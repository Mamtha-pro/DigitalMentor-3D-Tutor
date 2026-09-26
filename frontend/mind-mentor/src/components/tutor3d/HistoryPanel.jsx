import { History, PanelRightClose, Trash2, Volume2 } from 'lucide-react'
import { useTutor } from './useTutor'

export function HistoryPanel({ onClose }) {
  const messages = useTutor((state) => state.messages)
  const currentId = useTutor((state) => state.currentId)
  const play = useTutor((state) => state.play)
  const clearHistory = useTutor((state) => state.clearHistory)

  const answered = messages.filter((message) => message.answer)

  return (
    <aside className="flex h-full w-72 flex-col rounded-2xl border border-white/25 bg-slate-900/45 text-white shadow-2xl backdrop-blur-md">
      <header className="flex items-center justify-between border-b border-white/15 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <History size={16} />
          Chat History
        </h2>

        <div className="flex items-center gap-1">
          {answered.length > 0 && (
            <button
              onClick={clearHistory}
              className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
              title="Clear history"
            >
              <Trash2 size={15} />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            title="Hide history"
          >
            <PanelRightClose size={16} />
          </button>
        </div>
      </header>

      <div className="tutor-scroll flex-1 space-y-2 overflow-y-auto p-3">
        {answered.length === 0 ? (
          <p className="rounded-lg bg-white/10 p-3 text-center text-xs text-white/60">
            Your questions will show up here.
          </p>
        ) : (
          answered
            .slice()
            .reverse()
            .map((message) => (
              <button
                key={message.id}
                onClick={() => play(message.id)}
                className={`group w-full rounded-xl p-3 text-left transition ${
                  message.id === currentId
                    ? 'bg-[#c1ff72]/25 ring-1 ring-[#c1ff72]/70'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                title="Hear this answer again"
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold leading-5">
                    {message.question}
                  </span>
                  <Volume2
                    size={14}
                    className="mt-0.5 shrink-0 text-white/40 group-hover:text-white/80"
                  />
                </span>
                <span className="mt-1 line-clamp-3 block text-xs leading-5 text-white/65">
                  {message.answer}
                </span>
              </button>
            ))
        )}
      </div>
    </aside>
  )
}
