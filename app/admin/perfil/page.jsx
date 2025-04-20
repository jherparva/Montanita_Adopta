"use client"
import { useState, useEffect } from "react"
import "@/styles/admin/perfil.css"

export default function PerfilPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/admin/auth/user")

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()
        setUser(data.user)

        // Inicializar el formulario con los datos del usuario
        setFormData({
          nombre: data.user.nombre || data.user.name || "",
          email: data.user.correo_electronico || data.user.email || "",
          telefono: data.user.telefono || data.user.phone || "",
          password: "",
          confirmPassword: "",
        })
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error)
        setError("No se pudieron cargar los datos del perfil. Por favor intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar contraseñas si se están actualizando
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage("")

    try {
      // Crear objeto con datos a actualizar
      const updateData = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
      }

      // Solo incluir contraseña si se está actualizando
      if (formData.password) {
        updateData.password = formData.password
      }

      const res = await fetch("/api/admin/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Error al actualizar perfil")
      }

      setSuccessMessage("Perfil actualizado correctamente")

      // Actualizar datos del usuario en el estado
      setUser((prev) => ({
        ...prev,
        nombre: formData.nombre,
        name: formData.nombre,
        correo_electronico: formData.email,
        email: formData.email,
        telefono: formData.telefono,
        phone: formData.telefono,
      }))

      // Limpiar campos de contraseña
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }))
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      setError(error.message || "Error al actualizar el perfil. Intente nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">
          <i className="fas fa-paw fa-spin"></i>
        </div>
        <p>Cargando información del perfil...</p>
      </div>
    )
  }

  return (
    <div className="perfil-container">
      <h1>Mi Perfil</h1>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="perfil-content">
        <div className="perfil-avatar">
          <div className="avatar-container">
            <i className="fas fa-user"></i>
          </div>
          <button className="btn-change-avatar">Cambiar foto</button>
        </div>

        <div className="perfil-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo</label>
              <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} />
            </div>

            <div className="form-divider">
              <h3>Cambiar contraseña</h3>
              <p>Deje estos campos en blanco si no desea cambiar su contraseña</p>
            </div>

            <div className="form-group">
              <label htmlFor="password">Nueva contraseña</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
