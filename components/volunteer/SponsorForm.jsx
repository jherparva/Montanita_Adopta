"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

const SponsorForm = ({ user, animals, onClose }) => {
  const { t } = useLanguage()
  const router = useRouter()
  const [formData, setFormData] = useState({
    sponsorName: user?.nombre || user?.name || "",
    sponsorEmail: user?.email || "",
    sponsorPhone: user?.telefono || user?.phone || "",
    animalId: "",
    sponsorshipType: "monthly",
    amount: "",
    suppliesDescription: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validation messages now use translations
      if (!formData.animalId) {
        throw new Error(t("SPONSOR_FORM_ERROR_ANIMAL", "voluntario"))
      }

      if (formData.sponsorshipType !== "supplies" && (!formData.amount || formData.amount <= 0)) {
        throw new Error(t("SPONSOR_FORM_ERROR_AMOUNT", "voluntario"))
      }

      if (formData.sponsorshipType === "supplies" && !formData.suppliesDescription) {
        throw new Error(t("SPONSOR_FORM_ERROR_SUPPLIES", "voluntario"))
      }

      const response = await fetch("/api/volunteer/sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || t("SPONSOR_FORM_ERROR_GENERIC", "voluntario"))
      }

      if (window.Swal) {
        window.Swal.fire({
          title: t("SPONSOR_FORM_SUCCESS_TITLE", "voluntario"),
          text: t("SPONSOR_FORM_SUCCESS_TEXT", "voluntario"),
          icon: "success",
          confirmButtonColor: "#4caf50",
        }).then(() => {
          if (onClose) onClose()
          router.push("/voluntario")
        })
      } else {
        setSuccess(true)
        setTimeout(() => {
          if (onClose) onClose()
          router.push("/voluntario")
        }, 3000)
      }
    } catch (err) {
      console.error("Error al enviar formulario:", err)
      setError(err.message || t("SPONSOR_FORM_ERROR_GENERIC", "voluntario"))

      if (window.Swal) {
        window.Swal.fire({
          title: "Error",
          text: err.message || t("SPONSOR_FORM_ERROR_GENERIC", "voluntario"),
          icon: "error",
          confirmButtonColor: "#f44336",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="sponsor-form-container">
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          <h3>{t("SPONSOR_FORM_SUCCESS_TITLE", "voluntario")}</h3>
          <p>
            {t("SPONSOR_FORM_SUCCESS_TEXT", "voluntario")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="sponsor-form-container">
      <h2>{t("SPONSOR_FORM_TITLE", "voluntario")}</h2>
      <p className="form-intro">
        {t("SPONSOR_FORM_INTRO", "voluntario")}
      </p>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <form className="sponsor-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>{t("SPONSOR_FORM_PERSONAL_INFO", "voluntario")}</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sponsorName">
                {t("SPONSOR_FORM_NAME", "voluntario")} <span className="required">*</span>
              </label>
              <input
                type="text"
                id="sponsorName"
                name="sponsorName"
                value={formData.sponsorName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="sponsorEmail">
                {t("SPONSOR_FORM_EMAIL", "voluntario")} <span className="required">*</span>
              </label>
              <input
                type="email"
                id="sponsorEmail"
                name="sponsorEmail"
                value={formData.sponsorEmail}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sponsorPhone">
                {t("SPONSOR_FORM_PHONE", "voluntario")} <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="sponsorPhone"
                name="sponsorPhone"
                value={formData.sponsorPhone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>{t("SPONSOR_FORM_DETAILS", "voluntario")}</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="animalId">
                {t("SPONSOR_FORM_ANIMAL", "voluntario")} <span className="required">*</span>
              </label>
              <select 
                id="animalId" 
                name="animalId" 
                value={formData.animalId} 
                onChange={handleChange} 
                required
              >
                <option value="">{t("SPONSOR_FORM_ANIMAL_SELECT", "voluntario")}</option>
                {animals.map((animal) => (
                  <option key={animal._id} value={animal._id}>
                    {animal.name} (
                    {animal.species === "dog" ? "Perro" : animal.species === "cat" ? "Gato" : animal.species})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="sponsorshipType">
                {t("SPONSOR_FORM_TYPE", "voluntario")} <span className="required">*</span>
              </label>
              <select
                id="sponsorshipType"
                name="sponsorshipType"
                value={formData.sponsorshipType}
                onChange={handleChange}
                required
              >
                <option value="monthly">{t("SPONSOR_FORM_TYPE_MONTHLY", "voluntario")}</option>
                <option value="one-time">{t("SPONSOR_FORM_TYPE_ONETIME", "voluntario")}</option>
                <option value="supplies">{t("SPONSOR_FORM_TYPE_SUPPLIES", "voluntario")}</option>
              </select>
            </div>
          </div>

          {formData.sponsorshipType !== "supplies" ? (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">
                  {t("SPONSOR_FORM_AMOUNT", "voluntario")} <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="1"
                  placeholder={formData.sponsorshipType === "monthly" 
                    ? t("SPONSOR_FORM_AMOUNT_MONTHLY", "voluntario") 
                    : t("SPONSOR_FORM_AMOUNT_ONETIME", "voluntario")}
                  required={formData.sponsorshipType !== "supplies"}
                />
              </div>
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="suppliesDescription">
                  {t("SPONSOR_FORM_SUPPLIES", "voluntario")} <span className="required">*</span>
                </label>
                <textarea
                  id="suppliesDescription"
                  name="suppliesDescription"
                  value={formData.suppliesDescription}
                  onChange={handleChange}
                  rows="3"
                  placeholder={t("SPONSOR_FORM_SUPPLIES_PLACEHOLDER", "voluntario")}
                  required={formData.sponsorshipType === "supplies"}
                ></textarea>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="notes">{t("SPONSOR_FORM_NOTES", "voluntario")}</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder={t("SPONSOR_FORM_NOTES_PLACEHOLDER", "voluntario")}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> {t("SPONSOR_FORM_PROCESSING", "voluntario")}
              </>
            ) : (
              <>
                <i className="fas fa-heart"></i> {t("SPONSOR_FORM_SUBMIT", "voluntario")}
              </>
            )}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {t("SPONSOR_FORM_CANCEL", "voluntario")}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SponsorForm