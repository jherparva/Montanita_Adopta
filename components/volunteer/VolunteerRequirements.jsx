const VolunteerRequirements = () => {
  return (
    <section className="volunteer-requirements">
      <div className="container">
        <h2>Requisitos para ser Voluntario</h2>

        <div className="requirements-grid">
          <div className="requirement-card">
            <div className="requirement-icon">
              <i className="fas fa-user-clock"></i>
            </div>
            <h3>Edad mínima</h3>
            <p>Ser mayor de 18 años. Los menores pueden participar acompañados de un adulto responsable.</p>
          </div>

          <div className="requirement-card">
            <div className="requirement-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <h3>Compromiso</h3>
            <p>Disponibilidad para cumplir con el horario acordado de manera regular.</p>
          </div>

          <div className="requirement-card">
            <div className="requirement-icon">
              <i className="fas fa-heart"></i>
            </div>
            <h3>Amor por los animales</h3>
            <p>Pasión y respeto por los animales y su bienestar.</p>
          </div>

          <div className="requirement-card">
            <div className="requirement-icon">
              <i className="fas fa-hands-helping"></i>
            </div>
            <h3>Trabajo en equipo</h3>
            <p>Capacidad para trabajar en equipo y seguir instrucciones.</p>
          </div>

          <div className="requirement-card">
            <div className="requirement-icon">
              <i className="fas fa-file-signature"></i>
            </div>
            <h3>Documentación</h3>
            <p>Documento de identidad vigente y completar el formulario de solicitud.</p>
          </div>

          <div className="requirement-card">
            <div className="requirement-icon">
              <i className="fas fa-book-reader"></i>
            </div>
            <h3>Capacitación</h3>
            <p>Disposición para recibir capacitación sobre el manejo adecuado de los animales.</p>
          </div>
        </div>

        <div className="process-steps">
          <h3>Proceso de Selección</h3>
          <ol className="steps-list">
            <li>
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>Envío de solicitud</h4>
                <p>Completa el formulario de solicitud con tus datos y áreas de interés.</p>
              </div>
            </li>
            <li>
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>Revisión de solicitud</h4>
                <p>Nuestro equipo revisará tu solicitud y verificará la información proporcionada.</p>
              </div>
            </li>
            <li>
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>Entrevista</h4>
                <p>Si tu perfil es compatible, te contactaremos para una entrevista presencial o virtual.</p>
              </div>
            </li>
            <li>
              <span className="step-number">4</span>
              <div className="step-content">
                <h4>Capacitación</h4>
                <p>Recibirás una capacitación sobre nuestros protocolos y el manejo adecuado de los animales.</p>
              </div>
            </li>
            <li>
              <span className="step-number">5</span>
              <div className="step-content">
                <h4>Incorporación</h4>
                <p>¡Bienvenido al equipo! Comenzarás tus actividades según el área y horario acordados.</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}

export default VolunteerRequirements