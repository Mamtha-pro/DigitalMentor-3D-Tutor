// AI Tutor page: a 3D classroom with a talking, lip-synced teacher.
//
// The classroom, teacher models and animation approach are adapted from the
// open-source 3D mentor project (github.com/hemanthkt/3d-mentor-3js). This
// version talks to Mind Mentor's own /api/chat, speaks with the browser's
// speech engine, and keeps its history locally.

import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { PanelRightOpen, WifiOff } from 'lucide-react'
import { AskPanel } from './AskPanel'
import { Classroom } from './Classroom'
import { HistoryPanel } from './HistoryPanel'
import { TeacherPicker } from './TeacherPicker'
import { useTutor } from './useTutor'
import './tutor3d.css'

function LoadingVeil() {
  const { active, progress } = useProgress()
  if (!active) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-center">
      <div className="rounded-full border-2 border-black bg-[#c1ff72] px-5 py-2 text-sm font-semibold text-black shadow-[3px_3px_0_#000]">
        Setting up the classroom… {Math.round(progress)}%
      </div>
    </div>
  )
}

export default function Tutor3D() {
  const [historyOpen, setHistoryOpen] = useState(
    () => window.innerWidth >= 1280,
  )
  const apiOnline = useTutor((state) => state.apiOnline)
  const stop = useTutor((state) => state.stop)

  // Leaving the page must silence the teacher
  useEffect(() => stop, [stop])

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#2a201d]">
      <Classroom />
      <LoadingVeil />

      {/* The top row takes whatever height is left, so the ask panel always
          stays on screen, even on a short laptop display */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col gap-3 p-4">
        <div className="flex min-h-0 flex-1 items-start justify-between gap-4">
          <div className="pointer-events-auto">
            <TeacherPicker />
          </div>

          <div className="pointer-events-auto flex min-h-0 self-stretch">
            {historyOpen ? (
              <HistoryPanel onClose={() => setHistoryOpen(false)} />
            ) : (
              <button
                onClick={() => setHistoryOpen(true)}
                className="self-start rounded-xl border border-white/25 bg-slate-900/45 p-2.5 text-white shadow-xl backdrop-blur-md transition hover:bg-slate-900/60"
                title="Show chat history"
              >
                <PanelRightOpen size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2">
          {apiOnline === false && (
            <p className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-amber-200 backdrop-blur">
              <WifiOff size={13} />
              Chat service not reachable — the tutor can&apos;t give real
              answers yet.
            </p>
          )}
          <div className="pointer-events-auto flex w-full justify-center">
            <AskPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
