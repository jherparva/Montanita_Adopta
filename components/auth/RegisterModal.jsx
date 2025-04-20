"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import styles from "@/styles/components/auth/RegisterModal.module.css"

const RegisterModal = ({ isOpen, onClose, openLoginModal }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo_postal: "",
    prefijo: "",
    fecha_nacimiento: "",
    contrasena: "",
    correo_electronico: "",
    direccion: "",
    telefono: "",
    pais: "",
    confirmar_contrasena: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const flatpickrInstance = useRef(null)
  const dateInputRef = useRef(null)

  // Definir el callback de Google
  useEffect(() => {
    window.handleCredentialResponse = (response) => {
      handleGoogleRegister(response.credential)
    }
    
    return () => {
      delete window.handleCredentialResponse
    }
  }, [])

  // Limpiar flatpickr al desmontar
  useEffect(() => {
    return () => {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy()
      }
    }
  }, [])

  // Inicializar flatpickr
  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && window.flatpickr && dateInputRef.current) {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy()
      }

      flatpickrInstance.current = window.flatpickr(dateInputRef.current, {
        dateFormat: "Y-m-d",
        maxDate: new Date(),
        onChange: (selectedDates, dateStr) => {
          setFormData((prev) => ({
            ...prev,
            fecha_nacimiento: dateStr,
          }))
        },
        defaultDate: formData.fecha_nacimiento || undefined,
      })
    }
  }, [isOpen, formData.fecha_nacimiento])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name !== "fecha_nacimiento") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }
  }

  const validateForm = () => {
    // Validar contraseñas
    if (formData.contrasena !== formData.confirmar_contrasena) {
      setError("Las contraseñas no coinciden")
      return false
    }

    // Validar correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.correo_electronico)) {
      setError("Formato de correo electrónico inválido")
      return false
    }

    // Validar contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(formData.contrasena)) {
      setError("La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número")
      return false
    }

    // Validar fecha de nacimiento
    if (!formData.fecha_nacimiento) {
      setError("La fecha de nacimiento es requerida")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        onClose()

        window.Swal.fire({
          title: "¡Bienvenido!",
          text: "Te has registrado correctamente en Montañita Adopta.",
          icon: "success",
          confirmButtonText: "Continuar",
          confirmButtonColor: "#27b80b",
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          window.dispatchEvent(new Event("auth-changed"))
          router.refresh()
        })
      } else {
        setError(data.message || "Error al registrarse")

        window.Swal.fire({
          title: "Error",
          text: data.message || "Error al registrarse",
          icon: "error",
          confirmButtonColor: "#d33",
        })
      }
    } catch (error) {
      setError("Error al conectar con el servidor")
      console.error("Error de registro:", error)

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

  const handleGoogleRegister = async (credential) => {
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
        window.Swal.fire({
          title: "¡Bienvenido!",
          text: "Te has registrado correctamente con Google.",
          icon: "success",
          confirmButtonText: "Continuar",
          confirmButtonColor: "#27b80b",
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          window.dispatchEvent(new Event("auth-changed"))
          router.refresh()
        })
      } else {
        setError(data.message || "Error al registrarse con Google")

        window.Swal.fire({
          title: "Error",
          text: data.message || "Error al registrarse con Google",
          icon: "error",
          confirmButtonColor: "#d33",
        })
      }
    } catch (error) {
      setError("Error al conectar con el servidor")
      console.error("Error de registro con Google:", error)

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

  const handleFacebookRegister = () => {
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken
          handleFacebookRegisterServer(accessToken)
        } else {
          setError("Registro con Facebook cancelado")

          window.Swal.fire({
            title: "Cancelado",
            text: "Registro con Facebook cancelado",
            icon: "info",
            confirmButtonColor: "#3085d6",
          })
        }
      },
      { scope: "public_profile,email" },
    )
  }

  const handleFacebookRegisterServer = async (accessToken) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/facebook-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken }),
      })

      const data = await response.json()

      if (response.ok) {
        onClose()
        window.Swal.fire({
          title: "¡Bienvenido!",
          text: "Te has registrado correctamente con Facebook.",
          icon: "success",
          confirmButtonText: "Continuar",
          confirmButtonColor: "#27b80b",
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          window.dispatchEvent(new Event("auth-changed"))
          router.refresh()
        })
      } else {
        setError(data.message || "Error al registrarse con Facebook")

        window.Swal.fire({
          title: "Error",
          text: data.message || "Error al registrarse con Facebook",
          icon: "error",
          confirmButtonColor: "#d33",
        })
      }
    } catch (error) {
      setError("Error al conectar con el servidor")
      console.error("Error de registro con Facebook:", error)

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
      <div id="registerModal" className={styles.modal} style={{ display: "block" }}>
        <div className={styles.modalContent}>
          <div className={styles.close} onClick={onClose}>&times;</div>
          <div className={styles.registroContainer}>
            <h2 className={styles.title}>Registrarse</h2>
            <form id="register-form" onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formCol}>
                  <div className={styles.formGroup}>
                    <label htmlFor="nombre">Nombre:</label>
                    <input
                      type="text"
                      id="register-nombres"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="codigo-postal">Código Postal:</label>
                    <input
                      type="text"
                      id="register-codigo-postal"
                      name="codigo_postal"
                      value={formData.codigo_postal}
                      onChange={handleChange}
                      required
                      autoComplete="postal-code"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="prefijo">Prefijo:</label>
                    <input
                      type="text"
                      id="register-prefijo"
                      name="prefijo"
                      value={formData.prefijo}
                      onChange={handleChange}
                      required
                      autoComplete="tel-country-code"
                      className={styles.input}
                    />
                  </div>
                  <div className={`${styles.formGroup} ${styles.flatpickrContainer}`}>
                    <label htmlFor="fecha_nacimiento">Fecha de Nacimiento:</label>
                    <input
                      type="text"
                      id="register-fecha-nacimiento"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      placeholder="YYYY-MM-DD"
                      ref={dateInputRef}
                      readOnly
                      required
                      className={styles.dateInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="password">Contraseña:</label>
                    <input
                      type="password"
                      id="register-password"
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      className={styles.input}
                    />
                  </div>
                </div>
                <div className={styles.formCol}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Correo Electrónico:</label>
                    <input
                      type="email"
                      id="register-email"
                      name="correo_electronico"
                      value={formData.correo_electronico}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="direccion">Dirección:</label>
                    <input
                      type="text"
                      id="register-direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      required
                      autoComplete="street-address"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="telefono">Teléfono:</label>
                    <input
                      type="text"
                      id="register-telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                      autoComplete="tel"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="pais">País:</label>
                    <input
                      type="text"
                      id="register-pais"
                      name="pais"
                      value={formData.pais}
                      onChange={handleChange}
                      required
                      autoComplete="country"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="confirm-password">Confirmar Contraseña:</label>
                    <input
                      type="password"
                      id="register-confirm-password"
                      name="confirmar_contrasena"
                      value={formData.confirmar_contrasena}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.botonesContainer}>
                <button type="submit" disabled={loading} className={styles.submitButton}>
                  {loading ? "Procesando..." : "Registrarse"}
                </button>
                
                <div
                  id="g_id_onload"
                  data-client_id="385524721924-ufgkod1roqrgi6iaflumbo6dmictc7mm.apps.googleusercontent.com"
                  data-context="signin"
                  data-ux_mode="popup"
                  data-callback="handleCredentialResponse"
                  data-auto_prompt="false"
                  className={styles.googleContainer}
                ></div>

                <div className={`${styles.gidSignin} g_id_signin`} data-type="standard"></div>
                
                <button 
                  type="button" 
                  className={`${styles.socialLogin} ${styles.facebook}`} 
                  onClick={handleFacebookRegister}
                >
                  Registrarse con Facebook
                </button>
              </div>

              {error && <div className={styles.errorMessage}>{error}</div>}
            </form>
          </div>
        </div>
      </div>

      <Script src="https://cdn.jsdelivr.net/npm/flatpickr" strategy="afterInteractive" />
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

export default RegisterModal