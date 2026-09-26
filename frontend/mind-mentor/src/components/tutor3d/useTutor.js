import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { speak, stopSpeaking } from './speech'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const TEACHERS = ['Abbi', 'Alfie', 'Elliot']
export const LANGUAGES = ['English', 'Hindi', 'Marathi']

const HISTORY_TURNS_SENT = 8
const HISTORY_KEPT = 40
const REQUEST_TIMEOUT_MS = 45000

function getToken() {
  return localStorage.getItem('mind_mentor_token')
}

const OFFLINE_REPLY = {
  English: (question) =>
    `I heard your question: "${question}". I can't reach the Mind Mentor chat service right now, so I can't answer it yet. Please start the backend and ask me again.`,
  Hindi: (question) =>
    `मैंने आपका सवाल सुना: "${question}"। अभी माइंड मेंटर चैट सेवा से संपर्क नहीं हो पा रहा है, इसलिए मैं जवाब नहीं दे सकता। कृपया बैकएंड चालू करके फिर से पूछें।`,
  Marathi: (question) =>
    `मी तुमचा प्रश्न ऐकला: "${question}". सध्या माइंड मेंटर चॅट सेवेशी संपर्क होत नाही, त्यामुळे मी उत्तर देऊ शकत नाही. कृपया बॅकएंड सुरू करून पुन्हा विचारा.`,
}

// The answer is read aloud and written on the board, so markdown and emoji
// have to go.
function cleanForSpeech(text) {
  return String(text)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_#`>|~]/g, '')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

async function requestAnswer(question, language, previous) {
  const token = getToken()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message: question,
        language,
        history: previous
          .filter((item) => item.answer && !item.offline)
          .slice(-HISTORY_TURNS_SENT)
          .flatMap((item) => [
            { role: 'user', content: item.question },
            { role: 'assistant', content: item.answer },
          ]),
      }),
      signal: controller.signal,
    })

    if (!response.ok) throw new Error(`Chat API answered ${response.status}`)

    const data = await response.json()
    const reply = cleanForSpeech(data.reply || data.message || '')
    if (!reply) throw new Error('Chat API returned an empty reply')
    return reply
  } finally {
    clearTimeout(timeout)
  }
}

export const useTutor = create(
  persist(
    (set, get) => ({
      teacher: TEACHERS[0],
      language: LANGUAGES[0],
      messages: [],

      // 'idle' | 'thinking' | 'speaking'
      phase: 'idle',
      currentId: null,
      apiOnline: null,

      setTeacher: (teacher) => {
        get().stop()
        set({ teacher })
      },

      setLanguage: (language) => set({ language }),

      ask: async (rawQuestion) => {
        const question = (rawQuestion || '').trim()
        if (!question || get().phase === 'thinking') return

        get().stop()

        const { language, messages } = get()
        const message = {
          id: Date.now(),
          question,
          answer: null,
          language,
          offline: false,
        }

        set({
          messages: [...messages, message].slice(-HISTORY_KEPT),
          phase: 'thinking',
          currentId: message.id,
        })

        let answer
        let offline = false
        try {
          answer = await requestAnswer(question, language, messages)
        } catch (error) {
          console.error('Tutor chat request failed:', error)
          offline = true
          answer = (OFFLINE_REPLY[language] || OFFLINE_REPLY.English)(question)
        }

        set((state) => ({
          apiOnline: !offline,
          messages: state.messages.map((item) =>
            item.id === message.id ? { ...item, answer, offline } : item,
          ),
        }))

        get().play(message.id)
      },

      play: (id) => {
        const message = get().messages.find((item) => item.id === id)
        if (!message?.answer) return

        stopSpeaking()
        // Stay in "thinking" until the voice actually starts
        set({ currentId: id, phase: 'thinking' })

        speak(message.answer, {
          teacher: get().teacher,
          language: message.language,
          onStart: () => set({ phase: 'speaking' }),
          onEnd: () => set({ phase: 'idle', currentId: null }),
        })
      },

      stop: () => {
        stopSpeaking()
        const { phase, currentId, messages } = get()
        // A question still waiting on the chat API keeps its "thinking" state
        const awaitingAnswer =
          phase === 'thinking' &&
          messages.some((item) => item.id === currentId && !item.answer)
        if (!awaitingAnswer) set({ phase: 'idle', currentId: null })
      },

      clearHistory: () => {
        get().stop()
        set({ messages: [] })
      },
    }),
    {
      name: 'mind_mentor_tutor3d',
      partialize: ({ teacher, language, messages }) => ({
        teacher,
        language,
        // Never restore a question that was still waiting for its answer
        messages: messages.filter((item) => item.answer),
      }),
    },
  ),
)
