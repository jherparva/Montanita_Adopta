"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import "@/styles/components/auth/login.css"
import "@/styles/components/auth/google-social-buttons.css"
import { useLanguage } from "@/contexts/language-context"

const LoginModal = ({ isOpen, onClose, openRegisterModal, openResetPasswordModal }) => {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // En LoginModal.jsx
  useEffect(() => {
    // Definir el callback de Google globalmente con un nombre único para login
    window.handleCredentialResponseLogin = (response) => {
      handleGoogleLogin(response.credential)
    }
    
    // Renderizar el botón de Google solo cuando el modal esté abierto
    if (isOpen && window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: "385524721924-ufgkod1roqrgi6iaflumbo6dmictc7mm.apps.googleusercontent.com",
        callback: window.handleCredentialResponseLogin,
        auto_select: false,
      })
      
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button-login"),
        { theme: "outline", size: "large", width: "100%" }
      )
    }
    
    return () => {
      // Limpiar el callback cuando el componente se desmonte
      delete window.handleCredentialResponseLogin
    }
  }, [isOpen]) // Re-ejecutar cuando isOpen cambie

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onClose()

        window.Swal.fire({
          title: t("LOGIN_WELCOME", "general"),
          text: t("LOGIN_SUCCESS", "general"),
          icon: "success",
          confirmButtonText: t("SESSION_CONTINUE", "general"),
          confirmButtonColor: "#27b80b",
          timer: 3500,
          timerProgressBar: true,
        })

        window.dispatchEvent(new Event("auth-changed"))

        setTimeout(() => {
          router.refresh()
          window.location.reload()
        }, 3500)
      } else {
        setError(data.message || t("LOGIN_ERROR", "general"))

        window.Swal.fire({
          title: t("LOGIN_ERROR", "general"),
          text: data.message || t("LOGIN_ERROR_CREDENTIALS", "general"),
          icon: "error",
          confirmButtonColor: "#d33",
        })
      }
    } catch (error) {
      setError(t("LOGIN_ERROR_SERVER", "general"))
      console.error("Error de login:", error)

      window.Swal.fire({
        title: t("LOGIN_ERROR", "general"),
        text: t("LOGIN_ERROR_SERVER", "general"),
        icon: "error",
        confirmButtonColor: "#d33",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async (credential) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/google-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential }),
      })

      const data = await response.json()

      if (response.ok) {
        onClose()
        window.dispatchEvent(new Event("auth-changed"))

        setTimeout(() => {
          router.refresh()
          window.location.reload()
        }, 4000)
      } else {
        setError(data.message || "Error al iniciar sesión con Google")

        window.Swal.fire({
          title: t("LOGIN_ERROR", "general"),
          text: data.message || "Error al iniciar sesión con Google",
          icon: "error",
          confirmButtonColor: "#d33",
        })
      }
    } catch (error) {
      setError(t("LOGIN_ERROR_SERVER", "general"))
      console.error("Error de login con Google:", error)

      window.Swal.fire({
        title: t("LOGIN_ERROR", "general"),
        text: t("LOGIN_ERROR_SERVER", "general"),
        icon: "error",
        confirmButtonColor: "#d33",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookLogin = () => {
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken
          handleFacebookLoginServer(accessToken)
        } else {
          setError("Inicio de sesión con Facebook cancelado")

          window.Swal.fire({
            title: t("REGISTER_CANCELED_FACEBOOK", "general"),
            text: t("REGISTER_CANCELED_FACEBOOK", "general"),
            icon: "info",
            confirmButtonColor: "#3085d6",
          })
        }
      },
      { scope: "public_profile,email" },
    )
  }

  const handleFacebookLoginServer = async (accessToken) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/facebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken }),
      })

      const data = await response.json()

      if (response.ok) {
        onClose()
        window.dispatchEvent(new Event("auth-changed"))

        setTimeout(() => {
          router.refresh()
          window.location.reload()
        }, 500)
      } else {
        setError(data.message || "Error al iniciar sesión con Facebook")

        window.Swal.fire({
          title: t("LOGIN_ERROR", "general"),
          text: data.message || "Error al iniciar sesión con Facebook",
          icon: "error",
          confirmButtonColor: "#d33",
        })
      }
    } catch (error) {
      setError(t("LOGIN_ERROR_SERVER", "general"))
      console.error("Error de login con Facebook:", error)

      window.Swal.fire({
        title: t("LOGIN_ERROR", "general"),
        text: t("LOGIN_ERROR_SERVER", "general"),
        icon: "error",
        confirmButtonColor: "#d33",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div id="loginModal" className="modal" style={{ display: "block" }}>
        <div className="modal-content login-container">
          <span className="close" onClick={onClose}>
            &times;
          </span>
          <div className="login-header">
            <h2>{t("LOGIN_TITLE", "general")}</h2>
          </div>
          <form id="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">{t("LOGIN_EMAIL", "general")}</label>
            <input type="email" id="login-email" name="email" value={formData.email} onChange={handleChange} required />

            <label htmlFor="password">{t("LOGIN_PASSWORD", "general")}</label>
            <input
              type="password"
              id="login-password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? t("LOGIN_PROCESSING", "general") : t("LOGIN_BUTTON", "general")}
            </button>
            <a
              href="#"
              className="forgot-password"
              onClick={(e) => {
                e.preventDefault()
                onClose()
                openResetPasswordModal()
              }}
            >
              {t("LOGIN_FORGOT_PASSWORD", "general")}
            </a>

            <div className="google-signin-container" id="g_id_onload" 
              data-client_id="385524721924-ufgkod1roqrgi6iaflumbo6dmictc7mm.apps.googleusercontent.com"
              data-context="signin"
              data-ux_mode="popup"
              data-callback="handleCredentialResponse"
              data-auto_prompt="false">
            </div>

            <div id="google-signin-button-login" className="google-signin-button"></div>

            <button type="button" className="social-login-button facebook" onClick={handleFacebookLogin}>
              {t("LOGIN_WITH_FACEBOOK", "general")}
            </button>
          </form>
          {error && (
            <div className="auth-error-message" style={{ display: "block" }}>
              {error}
            </div>
          )}
        </div>
      </div>

      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.fbAsyncInit = () => {
            window.FB.init({
              appId: "531138253329753",
              cookie: true,
              xfbml: true,
              version: "v18.0",
            })
          }
        }}
      />
    </>
  )
}

export default LoginModal