import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Send, Square } from 'lucide-react'
import { LANGUAGES, useTutor } from './useTutor'

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

const RECOGNITION_LANG = {
  English: 'en-IN',
  Hindi: 'hi-IN',
  Marathi: 'mr-IN',
}

const SUGGESTIONS = [
  'Explain this topic simply',
  'Create a study plan',
  'Quiz me on this subject',
]

export function AskPanel() {
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)
  const recognition = useRef(null)

  const phase = useTutor((state) => state.phase)
  const language = useTutor((state) => state.language)
  const hasMessages = useTutor((state) => state.messages.length > 0)
  const ask = useTutor((state) => state.ask)
  const stop = useTutor((state) => state.stop)
  const setLanguage = useTutor((state) => state.setLanguage)

  useEffect(() => () => recognition.current?.abort(), [])

  function submit(event) {
    event.preventDefault()
    recognition.current?.stop()
    ask(input)
    setInput('')
  }

  function toggleListening() {
    if (listening) {
      recognition.current?.stop()
      return
    }

    const recognizer = new SpeechRecognition()
    recognizer.lang = RECOGNITION_LANG[language] || 'en-IN'
    recognizer.interimResults = true
    recognizer.continuous = false

    recognizer.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('')
      setInput(transcript)
    }
    recognizer.onerror = (event) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        console.warn('Voice input failed:', event.error)
      }
    }
    recognizer.onend = () => setListening(false)

    recognition.current = recognizer
    stop() // don't let the teacher's own voice end up in the transcript
    recognizer.start()
    setListening(true)
  }

  const thinking = phase === 'thinking'

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-xl rounded-2xl border border-white/25 bg-slate-900/45 p-4 shadow-2xl backdrop-blur-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Expert Session</h2>
          <p className="text-sm text-white/65">
            {listening ? 'Listening…' : 'Ask your guide a question'}
          </p>
        </div>

        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="rounded-lg border border-white/30 bg-white/10 px-2 py-1.5 text-xs text-white outline-none"
          title="Answer language"
        >
          {LANGUAGES.map((name) => (
            <option key={name} className="text-black">
              {name}
            </option>
          ))}
        </select>
      </div>

      {!hasMessages && (
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => ask(suggestion)}
              className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 transition hover:bg-white/20"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 rounded-full bg-slate-900/70 p-1.5">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={thinking ? 'Thinking…' : 'Ask a question'}
          disabled={thinking}
          className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-white/50 disabled:opacity-60"
        />

        {SpeechRecognition && (
          <button
            type="button"
            onClick={toggleListening}
            disabled={thinking}
            className={`rounded-full p-2 transition disabled:opacity-40 ${
              listening
                ? 'bg-red-500 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
            title={listening ? 'Stop listening' : 'Ask by voice'}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}

        {phase === 'speaking' ? (
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-5 py-2 text-sm font-semibold text-black"
          >
            <Square size={13} fill="currentColor" />
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#c1ff72] px-5 py-2 text-sm font-semibold text-black transition hover:bg-[#d4ff9c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={15} />
            Ask
          </button>
        )}
      </div>
    </form>
  )
}
