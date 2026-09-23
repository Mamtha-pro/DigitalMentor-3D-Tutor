function FeatureCard({ icon, title, description }) {
  return (
    <article className="feature-card">
      <div className="feature-heading">
        <div className="feature-icon">{icon}</div>
        <h3>{title}</h3>
      </div>

      <p>{description}</p>
    </article>
  )
}

export default FeatureCard