"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import "@/styles/components/auth/userSettingsModal.css"
import { useLanguage } from "@/contexts/language-context"

const UserSettingsModal = ({ isOpen, onClose, userData }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    correo_electronico: "",
    codigo_postal: "",
    direccion: "",
    telefono: "",
    contrasena: "",
    confirmar_contrasena: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (userData && isOpen) {
      setFormData({
        id: userData.id || "",
        nombre: userData.nombre || "",
        correo_electronico: userData.correo_electronico || "",
        codigo_postal: userData.codigo_postal || "",
        direccion: userData.direccion || "",
        telefono: userData.telefono || "",
        contrasena: "",
        confirmar_contrasena: "",
      })
    }
  }, [userData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (formData.contrasena || formData.confirmar_contrasena) {
      if (formData.contrasena !== formData.confirmar_contrasena) {
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
      if (!passwordRegex.test(formData.contrasena)) {
        window.Swal.fire({
          title: t("REGISTER_ERROR_PASSWORD_FORMAT", "general"),
          text: t("REGISTER_ERROR_PASSWORD_FORMAT", "general"),
          icon: "warning",
          confirmButtonColor: "#3085d6",
        })
        setError(t("REGISTER_ERROR_PASSWORD_FORMAT", "general"))
        return false
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.correo_electronico)) {
      window.Swal.fire({
        title: t("REGISTER_ERROR_EMAIL_FORMAT", "general"),
        text: t("REGISTER_ERROR_EMAIL_FORMAT", "general"),
        icon: "error",
        confirmButtonColor: "#d33",
      })
      setError(t("REGISTER_ERROR_EMAIL_FORMAT", "general"))
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
      title: t("SETTINGS_PROCESSING", "general"),
      text: t("SETTINGS_PROCESSING", "general"),
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
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: formData.id,
          nombre: formData.nombre,
          correo_electronico: formData.correo_electronico,
          codigo_postal: formData.codigo_postal,
          direccion: formData.direccion,
          telefono: formData.telefono,
          contrasena: formData.contrasena || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(t("SETTINGS_UPDATE_SUCCESS", "general"))
        setFormData((prev) => ({
          ...prev,
          contrasena: "",
          confirmar_contrasena: "",
        }))

        window.Swal.fire({
          title: t("SETTINGS_UPDATED", "general"),
          text: t("SETTINGS_UPDATE_SUCCESS", "general"),
          icon: "success",
          confirmButtonText: t("SESSION_CONTINUE", "general"),
          confirmButtonColor: "#27b80b",
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          window.dispatchEvent(new Event("auth-changed"))
          router.refresh()
        })
      } else {
        window.Swal.fire({
          title: "Error",
          text: data.message || t("REGISTER_ERROR_SERVER", "general"),
          icon: "error",
          confirmButtonColor: "#d33",
        })
        setError(data.message || t("REGISTER_ERROR_SERVER", "general"))
      }
    } catch (error) {
      window.Swal.fire({
        title: "Error",
        text: t("REGISTER_ERROR_SERVER", "general"),
        icon: "error",
        confirmButtonColor: "#d33",
      })
      setError(t("REGISTER_ERROR_SERVER", "general"))
      console.error("Error al actualizar usuario:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    window.Swal.fire({
      title: t("SETTINGS_DELETE_CONFIRMATION", "general"),
      text: t("SETTINGS_DELETE_WARNING", "general"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("SETTINGS_DELETE_CONFIRM", "general"),
      cancelButtonText: t("SETTINGS_DELETE_CANCEL", "general"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        window.Swal.fire({
          title: t("SETTINGS_DELETE_PROCESSING", "general"),
          text: t("SETTINGS_DELETE_PROCESSING", "general"),
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
          const response = await fetch("/api/user/delete", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: formData.id }),
          })

          const data = await response.json()

          if (response.ok) {
            window.dispatchEvent(new Event("auth-changed"))
            
            window.Swal.fire({
              title: t("SETTINGS_DELETE_SUCCESS", "general"),
              text: t("SETTINGS_DELETE_SUCCESS_MESSAGE", "general"),
              icon: "success",
              confirmButtonColor: "#27b80b",
            }).then(() => {
              onClose()
              fetch("/api/auth/logout", { method: "POST" }).then(() => router.push("/"))
            })
          } else {
            window.Swal.fire({
              title: "Error",
              text: data.message || t("REGISTER_ERROR_SERVER", "general"),
              icon: "error",
              confirmButtonColor: "#d33",
            })
            setError(data.message || t("REGISTER_ERROR_SERVER", "general"))
          }
        } catch (error) {
          window.Swal.fire({
            title: "Error",
            text: t("REGISTER_ERROR_SERVER", "general"),
            icon: "error",
            confirmButtonColor: "#d33",
          })
          setError(t("REGISTER_ERROR_SERVER", "general"))
          console.error("Error al eliminar cuenta:", error)
        } finally {
          setLoading(false)
        }
      }
    })
  }

  if (!isOpen) return null

  return (
    <div id="userSettingsModal" className="user-settings-modal" style={{ display: "block" }}>
      <div className="user-settings-modal-content">
        <span className="user-settings-close" onClick={onClose}>&times;</span>
        <div className="user-settings-container">
          <h2>{t("SETTINGS_TITLE", "general")}</h2>
          <form id="user-settings-form" onSubmit={handleSubmit}>
            <input type="hidden" name="id" id="user-settings-id" value={formData.id} />
            <div className="user-settings-form-row">
              <div className="user-settings-form-col">
                <div className="user-settings-form-group">
                  <label htmlFor="user-settings-nombre">{t("SETTINGS_NAME", "general")}</label>
                  <input 
                    type="text" 
                    id="user-settings-nombre" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="user-settings-form-group">
                  <label htmlFor="user-settings-correo_electronico">{t("SETTINGS_EMAIL", "general")}</label>
                  <input
                    type="email"
                    id="user-settings-correo_electronico"
                    name="correo_electronico"
                    value={formData.correo_electronico}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="user-settings-form-group">
                  <label htmlFor="user-settings-codigo_postal">{t("SETTINGS_POSTAL_CODE", "general")}</label>
                  <input
                    type="text"
                    id="user-settings-codigo_postal"
                    name="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="user-settings-form-group">
                  <label htmlFor="user-settings-contrasena">{t("SETTINGS_NEW_PASSWORD", "general")}</label>
                  <input
                    type="password"
                    id="user-settings-contrasena"
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="user-settings-form-col">
                <div className="user-settings-form-group">
                  <label htmlFor="user-settings-direccion">{t("SETTINGS_ADDRESS", "general")}</label>
                  <input
                    type="text"
                    id="user-settings-direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="user-settings-form-group">
                  <label htmlFor="user-settings-telefono">{t("SETTINGS_PHONE", "general")}</label>
                  <input
                    type="text"
                    id="user-settings-telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="user-settings-form-group">
                  <label htmlFor="user-settings-confirmar_contrasena">{t("SETTINGS_CONFIRM_PASSWORD", "general")}</label>
                  <input
                    type="password"
                    id="user-settings-confirmar_contrasena"
                    name="confirmar_contrasena"
                    value={formData.confirmar_contrasena}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            <div className="user-settings-botones-container">
              <button type="submit" className="user-settings-update-btn" disabled={loading}>
                {loading ? t("SETTINGS_PROCESSING", "general") : t("SETTINGS_UPDATE_BUTTON", "general")}
              </button>
              <button 
                type="button" 
                id="user-settings-delete-account" 
                className="user-settings-delete-btn"
                onClick={handleDeleteAccount} 
                disabled={loading}
              >
                {t("SETTINGS_DELETE_BUTTON", "general")}
              </button>
            </div>
          </form>
          {error && <div className="user-settings-error-message">{error}</div>}
          {success && <div className="user-settings-success-message">{success}</div>}
        </div>
      </div>
    </div>
  )
}

export default UserSettingsModal