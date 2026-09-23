import { lazy, Suspense, useState } from 'react'
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  Home,
  LogOut,
  Menu,
  NotebookPen,
  PlayCircle,
  Settings,
  UserRound,
  UsersRound,
  Bot,
  X,
} from 'lucide-react'
import Profile from './components/profile';
import Resources from './components/Resources';
import StudyPlan from './components/StudyPlan';
import Timer from './components/Timer';
import Notes from './components/Notes';

// The 3D classroom pulls in three.js, so it only loads when the tutor is opened
const Tutor3D = lazy(() => import('./components/tutor3d/Tutor3D'));

function MindMentorLogo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#c1ff72" />
          <stop offset="100%" stopColor="#7dd956" />
        </linearGradient>
      </defs>

      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="14"
        fill="url(#logo-gradient)"
        stroke="#1a1a2e"
        strokeWidth="2.5"
      />

      <path
        d="M22 36c-3-1-5-4-5-7 0-2 1-4 2.5-5.5C21 22 23 21 25 21c1.5 0 3 .5 4 1.5 1-2 3-3.5 5.5-3.5"
        stroke="#1a1a2e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        d="M42 36c3-1 5-4 5-7 0-2-1-4-2.5-5.5C43 22 41 21 39 21c-1.5 0-3 .5-4 1.5-1-2-3-3.5-5.5-3.5"
        stroke="#1a1a2e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        d="M32 18v20"
        stroke="#1a1a2e"
        strokeWidth="2"
        strokeDasharray="2 3"
      />

      <circle cx="27" cy="26" r="1.8" fill="#1a1a2e" />
      <circle cx="37" cy="26" r="1.8" fill="#1a1a2e" />
      <circle cx="32" cy="32" r="1.8" fill="#1a1a2e" />

      <path d="M22 44l10-4 10 4-10 4z" fill="#1a1a2e" />
      <line x1="42" y1="44" x2="42" y2="50" stroke="#1a1a2e" strokeWidth="1.5" />
      <circle cx="42" cy="51" r="1.2" fill="#ffd700" />
    </svg>
  )
}

