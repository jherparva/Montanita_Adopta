import Link from "next/link"

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <h1>Montañita Adopta</h1>
          <p className="hero-subtitle">Dando segundas oportunidades a quienes más lo necesitan</p>
          <p className="hero-description">
            Somos una organización sin fines de lucro dedicada al rescate, rehabilitación y adopción de animales
            abandonados en La Montañita, Caquetá.
          </p>
          <div className="hero-buttons">
            <Link href="/adopcion" className="btn btn-primary">
              <i className="fas fa-paw"></i> Adoptar
            </Link>
            <Link href="/donaciones" className="btn btn-secondary">
              <i className="fas fa-heart"></i> Donar
            </Link>
          </div>
        </div>
      </div>
      <div className="hero-wave"></div>
    </section>
  )
}

export default HeroSection

