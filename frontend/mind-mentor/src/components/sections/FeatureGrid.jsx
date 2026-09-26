import FeatureCard from './FeatureCard'

function FeatureGrid({ features }) {
  return (
    <section className="feature-grid">
      {features.map((feature) => (
        <FeatureCard
          key={feature.title}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </section>
  )
}

export default FeatureGrid