"use client"
import Link from "next/link"
import "@/styles/components/specific-modals-styles.css"

const ThankYouModal = ({ onClose }) => {
  return (
    <div
      className="modal fade show"
      id="thankYouModal"
      tabIndex="-1"
      aria-labelledby="thankYouModalLabel"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="thankYouModalLabel">
              ¡Mensaje Enviado!
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body text-center">
            <div className="thank-you-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h4>¡Gracias por contactarnos!</h4>
            <p>Hemos recibido tu mensaje correctamente. Nos pondremos en contacto contigo lo antes posible.</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
            <Link href="/" className="btn btn-primary">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThankYouModal

