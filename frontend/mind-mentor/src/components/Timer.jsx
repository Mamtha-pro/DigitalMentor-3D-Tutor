import { useEffect, useRef, useState } from 'react'
import { Loader2, Pause, Play, RotateCcw } from 'lucide-react'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const initialTimer = {
  timeLeft: 30 * 60,
  isActive: false,
  mode: 'focus',
  focusTime: 30,
  breakTime: 5,
  progress: 0,
}

function getSavedTimer() {
  try {
    const saved = localStorage.getItem('timer-storage')

    if (!saved) {
      return initialTimer
    }

    const parsed = JSON.parse(saved)

    return {
      ...initialTimer,
      ...parsed,
      isActive: false,
    }
  } catch {
    return initialTimer
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return `${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds,
  ).padStart(2, '0')}`
}

function saveTimer(timer) {
  localStorage.setItem(
    'timer-storage',
    JSON.stringify({
      timeLeft: timer.timeLeft,
      isActive: false,
      mode: timer.mode,
      focusTime: timer.focusTime,
      breakTime: timer.breakTime,
      progress: timer.progress,
    }),
  )
}

function showMessage(title, description, type = 'success') {
  const message = document.createElement('div')

  message.className = `
    fixed right-5 top-5 z-[100] max-w-sm rounded-lg border-2 border-black
    px-4 py-3 text-sm shadow-[3px_3px_0_#000]
    ${
      type === 'error'
        ? 'bg-red-100 text-red-800'
        : 'bg-[#c1ff72] text-slate-800'
    }
  `

  message.innerHTML = `
    <p class="font-bold">${title}</p>
    <p class="mt-1">${description}</p>
  `

  document.body.appendChild(message)

  setTimeout(() => {
    message.remove()
  }, 5000)
}

function TimerCard() {
  const [timer, setTimer] = useState(getSavedTimer)
  const timerRef = useRef(timer)

  useEffect(() => {
    timerRef.current = timer
    saveTimer(timer)
  }, [timer])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((currentTimer) => {
        if (!currentTimer.isActive) {
          return currentTimer
        }

        const nextTime = Math.max(0, currentTimer.timeLeft - 0.1)
        const totalTime =
          currentTimer.mode === 'focus'
            ? currentTimer.focusTime * 60
            : currentTimer.breakTime * 60

        const nextProgress =
          ((totalTime - nextTime) / totalTime) * 100

        if (nextTime <= 0) {
          completeSession(currentTimer)

          const nextMode =
            currentTimer.mode === 'focus' ? 'break' : 'focus'

          const nextDuration =
            nextMode === 'focus'
              ? currentTimer.focusTime
              : currentTimer.breakTime

          return {
            ...currentTimer,
            isActive: false,
            mode: nextMode,
            timeLeft: nextDuration * 60,
            progress: 0,
          }
        }

        return {
          ...currentTimer,
          timeLeft: nextTime,
          progress: nextProgress,
        }
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  async function completeSession(completedTimer) {
    if (completedTimer.mode === 'break') {
      showMessage(
        'Break Time Over',
        'Ready for another focus session?',
      )

      return
    }

    const startTime = new Date(
      Date.now() - completedTimer.focusTime * 60 * 1000,
    )

    const endTime = new Date()

    try {
      const token = localStorage.getItem('mind_mentor_token')

      const response = await fetch(
        `${API_BASE_URL}/api/study-sessions`,
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
            duration: completedTimer.focusTime * 60,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            mode: 'focus',
          }),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to save session')
      }

      const data = await response.json()

      showMessage(
        'Focus Session Complete! 🎉',
        `Current streak: ${
          data?.stats?.currentStreak || 0
        } days! Time for a break.`,
      )
    } catch (error) {
      console.error('Error saving study session:', error)

      /*
       * Temporary frontend behavior.
       * The timer still works before Spring Boot is connected.
       */
      showMessage(
        'Focus Session Complete! 🎉',
        'Time for a break.',
      )
    }

    window.dispatchEvent(
      new CustomEvent('study-session-completed'),
    )
  }

  function toggleTimer(event) {
    event.stopPropagation()

    setTimer((currentTimer) => ({
      ...currentTimer,
      isActive: !currentTimer.isActive,
    }))
  }

  function resetTimer(event) {
    event.stopPropagation()

    setTimer((currentTimer) => {
      const duration =
        currentTimer.mode === 'focus'
          ? currentTimer.focusTime
          : currentTimer.breakTime

      return {
        ...currentTimer,
        isActive: false,
        timeLeft: duration * 60,
        progress: 0,
      }
    })
  }

  function switchMode() {
    if (timer.isActive) {
      return
    }

    setTimer((currentTimer) => {
      const nextMode =
        currentTimer.mode === 'focus' ? 'break' : 'focus'

      const nextDuration =
        nextMode === 'focus'
          ? currentTimer.focusTime
          : currentTimer.breakTime

      return {
        ...currentTimer,
        mode: nextMode,
        timeLeft: nextDuration * 60,
        progress: 0,
      }
    })
  }

  function changeFocusTime(event) {
    const value = Number(event.target.value)

    setTimer((currentTimer) => ({
      ...currentTimer,
      focusTime: value,
      timeLeft:
        currentTimer.mode === 'focus'
          ? value * 60
          : currentTimer.timeLeft,
      progress:
        currentTimer.mode === 'focus'
          ? 0
          : currentTimer.progress,
    }))
  }

  function changeBreakTime(event) {
    const value = Number(event.target.value)

    setTimer((currentTimer) => ({
      ...currentTimer,
      breakTime: value,
      timeLeft:
        currentTimer.mode === 'break'
          ? value * 60
          : currentTimer.timeLeft,
      progress:
        currentTimer.mode === 'break'
          ? 0
          : currentTimer.progress,
    }))
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border border-[#7c8d91] bg-[#f2ede0] p-3 sm:p-4">
      <div
        onClick={switchMode}
        className="relative cursor-pointer rounded-lg bg-[#f5f1ea] p-4 transition-colors hover:bg-white sm:p-8"
      >
        <div className="mb-4 text-center sm:mb-6">
          <h2 className="mb-2 text-xl font-bold text-[#27445d] sm:text-2xl">
            {timer.mode === 'focus' ? 'Focus Time' : 'Break Time'}
          </h2>

          <div className="font-mono text-5xl font-bold text-[#27445d] sm:text-6xl">
            {formatTime(timer.timeLeft)}
          </div>
        </div>

        <div className="flex justify-center gap-3 sm:gap-4">
          <button
            onClick={toggleTimer}
            className={`inline-flex w-20 items-center justify-center rounded-md border-2 border-black px-3 py-2 text-sm font-semibold transition sm:w-24 ${
              timer.isActive
                ? 'bg-red-300 hover:bg-red-400'
                : 'bg-[#497d74] text-white hover:bg-[#3d6b64]'
            }`}
          >
            {timer.isActive ? (
              <>
                <Pause className="mr-1 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-1 h-4 w-4" />
                Start
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="inline-flex w-20 items-center justify-center rounded-md border-2 border-black bg-white px-3 py-2 text-sm font-semibold text-[#27445d] hover:bg-gray-100 sm:w-24"
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            Reset
          </button>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-300">
          <div
            className={`h-full transition-all ${
              timer.mode === 'focus'
                ? 'bg-green-600'
                : 'bg-blue-600'
            }`}
            style={{ width: `${timer.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
        <div>
          <label
            htmlFor="focus-duration"
            className="text-sm text-[#27445d] sm:text-base"
          >
            Focus Duration (minutes)
          </label>

          <select
            id="focus-duration"
            value={timer.focusTime}
            disabled={timer.isActive}
            onChange={changeFocusTime}
            className="mt-1 w-full rounded-md border border-[#d5ebe7] bg-[#efe9d5] px-3 py-2 text-sm text-[#27445d] outline-none focus:ring-2 focus:ring-[#497d74]"
          >
            {[15, 25, 30, 45, 60].map((time) => (
              <option key={time} value={time}>
                {time} minutes
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="break-duration"
            className="text-sm text-[#27445d] sm:text-base"
          >
            Break Duration (minutes)
          </label>

          <select
            id="break-duration"
            value={timer.breakTime}
            disabled={timer.isActive}
            onChange={changeBreakTime}
            className="mt-1 w-full rounded-md border border-[#d5ebe7] bg-[#efe9d5] px-3 py-2 text-sm text-[#27445d] outline-none focus:ring-2 focus:ring-[#497d74]"
          >
            {[5, 10, 15, 20].map((time) => (
              <option key={time} value={time}>
                {time} minutes
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default function Timer() {
  return (
    <div className="space-y-4 p-4 sm:space-y-8 sm:p-6 md:p-8">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Study Timer
        </h1>

        <span className="text-xs text-gray-600 sm:text-sm">
          Track your focus sessions
        </span>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        <TimerCard />
      </div>
    </div>
  )
}