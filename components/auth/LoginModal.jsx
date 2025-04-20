"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import "@/styles/components/auth/login.css"

const LoginModal = ({ isOpen, onClose, openRegisterModal, openResetPasswordModal }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Definir el callback de Google globalmente
    window.handleCredentialResponse = (response) => {
      handleGoogleLogin(response.credential)
    }
    
    return () => {
      delete window.handleCredentialResponse
    }
  }, [])

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
          title: "¡Bienvenido!",
          text: "Has iniciado sesión correctamente",
          icon: "success",
          confirmButtonText: "Continuar",
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
        setError(data.message || "Error al iniciar sesión")

        window.Swal.fire({
          title: "Error de inicio de sesión",
          text: data.message || "Credenciales inválidas",
          icon: "error",
          confirmButtonColor: "#d33",
        })
      }
    } catch (error) {
      setError("Error al conectar con el servidor")
      console.error("Error de login:", error)

      window.Swal.fire({
        title: "Error",
        text: "Error al conectar con el servidor. Por favor, intenta más tarde.",
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
          title: "Error",
          text: data.message || "Error al iniciar sesión con Google",
          icon: "error",
          confirmButtonColor: "#d33",
        })
      }
    } catch (error) {
      setError("Error al conectar con el servidor")
      console.error("Error de login con Google:", error)

      window.Swal.fire({
        title: "Error",
        text: "Error al conectar con el servidor. Por favor, intenta más tarde.",
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
            title: "Cancelado",
            text: "Inicio de sesión con Facebook cancelado",
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
          title: "Error",
          text: data.message || "Error al iniciar sesión con Facebook",
          icon: "error",
          confirmButtonColor: "#d33",
        })
      }
    } catch (error) {
      setError("Error al conectar con el servidor")
      console.error("Error de login con Facebook:", error)

      window.Swal.fire({
        title: "Error",
        text: "Error al conectar con el servidor. Por favor, intenta más tarde.",
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
            <h2>Iniciar Sesión</h2>
          </div>
          <form id="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Correo Electrónico:</label>
            <input type="email" id="login-email" name="email" value={formData.email} onChange={handleChange} required />

            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="login-password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Procesando..." : "Ingresar"}
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
              Olvidé mi contraseña
            </a>

            <div
              id="g_id_onload"
              data-client_id="385524721924-ufgkod1roqrgi6iaflumbo6dmictc7mm.apps.googleusercontent.com"
              data-context="signin"
              data-ux_mode="popup"
              data-callback="handleCredentialResponse"
              data-auto_prompt="false"
            ></div>

            <div className="g_id_signin" data-type="standard"></div>

            <button type="button" className="social-login facebook" onClick={handleFacebookLogin}>
              Entrar con Facebook
            </button>
          </form>
          {error && (
            <div id="login-alert" style={{ color: "red", display: "block" }}>
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