"use client"
import { useState, useEffect } from "react"
import VolunteerForm from "./VolunteerForm"
import { useLanguage } from "@/contexts/language-context"

const VolunteerSection = () => {
  const { t } = useLanguage()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check")
        const data = await res.json()

        if (data.authenticated || data.isAuthenticated) {
          setUser(data.user)
        }
        setLoading(false)
      } catch (error) {
        console.error("Error checking authentication:", error)
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleOpenModal = () => {
    if (!user) {
      // Si no hay usuario, abrir modal de login
      document.dispatchEvent(new CustomEvent("open-login-modal"))
      window.dispatchEvent(new CustomEvent("open-login-modal"))
      // Guardar redirección
      localStorage.setItem("redirectAfterLogin", "/voluntario#voluntariado")
      return
    }
    
    setShowModal(true)
  }

  return (
    <div id="voluntariado" className="voluntariado-container">
      <div className="voluntariado-text">
        <h2>{t("VOLUNTEER_SECTION_TITLE", "voluntario")}</h2>
        <div className="paw-divider">
          <i className="fas fa-paw"></i>
          <i className="fas fa-paw"></i>
          <i className="fas fa-paw"></i>
        </div>
        <p dangerouslySetInnerHTML={{ __html: t("VOLUNTEER_SECTION_INTRO", "voluntario") }} />
        <p>{t("VOLUNTEER_SECTION_ACTIVITIES", "voluntario")}</p>
        <p>
          <strong>{t("VOLUNTEER_SECTION_REQUIREMENTS_TITLE", "voluntario")}</strong>{" "}
          {t("VOLUNTEER_SECTION_REQUIREMENTS", "voluntario")}
        </p>
        <p>
          <strong>{t("VOLUNTEER_SECTION_TIME_TITLE", "voluntario")}</strong>{" "}
          {t("VOLUNTEER_SECTION_TIME", "voluntario")}
        </p>

        <button className="cta-button" onClick={handleOpenModal}>
          {t("VOLUNTEER_SECTION_CTA", "voluntario")}
        </button>
      </div>

      <div className="voluntariado-image">
        <img src="/imagenes/voluntariado.webp" alt="Voluntarios con animales" />
      </div>

      {/* Modal de formulario de voluntariado */}
      {showModal && (
        <div className="donation-modal volunteer-modal">
          <div className="donation-modal-content">
            <span className="close" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <VolunteerForm user={user} onClose={() => setShowModal(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default VolunteerSection