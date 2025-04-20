import Link from "next/link"

const AyudaSection = () => {
  return (
    <section className="ayuda-section">
      <div className="container">
        <div className="ayuda-content">
          <h2>¿Quieres hacer la diferencia?</h2>
          <p>Hay muchas formas de ayudar a los animales que lo necesitan</p>

          <div className="ayuda-buttons">
            <Link href="/adopcion" className="btn btn-primary">
              <i className="fas fa-paw"></i> Adoptar
            </Link>
            <Link href="/donaciones" className="btn btn-secondary">
              <i className="fas fa-heart"></i> Donar
            </Link>
            <Link href="/voluntario" className="btn btn-tertiary">
              <i className="fas fa-hands-helping"></i> Ser Voluntario
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AyudaSection