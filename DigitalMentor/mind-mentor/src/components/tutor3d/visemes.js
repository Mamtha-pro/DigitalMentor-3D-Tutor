// Text -> mouth-shape timeline.
//
// The teacher models expose one morph target per Azure viseme id (0-21).
// The original 3D mentor got those ids, with timings, from Azure's paid
// text-to-speech stream. Here the voice is the browser's own speech engine,
// which reports no mouth shapes at all, so the timeline is estimated from
// the spelling instead. It only has to be plausible: speech.js re-syncs it
// to the real audio whenever the browser reports a word boundary.

export const V = {
  SIL: 0, // silence
  AE: 1, // cat, about, cup
  AA: 2, // father
  AO: 3, // thought
  EH: 4, // bed, say
  ER: 5, // bird
  IY: 6, // see, yes
  UW: 7, // blue, we
  OW: 8, // go
  AW: 9, // now
  OY: 10, // boy
  AY: 11, // my
  H: 12,
  R: 13,
  L: 14,
  S: 15, // s, z
  SH: 16, // sh, ch, j
  TH: 17,
  F: 18, // f, v
  T: 19, // t, d, n
  K: 20, // k, g, ng
  P: 21, // p, b, m
}

// Milliseconds per sound at speaking rate 1.0
const MS = {
  vowel: 95,
  longVowel: 125,
  consonant: 62,
  lips: 78, // p/b/m and f/v are the closures people actually notice
  wordGap: 45,
  clausePause: 230,
  sentencePause: 390,
}

const LONG_VOWELS = new Set([V.AW, V.OY, V.AY, V.OW, V.UW, V.IY])
const LIP_SHAPES = new Set([V.P, V.F])

function durationOf(viseme) {
  if (viseme === V.SIL) return MS.wordGap
  if (viseme <= V.AY) return LONG_VOWELS.has(viseme) ? MS.longVowel : MS.vowel
  return LIP_SHAPES.has(viseme) ? MS.lips : MS.consonant
}

// Longest match first
const LATIN_GROUPS = [
  ['igh', [V.AY]],
  ['tch', [V.SH]],
  ['th', [V.TH]],
  ['sh', [V.SH]],
  ['ch', [V.SH]],
  ['ph', [V.F]],
  ['wh', [V.UW]],
  ['ck', [V.K]],
  ['ng', [V.K]],
  ['qu', [V.K, V.UW]],
  ['ee', [V.IY]],
  ['ea', [V.IY]],
  ['ie', [V.IY]],
  ['oo', [V.UW]],
  ['ou', [V.AW]],
  ['ow', [V.AW]],
  ['oi', [V.OY]],
  ['oy', [V.OY]],
  ['ai', [V.EH]],
  ['ay', [V.EH]],
  ['au', [V.AO]],
  ['aw', [V.AO]],
  ['er', [V.ER]],
  ['ir', [V.ER]],
  ['ur', [V.ER]],
  ['ar', [V.AA]],
  ['or', [V.AO]],
]

const LATIN_SINGLES = {
  a: V.AE, e: V.EH, i: V.IY, o: V.OW, u: V.UW, y: V.IY,
  b: V.P, m: V.P, p: V.P,
  f: V.F, v: V.F,
  d: V.T, t: V.T, n: V.T,
  c: V.K, g: V.K, k: V.K, q: V.K,
  s: V.S, x: V.S, z: V.S,
  j: V.SH,
  l: V.L,
  r: V.R,
  h: V.H,
  w: V.UW,
}

const LATIN_VOWELS = 'aeiouy'

// Devanagari (Hindi + Marathi): consonants grouped by where they are made
const DEVA_VIRAMA = 0x094d
const DEVA_MATRAS = {
  0x093e: V.AA, 0x093f: V.IY, 0x0940: V.IY, 0x0941: V.UW, 0x0942: V.UW,
  0x0943: V.R, 0x0947: V.EH, 0x0948: V.AY, 0x094b: V.OW, 0x094c: V.AW,
}
const DEVA_VOWELS = {
  0x0905: V.AE, 0x0906: V.AA, 0x0907: V.IY, 0x0908: V.IY, 0x0909: V.UW,
  0x090a: V.UW, 0x090b: V.R, 0x090f: V.EH, 0x0910: V.AY, 0x0913: V.OW,
  0x0914: V.AW,
}

function devaConsonant(code) {
  if (code >= 0x0915 && code <= 0x0919) return V.K // क ख ग घ ङ
  if (code >= 0x091a && code <= 0x091e) return V.SH // च छ ज झ ञ
  if (code >= 0x091f && code <= 0x0929) return V.T // ट ठ ड ढ ण त थ द ध न
  if (code >= 0x092a && code <= 0x092e) return V.P // प फ ब भ म
  if (code === 0x092f) return V.IY // य
  if (code === 0x0930 || code === 0x0931) return V.R // र
  if (code === 0x0932 || code === 0x0933 || code === 0x0934) return V.L // ल ळ
  if (code === 0x0935) return V.F // व
  if (code === 0x0936 || code === 0x0937) return V.SH // श ष
  if (code === 0x0938) return V.S // स
  if (code === 0x0939) return V.H // ह
  return null
}

const isDevanagari = (code) => code >= 0x0900 && code <= 0x097f

/**
 * @returns {{ frames: Array<[number, number, number]>, total: number }}
 *   frames are [startMs, visemeId, charIndex]; total is the estimated length.
 */
export function buildVisemeTimeline(text, rate = 1) {
  const frames = []
  const scale = 1 / Math.max(0.5, rate)
  let clock = 0

  const push = (viseme, charIndex, ms = durationOf(viseme)) => {
    const last = frames[frames.length - 1]
    // Merge repeats ("mm", back-to-back pauses) into one held shape
    if (!last || last[1] !== viseme) frames.push([clock, viseme, charIndex])
    clock += ms * scale
  }

  const lower = text.toLowerCase()
  let i = 0

  while (i < lower.length) {
    const char = lower[i]
    const code = lower.charCodeAt(i)

    if (char === '.' || char === '!' || char === '?' || code === 0x0964) {
      push(V.SIL, i, MS.sentencePause)
      i += 1
      continue
    }
    if (char === ',' || char === ';' || char === ':' || char === '\n' || char === '—') {
      push(V.SIL, i, MS.clausePause)
      i += 1
      continue
    }
    if (/\s/.test(char)) {
      push(V.SIL, i, MS.wordGap)
      i += 1
      continue
    }

    if (isDevanagari(code)) {
      const consonant = devaConsonant(code)
      if (consonant !== null) {
        push(consonant, i)
        const next = lower.charCodeAt(i + 1)
        const followedBySound =
          DEVA_MATRAS[next] !== undefined || next === DEVA_VIRAMA
        const endsWord = Number.isNaN(next) || !isDevanagari(next)
        // Inherent "a", dropped at the end of a word as it is when spoken
        if (!followedBySound && !endsWord) push(V.AE, i, 70)
      } else if (DEVA_MATRAS[code] !== undefined) {
        push(DEVA_MATRAS[code], i)
      } else if (DEVA_VOWELS[code] !== undefined) {
        push(DEVA_VOWELS[code], i)
      } else if (code === 0x0902 || code === 0x0901) {
        push(V.T, i, 50) // anusvara / chandrabindu: a short nasal
      }
      i += 1
      continue
    }

    if (char >= '0' && char <= '9') {
      push(V.AE, i)
      push(V.T, i)
      i += 1
      continue
    }

    if (char < 'a' || char > 'z') {
      i += 1 // symbols the voice skips
      continue
    }

    const group = LATIN_GROUPS.find(([letters]) => lower.startsWith(letters, i))
    if (group) {
      group[1].forEach((viseme) => push(viseme, i))
      i += group[0].length
      continue
    }

    // Silent final "e": make, time, note
    const next = lower[i + 1]
    const endsWord = next === undefined || next < 'a' || next > 'z'
    const previous = lower[i - 1]
    if (
      char === 'e' &&
      endsWord &&
      previous >= 'a' &&
      previous <= 'z' &&
      !LATIN_VOWELS.includes(previous) &&
      i >= 2 &&
      lower[i - 2] >= 'a' &&
      lower[i - 2] <= 'z'
    ) {
      i += 1
      continue
    }

    push(LATIN_SINGLES[char], i)
    i += 1
  }

  push(V.SIL, lower.length, MS.wordGap)
  return { frames, total: clock }
}

/** Timeline time (ms) at which the sound for `charIndex` starts. */
export function timeAtChar(frames, charIndex) {
  let low = 0
  let high = frames.length - 1
  let found = 0
  while (low <= high) {
    const mid = (low + high) >> 1
    if (frames[mid][2] <= charIndex) {
      found = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return frames.length ? frames[found][0] : 0
}

/** Viseme id active at `timeMs`. */
export function visemeAt(frames, timeMs) {
  let low = 0
  let high = frames.length - 1
  let found = -1
  while (low <= high) {
    const mid = (low + high) >> 1
    if (frames[mid][0] <= timeMs) {
      found = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return found === -1 ? V.SIL : frames[found][1]
}
