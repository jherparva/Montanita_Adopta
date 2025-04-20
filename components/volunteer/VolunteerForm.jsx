"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

const VolunteerForm = ({ user, onClose }) => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: user?.name || user?.nombre || "",
    email: user?.email || user?.correo_electronico || "",
    telefono: user?.phone || user?.telefono || "",
    direccion: "",
    ciudad: "",
    disponibilidad: "",
    experiencia: "",
    habilidades: "",
    motivacion: "",
    areas_interes: [],
    acepta_terminos: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const areasInteres = [
    { id: "cuidado_animales", label: "Cuidado de animales" },
    { id: "paseos", label: "Paseos" },
    { id: "limpieza", label: "Limpieza" },
    { id: "eventos", label: "Eventos y jornadas de adopción" },
    { id: "redes_sociales", label: "Redes sociales" },
    { id: "transporte", label: "Transporte" },
    { id: "fotografia", label: "Fotografía" },
    { id: "veterinaria", label: "Asistencia veterinaria" },
    { id: "educacion", label: "Educación y concientización" },
    { id: "recaudacion", label: "Recaudación de fondos" },
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox") {
      if (name === "acepta_terminos") {
        setFormData(prev => ({ ...prev, [name]: checked }))
      } else {
        // Para checkboxes de áreas de interés
        const updatedAreas = [...formData.areas_interes]
        if (checked) {
          updatedAreas.push(value)
        } else {
          const index = updatedAreas.indexOf(value)
          if (index > -1) {
            updatedAreas.splice(index, 1)
          }
        }
        setFormData(prev => ({ ...prev, areas_interes: updatedAreas }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validaciones
    if (!formData.acepta_terminos) {
      setError("Debes aceptar los términos y condiciones para continuar")
      setLoading(false)
      return
    }

    if (formData.areas_interes.length === 0) {
      setError("Por favor, selecciona al menos un área de interés")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (window.Swal) {
          window.Swal.fire({
            title: "¡Gracias por tu interés en ser voluntario!",
            text: "Nos pondremos en contacto contigo muy pronto para coordinar los detalles.",
            icon: "success",
            confirmButtonColor: "#4caf50",
          }).then(() => {
            if (onClose) onClose()
            router.push("/voluntario")
          })
        } else {
          setSuccess("¡Gracias por tu interés en ser voluntario! Nos pondremos en contacto contigo pronto.")
          setTimeout(() => {
            if (onClose) onClose()
            router.push("/voluntario")
          }, 3000)
        }
      } else {
        setError(data.message || "Error al enviar la solicitud")
        
        if (window.Swal) {
          window.Swal.fire({
            title: "Error",
            text: data.message || "Error al enviar la solicitud",
            icon: "error",
            confirmButtonColor: "#f44336",
          })
        }
      }
    } catch (error) {
      setError("Error al conectar con el servidor")
      console.error("Error al enviar solicitud de voluntariado:", error)
      
      if (window.Swal) {
        window.Swal.fire({
          title: "Error",
          text: "Error al conectar con el servidor",
          icon: "error",
          confirmButtonColor: "#f44336",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="volunteer-form-container">
      <h2>Solicitud de Voluntariado</h2>
      <p className="form-intro">
        Completa el siguiente formulario para unirte a nuestro equipo de voluntarios. Revisaremos tu solicitud y te
        contactaremos pronto.
      </p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="volunteer-form">
        <div className="form-section">
          <h3>Información Personal</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">
                Nombre completo: <span className="required">*</span>
              </label>
              <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Correo electrónico: <span className="required">*</span>
              </label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefono">
                Teléfono: <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección:</label>
              <input type="text" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="ciudad">Ciudad:</label>
            <input type="text" id="ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange} />
          </div>
        </div>

        <div className="form-section">
          <h3>Disponibilidad y Experiencia</h3>

          <div className="form-group">
            <label htmlFor="disponibilidad">
              Disponibilidad: <span className="required">*</span>
            </label>
            <select
              id="disponibilidad"
              name="disponibilidad"
              value={formData.disponibilidad}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona tu disponibilidad</option>
              <option value="fines-de-semana">Fines de semana</option>
              <option value="dias-semana">Días de semana</option>
              <option value="mananas">Mañanas</option>
              <option value="tardes">Tardes</option>
              <option value="flexible">Horario flexible</option>
              <option value="remoto">Trabajo remoto</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="experiencia">Experiencia previa con animales:</label>
            <textarea
              id="experiencia"
              name="experiencia"
              value={formData.experiencia}
              onChange={handleChange}
              rows="3"
              placeholder="Cuéntanos si has tenido experiencia previa trabajando con animales"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="habilidades">Habilidades o conocimientos especiales:</label>
            <textarea
              id="habilidades"
              name="habilidades"
              value={formData.habilidades}
              onChange={handleChange}
              rows="3"
              placeholder="Ej: fotografía, diseño gráfico, conocimientos veterinarios, etc."
            ></textarea>
          </div>
        </div>

        <div className="form-section">
          <h3>Áreas de Interés</h3>
          <p>
            Selecciona las áreas en las que te gustaría colaborar: <span className="required">*</span>
          </p>

          <div className="checkbox-group">
            {areasInteres.map((area) => (
              <div className="checkbox-item" key={area.id}>
                <input
                  type="checkbox"
                  id={area.id}
                  name="areas_interes"
                  value={area.id}
                  checked={formData.areas_interes.includes(area.id)}
                  onChange={handleChange}
                />
                <label htmlFor={area.id}>{area.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Motivación</h3>

          <div className="form-group">
            <label htmlFor="motivacion">
              ¿Por qué quieres ser voluntario? <span className="required">*</span>
            </label>
            <textarea
              id="motivacion"
              name="motivacion"
              value={formData.motivacion}
              onChange={handleChange}
              rows="4"
              required
              placeholder="Cuéntanos qué te motiva a unirte a nuestro equipo de voluntarios"
            ></textarea>
          </div>
        </div>

        <div className="form-section">
          <div className="form-group terms-group">
            <input
              type="checkbox"
              id="acepta_terminos"
              name="acepta_terminos"
              checked={formData.acepta_terminos}
              onChange={handleChange}
              required
            />
            <label htmlFor="acepta_terminos">
              Acepto los{" "}
              <a href="/terminos-y-condiciones" target="_blank" rel="noreferrer">
                términos y condiciones
              </a>{" "}
              y la{" "}
              <a href="/politica-de-privacidad" target="_blank" rel="noreferrer">
                política de privacidad
              </a>{" "}
              <span className="required">*</span>
            </label>
          </div>
        </div>

        <div className="form-note">
          <p>
            <span className="required">*</span> Campos obligatorios
          </p>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Enviando...
              </>
            ) : (
              "Enviar Solicitud"
            )}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default VolunteerForm