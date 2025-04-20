"use client"
import { useState } from "react"
import "@/styles/components/auth/reset-password.css"

const ResetPasswordModal = ({ isOpen, onClose, openVerifyCodeModal }) => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Se ha enviado un código de recuperación a tu correo electrónico")

        window.Swal.fire({
          title: "Código enviado",
          text: "Se ha enviado un código de recuperación a tu correo electrónico",
          icon: "success",
          confirmButtonText: "Continuar",
          confirmButtonColor: "#27b80b",
          timer: 3000,
          timerProgressBar: true,
        })

        setTimeout(() => {
          onClose()
          openVerifyCodeModal(email)
        }, 3000)
      } else {
        setError(data.message || "Error al enviar el código de recuperación")

        window.Swal.fire({
          title: "Error",
          text: data.message || "Error al enviar el código de recuperación",
          icon: "error",
          confirmButtonColor: "#d33",
        })
      }
    } catch (error) {
      setError("Error al conectar con el servidor")
      console.error("Error al solicitar recuperación:", error)

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
    <div id="resetPasswordModal" className="modal" style={{ display: "block" }}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Recuperar Contraseña</h2>
        <form id="reset-password-form" onSubmit={handleSubmit}>
          <label htmlFor="reset-password-email">Correo Electrónico:</label>
          <input
            type="email"
            id="reset-password-email"
            name="reset-password-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar Código de Recuperación"}
          </button>
        </form>
        {error && (
          <div id="reset-password-alert" style={{ color: "red", display: "block" }}>
            {error}
          </div>
        )}
        {success && <div style={{ color: "green", display: "block" }}>{success}</div>}
      </div>
    </div>
  )
}

export default ResetPasswordModal