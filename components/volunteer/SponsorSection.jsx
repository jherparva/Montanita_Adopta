"use client"
import { useState, useEffect } from "react"
import SponsorForm from "./SponsorForm"
import { useLanguage } from "@/contexts/language-context"

const SponsorSection = () => {
  const { t } = useLanguage()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [animals, setAnimals] = useState([])
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

    const fetchAnimals = async () => {
      try {
        const res = await fetch("/api/animals?status=available&limit=6")
        const data = await res.json()

        if (data.success) {
          setAnimals(data.animals || [])
        }
      } catch (error) {
        console.error("Error fetching animals:", error)
      }
    }

    checkAuth()
    fetchAnimals()
  }, [])

  const handleLoginClick = () => {
    localStorage.setItem("redirectAfterLogin", "/voluntariado#apadrinar")
    
    document.dispatchEvent(new CustomEvent("open-login-modal"))
    window.dispatchEvent(new CustomEvent("open-login-modal"))
  }

  const handleOpenModal = () => {
    if (!user) {
      handleLoginClick()
      return
    }
    
    setShowModal(true)
  }

  return (
    <section id="apadrinar" className="apadrinar-section">
      <div className="apadrinar-container">
        <div className="apadrinar-text">
          <h2>{t("SPONSOR_SECTION_TITLE", "voluntario")}</h2>
          <div className="paw-divider">
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
          </div>
          <p>
            {t("SPONSOR_SECTION_INTRO", "voluntario")}
          </p>

          <h3>{t("SPONSOR_SECTION_BENEFITS_TITLE", "voluntario")}</h3>
          <ul className="apadrinar-lista">
            <li>{t("SPONSOR_SECTION_BENEFIT1", "voluntario")}</li>
            <li>{t("SPONSOR_SECTION_BENEFIT2", "voluntario")}</li>
            <li>{t("SPONSOR_SECTION_BENEFIT3", "voluntario")}</li>
            <li>{t("SPONSOR_SECTION_BENEFIT4", "voluntario")}</li>
          </ul>

          <h3>{t("SPONSOR_SECTION_OPTIONS_TITLE", "voluntario")}</h3>
          <div className="opciones-apadrinamiento">
            <div className="opcion-apadrinamiento">
              <h4>{t("SPONSOR_SECTION_OPTION1_TITLE", "voluntario")}</h4>
              <p>{t("SPONSOR_SECTION_OPTION1", "voluntario")}</p>
            </div>
            <div className="opcion-apadrinamiento">
              <h4>{t("SPONSOR_SECTION_OPTION2_TITLE", "voluntario")}</h4>
              <p>{t("SPONSOR_SECTION_OPTION2", "voluntario")}</p>
            </div>
            <div className="opcion-apadrinamiento">
              <h4>{t("SPONSOR_SECTION_OPTION3_TITLE", "voluntario")}</h4>
              <p>{t("SPONSOR_SECTION_OPTION3", "voluntario")}</p>
            </div>
          </div>
          
          <button className="cta-button" onClick={handleOpenModal}>
            {t("SPONSOR_SECTION_CTA", "voluntario")}
          </button>
        </div>

        <div className="apadrinar-image">
          <img src="/imagenes/apadrinar.webp" alt={t("SPONSOR_SECTION_TITLE", "voluntario")} />
        </div>
      </div>
      
      {showModal && (
        <div className="donation-modal sponsor-modal">
          <div className="donation-modal-content">
            <span className="close" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <SponsorForm user={user} animals={animals} onClose={() => setShowModal(false)} />
          </div>
        </div>
      )}
      
      {!loading && !user && !showModal && (
        <div className="sponsor-form-section">
          <div className="container">
            <div className="login-required">
              <h3>{t("SPONSOR_SECTION_LOGIN_REQUIRED", "voluntario")}</h3>
              <p>{t("SPONSOR_SECTION_LOGIN_TEXT", "voluntario")}</p>
              <button className="login-btn" onClick={handleLoginClick}>
                {t("SPONSOR_SECTION_LOGIN_BUTTON", "voluntario")}
              </button>
              <p className="register-link">
                {t("SPONSOR_SECTION_REGISTER_TEXT", "voluntario")} <a href="#" onClick={(e) => {
                  e.preventDefault();
                  document.dispatchEvent(new CustomEvent("open-register-modal"));
                }}>{t("SPONSOR_SECTION_REGISTER_LINK", "voluntario")}</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default SponsorSection