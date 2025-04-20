"use client"
import { useState, useEffect } from "react"
import SponsorForm from "./SponsorForm"

const SponsorSection = () => {
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
    
    // Disparar evento para abrir modal de login
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
          <h2>Apadrina un Animal</h2>
          <div className="paw-divider">
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
          </div>
          <p>
            Si no puedes adoptar pero quieres ayudar, apadrinar es una excelente opción. Tu aporte mensual o único
            ayudará a cubrir los gastos de alimentación, atención veterinaria y cuidados de un animal específico.
          </p>

          <h3>Beneficios de apadrinar:</h3>
          <ul className="apadrinar-lista">
            <li>Recibirás actualizaciones periódicas sobre el animal apadrinado</li>
            <li>Podrás visitarlo cuando quieras (con cita previa)</li>
            <li>Contribuirás directamente a su bienestar</li>
            <li>Recibirás un certificado de apadrinamiento</li>
          </ul>

          <h3>Opciones de apadrinamiento:</h3>
          <div className="opciones-apadrinamiento">
            <div className="opcion-apadrinamiento">
              <h4>Apadrinamiento mensual</h4>
              <p>Desde $30.000 mensuales</p>
            </div>
            <div className="opcion-apadrinamiento">
              <h4>Aporte único</h4>
              <p>Desde $50.000</p>
            </div>
            <div className="opcion-apadrinamiento">
              <h4>Donación de suministros</h4>
              <p>Alimentos, medicamentos, accesorios</p>
            </div>
          </div>
          
          <button className="cta-button" onClick={handleOpenModal}>
            Apadrina Ahora
          </button>
        </div>

        <div className="apadrinar-image">
          <img src="/imagenes/apadrinar.webp" alt="Apadrina un animal" />
        </div>
      </div>

      {/* Modal de formulario de apadrinamiento */}
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
              <h3>Inicia sesión para apadrinar</h3>
              <p>Para apadrinar a uno de nuestros animales, necesitas tener una cuenta e iniciar sesión.</p>
              <button className="login-btn" onClick={handleLoginClick}>
                Iniciar Sesión
              </button>
              <p className="register-link">
                ¿No tienes cuenta? <a href="#" onClick={(e) => {
                  e.preventDefault();
                  document.dispatchEvent(new CustomEvent("open-register-modal"));
                }}>Regístrate aquí</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default SponsorSection