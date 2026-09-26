import { useEffect, useRef } from 'react'
import { CirclePlay, CircleStop } from 'lucide-react'
import MindMentorLogo from '../ui/MindMentorLogo'
import { useTutor } from './useTutor'

// Rendered inside the 3D scene and scaled down onto the classroom's
// blackboard, which is why every size in here is so large.
export function Board() {
  const messages = useTutor((state) => state.messages)
  const currentId = useTutor((state) => state.currentId)
  const phase = useTutor((state) => state.phase)
  const play = useTutor((state) => state.play)
  const stop = useTutor((state) => state.stop)

  const container = useRef(null)

  useEffect(() => {
    container.current?.scrollTo({
      top: container.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages.length, currentId])

  return (
    <div
      ref={container}
      className="tutor-board flex h-[676px] w-[1288px] flex-col gap-10 overflow-y-auto p-10 text-white"
    >
      <div className="flex shrink-0 items-center gap-5 opacity-90">
        <MindMentorLogo size={84} />
        <span className="text-5xl font-black tracking-tight">Mind Mentor</span>
      </div>

      {messages.length === 0 ? (
        <div className="grid flex-1 place-content-center text-center">
          <h2 className="text-7xl font-bold leading-tight text-white/90">
            Your personal expert guide
          </h2>
          <p className="mt-6 text-5xl text-[#c1ff72]/90">
            Ask anything — I&apos;ll explain it out loud.
          </p>
        </div>
      ) : (
        messages.map((message) => {
          const isCurrent = message.id === currentId
          return (
            <article key={message.id} className="shrink-0">
              <h3 className="text-5xl font-bold leading-tight text-[#c1ff72]">
                {message.question}
              </h3>

              {message.answer ? (
                <div className="mt-5 flex items-start gap-6">
                  <button
                    onClick={() => (isCurrent ? stop() : play(message.id))}
                    className="mt-1 shrink-0 text-white/70 transition hover:text-white"
                    title={isCurrent ? 'Stop' : 'Hear this again'}
                  >
                    {isCurrent && phase === 'speaking' ? (
                      <CircleStop size={72} strokeWidth={1.4} />
                    ) : (
                      <CirclePlay size={72} strokeWidth={1.4} />
                    )}
                  </button>
                  <p className="whitespace-pre-line text-[2.6rem] leading-snug text-white/90">
                    {message.answer}
                  </p>
                </div>
              ) : (
                <p className="mt-5 animate-pulse text-4xl text-white/60">
                  Thinking…
                </p>
              )}
            </article>
          )
        })
      )}
    </div>
  )
}
