const DonationsHero = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <h1>¡Tu Ayuda Salva Vidas!</h1>
        <p className="urgent-message">
          <i className="fas fa-exclamation-circle"></i> URGENTE: Necesitamos tu apoyo ahora para 12 cachorros rescatados
          esta semana
        </p>
        <p>Cada donación nos acerca un paso más a un mundo donde ningún animal sufre abandono o maltrato.</p>
        <div className="hero-buttons">
          <a href="#donacion-monetaria" className="btn btn-primary">
            Donar Ahora
          </a>
          <a href="#donacion-alimentos" className="btn btn-outline-primary">
            Donar Alimentos
          </a>
        </div>
      </div>
    </section>
  )
}

export default DonationsHero