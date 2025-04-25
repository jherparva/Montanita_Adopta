"use client"
import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"

const MonetaryDonation = () => {
  const { t } = useLanguage()
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [showEvidenceModal, setShowEvidenceModal] = useState(false)
  const [formData, setFormData] = useState({
    type: "monetary",
    amount: "",
    paymentMethod: "nequi",
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [evidenceFile, setEvidenceFile] = useState(null)
  const [evidencePreview, setEvidencePreview] = useState("")
  const [currentDonationId, setCurrentDonationId] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef(null)
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        const data = await response.json()

        if ((data.authenticated || data.isAuthenticated) && data.user) {
          setIsAuthenticated(true)
          setUserData(data.user)

          setFormData((prev) => ({
            ...prev,
            donorName: data.user.name || data.user.nombre || prev.donorName,
            donorEmail: data.user.email || prev.donorEmail,
          }))
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEvidenceChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEvidenceFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setEvidencePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      document.dispatchEvent(new CustomEvent("open-login-modal"))
      window.dispatchEvent(new CustomEvent("open-login-modal"))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        if (data.donationId) {
          setCurrentDonationId(data.donationId)
        }

        setShowDonationForm(false)

        window.Swal.fire({
          title: t("MONETARY_DONATION_SUCCESS_TITLE", "donaciones"),
          text: t("MONETARY_DONATION_SUCCESS_TEXT", "donaciones"),
          icon: "success",
          showCancelButton: true,
          confirmButtonColor: "#4caf50",
          cancelButtonColor: "#f44336",
          confirmButtonText: t("MONETARY_DONATION_SUCCESS_BUTTON_YES", "donaciones"),
          cancelButtonText: t("MONETARY_DONATION_SUCCESS_BUTTON_NO", "donaciones"),
        }).then((result) => {
          if (result.isConfirmed) {
            setShowEvidenceModal(true)
          } else {
            window.Swal.fire({
              title: t("MONETARY_DONATION_THANKS_TITLE", "donaciones"),
              text: t("MONETARY_DONATION_THANKS_TEXT", "donaciones"),
              icon: "success",
              confirmButtonColor: "#4caf50",
            })
            resetForm()
          }
        })
      } else {
        window.Swal.fire({
          title: t("MONETARY_DONATION_ERROR_TITLE", "donaciones"),
          text: data.message || t("MONETARY_DONATION_ERROR_PROCESSING", "donaciones"),
          icon: "error",
          confirmButtonColor: "#f44336",
        })
      }
    } catch (error) {
      console.error("Error submitting donation:", error)
      window.Swal.fire({
        title: t("MONETARY_DONATION_ERROR_TITLE", "donaciones"),
        text: t("MONETARY_DONATION_ERROR_PROCESSING", "donaciones"),
        icon: "error",
        confirmButtonColor: "#f44336",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEvidenceSubmit = async (e) => {
    e.preventDefault()

    if (!evidenceFile) {
      window.Swal.fire({
        title: t("MONETARY_DONATION_ERROR_TITLE", "donaciones"),
        text: t("MONETARY_DONATION_ERROR_EVIDENCE_MISSING", "donaciones"),
        icon: "warning",
        confirmButtonColor: "#f44336",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("file", evidenceFile)

      if (currentDonationId) {
        formData.append("donationId", String(currentDonationId))
      }

      const response = await fetch("/api/donations/evidence", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setShowEvidenceModal(false)

        window.Swal.fire({
          title: t("MONETARY_DONATION_EVIDENCE_SUCCESS_TITLE", "donaciones"),
          text: t("MONETARY_DONATION_EVIDENCE_SUCCESS_TEXT", "donaciones"),
          icon: "success",
          confirmButtonColor: "#4caf50",
        })

        resetForm()
      } else {
        window.Swal.fire({
          title: t("MONETARY_DONATION_ERROR_TITLE", "donaciones"),
          text: data.message || t("MONETARY_DONATION_ERROR_EVIDENCE", "donaciones"),
          icon: "error",
          confirmButtonColor: "#f44336",
        })
      }
    } catch (error) {
      console.error("Error uploading evidence:", error)
      window.Swal.fire({
        title: t("MONETARY_DONATION_ERROR_TITLE", "donaciones"),
        text: t("MONETARY_DONATION_ERROR_EVIDENCE", "donaciones"),
        icon: "error",
        confirmButtonColor: "#f44336",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      type: "monetary",
      amount: "",
      paymentMethod: "nequi",
      donorName: userData ? userData.name || userData.nombre : "",
      donorEmail: userData ? userData.email : "",
      donorPhone: "",
      notes: "",
    })
    setEvidenceFile(null)
    setEvidencePreview("")
    setShowEvidenceModal(false)
    setShowDonationForm(false)
    setCurrentDonationId(null)
  }

  const handlePaymentMethodClick = (method) => {
    if (!isAuthenticated) {
      document.dispatchEvent(new CustomEvent("open-login-modal"))
      window.dispatchEvent(new CustomEvent("open-login-modal"))
      return
    }

    setFormData(prev => ({
      ...prev,
      paymentMethod: method,
    }))
    setShowDonationForm(true)
  }

  return (
    <section id="donacion-monetaria" className="about-section">
      <div className="container">
        <div className="section-header">
          <h2>{t("MONETARY_DONATION_TITLE", "donaciones")}</h2>
          <div className="paw-divider">
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
          </div>
          <p>{t("MONETARY_DONATION_SUBTITLE", "donaciones")}</p>
        </div>

        <div className="donation-info-card">
          <h3>{t("MONETARY_DONATION_USAGE_TITLE", "donaciones")}</h3>
          <div className="donation-usage">
            <div className="usage-item">
              <i className="fas fa-medkit"></i>
              <h4>{t("MONETARY_DONATION_USAGE_VET_TITLE", "donaciones")}</h4>
              <p>{t("MONETARY_DONATION_USAGE_VET_TEXT", "donaciones")}</p>
            </div>
            <div className="usage-item">
              <i className="fas fa-utensils"></i>
              <h4>{t("MONETARY_DONATION_USAGE_FOOD_TITLE", "donaciones")}</h4>
              <p>{t("MONETARY_DONATION_USAGE_FOOD_TEXT", "donaciones")}</p>
            </div>
            <div className="usage-item">
              <i className="fas fa-home"></i>
              <h4>{t("MONETARY_DONATION_USAGE_SHELTER_TITLE", "donaciones")}</h4>
              <p>{t("MONETARY_DONATION_USAGE_SHELTER_TEXT", "donaciones")}</p>
            </div>
          </div>
        </div>

        <div className="about-grid">
          <div className="about-card payment-method" id="nequi">
            <div className="about-icon">
              <i className="fas fa-mobile-alt"></i>
            </div>
            <h3>{t("MONETARY_DONATION_NEQUI_TITLE", "donaciones")}</h3>
            <p>{t("MONETARY_DONATION_NEQUI_TEXT", "donaciones")}</p>
            <p className="payment-number">{t("MONETARY_DONATION_NEQUI_NUMBER", "donaciones")}</p>
            <div className="payment-actions">
              <button className="btn btn-primary donate-btn" onClick={() => handlePaymentMethodClick("nequi")}>
                <i className="fas fa-heart me-1"></i> {t("MONETARY_DONATION_NEQUI_BUTTON", "donaciones")}
              </button>
            </div>
          </div>

          <div className="about-card payment-method" id="banco-bogota">
            <div className="about-icon">
              <i className="fas fa-university"></i>
            </div>
            <h3>{t("MONETARY_DONATION_BANK_TITLE", "donaciones")}</h3>
            <p>{t("MONETARY_DONATION_BANK_TEXT", "donaciones")}</p>
            <p className="payment-number">{t("MONETARY_DONATION_BANK_NUMBER", "donaciones")}</p>
            <div className="payment-actions">
              <button className="btn btn-primary donate-btn" onClick={() => handlePaymentMethodClick("banco-bogota")}>
                <i className="fas fa-heart me-1"></i> {t("MONETARY_DONATION_BANK_BUTTON", "donaciones")}
              </button>
            </div>
          </div>

          <div className="about-card payment-method" id="paypal">
            <div className="about-icon">
              <i className="fab fa-paypal"></i>
            </div>
            <h3>{t("MONETARY_DONATION_PAYPAL_TITLE", "donaciones")}</h3>
            <p>{t("MONETARY_DONATION_PAYPAL_TEXT", "donaciones")}</p>
            <img src="/imagenes/codigo_qr_paypal.png" alt="Código QR PayPal" className="qr-code" />
            <div className="payment-actions">
              <button className="btn btn-primary donate-btn" onClick={() => handlePaymentMethodClick("paypal")}>
                <i className="fas fa-heart me-1"></i> {t("MONETARY_DONATION_PAYPAL_BUTTON", "donaciones")}
              </button>
            </div>
          </div>
        </div>

        {showDonationForm && (
          <div className="donation-modal">
            <div className="donation-modal-content">
              <span className="close" onClick={() => setShowDonationForm(false)}>
                &times;
              </span>
              <h2>{t("MONETARY_DONATION_FORM_TITLE", "donaciones")}</h2>
              <p className="donation-method-selected">
                {t("MONETARY_DONATION_FORM_METHOD", "donaciones")}{" "}
                <strong>
                  {formData.paymentMethod === "nequi"
                    ? t("MONETARY_DONATION_NEQUI_TITLE", "donaciones")
                    : formData.paymentMethod === "banco-bogota"
                      ? t("MONETARY_DONATION_BANK_TITLE", "donaciones")
                      : t("MONETARY_DONATION_PAYPAL_TITLE", "donaciones")}
                </strong>
              </p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="amount">{t("MONETARY_DONATION_FORM_AMOUNT", "donaciones")}</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder={t("MONETARY_DONATION_FORM_AMOUNT_PLACEHOLDER", "donaciones")}
                    required
                    min="1000"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="donorName">{t("MONETARY_DONATION_FORM_NAME", "donaciones")}</label>
                  <input
                    type="text"
                    id="donorName"
                    name="donorName"
                    value={formData.donorName}
                    onChange={handleInputChange}
                    placeholder={t("MONETARY_DONATION_FORM_NAME_PLACEHOLDER", "donaciones")}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="donorEmail">{t("MONETARY_DONATION_FORM_EMAIL", "donaciones")}</label>
                  <input
                    type="email"
                    id="donorEmail"
                    name="donorEmail"
                    value={formData.donorEmail}
                    onChange={handleInputChange}
                    placeholder={t("MONETARY_DONATION_FORM_EMAIL_PLACEHOLDER", "donaciones")}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="donorPhone">{t("MONETARY_DONATION_FORM_PHONE", "donaciones")}</label>
                  <input
                    type="tel"
                    id="donorPhone"
                    name="donorPhone"
                    value={formData.donorPhone}
                    onChange={handleInputChange}
                    placeholder={t("MONETARY_DONATION_FORM_PHONE_PLACEHOLDER", "donaciones")}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">{t("MONETARY_DONATION_FORM_MESSAGE", "donaciones")}</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder={t("MONETARY_DONATION_FORM_MESSAGE_PLACEHOLDER", "donaciones")}
                  ></textarea>
                </div>

                <div className="payment-instructions">
                  <h4>{t("MONETARY_DONATION_INSTRUCTIONS_TITLE", "donaciones")}</h4>
                  {formData.paymentMethod === "nequi" && (
                    <div className="instruction-steps">
                      <p>{t("MONETARY_DONATION_NEQUI_INSTR_1", "donaciones")}</p>
                      <p>
                        {t("MONETARY_DONATION_NEQUI_INSTR_2", "donaciones")} <strong>3166532433</strong>
                      </p>
                      <p>{t("MONETARY_DONATION_NEQUI_INSTR_3", "donaciones")}</p>
                      <p>{t("MONETARY_DONATION_NEQUI_INSTR_4", "donaciones")}</p>
                      <p>{t("MONETARY_DONATION_NEQUI_INSTR_5", "donaciones")}</p>
                    </div>
                  )}
                  {formData.paymentMethod === "banco-bogota" && (
                    <div className="instruction-steps">
                      <p>
                        {t("MONETARY_DONATION_BANK_INSTR_1", "donaciones")} <strong>312334428</strong>
                      </p>
                      <p>{t("MONETARY_DONATION_BANK_INSTR_2", "donaciones")}</p>
                      <p>{t("MONETARY_DONATION_BANK_INSTR_3", "donaciones")}</p>
                      <p>{t("MONETARY_DONATION_BANK_INSTR_4", "donaciones")}</p>
                      <p>{t("MONETARY_DONATION_BANK_INSTR_5", "donaciones")}</p>
                    </div>
                  )}
                  {formData.paymentMethod === "paypal" && (
                    <div className="instruction-steps">
                      <p>{t("MONETARY_DONATION_PAYPAL_INSTR_1", "donaciones")}</p>
                      <p>{t("MONETARY_DONATION_PAYPAL_INSTR_2", "donaciones")}</p>
                      <p>{t("MONETARY_DONATION_PAYPAL_INSTR_3", "donaciones")}</p>
                      <p>{t("MONETARY_DONATION_PAYPAL_INSTR_4", "donaciones")}</p>
                      <p>{t("MONETARY_DONATION_PAYPAL_INSTR_5", "donaciones")}</p>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : t("MONETARY_DONATION_BUTTON_SUBMIT", "donaciones")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDonationForm(false)}
                    disabled={isSubmitting}
                  >
                    {t("MONETARY_DONATION_BUTTON_CANCEL", "donaciones")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEvidenceModal && (
          <div className="donation-modal">
            <div className="donation-modal-content">
              <span className="close" onClick={() => setShowEvidenceModal(false)}>
                &times;
              </span>
              <h2>{t("MONETARY_DONATION_EVIDENCE_TITLE", "donaciones")}</h2>
              <p>{t("MONETARY_DONATION_EVIDENCE_TEXT", "donaciones")}</p>

              <form onSubmit={handleEvidenceSubmit}>
                <div className="form-group">
                  <label htmlFor="evidence-file">{t("MONETARY_DONATION_EVIDENCE_FILE_LABEL", "donaciones")}</label>
                  <input
                    type="file"
                    id="evidence-file"
                    name="evidence"
                    accept="image/*"
                    onChange={handleEvidenceChange}
                    ref={fileInputRef}
                    className="file-input"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-file-select"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <i className="fas fa-file-upload me-1"></i> {t("MONETARY_DONATION_EVIDENCE_FILE_BUTTON", "donaciones")}
                  </button>
                </div>

                {evidencePreview && (
                  <div className="evidence-preview">
                    <h4>{t("MONETARY_DONATION_EVIDENCE_PREVIEW", "donaciones")}</h4>
                    <img src={evidencePreview} alt="Vista previa del comprobante" />
                  </div>
                )}

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting || !evidenceFile}>
                    {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : t("MONETARY_DONATION_EVIDENCE_BUTTON_SUBMIT", "donaciones")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEvidenceModal(false)}
                    disabled={isSubmitting}
                  >
                    {t("MONETARY_DONATION_BUTTON_CANCEL", "donaciones")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default MonetaryDonation