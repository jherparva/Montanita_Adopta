"use client"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import "@/styles/components/specific-modals-styles.css"

const ThankYouModal = ({ onClose }) => {
  const { t } = useLanguage()
  
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
              {t("THANKYOU_MODAL_TITLE", "modales")}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body text-center">
            <div className="thank-you-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h4>{t("THANKYOU_MODAL_HEADER", "modales")}</h4>
            <p>{t("THANKYOU_MODAL_TEXT", "modales")}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t("THANKYOU_MODAL_CLOSE", "modales")}
            </button>
            <Link href="/" className="btn btn-primary">
              {t("THANKYOU_MODAL_HOME", "modales")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThankYouModal