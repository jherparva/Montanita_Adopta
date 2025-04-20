"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

const ContactForm = () => {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    privacyPolicy: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        const data = await response.json()

        if ((data.authenticated || data.isAuthenticated) && data.user) {
          setIsAuthenticated(true)
          setUserData(data.user)

          // Prellenar el formulario con datos del usuario
          setFormData(prev => ({
            ...prev,
            name: data.user.name || data.user.nombre || prev.name,
            email: data.user.email || prev.email,
          }))
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Verificar si el usuario está autenticado
    if (!isAuthenticated) {
      window.Swal.fire({
        title: "Acceso Requerido",
        text: "Debes iniciar sesión para enviar mensajes",
        icon: "warning",
        confirmButtonColor: "#13a840",
        confirmButtonText: "Iniciar Sesión",
      }).then((result) => {
        if (result.isConfirmed) {
          document.dispatchEvent(new CustomEvent("open-login-modal"))
        }
      })
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        if (process.env.NODE_ENV === 'development') {
          console.log("Mensaje enviado exitosamente:", result)
        }
        
        window.Swal.fire({
          title: "¡Mensaje Enviado!",
          text: "Hemos recibido tu mensaje. Te responderemos lo antes posible.",
          icon: "success",
          confirmButtonColor: "#13a840",
        })
        
        // Limpiar el formulario después de enviar exitosamente, pero mantener nombre y email
        setFormData({
          name: userData ? userData.name || userData.nombre : "",
          email: userData ? userData.email : "",
          subject: "",
          message: "",
          privacyPolicy: false,
        })
      } else {
        console.error("Error al enviar el mensaje:", result.message)
        
        window.Swal.fire({
          title: "Error",
          text: result.message || "Error al enviar el mensaje",
          icon: "error",
          confirmButtonColor: "#cf0707",
        })
        
        setErrorMessage(result.message || "Error al enviar el mensaje")
      }
    } catch (error) {
      console.error("Error en la solicitud:", error)
      
      window.Swal.fire({
        title: "Error",
        text: "Error de conexión. Por favor intenta nuevamente.",
        icon: "error",
        confirmButtonColor: "#cf0707",
      })
      
      setErrorMessage("Error de conexión. Por favor intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openPrivacyPolicy = useCallback((e) => {
    e.preventDefault()
    
    window.Swal.fire({
      title: "Política de Privacidad",
      html: `
        <div class="privacy-policy-content" style="text-align: left; max-height: 400px; overflow-y: auto; padding: 10px;">
          <h3>Política de Privacidad</h3>
          <p>En Montañita Adopta, respetamos tu privacidad y estamos comprometidos con la protección de tus datos personales.</p>
          
          <h4>1. Información que recopilamos</h4>
          <p>Recopilamos la siguiente información cuando nos contactas:</p>
          <ul>
            <li>Nombre completo</li>
            <li>Correo electrónico</li>
            <li>Mensaje y asunto</li>
          </ul>
          
          <h4>2. Uso de la información</h4>
          <p>La información proporcionada será utilizada exclusivamente para:</p>
          <ul>
            <li>Responder a tus consultas</li>
            <li>Procesar solicitudes de adopción o voluntariado</li>
            <li>Mejorar nuestros servicios</li>
          </ul>
          
          <h4>3. Seguridad de datos</h4>
          <p>Implementamos medidas de seguridad para proteger tu información personal y prevenir accesos no autorizados.</p>
          
          <h4>4. Divulgación a terceros</h4>
          <p>No compartimos tu información con terceros sin tu consentimiento, excepto cuando sea requerido por ley.</p>
        </div>
      `,
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#13a840",
      showCancelButton: true,
      cancelButtonText: "Cerrar",
      cancelButtonColor: "#cf0707",
      width: '600px',
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData(prev => ({
          ...prev,
          privacyPolicy: true,
        }))
      }
    })
  }, [])

  // Función para abrir el modal de login
  const openLoginModal = useCallback(() => {
    document.dispatchEvent(new CustomEvent("open-login-modal"))
    window.dispatchEvent(new CustomEvent("open-login-modal"))
    
    if (process.env.NODE_ENV === 'development') {
      console.log("Evento open-login-modal disparado desde ContactForm")
    }
  }, [])

  if (isLoading) {
    return <div className="contact-container">Cargando...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="contact-container">
        <h2>Contáctanos</h2>
        <div className="auth-needed-message">
          <p>Debes iniciar sesión para enviar mensajes de contacto.</p>
          <button onClick={openLoginModal} className="login-button">
            Iniciar Sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="contact-container">
      <h2>Contáctanos</h2>

      {/* Banner con llamada a la acción */}
      <div className="cta-banner">
        <div className="cta-icon">
          <i className="fas fa-paw"></i>
        </div>
        <div className="cta-content">
          <h3>¿Tienes preguntas sobre adopción?</h3>
          <p>
            Completa este formulario y te responderemos lo antes posible. ¡Juntos podemos darle un hogar a todos los
            peluditos!
          </p>
        </div>
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <form id="contact-form" onSubmit={handleSubmit}>
        <div className="contact-row">
          <div className="input-group">
            <label htmlFor="name">Nombre Completo</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Tu nombre completo"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="tucorreo@ejemplo.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="subject">Asunto</label>
          <input
            type="text"
            id="subject"
            name="subject"
            placeholder="Asunto de tu mensaje"
            required
            value={formData.subject}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label htmlFor="message">Mensaje</label>
          <textarea
            id="message"
            name="message"
            rows="4"
            placeholder="Escribe tu mensaje aquí"
            required
            value={formData.message}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Checkbox para política de privacidad */}
        <div className="privacy-checkbox">
          <input
            type="checkbox"
            id="privacy-policy"
            name="privacyPolicy"
            required
            checked={formData.privacyPolicy}
            onChange={handleChange}
          />
          <label htmlFor="privacy-policy">
            He leído y acepto la{" "}
            <a href="#" id="privacy-policy-link" onClick={openPrivacyPolicy}>
              política de privacidad
            </a>
          </label>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar"}
        </button>
      </form>

      {/* Elementos decorativos (dentro del container) */}
      <div className="paw-prints paw-1"></div>
      <div className="paw-prints paw-2"></div>
      <div className="form-decoration decoration-1"></div>
      <div className="form-decoration decoration-2"></div>
    </div>
  )
}

export default ContactForm