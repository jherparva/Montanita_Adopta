"use client"
import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"

const WelcomePopup = () => {
  const [showPopup, setShowPopup] = useState(false)
  const { t } = useLanguage()
  
  useEffect(() => {
    // Verifica si el usuario está logueado (usando localStorage como ejemplo)
    const isLoggedIn = localStorage.getItem("userLoggedIn") === "true"
    
    if (!isLoggedIn) {
      setShowPopup(true)
    }
    
    // Exponer función para cerrar popup al sistema de autenticación
    window.closeWelcomePopup = () => setShowPopup(false)
    
    return () => {
      delete window.closeWelcomePopup
    }
  }, [])

  // Si no se debe mostrar, retornar null
  if (!showPopup) return null

  return (
    <div id="welcome-popup" className="welcome-popup" style={{ display: 'block' }}>
      <div className="welcome-content">
        <span className="close-welcome" onClick={() => setShowPopup(false)}>
          &times;
        </span>
        <div className="welcome-header">
          <img src="/imagenes/logo.webp" alt="Logo Montañita" className="logo" />
          <h2>{t("HOME_WELCOME_TITLE", "home")}</h2>
        </div>
        <div className="welcome-body">
          <p>{t("HOME_WELCOME_DESCRIPTION1", "home")}</p>
          <p>{t("HOME_WELCOME_DESCRIPTION2", "home")}</p>
          <div className="welcome-paws">
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
          </div>
          <button id="welcome-button" className="welcome-button" onClick={() => setShowPopup(false)}>
            {t("HOME_WELCOME_BUTTON", "home")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default WelcomePopup