import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Loader2, Trash2 } from 'lucide-react'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const ITEMS_PER_PAGE = 5

function normalizeTask(task) {
  if (typeof task === 'string') {
    return {
      text: task || 'Untitled task',
      completed: false,
    }
  }

  const textCandidates = [
    task?.text,
    task?.task,
    task?.label,
    task?.name,
    task?.title,
  ]

  const text =
    textCandidates.find(
      (candidate) =>
        typeof candidate === 'string' && candidate.trim(),
    ) ||
    Object.values(task || {}).find(
      (value) => typeof value === 'string' && value.trim(),
    ) ||
    'Untitled task'

  return {
    text,
    completed: task?.completed || false,
  }
}

function calculateTaskStats(plan) {
  const tasks =
    plan?.weeklyPlans?.flatMap((week) =>
      week.dailyTasks?.flatMap((day) =>
        day.tasks?.map(normalizeTask) || [],
      ) || [],
    ) || []

  const total = tasks.length
  const completed = tasks.filter((task) => task.completed).length
  const incomplete = total - completed
  const percentage =
    total > 0
      ? Math.round((completed / total) * 100)
      : plan?.progress || 0

  return {
    total,
    completed,
    incomplete,
    percentage,
  }
}

function samplePlan(subject, examDate) {
  return {
    _id: `local-${Date.now()}`,
    overview: {
      subject,
      duration: '4 weeks',
      examDate,
    },
    weeklyPlans: [
      {
        week: 'Week 1',
        goals: [
          `Understand the fundamentals of ${subject}`,
          `Create a strong study foundation for ${subject}`,
        ],
        dailyTasks: [
          {
            day: 'Monday',
            duration: '60 minutes',
            tasks: [
              `Review the introduction to ${subject}`,
              'Write summary notes',
            ],
          },
          {
            day: 'Tuesday',
            duration: '60 minutes',
            tasks: [
              `Study the basic concepts of ${subject}`,
              'Complete practice questions',
            ],
          },
          {
            day: 'Wednesday',
            duration: '45 minutes',
            tasks: ['Review previous notes', 'Practice key examples'],
          },
          {
            day: 'Thursday',
            duration: '60 minutes',
            tasks: ['Study important definitions', 'Create flashcards'],
          },
          {
            day: 'Friday',
            duration: '60 minutes',
            tasks: ['Complete a short revision test'],
          },
        ],
      },
      {
        week: 'Week 2',
        goals: [
          `Build intermediate knowledge of ${subject}`,
          'Practice applying the concepts',
        ],
        dailyTasks: [
          {
            day: 'Monday',
            duration: '60 minutes',
            tasks: ['Review Week 1 concepts', 'Study the next chapter'],
          },
          {
            day: 'Tuesday',
            duration: '60 minutes',
            tasks: ['Solve practice exercises'],
          },
          {
            day: 'Wednesday',
            duration: '45 minutes',
            tasks: ['Review mistakes and weak areas'],
          },
          {
            day: 'Thursday',
            duration: '60 minutes',
            tasks: ['Complete topic-based questions'],
          },
          {
            day: 'Friday',
            duration: '60 minutes',
            tasks: ['Take a practice quiz'],
          },
        ],
      },
    ],
    recommendations: [
      'Study consistently every day.',
      'Review difficult topics before moving forward.',
      'Use active recall and practice questions.',
      'Take short breaks during longer study sessions.',
    ],
    isActive: true,
    progress: 0,
  }
}

