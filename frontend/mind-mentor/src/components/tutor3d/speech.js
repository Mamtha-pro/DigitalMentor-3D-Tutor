// Voice for the 3D tutor, using the browser's built-in speech synthesis
// (no API key, no server). Keeps a running viseme clock that Teacher.jsx
// samples every frame through getActiveViseme().

import { buildVisemeTimeline, timeAtChar, visemeAt } from './visemes'

const synth =
  typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis
    : null

const LANGUAGE_TAGS = {
  English: ['en-GB', 'en-IN', 'en-US', 'en'],
  Hindi: ['hi-IN', 'hi'],
  // Few browsers ship a Marathi voice; Hindi reads the same script
  Marathi: ['mr-IN', 'mr', 'hi-IN', 'hi'],
}

const TEACHER_VOICES = {
  Abbi: { female: true, pitch: 1.1, rate: 1 },
  Alfie: { female: false, pitch: 0.95, rate: 1 },
  Elliot: { female: false, pitch: 0.78, rate: 0.96 },
}

const FEMALE_HINT = /female|woman|zira|hazel|susan|samantha|heera|swara|kalpana/i
const MALE_HINT = /\bmale\b|\bman\b|david|george|daniel|ravi|hemant|madhur/i

// Chrome cuts off long utterances from its network voices, so answers are
// spoken one short chunk at a time.
const MAX_CHUNK = 180
// If the browser never starts speaking (no voices installed, offline network
// voice), fall back to moving the mouth silently rather than hanging.
const START_WATCHDOG_MS = 5000

const clock = { frames: [], total: 0, startedAt: 0, running: false }
let session = 0
let silentTimer = null
let watchdog = null

export function getActiveViseme() {
  if (!clock.running || clock.frames.length === 0) return 0
  let elapsed = performance.now() - clock.startedAt
  // The estimate can run short of the real audio: loop so the mouth keeps
  // moving until the voice actually ends.
  if (clock.total > 0 && elapsed > clock.total) elapsed %= clock.total
  return visemeAt(clock.frames, elapsed)
}

function splitIntoChunks(text) {
  const sentences = text.match(/[^.!?।\n]+[.!?।]*\s*/g) || [text]
  const chunks = []
  let current = ''

  const flush = () => {
    if (current.trim()) chunks.push(current.trim())
    current = ''
  }

  for (const sentence of sentences) {
    if (sentence.length > MAX_CHUNK) {
      flush()
      // A single very long sentence: break on commas, then on words
      for (const word of sentence.split(/(?<=,)\s+|\s+/)) {
        if ((current + ' ' + word).length > MAX_CHUNK) flush()
        current = current ? `${current} ${word}` : word
      }
      flush()
    } else if ((current + sentence).length > MAX_CHUNK) {
      flush()
      current = sentence
    } else {
      current += sentence
    }
  }
  flush()
  return chunks
}

let voicesReady = null
function loadVoices() {
  if (!synth) return Promise.resolve([])
  if (synth.getVoices().length) return Promise.resolve(synth.getVoices())
  if (!voicesReady) {
    voicesReady = new Promise((resolve) => {
      const done = () => resolve(synth.getVoices())
      synth.addEventListener('voiceschanged', done, { once: true })
      setTimeout(done, 1500)
    }).then((voices) => {
      if (!voices.length) voicesReady = null // allow a retry next time
      return voices
    })
  }
  return voicesReady
}

function pickVoice(voices, teacher, language) {
  const profile = TEACHER_VOICES[teacher] || TEACHER_VOICES.Abbi
  const tags = LANGUAGE_TAGS[language] || LANGUAGE_TAGS.English

  for (const tag of tags) {
    const matches = voices.filter((voice) =>
      voice.lang.replace('_', '-').toLowerCase().startsWith(tag.toLowerCase()),
    )
    if (!matches.length) continue

    const wanted = matches.find((voice) =>
      profile.female
        ? FEMALE_HINT.test(voice.name)
        : MALE_HINT.test(voice.name) && !FEMALE_HINT.test(voice.name),
    )
    return wanted || matches[0]
  }
  return null
}

function clearTimers() {
  clearTimeout(silentTimer)
  clearTimeout(watchdog)
  silentTimer = null
  watchdog = null
}

function startClock(text, rate) {
  const { frames, total } = buildVisemeTimeline(text, rate)
  clock.frames = frames
  clock.total = total
  clock.startedAt = performance.now()
  clock.running = true
}

export function stopSpeaking() {
  session += 1
  clearTimers()
  clock.running = false
  if (synth) synth.cancel()
}

/**
 * Speak `text` as `teacher`. onStart fires when sound (or the silent
 * fallback) begins; onEnd fires once, when it finishes or is interrupted.
 */
export async function speak(text, { teacher, language, onStart, onEnd } = {}) {
  stopSpeaking()
  const mySession = session
  const isCurrent = () => mySession === session

  const chunks = splitIntoChunks(text)
  if (!chunks.length) {
    onEnd?.()
    return
  }

  const profile = TEACHER_VOICES[teacher] || TEACHER_VOICES.Abbi
  const voices = await loadVoices()
  if (!isCurrent()) return
  const voice = pickVoice(voices, teacher, language)

  let started = false
  const markStarted = () => {
    if (started) return
    started = true
    onStart?.()
  }
  const finish = () => {
    clearTimers()
    clock.running = false
    if (isCurrent()) onEnd?.()
  }

  // Mouth moves, no sound: used when the browser cannot speak
  const playSilently = (index) => {
    if (!isCurrent()) return
    if (index >= chunks.length) return finish()
    startClock(chunks[index], profile.rate)
    markStarted()
    silentTimer = setTimeout(() => playSilently(index + 1), clock.total)
  }

  if (!synth) return playSilently(0)

  const playChunk = (index) => {
    if (!isCurrent()) return
    if (index >= chunks.length) return finish()

    const utterance = new SpeechSynthesisUtterance(chunks[index])
    if (voice) {
      utterance.voice = voice
      utterance.lang = voice.lang
    }
    utterance.rate = profile.rate
    utterance.pitch = profile.pitch

    let chunkStarted = false
    // Set when the watchdog gives up on this utterance; its late callbacks
    // (cancel() reports asynchronously) must then be ignored.
    let abandoned = false
    const isLive = () => isCurrent() && !abandoned

    utterance.onstart = () => {
      if (!isLive()) return
      chunkStarted = true
      clearTimeout(watchdog)
      startClock(chunks[index], profile.rate)
      markStarted()
    }

    // Local voices report word positions; use them to pull the estimated
    // timeline back onto the real audio.
    utterance.onboundary = (event) => {
      if (!isLive() || event.name === 'sentence') return
      clock.startedAt =
        performance.now() - timeAtChar(clock.frames, event.charIndex)
    }

    utterance.onend = () => {
      if (!isLive()) return
      clock.running = false
      playChunk(index + 1)
    }

    utterance.onerror = (event) => {
      if (!isLive()) return
      clearTimeout(watchdog)
      if (event.error === 'interrupted' || event.error === 'canceled') {
        return finish()
      }
      console.warn('Speech synthesis failed, continuing silently:', event.error)
      playSilently(index)
    }

    watchdog = setTimeout(() => {
      if (!isCurrent() || chunkStarted) return
      console.warn('Speech synthesis never started, continuing silently')
      abandoned = true
      synth.cancel()
      playSilently(index)
    }, START_WATCHDOG_MS)

    synth.speak(utterance)
  }

  // Chrome drops a speak() issued in the same tick as cancel()
  setTimeout(() => playChunk(0), 60)
}
