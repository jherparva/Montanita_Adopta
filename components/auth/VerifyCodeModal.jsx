"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import "@/styles/components/auth/verify-code-modal.css" 
import { useLanguage } from "@/contexts/language-context"

const VerifyCodeModal = ({ isOpen, onClose, email }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (email && isOpen) {
      setFormData((prev) => ({ ...prev, email }))
    }
  }, [email, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      window.Swal.fire({
        title: t("REGISTER_ERROR_PASSWORD_MATCH", "general"),
        text: t("REGISTER_ERROR_PASSWORD_MATCH", "general"),
        icon: "error",
        confirmButtonColor: "#d33",
      })
      setError(t("REGISTER_ERROR_PASSWORD_MATCH", "general"))
      return false
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(formData.newPassword)) {
      window.Swal.fire({
        title: t("VERIFY_CODE_PASSWORD_REQUIREMENTS", "general"),
        html: `
          <p>${t("VERIFY_CODE_PASSWORD_REQUIREMENTS", "general")}</p>
          <ul style="text-align: left; display: inline-block;">
            <li>${t("VERIFY_CODE_REQ_LENGTH", "general")}</li>
            <li>${t("VERIFY_CODE_REQ_UPPERCASE", "general")}</li>
            <li>${t("VERIFY_CODE_REQ_LOWERCASE", "general")}</li>
            <li>${t("VERIFY_CODE_REQ_NUMBER", "general")}</li>
          </ul>
        `,
        icon: "warning",
        confirmButtonColor: "#3085d6",
      })
      setError(t("REGISTER_ERROR_PASSWORD_FORMAT", "general"))
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    window.Swal.fire({
      title: t("VERIFY_CODE_PROCESSING", "general"),
      text: t("VERIFY_CODE_PROCESSING", "general"),
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        window.Swal.showLoading()
      }
    })

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          code: formData.code,
          newPassword: formData.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(t("VERIFY_CODE_SUCCESS", "general"))
        window.Swal.close()

        window.Swal.fire({
          title: t("VERIFY_CODE_SUCCESS", "general"),
          text: t("VERIFY_CODE_SUCCESS_MESSAGE", "general"),
          icon: "success",
          confirmButtonText: t("SESSION_CONTINUE", "general"),
          confirmButtonColor: "#27b80b",
        }).then(() => {
          window.dispatchEvent(new Event("auth-changed"))
          onClose()
          window.location.reload()
        })
      } else {
        window.Swal.close()
        
        window.Swal.fire({
          title: "Error",
          text: data.message || t("REGISTER_ERROR_SERVER", "general"),
          icon: "error",
          confirmButtonColor: "#d33",
        })
        setError(data.message || t("REGISTER_ERROR_SERVER", "general"))
      }
    } catch (error) {
      window.Swal.close()
      
      window.Swal.fire({
        title: "Error",
        text: t("REGISTER_ERROR_SERVER", "general"),
        icon: "error",
        confirmButtonColor: "#d33",
      })
      setError(t("REGISTER_ERROR_SERVER", "general"))
      console.error("Error al verificar código:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="vcm-modal" style={{ display: "block" }}>
      <div className="vcm-modal-content">
        <span className="vcm-close" onClick={onClose}>&times;</span>
        <h2 className="vcm-title">{t("VERIFY_CODE_TITLE", "general")}</h2>
        <form className="vcm-form" onSubmit={handleSubmit}>
          <div className="vcm-form-group">
            <label htmlFor="vcm-email">{t("VERIFY_CODE_EMAIL", "general")}</label>
            <input
              type="email"
              id="vcm-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="vcm-form-group">
            <label htmlFor="vcm-recovery-code">{t("VERIFY_CODE_CODE", "general")}</label>
            <input 
              type="text" 
              id="vcm-recovery-code" 
              name="code" 
              value={formData.code} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="vcm-form-group">
            <label htmlFor="vcm-new-password">{t("VERIFY_CODE_NEW_PASSWORD", "general")}</label>
            <input
              type="password"
              id="vcm-new-password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="vcm-form-group">
            <label htmlFor="vcm-confirm-password">{t("VERIFY_CODE_CONFIRM_PASSWORD", "general")}</label>
            <input
              type="password"
              id="vcm-confirm-password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="vcm-password-requirements">
            <p>{t("VERIFY_CODE_PASSWORD_REQUIREMENTS", "general")}</p>
            <ul>
              <li>{t("VERIFY_CODE_REQ_LENGTH", "general")}</li>
              <li>{t("VERIFY_CODE_REQ_UPPERCASE", "general")}</li>
              <li>{t("VERIFY_CODE_REQ_LOWERCASE", "general")}</li>
              <li>{t("VERIFY_CODE_REQ_NUMBER", "general")}</li>
            </ul>
          </div>

          <button className="vcm-button" type="submit" disabled={loading}>
            {loading ? t("VERIFY_CODE_PROCESSING", "general") : t("VERIFY_CODE_BUTTON", "general")}
          </button>
        </form>
      </div>
    </div>
  )
}

export default VerifyCodeModal