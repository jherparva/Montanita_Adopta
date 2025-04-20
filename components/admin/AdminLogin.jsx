"use client"
import { useState } from "react"
import styles from "@/styles/admin/Admin_Dashboard.module.css"

const AdminLogin = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        if (onLoginSuccess) {
          onLoginSuccess()
        }
        setTimeout(() => {
          window.location.href = "/admin/dashboard"
        }, 500)
      } else {
        setError(data.message || "Error al iniciar sesión")
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      setError("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminContainer}>
        <div className={styles.adminLoginContainer}>
          <div className={styles.adminLoginLogo}>
            <img src="/imagenes/logo.webp" alt="Logo Montañita Adopta" />
            <h1>Montañita Adopta</h1>
            <h2>Panel de Administración</h2>
          </div>

          <form className={styles.adminLoginForm} onSubmit={handleSubmit}>
            {error && <div className={styles.loginError}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="email">Correo Electrónico</label>
              <div className={styles.inputWithIcon}>
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Contraseña</label>
              <div className={styles.inputWithIcon}>
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" className={styles.loginButton} disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Iniciando sesión...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i> Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className={styles.adminLoginFooter}>
            <p>© 2025 Montañita Adopta - Panel de Administración</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin