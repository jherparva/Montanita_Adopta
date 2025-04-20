"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"

export default function EditUserPage({ params }) {
  const { id } = params
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    correo_electronico: "",
    telefono: "",
    direccion: "",
    codigo_postal: "",
    contrasena: "",
    role: "user",
  })
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [activities, setActivities] = useState([])
  const [loadingActivities, setLoadingActivities] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/users/${id}`)
        const data = await response.json()

        if (response.ok && data.success) {
          const user = data.user
          setFormData({
            nombre: user.nombre || user.name || "",
            correo_electronico: user.correo_electronico || user.email || "",
            telefono: user.telefono || user.phone || "",
            direccion: user.direccion || "",
            codigo_postal: user.codigo_postal || "",
            contrasena: "",
            role: user.role || "user",
          })
          
          // Cargar actividades del usuario
          fetchUserActivities()
        } else {
          setError(data.message || "Error al cargar el usuario")
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        setError("Error al cargar el usuario")
      } finally {
        setLoading(false)
      }
    }

    const fetchUserActivities = async () => {
      try {
        setLoadingActivities(true)
        const response = await fetch(`/api/admin/users/activity?userId=${id}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setActivities(data.actividades)
        }
      } catch (error) {
        console.error("Error fetching user activities:", error)
      } finally {
        setLoadingActivities(false)
      }
    }

    if (id) {
      fetchUser()
    }
  }, [id])

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

    try {
      // Validar contraseña si se está cambiando
      if (formData.contrasena) {
        if (formData.contrasena.length < 6) {
          alert("La contraseña debe tener al menos 6 caracteres")
          setSubmitting(false)
          return
        }
        
        if (formData.contrasena !== confirmPassword) {
          alert("Las contraseñas no coinciden")
          setSubmitting(false)
          return
        }
      }

      // Actualizar el usuario
      const response = await fetch(`/api/admin/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          ...formData
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert("Usuario actualizado correctamente")
        router.push("/admin/usuarios")
      } else {
        throw new Error(data.message || "Error al actualizar el usuario")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      setError(error.message || "Error al actualizar el usuario")
      alert(error.message || "Error al actualizar el usuario")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando información del usuario...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={() => router.push("/admin/usuarios")} className="btn btn-primary mt-3">
            Volver a la lista
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="admin-form">
        <h2>Editar Usuario</h2>

        <form className="user-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre:</label>
            <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="correo_electronico">Correo Electrónico:</label>
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
            <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="direccion">Dirección:</label>
            <input type="text" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} />
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
            <label htmlFor="role">Rol:</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} required>
              <option value="user">Usuario</option>
              <option value="moderador">Moderador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="contrasena">Nueva Contraseña (dejar en blanco para mantener la actual):</label>
            <input 
              type="password" 
              id="contrasena" 
              name="contrasena" 
              value={formData.contrasena} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
            <input 
              type="password" 
              id="confirmPassword" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              disabled={!formData.contrasena}
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? <i className="fas fa-spinner fa-spin"></i> : "Guardar Cambios"}
            </button>
            <button type="button" onClick={() => router.push("/admin/usuarios")}>
              Cancelar
            </button>
          </div>
        </form>

        <div className="user-activities">
          <h3>Actividad Reciente</h3>
          {loadingActivities ? (
            <p>Cargando actividades...</p>
          ) : activities.length > 0 ? (
            <ul className="activities-list">
              {activities.map((activity, index) => (
                <li key={index} className={`activity-item ${activity.tipo}`}>
                  <span className="activity-date">
                    {new Date(activity.fecha).toLocaleString()}
                  </span>
                  <span className="activity-type">{activity.tipo}</span>
                  <span className="activity-desc">{activity.descripcion}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay actividades registradas.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}