"use client"
import { useState, useEffect } from "react"
import VolunteerForm from "./VolunteerForm"

const VolunteerBanner = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        const data = await response.json()

        if (data.authenticated || data.isAuthenticated) {
          setIsAuthenticated(true)
          setUser(data.user)
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error)
      }
    }

    checkAuth()
  }, [])

  const handleVolunteerClick = (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      localStorage.setItem("redirectAfterLogin", "/voluntariado#formulario")
      
      document.dispatchEvent(new CustomEvent("open-login-modal"))
      window.dispatchEvent(new CustomEvent("open-login-modal"))
    } else {
      setShowModal(true)
    }
  }

  return (
    <div className="voluntariado-banner">
      <div className="banner-content">
        <h1>VOLUNTARIADO</h1>
        <p>Únete a nuestro equipo y ayuda a cambiar vidas</p>
        <a href="#" className="cta-button" onClick={handleVolunteerClick}>
          Quiero ser voluntario
        </a>
      </div>

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

export default VolunteerBanner