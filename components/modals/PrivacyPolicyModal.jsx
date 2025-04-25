"use client"
import { useLanguage } from "@/contexts/language-context"
import "@/styles/components/specific-modals-styles.css"

const PrivacyPolicyModal = ({ onClose, onAccept }) => {
  const { t } = useLanguage()
  
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
              {t("PRIVACY_MODAL_TITLE", "modales")}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <h4>{t("PRIVACY_MODAL_HEADER", "modales")}</h4>
            <p>
              <strong>{t("PRIVACY_MODAL_RESPONSIBLE_TITLE", "modales")}</strong>
            </p>
            <p>{t("PRIVACY_MODAL_RESPONSIBLE_TEXT", "modales")}</p>

            <p>
              <strong>{t("PRIVACY_MODAL_PURPOSE_TITLE", "modales")}</strong>
            </p>
            <p>{t("PRIVACY_MODAL_PURPOSE_TEXT", "modales")}</p>

            <p>
              <strong>{t("PRIVACY_MODAL_LEGITIMATION_TITLE", "modales")}</strong>
            </p>
            <p>{t("PRIVACY_MODAL_LEGITIMATION_TEXT", "modales")}</p>

            <p>
              <strong>{t("PRIVACY_MODAL_RECIPIENTS_TITLE", "modales")}</strong>
            </p>
            <p>{t("PRIVACY_MODAL_RECIPIENTS_TEXT", "modales")}</p>

            <p>
              <strong>{t("PRIVACY_MODAL_CONSERVATION_TITLE", "modales")}</strong>
            </p>
            <p>{t("PRIVACY_MODAL_CONSERVATION_TEXT", "modales")}</p>

            <p>
              <strong>{t("PRIVACY_MODAL_RIGHTS_TITLE", "modales")}</strong>
            </p>
            <p>{t("PRIVACY_MODAL_RIGHTS_TEXT", "modales")}</p>

            <p>
              <strong>{t("PRIVACY_MODAL_ADDITIONAL_TITLE", "modales")}</strong>
            </p>
            <p>{t("PRIVACY_MODAL_ADDITIONAL_TEXT", "modales")}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t("PRIVACY_MODAL_CLOSE", "modales")}
            </button>
            <button type="button" className="btn btn-primary" id="accept-privacy" onClick={onAccept}>
              {t("PRIVACY_MODAL_ACCEPT", "modales")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyModal