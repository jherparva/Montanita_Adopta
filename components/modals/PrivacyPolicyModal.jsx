"use client"
import "@/styles/components/specific-modals-styles.css"

const PrivacyPolicyModal = ({ onClose, onAccept }) => {
  return (
    <div
      className="modal fade show"
      id="privacyPolicyModal"
      tabIndex="-1"
      aria-labelledby="privacyPolicyModalLabel"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="privacyPolicyModalLabel">
              Política de Privacidad
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <h4>Política de Privacidad y Tratamiento de Datos Personales</h4>
            <p>
              <strong>1. Responsable del tratamiento</strong>
            </p>
            <p>
              La Asociación de Protección Animal "Montañita Adopta" (en adelante, "Montañita Adopta"), con domicilio en
              La Montañita, Caqueta y CIF [NÚMERO], es el responsable del tratamiento de los datos personales que nos
              facilite a través de este formulario de contacto.
            </p>

            <p>
              <strong>2. Finalidad del tratamiento</strong>
            </p>
            <p>
              Los datos personales que nos proporcione serán tratados con la finalidad de atender las consultas que nos
              realice a través del formulario de contacto y, en su caso, gestionar los procesos de adopción o las
              actividades relacionadas con nuestra asociación en las que pueda estar interesado.
            </p>

            <p>
              <strong>3. Legitimación</strong>
            </p>
            <p>
              La base legal para el tratamiento de sus datos es su consentimiento, que nos otorga al marcar la casilla
              correspondiente y enviar el formulario de contacto.
            </p>

            <p>
              <strong>4. Destinatarios</strong>
            </p>
            <p>
              Sus datos no serán cedidos a terceros, salvo obligación legal o cuando sea necesario para la gestión de
              los procesos de adopción, en cuyo caso se le informará previamente.
            </p>

            <p>
              <strong>5. Conservación de los datos</strong>
            </p>
            <p>
              Sus datos se conservarán durante el tiempo necesario para atender su consulta y, en su caso, gestionar los
              procesos de adopción o las actividades relacionadas con nuestra asociación en las que pueda estar
              interesado.
            </p>

            <p>
              <strong>6. Derechos</strong>
            </p>
            <p>
              Tiene derecho a acceder, rectificar y suprimir sus datos, así como a ejercer otros derechos, como se
              explica en la información adicional.
            </p>

            <p>
              <strong>7. Información adicional</strong>
            </p>
            <p>
              Puede consultar la información adicional y detallada sobre Protección de Datos en nuestra política de
              privacidad completa disponible en nuestra página web.
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
            <button type="button" className="btn btn-primary" id="accept-privacy" onClick={onAccept}>
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyModal

