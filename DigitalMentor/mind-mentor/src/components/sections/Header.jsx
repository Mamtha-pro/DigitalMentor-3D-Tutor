import { useState } from 'react'
import MindMentorLogo from './MindMentorLogo'

function Header() {
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)

  return (
    <>
      <header className="header">
        <div className="header-content">
          <a href="/" className="brand">
            <MindMentorLogo size={32} />
            <span>Mind Mentor</span>
          </a>

          <nav className="navigation">
            <a
              href="https://github.com/KartikLabhshetwar/mind-mentor"
              target="_blank"
              rel="noreferrer"
              className="github-button"
            >
              GitHub
            </a>

            <button
              className="signin-button"
              onClick={() => setShowLogin(true)}
            >
              Sign In
            </button>

            <button
              className="signup-button"
              onClick={() => setShowSignup(true)}
            >
              Sign Up
            </button>
          </nav>
        </div>
      </header>

      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setShowLogin(false)}
            >
              ×
            </button>

            <h2>Sign In</h2>
            <input type="email" placeholder="Email address" />
            <input type="password" placeholder="Password" />
            <button className="modal-submit">Sign In</button>
          </div>
        </div>
      )}

      {showSignup && (
        <div className="modal-overlay" onClick={() => setShowSignup(false)}>
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setShowSignup(false)}
            >
              ×
            </button>

            <h2>Create Account</h2>
            <input type="text" placeholder="Full name" />
            <input type="email" placeholder="Email address" />
            <input type="password" placeholder="Password" />
            <button className="modal-submit">Sign Up</button>
          </div>
        </div>
      )}
    </>
  )
}

export default Header