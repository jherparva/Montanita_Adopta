"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"

export default function CreateUserPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    correo_electronico: "",
    telefono: "",
    direccion: "",
    codigo_postal: "",
    contrasena: "",
    role: "user",
    tipo_voluntario: "",  // Campo adicional para rol de voluntario
    fecha_registro: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    observaciones: ""  // Campo adicional para notas u observaciones
  })
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Validaciones
      if (formData.contrasena.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres")
      }
      
      if (formData.contrasena !== confirmPassword) {
        throw new Error("Las contraseñas no coinciden")
      }

      // Validación de email con regex simple
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.correo_electronico)) {
        throw new Error("El correo electrónico no es válido")
      }

      // Crear el usuario
      const response = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert("Usuario creado correctamente")
        router.push("/admin/usuarios")
      } else {
        throw new Error(data.message || "Error al crear el usuario")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      setError(error.message || "Error al crear el usuario")
    } finally {
      setSubmitting(false)
    }
  }

  // Mostrar campos adicionales según el rol seleccionado
  const showAdditionalFields = () => {
    if (formData.role === "voluntario") {
      return (
        <div className="form-group">
          <label htmlFor="tipo_voluntario">Tipo de Voluntario:</label>
          <select
            id="tipo_voluntario"
            name="tipo_voluntario"
            value={formData.tipo_voluntario}
            onChange={handleChange}
          >
            <option value="">Seleccione tipo</option>
            <option value="cuidador">Cuidador</option>
            <option value="transportista">Transportista</option>
            <option value="eventos">Organizador de eventos</option>
            <option value="recursos">Recaudador de recursos</option>
          </select>
        </div>
      )
    }
    return null
  }

  return (
    <AdminLayout>
      <div className="admin-form">
        <h2>Crear Nuevo Usuario</h2>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
          </div>
        )}

        <form className="user-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre: *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="correo_electronico">Correo Electrónico: *</label>
            <input
              type="email"
              id="correo_electronico"
              name="correo_electronico"
              value={formData.correo_electronico}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono:</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="direccion">Dirección:</label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="codigo_postal">Código Postal:</label>
            <input
              type="text"
              id="codigo_postal"
              name="codigo_postal"
              value={formData.codigo_postal}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Rol: *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="user">Usuario</option>
              <option value="moderador">Moderador</option>
              <option value="admin">Administrador</option>
              <option value="voluntario">Voluntario</option>
            </select>
          </div>

          {showAdditionalFields()}

          <div className="form-group">
            <label htmlFor="contrasena">Contraseña: *</label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              required
            />
            <small>Mínimo 6 caracteres</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña: *</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="observaciones">Observaciones:</label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? <i className="fas fa-spinner fa-spin"></i> : "Crear Usuario"}
            </button>
            <button type="button" onClick={() => router.push("/admin/usuarios")}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}