function StudyPlanDisplay({ plan }) {
  return (
    <div className="w-full rounded-xl border-2 border-black bg-white">
      <div className="border-b-2 border-black p-4 sm:p-6">
        <h3 className="break-words text-xl font-semibold text-gray-800 sm:text-2xl">
          Study Plan for {plan.overview.subject}
        </h3>

        <div className="mt-2 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:gap-4 sm:text-base">
          <span>Duration: {plan.overview.duration}</span>
          <span className="hidden sm:inline">|</span>
          <span>Exam Date: {plan.overview.examDate}</span>
        </div>
      </div>

      <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-4 sm:p-6">
        {plan.weeklyPlans?.map((weeklyPlan, weekIndex) => (
          <div
            key={weekIndex}
            className="mb-8 last:mb-0 sm:mb-12"
          >
            <h3 className="mb-3 border-b pb-2 text-lg font-semibold text-gray-800 sm:mb-4 sm:text-xl">
              {weeklyPlan.week}
            </h3>

            <div className="mb-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700 sm:text-base">
                Goals:
              </h4>

              <ul className="list-disc space-y-1 pl-5 text-sm sm:text-base">
                {weeklyPlan.goals?.map((goal, index) => (
                  <li key={index} className="text-gray-600">
                    {goal}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-700 sm:text-base">
                Daily Schedule:
              </h4>

              {weeklyPlan.dailyTasks?.map((day, dayIndex) => (
                <div key={dayIndex} className="mb-3">
                  <h5 className="text-sm font-medium text-gray-600 sm:text-base">
                    {day.day} ({day.duration})
                  </h5>

                  <ul className="list-disc space-y-1 pl-5 text-sm sm:text-base">
                    {day.tasks?.map((task, taskIndex) => {
                      const normalized = normalizeTask(task)

                      return (
                        <li key={taskIndex} className="text-gray-600">
                          {normalized.text}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-6 sm:mt-8">
          <h3 className="mb-3 border-b pb-2 text-lg font-semibold text-gray-800 sm:mb-4 sm:text-xl">
            Study Tips & Recommendations
          </h3>

          <ul className="list-disc space-y-2 pl-5 text-sm sm:text-base">
            {plan.recommendations?.map((recommendation, index) => (
              <li key={index} className="text-gray-600">
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function StoredPlan({ plan, onDelete, onTaskUpdate }) {
  const [currentPlan, setCurrentPlan] = useState(plan)
  const [openWeeks, setOpenWeeks] = useState({})
  const [updatingTask, setUpdatingTask] = useState(false)

  useEffect(() => {
    setCurrentPlan(plan)
  }, [plan])

  const taskStats = useMemo(
    () => calculateTaskStats(currentPlan),
    [currentPlan],
  )

  function toggleWeek(index) {
    setOpenWeeks((previous) => ({
      ...previous,
      [index]: !previous[index],
    }))
  }

  async function handleTaskToggle(
    weekIndex,
    dayIndex,
    taskIndex,
    checked,
  ) {
    setUpdatingTask(true)

    const updatedPlan = {
      ...currentPlan,
      weeklyPlans: currentPlan.weeklyPlans.map(
        (week, currentWeekIndex) => ({
          ...week,
          dailyTasks: week.dailyTasks.map(
            (day, currentDayIndex) => ({
              ...day,
              tasks:
                currentWeekIndex === weekIndex &&
                currentDayIndex === dayIndex
                  ? day.tasks.map((task, currentTaskIndex) => {
                      if (currentTaskIndex !== taskIndex) {
                        return task
                      }

                      if (typeof task === 'string') {
                        return {
                          text: task,
                          completed: checked,
                        }
                      }

                      return {
                        ...task,
                        completed: checked,
                      }
                    })
                  : day.tasks,
            }),
          ),
        }),
      ),
    }

    const updatedStats = calculateTaskStats(updatedPlan)
    updatedPlan.progress = updatedStats.percentage

    setCurrentPlan(updatedPlan)
    onTaskUpdate(updatedPlan)
    setUpdatingTask(false)

    try {
      const token = localStorage.getItem('mind_mentor_token')

      await fetch(
        `${API_BASE_URL}/api/study-plans/${currentPlan._id}/tasks`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
          body: JSON.stringify({
            weekIndex,
            dayIndex,
            taskIndex,
            completed: checked,
          }),
        },
      )
    } catch {
      // The local UI remains usable until Spring Boot is connected.
    }
  }

  return (
    <div className="mt-4 w-full rounded-xl border-2 border-black bg-white sm:mt-8">
      <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
        <div>
          <h3 className="break-words text-xl font-bold sm:text-2xl">
            Study Plan for {currentPlan.overview.subject}
          </h3>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full border border-gray-400 px-3 py-1 text-xs sm:text-sm">
              {currentPlan.overview.duration}
            </span>

            <span className="rounded-full border border-gray-400 px-3 py-1 text-xs sm:text-sm">
              Exam: {currentPlan.overview.examDate}
            </span>

            <span className="rounded-full bg-[#497D74] px-3 py-1 text-xs text-white sm:text-sm">
              {currentPlan.isActive ? 'Active' : 'Completed'}
            </span>
          </div>
        </div>

        <button
          onClick={() => onDelete(currentPlan._id)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-red-600 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 sm:w-auto"
        >
          <Trash2 size={16} />
          Delete Plan
        </button>
      </div>

      <div className="border-t border-gray-200 p-4 sm:p-6">
        <div className="mb-6 rounded-md border border-gray-300 bg-[#F2EDE0] p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Task Progress
              </p>

              <p className="text-xs text-gray-500">
                {taskStats.completed} of {taskStats.total} tasks completed
              </p>
            </div>

            <span className="w-fit rounded-full border border-gray-400 px-3 py-1 text-xs sm:text-sm">
              {taskStats.percentage}%
            </span>
          </div>

          <div className="mb-4 h-3 overflow-hidden rounded-full bg-gray-300">
            <div
              className="h-full rounded-full bg-[#497D74] transition-all"
              style={{ width: `${taskStats.percentage}%` }}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-md border border-gray-300 bg-white p-3">
              <p className="text-xs text-gray-500">Total Tasks</p>
              <p className="text-lg font-semibold text-gray-800">
                {taskStats.total}
              </p>
            </div>

            <div className="rounded-md border border-gray-300 bg-white p-3">
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-lg font-semibold text-gray-800">
                {taskStats.completed}
              </p>
            </div>

            <div className="rounded-md border border-gray-300 bg-white p-3">
              <p className="text-xs text-gray-500">Incomplete</p>
              <p className="text-lg font-semibold text-gray-800">
                {taskStats.incomplete}
              </p>
            </div>
          </div>
        </div>

        <div>
          {currentPlan.weeklyPlans?.map((weekPlan, weekIndex) => (
            <div key={weekIndex} className="border-b border-gray-300">
              <button
                onClick={() => toggleWeek(weekIndex)}
                className="flex w-full items-center justify-between py-4 text-left text-base font-semibold sm:text-lg"
              >
                <span>{weekPlan.week}</span>
                <span>{openWeeks[weekIndex] ? '−' : '+'}</span>
              </button>

              {openWeeks[weekIndex] && (
                <div className="space-y-4 pb-5 text-sm sm:text-base">
                  <div>
                    <h4 className="mb-2 font-semibold">Goals:</h4>

                    <ul className="list-disc space-y-1 pl-5">
                      {weekPlan.goals?.map((goal, index) => (
                        <li key={index}>{goal}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 font-semibold">Daily Tasks:</h4>

                    {weekPlan.dailyTasks?.map((day, dayIndex) => (
                      <div key={dayIndex} className="mb-4">
                        <h5 className="mb-2 font-medium">
                          {day.day} ({day.duration})
                        </h5>

                        <ul className="space-y-2">
                          {day.tasks?.map((task, taskIndex) => {
                            const normalized = normalizeTask(task)

                            return (
                              <li key={taskIndex}>
                                <label className="flex items-start gap-2">
                                  <input
                                    type="checkbox"
                                    checked={normalized.completed}
                                    disabled={updatingTask}
                                    onChange={(event) =>
                                      handleTaskToggle(
                                        weekIndex,
                                        dayIndex,
                                        taskIndex,
                                        event.target.checked,
                                      )
                                    }
                                    className="mt-1 h-4 w-4 accent-[#497D74]"
                                  />

                                  <span
                                    className={
                                      normalized.completed
                                        ? 'text-gray-500 line-through'
                                        : 'text-gray-700'
                                    }
                                  >
                                    {normalized.text}
                                  </span>
                                </label>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="border-b border-gray-300">
            <button
              onClick={() => toggleWeek('recommendations')}
              className="flex w-full items-center justify-between py-4 text-left text-base font-semibold sm:text-lg"
            >
              <span>Recommendations</span>
              <span>
                {openWeeks.recommendations ? '−' : '+'}
              </span>
            </button>

            {openWeeks.recommendations && (
              <ul className="list-disc space-y-1 pb-5 pl-5 text-sm sm:text-base">
                {currentPlan.recommendations?.map(
                  (recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ),
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StudyPlanForm({ onPlanGenerated }) {
  const [subject, setSubject] = useState('')
  const [date, setDate] = useState('')
  const [plan, setPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setPlan(null)

    if (!subject.trim()) {
      setError('Please enter a subject')
      return
    }

    if (!date) {
      setError('Please select an exam date')
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('mind_mentor_token')
      const user = JSON.parse(
        localStorage.getItem('mind_mentor_user') || '{}',
      )

      const response = await fetch(
        `${API_BASE_URL}/api/study-plans`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
          body: JSON.stringify({
            userId: user.id,
            subject: subject.trim(),
            examDate: date,
          }),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to create study plan')
      }

      const data = await response.json()
      const generatedPlan = data.plan || data

      setPlan(generatedPlan)
      setSubject('')
      setDate('')
      onPlanGenerated(generatedPlan)
    } catch {
      /*
       * Temporary local fallback.
       * Remove this fallback once Spring Boot is connected.
       */
      const generatedPlan = samplePlan(subject.trim(), date)

      setPlan(generatedPlan)
      setSubject('')
      setDate('')
      onPlanGenerated(generatedPlan)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full rounded-xl border-2 border-b-4 border-r-4 border-black bg-[#F2EDE0] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <form
          onSubmit={handleSubmit}
          className="mb-6 space-y-4 sm:mb-8 sm:space-y-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter your study topic..."
                value={subject}
                onChange={(event) => {
                  setSubject(event.target.value)
                  setError('')
                }}
                className={`w-full rounded-xl border-2 bg-white p-6 text-base text-gray-900 outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-[#c1ff72] sm:text-lg ${
                  error ? 'border-red-500' : 'border-black'
                }`}
              />

              {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
              )}
            </div>

            <div className="relative flex-1">
              <CalendarDays
                size={20}
                className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2 text-gray-600"
              />

              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(event) => {
                  setDate(event.target.value)
                  setError('')
                }}
                className="h-full w-full rounded-xl border-2 border-black bg-white p-6 pl-14 text-base text-gray-700 outline-none focus:ring-2 focus:ring-[#c1ff72] sm:text-lg"
              />
            </div>
          </div>

          <div className="flex w-full justify-center">
            <button
              type="submit"
              disabled={isLoading || !subject.trim() || !date}
              className="inline-flex w-full items-center justify-center rounded-xl border-2 border-black bg-[#c1ff72] px-8 py-3 text-base font-semibold text-gray-800 shadow-[3px_3px_0_#000] transition hover:bg-[#b1ef62] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-4 sm:text-lg"
            >
              {isLoading && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              )}

              {isLoading
                ? 'Generating Your Plan...'
                : 'Create Study Plan'}
            </button>
          </div>
        </form>

        {plan && (
          <div className="mt-6 rounded-xl border-2 border-black bg-white p-4 sm:mt-8 sm:p-6">
            <h3 className="mb-4 text-xl font-semibold">
              Generated Study Plan
            </h3>

            <StudyPlanDisplay plan={plan} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function StudyPlan() {
  const [storedPlans, setStoredPlans] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('mind_mentor_study_plans') || '[]',
      )
    } catch {
      return []
    }
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)

  function savePlans(plans) {
    setStoredPlans(plans)
    localStorage.setItem(
      'mind_mentor_study_plans',
      JSON.stringify(plans),
    )
  }

  function handlePlanGenerated(plan) {
    const updatedPlans = [plan, ...storedPlans]
    savePlans(updatedPlans)
    setCurrentPage(1)
  }

  function handlePlanDelete(planId) {
    savePlans(
      storedPlans.filter((plan) => plan._id !== planId),
    )
  }

  function handleTaskUpdate(updatedPlan) {
    savePlans(
      storedPlans.map((plan) =>
        plan._id === updatedPlan._id ? updatedPlan : plan,
      ),
    )
  }

  const totalPages = Math.ceil(storedPlans.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentPlans = storedPlans.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  )

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-col items-start justify-between sm:mb-8 sm:flex-row sm:items-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-800 sm:mb-0 sm:text-3xl">
          Study Plan Generator
        </h1>

        <span className="text-xs text-gray-600 sm:text-sm">
          Create and manage your study plans
        </span>
      </div>

      <div className="w-full">
        <StudyPlanForm onPlanGenerated={handlePlanGenerated} />
      </div>

      <div id="stored-plans" className="mt-8 sm:mt-12">
        <div className="my-6 h-px bg-gray-400 sm:my-8" />

        <h2 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">
          Your Study Plans
        </h2>

        {loading ? (
          <div className="space-y-4">
            <div className="h-40 animate-pulse rounded-xl bg-gray-300" />
            <div className="h-40 animate-pulse rounded-xl bg-gray-300" />
          </div>
        ) : storedPlans.length > 0 ? (
          <>
            <div className="space-y-4 sm:space-y-6">
              {currentPlans.map((plan) => (
                <StoredPlan
                  key={plan._id}
                  plan={plan}
                  onDelete={handlePlanDelete}
                  onTaskUpdate={handleTaskUpdate}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  className="rounded-md border-2 border-black bg-white px-4 py-2 text-sm disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1),
                    )
                  }
                  className="rounded-md border-2 border-black bg-white px-4 py-2 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <p>You haven&apos;t created any study plans yet.</p>
            <p className="mt-2">
              Use the form above to create your first study plan!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}