"use client"
import { useState, useEffect } from "react"

const WelcomePopup = () => {
  const [showPopup, setShowPopup] = useState(false)
  
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
          <h2>¡Bienvenido a Montañita Adopta!</h2>
        </div>
        <div className="welcome-body">
          <p>
            Gracias por visitar nuestra plataforma dedicada a encontrar hogares amorosos para nuestros amigos peludos
          </p>
          <p>Explora nuestro sitio para conocer a los animales que están esperando una familia como la tuya.</p>
          <div className="welcome-paws">
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
          </div>
          <button id="welcome-button" className="welcome-button" onClick={() => setShowPopup(false)}>
            Comenzar
          </button>
        </div>
      </div>
    </div>
  )
}

export default WelcomePopup