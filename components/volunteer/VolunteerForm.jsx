"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

const VolunteerForm = ({ user, onClose }) => {
  const router = useRouter()
  const { t } = useLanguage()
  
  const [formData, setFormData] = useState({
    nombre: user?.name || user?.nombre || "",
    email: user?.email || user?.correo_electronico || "",
    telefono: user?.phone || user?.telefono || "",
    direccion: "",
    ciudad: "",
    disponibilidad: "",
    experiencia: "",
    habilidades: "",
    motivacion: "",
    areas_interes: [],
    acepta_terminos: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const areasInteres = [
    { id: "cuidado_animales", label: t("VOLUNTEER_FORM_AREA_CARE", "voluntario") },
    { id: "paseos", label: t("VOLUNTEER_FORM_AREA_WALKS", "voluntario") },
    { id: "limpieza", label: t("VOLUNTEER_FORM_AREA_CLEANING", "voluntario") },
    { id: "eventos", label: t("VOLUNTEER_FORM_AREA_EVENTS", "voluntario") },
    { id: "redes_sociales", label: t("VOLUNTEER_FORM_AREA_SOCIAL", "voluntario") },
    { id: "transporte", label: t("VOLUNTEER_FORM_AREA_TRANSPORT", "voluntario") },
    { id: "fotografia", label: t("VOLUNTEER_FORM_AREA_PHOTO", "voluntario") },
    { id: "veterinaria", label: t("VOLUNTEER_FORM_AREA_VET", "voluntario") },
    { id: "educacion", label: t("VOLUNTEER_FORM_AREA_EDUCATION", "voluntario") },
    { id: "recaudacion", label: t("VOLUNTEER_FORM_AREA_FUNDRAISING", "voluntario") },
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox") {
      if (name === "acepta_terminos") {
        setFormData(prev => ({ ...prev, [name]: checked }))
      } else {
        // Para checkboxes de áreas de interés
        const updatedAreas = [...formData.areas_interes]
        if (checked) {
          updatedAreas.push(value)
        } else {
          const index = updatedAreas.indexOf(value)
          if (index > -1) {
            updatedAreas.splice(index, 1)
          }
        }
        setFormData(prev => ({ ...prev, areas_interes: updatedAreas }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validaciones
    if (!formData.acepta_terminos) {
      setError(t("VOLUNTEER_FORM_ERROR_TERMS", "voluntario"))
      setLoading(false)
      return
    }

    if (formData.areas_interes.length === 0) {
      setError(t("VOLUNTEER_FORM_ERROR_AREAS", "voluntario"))
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (window.Swal) {
          window.Swal.fire({
            title: t("VOLUNTEER_FORM_SUCCESS", "voluntario"),
            text: t("VOLUNTEER_FORM_SUCCESS", "voluntario"),
            icon: "success",
            confirmButtonColor: "#4caf50",
          }).then(() => {
            if (onClose) onClose()
            router.push("/voluntario")
          })
        } else {
          setSuccess(t("VOLUNTEER_FORM_SUCCESS", "voluntario"))
          setTimeout(() => {
            if (onClose) onClose()
            router.push("/voluntario")
          }, 3000)
        }
      } else {
        setError(data.message || t("VOLUNTEER_FORM_ERROR", "voluntario"))
        
        if (window.Swal) {
          window.Swal.fire({
            title: "Error",
            text: data.message || t("VOLUNTEER_FORM_ERROR", "voluntario"),
            icon: "error",
            confirmButtonColor: "#f44336",
          })
        }
      }
    } catch (error) {
      setError(t("VOLUNTEER_FORM_ERROR_SERVER", "voluntario"))
      console.error("Error al enviar solicitud de voluntariado:", error)
      
      if (window.Swal) {
        window.Swal.fire({
          title: "Error",
          text: t("VOLUNTEER_FORM_ERROR_SERVER", "voluntario"),
          icon: "error",
          confirmButtonColor: "#f44336",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="volunteer-form-container">
      <h2>{t("VOLUNTEER_FORM_TITLE", "voluntario")}</h2>
      <p className="form-intro">
        {t("VOLUNTEER_FORM_INTRO", "voluntario")}
      </p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="volunteer-form">
        <div className="form-section">
          <h3>{t("VOLUNTEER_FORM_PERSONAL_INFO", "voluntario")}</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">
                {t("VOLUNTEER_FORM_NAME", "voluntario")} <span className="required">*</span>
              </label>
              <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                {t("VOLUNTEER_FORM_EMAIL", "voluntario")} <span className="required">*</span>
              </label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefono">
                {t("VOLUNTEER_FORM_PHONE", "voluntario")} <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="direccion">{t("VOLUNTEER_FORM_ADDRESS", "voluntario")}</label>
              <input type="text" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="ciudad">{t("VOLUNTEER_FORM_CITY", "voluntario")}</label>
            <input type="text" id="ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange} />
          </div>
        </div>

        <div className="form-section">
          <h3>{t("VOLUNTEER_FORM_AVAILABILITY_SECTION", "voluntario")}</h3>

          <div className="form-group">
            <label htmlFor="disponibilidad">
              {t("VOLUNTEER_FORM_AVAILABILITY", "voluntario")} <span className="required">*</span>
            </label>
            <select
              id="disponibilidad"
              name="disponibilidad"
              value={formData.disponibilidad}
              onChange={handleChange}
              required
            >
              <option value="">{t("VOLUNTEER_FORM_AVAILABILITY_SELECT", "voluntario")}</option>
              <option value="fines-de-semana">{t("VOLUNTEER_FORM_AVAILABILITY_WEEKENDS", "voluntario")}</option>
              <option value="dias-semana">{t("VOLUNTEER_FORM_AVAILABILITY_WEEKDAYS", "voluntario")}</option>
              <option value="mananas">{t("VOLUNTEER_FORM_AVAILABILITY_MORNINGS", "voluntario")}</option>
              <option value="tardes">{t("VOLUNTEER_FORM_AVAILABILITY_AFTERNOONS", "voluntario")}</option>
              <option value="flexible">{t("VOLUNTEER_FORM_AVAILABILITY_FLEXIBLE", "voluntario")}</option>
              <option value="remoto">{t("VOLUNTEER_FORM_AVAILABILITY_REMOTE", "voluntario")}</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="experiencia">{t("VOLUNTEER_FORM_EXPERIENCE", "voluntario")}</label>
            <textarea
              id="experiencia"
              name="experiencia"
              value={formData.experiencia}
              onChange={handleChange}
              rows="3"
              placeholder={t("VOLUNTEER_FORM_EXPERIENCE_PLACEHOLDER", "voluntario")}
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="habilidades">{t("VOLUNTEER_FORM_SKILLS", "voluntario")}</label>
            <textarea
              id="habilidades"
              name="habilidades"
              value={formData.habilidades}
              onChange={handleChange}
              rows="3"
              placeholder={t("VOLUNTEER_FORM_SKILLS_PLACEHOLDER", "voluntario")}
            ></textarea>
          </div>
        </div>

        <div className="form-section">
          <h3>{t("VOLUNTEER_FORM_AREAS", "voluntario")}</h3>
          <p>
            {t("VOLUNTEER_FORM_AREAS_SELECT", "voluntario")} <span className="required">*</span>
          </p>

          <div className="checkbox-group">
            {areasInteres.map((area) => (
              <div className="checkbox-item" key={area.id}>
                <input
                  type="checkbox"
                  id={area.id}
                  name="areas_interes"
                  value={area.id}
                  checked={formData.areas_interes.includes(area.id)}
                  onChange={handleChange}
                />
                <label htmlFor={area.id}>{area.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>{t("VOLUNTEER_FORM_MOTIVATION_TITLE", "voluntario")}</h3>

          <div className="form-group">
            <label htmlFor="motivacion">
              {t("VOLUNTEER_FORM_MOTIVATION", "voluntario")} <span className="required">*</span>
            </label>
            <textarea
              id="motivacion"
              name="motivacion"
              value={formData.motivacion}
              onChange={handleChange}
              rows="4"
              required
              placeholder={t("VOLUNTEER_FORM_MOTIVATION_PLACEHOLDER", "voluntario")}
            ></textarea>
          </div>
        </div>

        <div className="form-section">
          <div className="form-group terms-group">
            <input
              type="checkbox"
              id="acepta_terminos"
              name="acepta_terminos"
              checked={formData.acepta_terminos}
              onChange={handleChange}
              required
            />
            <label htmlFor="acepta_terminos">
              {t("VOLUNTEER_FORM_TERMS", "voluntario")}{" "}
              <a href="/terminos-y-condiciones" target="_blank" rel="noreferrer">
                {t("VOLUNTEER_FORM_TERMS_LINK", "voluntario")}
              </a>{" "}
              {t("VOLUNTEER_FORM_PRIVACY", "voluntario")}{" "}
              <a href="/politica-de-privacidad" target="_blank" rel="noreferrer">
                {t("VOLUNTEER_FORM_PRIVACY_LINK", "voluntario")}
              </a>{" "}
              <span className="required">*</span>
            </label>
          </div>
        </div>

        <div className="form-note">
          <p>
            <span className="required">*</span> {t("VOLUNTEER_FORM_REQUIRED", "voluntario")}
          </p>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> {t("VOLUNTEER_FORM_SENDING", "voluntario")}
              </>
            ) : (
              t("VOLUNTEER_FORM_SUBMIT", "voluntario")
            )}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {t("VOLUNTEER_FORM_CANCEL", "voluntario")}
          </button>
        </div>
      </form>
    </div>
  )
}

export default VolunteerForm