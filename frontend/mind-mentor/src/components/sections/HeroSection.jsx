import { ChevronRight } from 'lucide-react'
import MindMentorLogo from './MindMentorLogo'

function HeroSection({ onGetStarted }) {
  return (
    <section className="hero-section">
      <div className="hero-logo">
        <MindMentorLogo size={64} />
      </div>

      <h1>
        Welcome to <span>Mind Mentor</span>
      </h1>

      <p>
        Your AI-powered study assistant for accelerated learning
      </p>

      <button className="get-started-button" onClick={onGetStarted}>
        Get Started
        <ChevronRight size={20} />
      </button>
    </section>
  )
}

export default HeroSection