function LandingHeader({ onSignIn, onSignUp }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-slate-500/60 bg-[#efe9d5]/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <MindMentorLogo size={32} />
          Mind Mentor
        </div>

        <nav className="flex items-center gap-2">
          <a
            href="https://github.com/KartikLabhshetwar/mind-mentor"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-lg border-2 border-black bg-[#c1ff72] px-4 py-1.5 text-sm shadow-[0_2px_0_#000] sm:block"
          >
            GitHub
          </a>

          <button
            onClick={onSignIn}
            className="rounded-md border border-black bg-white px-3 py-1.5 text-xs sm:px-4 sm:text-sm"
          >
            Sign In
          </button>

          <button
            onClick={onSignUp}
            className="rounded-lg border-2 border-black bg-[#c1ff72] px-3 py-1.5 text-xs shadow-[0_2px_0_#000] sm:px-4 sm:text-sm"
          >
            Sign Up
          </button>
        </nav>
      </div>
    </header>
  )
}

function LandingPage({ onSignIn, onSignUp }) {
  return (
    <div className="min-h-screen bg-[#efe9d5] text-slate-800">
      <LandingHeader onSignIn={onSignIn} onSignUp={onSignUp} />

      <main className="px-5 pb-20 pt-32 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 flex justify-center">
            <MindMentorLogo size={64} />
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Welcome to <span className="text-[#7fb236]">Mind Mentor</span>
          </h1>

          <p className="mt-3 text-slate-600">
            Your AI-powered study assistant for accelerated learning
          </p>

          <button
            onClick={onSignUp}
            className="mt-7 inline-flex items-center gap-1 rounded-full border-2 border-black bg-[#c1ff72] px-5 py-2.5 text-sm font-semibold shadow-[3px_3px_0_#000]"
          >
            Get Started
            <ChevronRight size={19} />
          </button>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-5 sm:grid-cols-3">
          <FeatureCard
            icon={<BookOpen size={20} />}
            title="Personalized Study Plans"
            text="Get tailored study plans based on your goals and learning style."
          />

          <FeatureCard
            icon={<UsersRound size={20} />}
            title="AI-Curated Resources"
            text="Access the best learning materials curated by our AI."
          />

          <FeatureCard
            icon={<Clock3 size={20} />}
            title="Time Management"
            text="Manage your time effectively and stay on top of your studies."
          />
        </div>
      </main>
    </div>
  )
}

function FeatureCard({ icon, title, text }) {
  return (
    <article className="rounded-lg border-2 border-black bg-white p-5 text-left shadow-[3px_3px_0_#000]">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0ffdb] text-[#7fb236]">
          {icon}
        </div>

        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>

      <p className="text-xs leading-5 text-slate-500">{text}</p>
    </article>
  )
}

function AuthModal({ type, onClose, onSuccess }) {
  const isSignIn = type === 'signin'

  function handleSubmit(event) {
    event.preventDefault()
    onSuccess()
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-5"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-md rounded-xl border-2 border-black bg-white p-7 shadow-[6px_6px_0_#000]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-slate-500 hover:text-black"
        >
          <X size={22} />
        </button>

        <h2 className="mb-5 text-2xl font-bold text-slate-800">
          {isSignIn ? 'Sign In' : 'Create Account'}
        </h2>

        {!isSignIn && (
          <input
            required
            type="text"
            placeholder="Full name"
            className="mb-3 w-full rounded-md border border-slate-400 px-3 py-2 outline-none focus:ring-2 focus:ring-[#c1ff72]"
          />
        )}

        <input
          required
          type="email"
          placeholder="Email address"
          className="mb-3 w-full rounded-md border border-slate-400 px-3 py-2 outline-none focus:ring-2 focus:ring-[#c1ff72]"
        />

        <input
          required
          type="password"
          placeholder="Password"
          className="mb-4 w-full rounded-md border border-slate-400 px-3 py-2 outline-none focus:ring-2 focus:ring-[#c1ff72]"
        />

        <button
          type="submit"
          className="w-full rounded-md border-2 border-black bg-[#c1ff72] px-4 py-2.5 font-semibold shadow-[2px_2px_0_#000]"
        >
          {isSignIn ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
    </div>
  )
}

function Sidebar({ activePage, setActivePage, onLogout, mobileOpen, setMobileOpen }) {
  const generalLinks = [
    { name: 'Home', icon: Home },
    { name: 'Profile', icon: UserRound },
  ]

 const studyLinks = [
  { name: 'Planner', icon: CalendarDays },
  { name: 'Resources', icon: BookOpen },
  { name: 'Timer', icon: Clock3 },
  { name: 'Notes', icon: NotebookPen },
  { name: 'AI Tutor', icon: Bot },
]

  function NavItem({ item }) {
    const Icon = item.icon
    const active = activePage === item.name

    return (
      <button
        onClick={() => {
          setActivePage(item.name)
          setMobileOpen(false)
        }}
        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
          active
            ? 'bg-[#dceac1] font-semibold text-slate-800'
            : 'text-slate-600 hover:bg-[#f1edda]'
        }`}
      >
        <Icon size={16} />
        {item.name}
      </button>
    )
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-16 z-40 w-64 border-r border-slate-400/70 bg-[#efe9d5] p-5 transition-transform lg:static lg:block lg:w-52 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-7">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase text-slate-500">
            General
          </p>

          <div className="space-y-1">
            {generalLinks.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase text-slate-500">
            Study Tools
          </p>

          <div className="space-y-1">
            {studyLinks.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        </div>

        <button
          onClick={onLogout}
          className="mt-8 flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-red-600"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </aside>
    </>
  )
}

function DashboardHeader({ onMenu }) {
  return (
    <header className="fixed inset-x-0 top-0 z-20 h-16 border-b border-slate-400/70 bg-[#efe9d5]">
      <div className="flex h-full items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenu}
            className="rounded-md p-1 text-slate-600 hover:bg-[#dceac1] lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <MindMentorLogo size={32} />
            <span>Mind Mentor</span>
          </div>
        </div>

        <button className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-500 bg-[#f8f5e9] text-xs text-slate-700">
          K
        </button>
      </div>
    </header>
  )
}

function ContributionCalendar() {
  const columns = Array.from({ length: 52 })
  const rows = Array.from({ length: 7 })

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[650px]">
        <div className="mb-2 ml-12 flex justify-between text-xs text-slate-500">
          {['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'].map(
            (month, index) => (
              <span key={`${month}-${index}`}>{month}</span>
            ),
          )}
        </div>

        <div className="flex gap-2">
          <div className="flex flex-col justify-between py-1 text-[11px] text-slate-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="grid flex-1 grid-flow-col grid-rows-7 gap-1">
            {columns.map((_, columnIndex) =>
              rows.map((__, rowIndex) => (
                <button
                  key={`${columnIndex}-${rowIndex}`}
                  title="No study activity"
                  className="h-3 w-3 rounded-[2px] border border-[#e8e4cf] bg-[#f4f0dd] transition hover:border-[#7fb236] hover:bg-[#dceac1]"
                />
              )),
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-slate-500">
          Less
          <span className="h-3 w-3 rounded-sm bg-[#f4f0dd]" />
          <span className="h-3 w-3 rounded-sm bg-[#dceac1]" />
          <span className="h-3 w-3 rounded-sm bg-[#b8d995]" />
          <span className="h-3 w-3 rounded-sm bg-[#7fb236]" />
          More
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-lg border-2 border-slate-500/80 bg-[#f3eedc] p-4 shadow-[0_2px_0_rgba(80,90,80,0.15)] sm:p-5">
      <p className="text-xs font-semibold text-slate-600 sm:text-sm">{title}</p>
      <p className="mt-3 text-2xl font-bold text-slate-700">{value}</p>
    </div>
  )
}

function DashboardPage({ onLogout }) {
  const [activePage, setActivePage] = useState('Home')
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#efe9d5] text-slate-800">
      <DashboardHeader onMenu={() => setMobileOpen(true)} />

      <div className="flex min-h-screen pt-16">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          onLogout={onLogout}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main
          className={`min-w-0 flex-1 ${
            activePage === 'AI Tutor' ? '' : 'px-4 py-6 sm:px-6 lg:px-10'
          }`}
        >
      {activePage === 'Home' ? (
  <DashboardHome />
) : activePage === 'Profile' ? (
  <Profile
    user={{
      name: 'kartik',
      email: 'kartik@example.com',
    }}
  />
) : activePage === 'Planner' ? (
  <StudyPlan />
) : activePage === 'Resources' ? (
  <Resources />
) : activePage === 'Timer' ? (
  <Timer />
) : activePage === 'Notes' ? (
  <Notes />
) : activePage === 'AI Tutor' ? (
  <Suspense
    fallback={
      <div className="grid h-[calc(100vh-4rem)] place-items-center bg-[#2a201d] text-sm text-white/70">
        Opening the classroom…
      </div>
    }
  >
    <Tutor3D />
  </Suspense>
) : (
  <PlaceholderPage title={activePage} />
)}
        </main>
      </div>
    </div>
  )
}

function DashboardHome() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-slate-700 sm:text-2xl">
          kartik's Study Activity
        </h1>

        <span className="text-xs text-slate-500 sm:text-sm">
          Last updated: 2/5/2025
        </span>
      </div>

      <section className="rounded-lg border-2 border-slate-500/80 bg-[#f3eedc] shadow-[0_3px_0_#57917b]">
        <div className="border-b border-slate-300 px-4 py-4">
          <h2 className="text-sm font-semibold text-slate-700">
            Your Study Contributions
          </h2>
        </div>

        <div className="p-4 sm:p-6">
          <ContributionCalendar />
        </div>
      </section>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Current Streak" value="0 days" />
        <StatCard title="Total Study Days" value="0 days" />
        <StatCard title="Best Streak" value="0 days" />
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border-2 border-slate-400/70 bg-[#f3eedc] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#dceac1] p-2 text-[#668f32]">
              <PlayCircle size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-700">Start studying</h2>
              <p className="text-sm text-slate-500">
                Begin a focused study session.
              </p>
            </div>
          </div>

          <button className="mt-5 inline-flex items-center gap-2 rounded-md border-2 border-black bg-[#c1ff72] px-4 py-2 text-sm font-semibold shadow-[2px_2px_0_#000]">
            Start Timer
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="rounded-lg border-2 border-slate-400/70 bg-[#f3eedc] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#dceac1] p-2 text-[#668f32]">
              <FileText size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-700">Your notes</h2>
              <p className="text-sm text-slate-500">
                Create and manage your study notes.
              </p>
            </div>
          </div>

          <button className="mt-5 inline-flex items-center gap-2 rounded-md border-2 border-slate-700 bg-white px-4 py-2 text-sm font-semibold">
            Open Notes
            <ChevronRight size={16} />
          </button>
        </div>
      </section>
    </div>
  )
}

function PlaceholderPage({ title }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
      <div className="rounded-lg border-2 border-slate-500 bg-[#f3eedc] px-12 py-10 text-center shadow-[3px_3px_0_#000]">
        <Settings className="mx-auto mb-4 text-[#7fb236]" size={38} />
        <h1 className="text-2xl font-bold text-slate-700">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          This section will be added next.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authModal, setAuthModal] = useState(null)

  if (isLoggedIn) {
    return <DashboardPage onLogout={() => setIsLoggedIn(false)} />
  }

  return (
    <>
      <LandingPage
        onSignIn={() => setAuthModal('signin')}
        onSignUp={() => setAuthModal('signup')}
      />

      {authModal && (
        <AuthModal
          type={authModal}
          onClose={() => setAuthModal(null)}
          onSuccess={() => {
            setAuthModal(null)
            setIsLoggedIn(true)
          }}
        />
      )}
    </>
  )
}