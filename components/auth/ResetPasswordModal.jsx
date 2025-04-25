"use client"
import { useState } from "react"
import "@/styles/components/auth/reset-password.css"
import { useLanguage } from "@/contexts/language-context"

const ResetPasswordModal = ({ isOpen, onClose, openVerifyCodeModal }) => {
  const { t } = useLanguage()
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
        setSuccess(t("RESET_PASSWORD_SUCCESS", "general"))

        window.Swal.fire({
          title: t("RESET_PASSWORD_CODE_SENT", "general"),
          text: t("RESET_PASSWORD_SUCCESS", "general"),
          icon: "success",
          confirmButtonText: t("SESSION_CONTINUE", "general"),
          confirmButtonColor: "#27b80b",
          timer: 3000,
          timerProgressBar: true,
        })

        setTimeout(() => {
          onClose()
          openVerifyCodeModal(email)
        }, 3000)
      } else {
        setError(data.message || t("REGISTER_ERROR_SERVER", "general"))

        window.Swal.fire({
          title: "Error",
          text: data.message || t("REGISTER_ERROR_SERVER", "general"),
          icon: "error",
          confirmButtonColor: "#d33",
        })
      }
    } catch (error) {
      setError(t("REGISTER_ERROR_SERVER", "general"))
      console.error("Error al solicitar recuperación:", error)

      window.Swal.fire({
        title: "Error",
        text: t("REGISTER_ERROR_SERVER", "general"),
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
        <h2>{t("RESET_PASSWORD_TITLE", "general")}</h2>
        <form id="reset-password-form" onSubmit={handleSubmit}>
          <label htmlFor="reset-password-email">{t("RESET_PASSWORD_EMAIL", "general")}</label>
          <input
            type="email"
            id="reset-password-email"
            name="reset-password-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? t("RESET_PASSWORD_PROCESSING", "general") : t("RESET_PASSWORD_BUTTON", "general")}
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