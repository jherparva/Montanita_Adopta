"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

const ContactForm = () => {
  const router = useRouter()
  const { language, t } = useLanguage()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    privacyPolicy: false,
  })

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
        title: t("CONTACT_ACCESS_REQUIRED", "contact"),
        text: t("CONTACT_LOGIN_REQUIRED", "contact"),
        icon: "warning",
        confirmButtonColor: "#13a840",
        confirmButtonText: t("CONTACT_LOGIN_CONFIRM", "contact"),
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
          title: t("CONTACT_SUCCESS_TITLE", "contact"),
          text: t("CONTACT_SUCCESS_TEXT", "contact"),
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
          title: t("CONTACT_ERROR_TITLE", "contact"),
          text: result.message || t("CONTACT_ERROR_CONNECTION", "contact"),
          icon: "error",
          confirmButtonColor: "#cf0707",
        })
        
        setErrorMessage(result.message || t("CONTACT_ERROR_CONNECTION", "contact"))
      }
    } catch (error) {
      console.error("Error en la solicitud:", error)
      
      window.Swal.fire({
        title: t("CONTACT_ERROR_TITLE", "contact"),
        text: t("CONTACT_ERROR_CONNECTION", "contact"),
        icon: "error",
        confirmButtonColor: "#cf0707",
      })
      
      setErrorMessage(t("CONTACT_ERROR_CONNECTION", "contact"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const openPrivacyPolicy = useCallback((e) => {
    e.preventDefault()
    
    window.Swal.fire({
      title: t("CONTACT_PRIVACY_POLICY_TITLE", "contact"),
      html: `
        <div class="privacy-policy-content" style="text-align: left; max-height: 400px; overflow-y: auto; padding: 10px;">
          <h3>${t("CONTACT_PRIVACY_CONTENT_TITLE", "contact")}</h3>
          <p>${t("CONTACT_PRIVACY_INTRO", "contact")}</p>
          
          <h4>${t("CONTACT_PRIVACY_INFO_TITLE", "contact")}</h4>
          <p>${t("CONTACT_PRIVACY_INFO_TEXT", "contact")}</p>
          <ul>
            <li>${t("CONTACT_PRIVACY_INFO_ITEM1", "contact")}</li>
            <li>${t("CONTACT_PRIVACY_INFO_ITEM2", "contact")}</li>
            <li>${t("CONTACT_PRIVACY_INFO_ITEM3", "contact")}</li>
          </ul>
          
          <h4>${t("CONTACT_PRIVACY_USE_TITLE", "contact")}</h4>
          <p>${t("CONTACT_PRIVACY_USE_TEXT", "contact")}</p>
          <ul>
            <li>${t("CONTACT_PRIVACY_USE_ITEM1", "contact")}</li>
            <li>${t("CONTACT_PRIVACY_USE_ITEM2", "contact")}</li>
            <li>${t("CONTACT_PRIVACY_USE_ITEM3", "contact")}</li>
          </ul>
          
          <h4>${t("CONTACT_PRIVACY_SECURITY_TITLE", "contact")}</h4>
          <p>${t("CONTACT_PRIVACY_SECURITY_TEXT", "contact")}</p>
          
          <h4>${t("CONTACT_PRIVACY_DISCLOSURE_TITLE", "contact")}</h4>
          <p>${t("CONTACT_PRIVACY_DISCLOSURE_TEXT", "contact")}</p>
        </div>
      `,
      confirmButtonText: t("CONTACT_PRIVACY_ACCEPT", "contact"),
      confirmButtonColor: "#13a840",
      showCancelButton: true,
      cancelButtonText: t("CONTACT_PRIVACY_CLOSE", "contact"),
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
  }, [t])

  // Función para abrir el modal de login
  const openLoginModal = useCallback(() => {
    document.dispatchEvent(new CustomEvent("open-login-modal"))
    window.dispatchEvent(new CustomEvent("open-login-modal"))
    
    if (process.env.NODE_ENV === 'development') {
      console.log("Evento open-login-modal disparado desde ContactForm")
    }
  }, [])

  if (isLoading) {
    return <div className="contact-container">{t("CONTACT_LOADING", "contact")}</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="contact-container">
        <h2>{t("CONTACT_TITLE", "contact")}</h2>
        <div className="auth-needed-message">
          <p>{t("CONTACT_AUTH_NEEDED", "contact")}</p>
          <button onClick={openLoginModal} className="login-button">
            {t("CONTACT_LOGIN_BUTTON", "contact")}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="contact-container">
      <h2>{t("CONTACT_TITLE", "contact")}</h2>

      {/* Banner con llamada a la acción */}
      <div className="cta-banner">
        <div className="cta-icon">
          <i className="fas fa-paw"></i>
        </div>
        <div className="cta-content">
          <h3>{t("CONTACT_CTA_TITLE", "contact")}</h3>
          <p>{t("CONTACT_CTA_TEXT", "contact")}</p>
        </div>
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <form id="contact-form" onSubmit={handleSubmit}>
        <div className="contact-row">
          <div className="input-group">
            <label htmlFor="name">{t("CONTACT_FORM_NAME", "contact")}</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder={t("CONTACT_FORM_NAME_PLACEHOLDER", "contact")}
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">{t("CONTACT_FORM_EMAIL", "contact")}</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder={t("CONTACT_FORM_EMAIL_PLACEHOLDER", "contact")}
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="subject">{t("CONTACT_FORM_SUBJECT", "contact")}</label>
          <input
            type="text"
            id="subject"
            name="subject"
            placeholder={t("CONTACT_FORM_SUBJECT_PLACEHOLDER", "contact")}
            required
            value={formData.subject}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label htmlFor="message">{t("CONTACT_FORM_MESSAGE", "contact")}</label>
          <textarea
            id="message"
            name="message"
            rows="4"
            placeholder={t("CONTACT_FORM_MESSAGE_PLACEHOLDER", "contact")}
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
            {t("CONTACT_PRIVACY_CHECKBOX", "contact")}{" "}
            <a href="#" id="privacy-policy-link" onClick={openPrivacyPolicy}>
              {t("CONTACT_PRIVACY_LINK", "contact")}
            </a>
          </label>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("CONTACT_SUBMITTING", "contact") : t("CONTACT_SUBMIT_BUTTON", "contact")}
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