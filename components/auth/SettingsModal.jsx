"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import "@/styles/components/auth/userSettingsModal.css"

const UserSettingsModal = ({ isOpen, onClose, userData }) => {
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
          title: "Error de validación",
          text: "Las contraseñas no coinciden",
          icon: "error",
          confirmButtonColor: "#d33",
        })
        setError("Las contraseñas no coinciden")
        return false
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
      if (!passwordRegex.test(formData.contrasena)) {
        window.Swal.fire({
          title: "Error de validación",
          text: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número",
          icon: "warning",
          confirmButtonColor: "#3085d6",
        })
        setError("La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número")
        return false
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.correo_electronico)) {
      window.Swal.fire({
        title: "Error de validación",
        text: "Formato de correo electrónico inválido",
        icon: "error",
        confirmButtonColor: "#d33",
      })
      setError("Formato de correo electrónico inválido")
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
      title: "Procesando...",
      text: "Actualizando tu información",
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
        setSuccess("Información actualizada correctamente")
        setFormData((prev) => ({
          ...prev,
          contrasena: "",
          confirmar_contrasena: "",
        }))

        window.Swal.fire({
          title: "¡Actualizado!",
          text: "Tu información ha sido actualizada correctamente",
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
        window.Swal.fire({
          title: "Error",
          text: data.message || "Error al actualizar la información",
          icon: "error",
          confirmButtonColor: "#d33",
        })
        setError(data.message || "Error al actualizar la información")
      }
    } catch (error) {
      window.Swal.fire({
        title: "Error",
        text: "Error al conectar con el servidor",
        icon: "error",
        confirmButtonColor: "#d33",
      })
      setError("Error al conectar con el servidor")
      console.error("Error al actualizar usuario:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    window.Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará permanentemente tu cuenta y no podrá ser revertida",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar cuenta",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        window.Swal.fire({
          title: "Procesando...",
          text: "Eliminando tu cuenta",
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
              title: "Cuenta eliminada",
              text: "Tu cuenta ha sido eliminada correctamente",
              icon: "success",
              confirmButtonColor: "#27b80b",
            }).then(() => {
              onClose()
              fetch("/api/auth/logout", { method: "POST" }).then(() => router.push("/"))
            })
          } else {
            window.Swal.fire({
              title: "Error",
              text: data.message || "Error al eliminar la cuenta",
              icon: "error",
              confirmButtonColor: "#d33",
            })
            setError(data.message || "Error al eliminar la cuenta")
          }
        } catch (error) {
          window.Swal.fire({
            title: "Error",
            text: "Error al conectar con el servidor. Por favor, intenta más tarde.",
            icon: "error",
            confirmButtonColor: "#d33",
          })
          setError("Error al conectar con el servidor")
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
          <h2>Configuración de Usuario</h2>
          <form id="user-settings-form" onSubmit={handleSubmit}>
            <input type="hidden" name="id" id="user-settings-id" value={formData.id} />
            <div className="user-settings-form-row">
              <div className="user-settings-form-col">
                <div className="user-settings-form-group">
                  <label htmlFor="user-settings-nombre">Nombre:</label>
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
                  <label htmlFor="user-settings-correo_electronico">Correo Electrónico:</label>
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
                  <label htmlFor="user-settings-codigo_postal">Código Postal:</label>
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
                  <label htmlFor="user-settings-contrasena">Nueva Contraseña:</label>
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
                  <label htmlFor="user-settings-direccion">Dirección:</label>
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
                  <label htmlFor="user-settings-telefono">Teléfono:</label>
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
                  <label htmlFor="user-settings-confirmar_contrasena">Confirmar Nueva Contraseña:</label>
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
                {loading ? "Procesando..." : "Actualizar Información"}
              </button>
              <button 
                type="button" 
                id="user-settings-delete-account" 
                className="user-settings-delete-btn"
                onClick={handleDeleteAccount} 
                disabled={loading}
              >
                Eliminar Cuenta
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