import Link from "next/link"

const AboutSection = () => {
  return (
    <section className="about-section" id="nosotros">
      <div className="container">
        <div className="section-header">
          <h2>Quienes Somos</h2>
          <div className="paw-divider">
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
          </div>
          <p>Conoce nuestra misión y cómo trabajamos para mejorar la vida de los animales</p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <div className="about-icon">
              <i className="fas fa-heart"></i>
            </div>
            <h3>Nuestra Misión</h3>
            <p>
              Rescatar, rehabilitar y encontrar hogares amorosos para animales abandonados y maltratados en La
              Montañita, Caquetá.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">
              <i className="fas fa-eye"></i>
            </div>
            <h3>Nuestra Visión</h3>
            <p>
              Crear una comunidad donde ningún animal sufra abandono o maltrato, y todos tengan la oportunidad de vivir
              en un hogar lleno de amor.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">
              <i className="fas fa-hands-helping"></i>
            </div>
            <h3>Cómo Ayudamos</h3>
            <p>
              Rescatamos animales en situación de calle, les brindamos atención veterinaria, los rehabilitamos y
              trabajamos para encontrarles familias responsables.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">
              <i className="fas fa-users"></i>
            </div>
            <h3>Nuestro Equipo</h3>
            <p>
              Somos un grupo de voluntarios apasionados por el bienestar animal, comprometidos con hacer una diferencia
              en nuestra comunidad.
            </p>
            <Link href="/voluntario" className="about-link">
              Únete a nosotros
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection