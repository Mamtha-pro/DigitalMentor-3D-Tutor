import { useEffect, useRef, useState } from 'react'
import {
  Bot,
  Clock3,
  History,
  Mic,
  Plus,
  Send,
  User,
  X,
} from 'lucide-react'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function getToken() {
  return localStorage.getItem('mind_mentor_token')
}

function getUser() {
  try {
    return JSON.parse(
      localStorage.getItem('mind_mentor_user') || '{}',
    )
  } catch {
    return {}
  }
}

function ChatHistory({ conversations, activeId, onSelect, onNew }) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-white/20 bg-black/20 p-4 text-white backdrop-blur-xl lg:w-72">
      <button
        onClick={onNew}
        className="mb-5 flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/20 px-4 py-3 text-sm font-semibold transition hover:bg-white/30"
      >
        <Plus size={17} />
        New Chat
      </button>

      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60">
        <History size={14} />
        Chat History
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="rounded-lg bg-white/10 p-3 text-center text-xs text-white/60">
            No conversations yet
          </p>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={`w-full rounded-lg px-3 py-3 text-left text-sm transition ${
                activeId === conversation.id
                  ? 'bg-white/30 text-white'
                  : 'text-white/70 hover:bg-white/15 hover:text-white'
              }`}
            >
              <p className="truncate font-medium">
                {conversation.title}
              </p>

              <p className="mt-1 flex items-center gap-1 text-[11px] text-white/50">
                <Clock3 size={11} />
                {conversation.time}
              </p>
            </button>
          ))
        )}
      </div>

      <div className="mt-4 border-t border-white/20 pt-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#c1ff72] text-slate-800">
            {getUser()?.name?.charAt(0)?.toUpperCase() || 'K'}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {getUser()?.name || 'Student'}
            </p>
            <p className="text-xs text-white/50">Learner</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex items-end gap-3 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#c1ff72] text-slate-800">
          <Bot size={19} />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-lg ${
          isUser
            ? 'rounded-br-sm bg-[#35435a] text-white'
            : 'rounded-bl-sm bg-white/85 text-slate-800 backdrop-blur-md'
        }`}
      >
        {message.content}
      </div>

      {isUser && (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/70 text-slate-700">
          <User size={18} />
        </div>
      )}
    </div>
  )
}

function ExpertSessionCard({ onAsk }) {
  const suggestions = [
    'Explain this topic simply',
    'Create a study plan',
    'Quiz me on this subject',
  ]

  return (
    <div className="rounded-2xl border border-white/30 bg-white/20 p-5 text-white shadow-2xl backdrop-blur-xl">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">
          Mind Mentor
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Expert Session
        </h2>

        <p className="mt-1 text-sm text-white/70">
          Ask your guide a question
        </p>
      </div>

      <div className="mb-5 flex items-center justify-center">
        <div className="grid h-32 w-32 place-items-center rounded-full border-4 border-[#c1ff72]/70 bg-slate-900/40 text-6xl shadow-2xl">
          🧑‍🏫
        </div>
      </div>

      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onAsk(suggestion)}
            className="w-full rounded-lg bg-white/15 px-3 py-2 text-left text-xs text-white/80 transition hover:bg-white/25"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ChatBot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState('English')
  const [isLoading, setIsLoading] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(true)
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [conversations, setConversations] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function startNewChat() {
    setMessages([])
    setInput('')
    setActiveConversationId(null)
  }

  function createConversationTitle(text) {
    return text.length > 34
      ? `${text.slice(0, 34)}...`
      : text
  }

  async function sendMessage(customMessage) {
    const message = (customMessage || input).trim()

    if (!message || isLoading) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
    }

    setMessages((previous) => [...previous, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const token = getToken()

      const response = await fetch(
        `${API_BASE_URL}/api/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            message,
            language,
            history: messages.map((item) => ({
              role: item.role,
              content: item.content,
            })),
          }),
        },
      )

      if (!response.ok) {
        throw new Error('Chat API unavailable')
      }

      const data = await response.json()

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content:
          data.reply ||
          data.message ||
          'I am ready to help you with your studies.',
      }

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ])
    } catch (error) {
      console.error('Chat request failed:', error)

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I received your question: "${message}". Connect the Spring Boot chat API to receive AI-powered answers.`,
      }

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ])
    } finally {
      setIsLoading(false)
    }

    if (!activeConversationId) {
      const newId = Date.now().toString()

      setActiveConversationId(newId)

      setConversations((previous) => [
        {
          id: newId,
          title: createConversationTitle(message),
          time: 'Just now',
        },
        ...previous,
      ])
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendMessage()
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-br from-[#d89579] via-[#83575b] to-[#273444]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,210,170,0.55),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(90,120,110,0.45),transparent_35%)]" />

      <div className="relative flex min-h-[calc(100vh-64px)]">
        {historyOpen && (
          <div className="hidden lg:block">
            <ChatHistory
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={setActiveConversationId}
              onNew={startNewChat}
            />
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-white/20 px-4 py-4 text-white backdrop-blur-md sm:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHistoryOpen(!historyOpen)}
                className="rounded-lg bg-white/15 p-2 transition hover:bg-white/25"
                title="Chat History"
              >
                {historyOpen ? (
                  <X size={18} />
                ) : (
                  <History size={18} />
                )}
              </button>

              <div>
                <h1 className="font-semibold">AI Tutor</h1>
                <p className="text-xs text-white/60">
                  Your personal expert guide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-xs text-white outline-none"
              >
                <option className="text-black">English</option>
                <option className="text-black">Hindi</option>
                <option className="text-black">Marathi</option>
              </select>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between overflow-hidden p-4 sm:p-8">
            <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <div className="flex min-h-[55vh] flex-col items-center justify-center text-center text-white">
                  <div className="mb-5 grid h-20 w-20 place-items-center rounded-full border-2 border-white/40 bg-white/20 text-4xl shadow-xl backdrop-blur-md">
                    🤖
                  </div>

                  <h2 className="text-2xl font-bold sm:text-3xl">
                    Your Personal Expert Guide
                  </h2>

                  <p className="mt-2 max-w-md text-sm text-white/70">
                    Ask me anything about your studies. I can explain topics,
                    create quizzes, find resources, and make study plans.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                    />
                  ))}

                  {isLoading && (
                    <div className="flex items-end gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-[#c1ff72]">
                        <Bot size={19} />
                      </div>

                      <div className="rounded-2xl bg-white/80 px-5 py-4">
                        <div className="flex gap-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-600" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-600 [animation-delay:150ms]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-600 [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            <div className="mx-auto mt-6 w-full max-w-2xl">
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-white/30 bg-white/20 p-4 shadow-2xl backdrop-blur-xl"
              >
                <div className="mb-3">
                  <h2 className="font-bold text-white">
                    Expert Session
                  </h2>

                  <p className="text-sm text-white/65">
                    Ask your guide a question
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-slate-800/70 p-1.5">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask a question"
                    className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-white/50"
                  />

                  <button
                    type="button"
                    className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                    title="Voice input"
                  >
                    <Mic size={18} />
                  </button>

                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-[#e5cfc6] px-5 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={15} />
                    Ask
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>

        <div className="hidden w-80 p-6 xl:block">
          <ExpertSessionCard onAsk={sendMessage} />
        </div>
      </div>
    </div>
  )
}