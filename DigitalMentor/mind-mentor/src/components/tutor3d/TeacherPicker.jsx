import { teacherImage } from './assets'
import { TEACHERS, useTutor } from './useTutor'

export function TeacherPicker() {
  const teacher = useTutor((state) => state.teacher)
  const setTeacher = useTutor((state) => state.setTeacher)

  return (
    <div className="rounded-2xl border border-white/25 bg-slate-900/45 p-3 shadow-xl backdrop-blur-md">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
        Your guide
      </p>

      <div className="flex gap-2">
        {TEACHERS.map((name) => {
          const active = name === teacher
          return (
            <button
              key={name}
              onClick={() => setTeacher(name)}
              aria-pressed={active}
              className={`rounded-xl border-2 p-1 text-center transition ${
                active
                  ? 'border-black bg-[#c1ff72] text-black shadow-[2px_2px_0_#000]'
                  : 'border-transparent bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <img
                src={teacherImage(name)}
                alt=""
                className="h-14 w-14 rounded-lg object-cover object-top"
              />
              <span className="mt-1 block text-xs font-semibold">{name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
