import Link from "next/link"

const AdoptionStepsSection = () => {
  return (
    <section className="adoption-steps-section" id="adoptar">
      <div className="container">
        <div className="section-header">
          <h2>Cómo Adoptar</h2>
          <div className="paw-divider">
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
          </div>
          <p>Sigue estos sencillos pasos para darle un hogar a uno de nuestros peludos</p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon">
              <i className="fas fa-search"></i>
            </div>
            <h3>Encuentra tu compañero</h3>
            <p>Explora nuestro catálogo de animales disponibles para adopción y encuentra el que conecte contigo.</p>
            <Link href="/adopcion" className="step-link">
              Ver animales disponibles
            </Link>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <h3>Completa el formulario</h3>
            <p>
              Llena nuestro formulario de adopción para que podamos conocerte mejor y asegurar un buen hogar para el
              animal.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon">
              <i className="fas fa-comments"></i>
            </div>
            <h3>Entrevista y visita</h3>
            <p>
              Realizaremos una entrevista y posiblemente una visita a tu hogar para asegurar que sea adecuado para el
              animal.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-icon">
              <i className="fas fa-handshake"></i>
            </div>
            <h3>Firma del contrato</h3>
            <p>
              Si todo está en orden, firmarás un contrato de adopción comprometiéndote al cuidado responsable del
              animal.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">5</div>
            <div className="step-icon">
              <i className="fas fa-home"></i>
            </div>
            <h3>¡Llévalo a casa!</h3>
            <p>
              Finalmente, podrás llevar a tu nuevo amigo a casa y comenzar una vida juntos llena de amor y aventuras.
            </p>
          </div>
        </div>

        <div className="adoption-cta">
          <p>¿Listo para cambiar una vida?</p>
          <Link href="/adopcion" className="btn btn-primary">
            Adoptar ahora
          </Link>
        </div>
      </div>
    </section>
  )
}

export default AdoptionStepsSection