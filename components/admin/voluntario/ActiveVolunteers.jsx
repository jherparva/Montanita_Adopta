"use client"
import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import TestimonialsManager from "./TestimonialsManager"

const ActiveVolunteers = () => {
  const [voluntariosActivos, setVoluntariosActivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [mostrarEditar, setMostrarEditar] = useState(false)
  const [voluntarioEditar, setVoluntarioEditar] = useState(null)
  const [areaFiltro, setAreaFiltro] = useState("")
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")

  // Mapeo de IDs de áreas a nombres legibles
  const areasInteres = {
    "cuidado_animales": "Cuidado de animales",
    "paseos": "Paseos",
    "limpieza": "Limpieza",
    "eventos": "Eventos y jornadas de adopción",
    "redes_sociales": "Redes sociales",
    "transporte": "Transporte",
    "fotografia": "Fotografía",
    "veterinaria": "Asistencia veterinaria",
    "educacion": "Educación y concientización",
    "recaudacion": "Recaudación de fondos",
  }

  // Fetch voluntarios activos con useCallback para evitar recreaciones innecesarias
  const fetchVoluntariosActivos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        activos: true,
        ...(areaFiltro && { area: areaFiltro }),
        ...(desde && { desde }),
        ...(hasta && { hasta }),
      })

      const res = await fetch(`/api/admin/volunteer/active?${params}`)
      const data = await res.json()

      if (data.success) {
        setVoluntariosActivos(data.volunteers || [])
        setTotalPages(data.pagination?.pages || 1)
      } else {
        setError(data.message || "Error al cargar voluntarios activos")
        setVoluntariosActivos([])
      }
    } catch (error) {
      console.error("Error al cargar voluntarios activos:", error)
      setError("Error al cargar voluntarios activos. Por favor, intente nuevamente.")
      setVoluntariosActivos([])
    } finally {
      setLoading(false)
    }
  }, [page, areaFiltro, desde, hasta])

  useEffect(() => {
    fetchVoluntariosActivos()
  }, [fetchVoluntariosActivos])

  const aplicarFiltros = () => {
    setPage(1)
    fetchVoluntariosActivos()
  }

  const resetFiltros = () => {
    setAreaFiltro("")
    setDesde("")
    setHasta("")
    setPage(1)
    fetchVoluntariosActivos()
  }

  const abrirEditar = (voluntario) => {
    setVoluntarioEditar(voluntario)
    setMostrarEditar(true)
  }

  const cerrarEditar = () => {
    setMostrarEditar(false)
    setVoluntarioEditar(null)
  }

  const guardarCambios = async (formData) => {
    try {
      const res = await fetch("/api/admin/volunteer/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      // Mostrar mensaje de éxito
      if (window.Swal) {
        window.Swal.fire({
          title: "¡Guardado!",
          text: "La información del voluntario ha sido actualizada correctamente",
          icon: "success",
          confirmButtonColor: "#4caf50",
        })
      } else {
        alert("La información del voluntario ha sido actualizada correctamente")
      }

      cerrarEditar()
      fetchVoluntariosActivos()
    } catch (error) {
      if (window.Swal) {
        window.Swal.fire({
          title: "Error",
          text: error.message || "Error al actualizar la información",
          icon: "error",
          confirmButtonColor: "#f44336",
        })
      } else {
        alert(`Error: ${error.message}`)
      }
    }
  }

  const formatearFecha = (fecha) => {
    return fecha ? format(new Date(fecha), 'dd/MM/yyyy', { locale: es }) : ''
  }

  return (
    <div className="voluntarios-activos-container">
      <h2>Voluntarios Activos</h2>
      <p>Gestiona la información de los voluntarios aprobados y activos.</p>

      <div className="filtros-activos">
        <select 
          value={areaFiltro} 
          onChange={(e) => setAreaFiltro(e.target.value)}
          aria-label="Filtrar por área de interés"
        >
          <option value="">Todas las áreas</option>
          {Object.entries(areasInteres).map(([id, nombre]) => (
            <option key={id} value={id}>
              {nombre}
            </option>
          ))}
        </select>

        <div className="filtro-fecha">
          <input 
            type="date" 
            value={desde} 
            onChange={(e) => setDesde(e.target.value)} 
            aria-label="Fecha desde"
          />
        </div>

        <div className="filtro-fecha">
          <input 
            type="date" 
            value={hasta} 
            onChange={(e) => setHasta(e.target.value)} 
            aria-label="Fecha hasta"
          />
        </div>

        <button onClick={aplicarFiltros} className="btn-buscar">
          <i className="fas fa-search"></i> Aplicar filtros
        </button>

        <button onClick={resetFiltros} className="btn-refresh">
          <i className="fas fa-sync-alt"></i> Limpiar
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando voluntarios activos...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={fetchVoluntariosActivos}>Reintentar</button>
        </div>
      ) : voluntariosActivos.length === 0 ? (
        <div className="no-results">
          <i className="fas fa-info-circle"></i>
          <p>No se encontraron voluntarios activos con los filtros seleccionados.</p>
        </div>
      ) : (
        <>
          <div className="voluntarios-activos-lista">
            <table className="voluntarios-tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Fecha de inicio</th>
                  <th>Disponibilidad</th>
                  <th>Áreas de interés</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {voluntariosActivos.map((v) => (
                  <tr key={v._id}>
                    <td>{v.nombre}</td>
                    <td>
                      <div>{v.email}</div>
                      <div>{v.telefono}</div>
                    </td>
                    <td className="fecha-inicio">
                      {formatearFecha(v.fecha_inicio || v.fecha_actualizacion || v.fecha_solicitud)}
                    </td>
                    <td>{v.disponibilidad}</td>
                    <td>
                      <div className="areas-container">
                        {v.areas_interes?.map((area) => (
                          <span key={area} className="badge badge-area">
                            {areasInteres[area] || area}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button onClick={() => abrirEditar(v)} className="btn-detalle">
                        <i className="fas fa-edit"></i> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="paginacion-voluntarios">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
              <i className="fas fa-chevron-left"></i> Anterior
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
              Siguiente <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </>
      )}

      {/* Modal de edición de voluntario */}
      {mostrarEditar && voluntarioEditar && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar Voluntario</h2>
              <button className="btn-cerrar" onClick={cerrarEditar}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <EditarVoluntarioForm 
                voluntario={voluntarioEditar}
                areasInteres={areasInteres}
                onGuardar={guardarCambios}
                onCancelar={cerrarEditar}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para editar la información del voluntario
const EditarVoluntarioForm = ({ voluntario, areasInteres, onGuardar, onCancelar }) => {
  const [formData, setFormData] = useState({
    _id: voluntario._id,
    nombre: voluntario.nombre || "",
    email: voluntario.email || "",
    telefono: voluntario.telefono || "",
    direccion: voluntario.direccion || "",
    ciudad: voluntario.ciudad || "",
    disponibilidad: voluntario.disponibilidad || "",
    experiencia: voluntario.experiencia || "",
    habilidades: voluntario.habilidades || "",
    motivacion: voluntario.motivacion || "",
    areas_interes: voluntario.areas_interes || [],
    fecha_inicio: voluntario.fecha_inicio 
      ? new Date(voluntario.fecha_inicio).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    notas_admin: voluntario.notas_admin || "",
    capacitaciones: voluntario.capacitaciones || "",
    horas_acumuladas: voluntario.horas_acumuladas || 0,
    rol_especifico: voluntario.rol_especifico || "",
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox") {
      const updatedAreas = [...formData.areas_interes]
      if (checked) {
        if (!updatedAreas.includes(value)) {
          updatedAreas.push(value)
        }
      } else {
        const index = updatedAreas.indexOf(value)
        if (index > -1) {
          updatedAreas.splice(index, 1)
        }
      }
      setFormData({ ...formData, areas_interes: updatedAreas })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar(formData)
  }

  return (
    <form className="editar-voluntario-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Información Personal</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre">Nombre completo:</label>
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
            <label htmlFor="email">Correo electrónico:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="telefono">Teléfono:</label>
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
            <label htmlFor="fecha_inicio">Fecha de inicio:</label>
            <input
              type="date"
              id="fecha_inicio"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
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
            <label htmlFor="ciudad">Ciudad:</label>
            <input
              type="text"
              id="ciudad"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Información de Voluntariado</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="disponibilidad">Disponibilidad:</label>
            <select
              id="disponibilidad"
              name="disponibilidad"
              value={formData.disponibilidad}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona su disponibilidad</option>
              <option value="fines-de-semana">Fines de semana</option>
              <option value="dias-semana">Días de semana</option>
              <option value="mananas">Mañanas</option>
              <option value="tardes">Tardes</option>
              <option value="flexible">Horario flexible</option>
              <option value="remoto">Trabajo remoto</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="rol_especifico">Rol específico:</label>
            <input
              type="text"
              id="rol_especifico"
              name="rol_especifico"
              value={formData.rol_especifico}
              onChange={handleChange}
              placeholder="Ej: Coordinador de eventos, Fotógrafo, etc."
            />
          </div>
        </div>

        <div className="form-group">
          <label>Áreas de interés:</label>
          <div className="checkbox-group">
            {Object.entries(areasInteres).map(([id, nombre]) => (
              <div className="checkbox-item" key={id}>
                <input
                  type="checkbox"
                  id={`area-${id}`}
                  name="areas_interes"
                  value={id}
                  checked={formData.areas_interes.includes(id)}
                  onChange={handleChange}
                />
                <label htmlFor={`area-${id}`}>{nombre}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="experiencia">Experiencia previa:</label>
          <textarea
            id="experiencia"
            name="experiencia"
            value={formData.experiencia}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="habilidades">Habilidades especiales:</label>
          <textarea
            id="habilidades"
            name="habilidades"
            value={formData.habilidades}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="motivacion">Motivación:</label>
          <textarea
            id="motivacion"
            name="motivacion"
            value={formData.motivacion}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>
      </div>

      <div className="form-section">
        <h3>Información Administrativa</h3>
        <div className="form-group">
          <label htmlFor="horas_acumuladas">Horas acumuladas:</label>
          <input
            type="number"
            id="horas_acumuladas"
            name="horas_acumuladas"
            value={formData.horas_acumuladas}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="capacitaciones">Capacitaciones recibidas:</label>
          <textarea
            id="capacitaciones"
            name="capacitaciones"
            value={formData.capacitaciones}
            onChange={handleChange}
            rows="3"
            placeholder="Ej: Taller de primeros auxilios (12/05/2024), Manejo de animales (23/06/2024)"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="notas_admin">Notas administrativas:</label>
          <textarea
            id="notas_admin"
            name="notas_admin"
            value={formData.notas_admin}
            onChange={handleChange}
            rows="3"
            placeholder="Notas internas sobre el voluntario"
          ></textarea>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancelar" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn-guardar">
          Guardar cambios
        </button>
      </div>
    </form>
  )
}

export default ActiveVolunteers