"use client"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const TestimonialsManager = () => {
  const [testimonios, setTestimonios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [testimonioEditar, setTestimonioEditar] = useState(null)
  const [voluntarios, setVoluntarios] = useState([])

  // Formulario
  const [formData, setFormData] = useState({
    nombre: "",
    imagen: "",
    contenido: "",
    rol: "",
    anioInicio: "",
    mostrarEnHome: false,
    estado: "activo",
    voluntarioId: "",
  })

  // Obtener testimonios
  const fetchTestimonios = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/testimonials?page=${page}&limit=6`)
      const data = await res.json()

      if (data.success) {
        setTestimonios(data.testimonials || [])
        setTotalPages(data.pagination?.pages || 1)
      } else {
        setError(data.message || "Error al cargar testimonios")
        setTestimonios([])
      }
    } catch (error) {
      console.error("Error al cargar testimonios:", error)
      setError("Error al cargar testimonios. Por favor, intente nuevamente.")
      setTestimonios([])
    } finally {
      setLoading(false)
    }
  }

  // Obtener voluntarios para vincular
  const fetchVoluntarios = async () => {
    try {
      const res = await fetch("/api/admin/volunteer/active?limit=100")
      const data = await res.json()

      if (data.success) {
        setVoluntarios(data.volunteers || [])
      } else {
        console.error("Error al cargar voluntarios:", data.message)
      }
    } catch (error) {
      console.error("Error al cargar voluntarios:", error)
    }
  }

  useEffect(() => {
    fetchTestimonios()
    fetchVoluntarios()
  }, [page])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let res
      if (testimonioEditar) {
        // Actualizar testimonio existente
        res = await fetch(`/api/admin/testimonials/${testimonioEditar._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      } else {
        // Crear nuevo testimonio
        res = await fetch("/api/admin/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      }

      const data = await res.json()

      if (data.success) {
        // Mostrar mensaje de éxito
        if (window.Swal) {
          window.Swal.fire({
            title: "¡Éxito!",
            text: testimonioEditar
              ? "Testimonio actualizado correctamente"
              : "Testimonio creado correctamente",
            icon: "success",
            confirmButtonColor: "#4caf50",
          })
        } else {
          alert(
            testimonioEditar
              ? "Testimonio actualizado correctamente"
              : "Testimonio creado correctamente"
          )
        }

        // Limpiar formulario y actualizar lista
        resetFormulario()
        fetchTestimonios()
      } else {
        setError(data.message || "Error en la operación")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Error en la operación. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const editarTestimonio = (testimonio) => {
    setTestimonioEditar(testimonio)
    setFormData({
      nombre: testimonio.nombre || "",
      imagen: testimonio.imagen || "",
      contenido: testimonio.contenido || "",
      rol: testimonio.rol || "",
      anioInicio: testimonio.anioInicio || "",
      mostrarEnHome: testimonio.mostrarEnHome || false,
      estado: testimonio.estado || "activo",
      voluntarioId: testimonio.voluntarioId || "",
    })
    setMostrarFormulario(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const eliminarTestimonio = async (id) => {
    // Confirmar antes de eliminar
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este testimonio? Esta acción no se puede deshacer."
    )
    if (!confirmar) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      })
      const data = await res.json()

      if (data.success) {
        // Mostrar mensaje de éxito
        if (window.Swal) {
          window.Swal.fire({
            title: "¡Eliminado!",
            text: "Testimonio eliminado correctamente",
            icon: "success",
            confirmButtonColor: "#4caf50",
          })
        } else {
          alert("Testimonio eliminado correctamente")
        }

        fetchTestimonios()
      } else {
        setError(data.message || "Error al eliminar testimonio")
      }
    } catch (error) {
      console.error("Error al eliminar testimonio:", error)
      setError("Error al eliminar testimonio. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const resetFormulario = () => {
    setTestimonioEditar(null)
    setFormData({
      nombre: "",
      imagen: "",
      contenido: "",
      rol: "",
      anioInicio: "",
      mostrarEnHome: false,
      estado: "activo",
      voluntarioId: "",
    })
    setMostrarFormulario(false)
  }

  // Función para formatear fechas
  const formatearFecha = (fecha) => {
    if (!fecha) return ""
    try {
      return format(new Date(fecha), "dd/MM/yyyy", { locale: es })
    } catch (e) {
      return "Fecha inválida"
    }
  }

  // Obtener nombre de voluntario por ID
  const getNombreVoluntario = (id) => {
    if (!id) return ""
    const voluntario = voluntarios.find((v) => v._id === id)
    return voluntario ? voluntario.nombre : ""
  }

  return (
    <div className="testimonios-manager">
      <div className="section-header">
        <h2>Testimonios de Voluntarios</h2>
        <button
          className="btn-primary"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? (
            <>
              <i className="fas fa-times"></i> Cancelar
            </>
          ) : (
            <>
              <i className="fas fa-plus"></i> Nuevo Testimonio
            </>
          )}
        </button>
      </div>

      {/* Formulario de creación/edición */}
      {mostrarFormulario && (
        <div className="card testimonio-form-card">
          <h3>{testimonioEditar ? "Editar Testimonio" : "Nuevo Testimonio"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre del voluntario *</label>
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
                <label htmlFor="imagen">URL de la imagen (opcional)</label>
                <input
                  type="text"
                  id="imagen"
                  name="imagen"
                  value={formData.imagen}
                  onChange={handleChange}
                  placeholder="/imagenes/testimonio.webp"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rol">Rol o descripción</label>
                <input
                  type="text"
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  placeholder="Ej: Coordinador de eventos"
                />
              </div>
              <div className="form-group">
                <label htmlFor="anioInicio">Año de inicio</label>
                <input
                  type="text"
                  id="anioInicio"
                  name="anioInicio"
                  value={formData.anioInicio}
                  onChange={handleChange}
                  placeholder="Ej: 2021"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contenido">Testimonio *</label>
              <textarea
                id="contenido"
                name="contenido"
                rows="5"
                value={formData.contenido}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="mostrarEnHome"
                    checked={formData.mostrarEnHome}
                    onChange={handleChange}
                  />
                  Mostrar en página principal
                </label>
              </div>
              <div className="form-group">
                <label htmlFor="estado">Estado</label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="voluntarioId">Vincular a voluntario (opcional)</label>
              <select
                id="voluntarioId"
                name="voluntarioId"
                value={formData.voluntarioId}
                onChange={handleChange}
              >
                <option value="">-- Sin vincular --</option>
                {voluntarios.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.nombre}
                  </option>
                ))}
              </select>
              <small>
                Vincular el testimonio a un voluntario registrado en el sistema
              </small>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={resetFormulario}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Guardando...
                  </>
                ) : testimonioEditar ? (
                  "Actualizar Testimonio"
                ) : (
                  "Crear Testimonio"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mensajes de estado */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
        </div>
      )}

      {/* Lista de testimonios */}
      {loading && !mostrarFormulario ? (
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando testimonios...</p>
        </div>
      ) : testimonios.length === 0 ? (
        <div className="no-results">
          <i className="fas fa-info-circle"></i>
          <p>No hay testimonios registrados.</p>
        </div>
      ) : (
        <div className="testimonios-grid">
          {testimonios.map((testimonio) => (
            <div key={testimonio._id} className="testimonio-card">
              <div className="testimonio-content">
                <div className="testimonio-header">
                  <h3>{testimonio.nombre}</h3>
                  <div className="testimonio-badges">
                    <span className={`badge estado-${testimonio.estado}`}>
                      {testimonio.estado === "activo" ? "Activo" : "Inactivo"}
                    </span>
                    {testimonio.mostrarEnHome && (
                      <span className="badge badge-home">
                        <i className="fas fa-home"></i> En inicio
                      </span>
                    )}
                  </div>
                </div>

                <div className="testimonio-imagen">
                  {testimonio.imagen ? (
                    <img src={testimonio.imagen} alt={testimonio.nombre} />
                  ) : (
                    <div className="imagen-placeholder">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                </div>

                <blockquote>"{testimonio.contenido}"</blockquote>

                <div className="testimonio-meta">
                  {testimonio.rol && <p><strong>Rol:</strong> {testimonio.rol}</p>}
                  {testimonio.anioInicio && (
                    <p><strong>Voluntario desde:</strong> {testimonio.anioInicio}</p>
                  )}
                  {testimonio.voluntarioId && (
                    <p>
                      <strong>Vinculado a:</strong> {getNombreVoluntario(testimonio.voluntarioId)}
                    </p>
                  )}
                  <p className="fecha-creacion">
                    Creado: {formatearFecha(testimonio.fecha_creacion)}
                  </p>
                </div>

                <div className="testimonio-acciones">
                  <button
                    onClick={() => editarTestimonio(testimonio)}
                    className="btn-editar"
                  >
                    <i className="fas fa-edit"></i> Editar
                  </button>
                  <button
                    onClick={() => eliminarTestimonio(testimonio._id)}
                    className="btn-eliminar"
                  >
                    <i className="fas fa-trash"></i> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {testimonios.length > 0 && (
        <div className="paginacion">
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
      )}
    </div>
  )
}

export default TestimonialsManager