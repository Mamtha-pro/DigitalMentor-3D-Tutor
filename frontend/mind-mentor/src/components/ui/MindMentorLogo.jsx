function MindMentorLogo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mind Mentor logo"
    >
      <defs>
        <linearGradient
          id="logo-background"
          x1="0"
          y1="0"
          x2="64"
          y2="64"
        >
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
        fill="url(#logo-background)"
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

      <path
        d="M22 44l10-4 10 4-10 4z"
        fill="#1a1a2e"
        opacity="0.9"
      />

      <line
        x1="42"
        y1="44"
        x2="42"
        y2="50"
        stroke="#1a1a2e"
        strokeWidth="1.5"
      />

      <circle cx="42" cy="51" r="1.2" fill="#ffd700" />
    </svg>
  )
}

export default MindMentorLogo