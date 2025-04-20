"use client"
import { useState, useEffect } from "react"
import VolunteerForm from "./VolunteerForm"

const VolunteerSection = () => {
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
        <h2>Voluntariado</h2>
        <div className="paw-divider">
          <i className="fas fa-paw"></i>
          <i className="fas fa-paw"></i>
          <i className="fas fa-paw"></i>
        </div>
        <p>
          En <strong>Montañita Adopta</strong>, los voluntarios son el corazón de nuestra organización. Gracias a
          personas como tú, podemos seguir rescatando y cuidando a animales necesitados.
        </p>
        <p>
          Nuestros voluntarios participan en diversas actividades como cuidado de animales, paseos, limpieza, eventos de
          adopción, difusión en redes sociales, transporte, fotografía y mucho más.
        </p>
        <p>
          <strong>¿Qué necesitamos?</strong> Personas comprometidas, responsables y con amor por los animales. No
          importa tu experiencia previa, lo importante es tu disposición para ayudar.
        </p>
        <p>
          <strong>¿Cuánto tiempo?</strong> Tú decides. Puedes colaborar unas horas a la semana o participar en eventos
          específicos. Toda ayuda es valiosa.
        </p>

        <button className="cta-button" onClick={handleOpenModal}>
          Postúlate como Voluntario
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