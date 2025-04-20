"use client"
import { useEffect, useState } from "react"
import "@/styles/admin/voluntarios.css"
import ActiveVolunteers from "@/components/admin/voluntario/ActiveVolunteers"
import TestimonialsManager from "@/components/admin/voluntario/TestimonialsManager"

export default function VoluntariosPage() {
  const [voluntarios, setVoluntarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [error, setError] = useState(null)
  const [voluntarioDetalle, setVoluntarioDetalle] = useState(null)
  const [mostrarDetalle, setMostrarDetalle] = useState(false)
  const [tabActiva, setTabActiva] = useState("solicitudes") // Estado para las pestañas

  const fetchVoluntarios = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page,
        limit: 5,
        ...(statusFilter ? { estado: statusFilter } : {}),
      })

      const res = await fetch(`/api/admin/volunteer?${params}`)
      const data = await res.json()

      console.log("Respuesta de la API:", data) // Para depuración

      if (data.success) {
        setVoluntarios(data.volunteers || [])
        setTotalPages(data.pagination?.pages || 1)
      } else {
        setError(data.message || "Error al cargar voluntarios")
        setVoluntarios([])
      }
    } catch (error) {
      console.error("Error al cargar voluntarios:", error)
      setError("Error al cargar voluntarios. Por favor, intente nuevamente.")
      setVoluntarios([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tabActiva === "solicitudes") {
      fetchVoluntarios()
    }
  }, [page, statusFilter, tabActiva])

  const actualizarEstado = async (id, status) => {
    const comentarios = prompt(`Comentarios para el estado "${status}" (opcional):`) || ""

    try {
      const res = await fetch("/api/admin/volunteer/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId: id, status, comentarios }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      // Mostrar mensaje de éxito con SweetAlert2 si está disponible
      if (window.Swal) {
        window.Swal.fire({
          title: "¡Éxito!",
          text: `Estado actualizado a "${status}" correctamente`,
          icon: "success",
          confirmButtonColor: "#4caf50",
        })
      } else {
        alert(`Estado actualizado a "${status}" correctamente`)
      }

      fetchVoluntarios()
    } catch (error) {
      // Mostrar error con SweetAlert2 si está disponible
      if (window.Swal) {
        window.Swal.fire({
          title: "Error",
          text: error.message || "Error al actualizar estado",
          icon: "error",
          confirmButtonColor: "#f44336",
        })
      } else {
        alert(`Error: ${error.message}`)
      }
    }
  }

  const eliminarVoluntario = async (id) => {
    // Confirmar antes de eliminar
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar esta solicitud de voluntario? Esta acción no se puede deshacer.")
    if (!confirmar) return

    try {
      const res = await fetch("/api/admin/volunteer/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId: id }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      // Mostrar mensaje de éxito
      if (window.Swal) {
        window.Swal.fire({
          title: "¡Eliminado!",
          text: "La solicitud de voluntario ha sido eliminada correctamente",
          icon: "success",
          confirmButtonColor: "#4caf50",
        })
      } else {
        alert("La solicitud de voluntario ha sido eliminada correctamente")
      }

      // Actualizar la lista
      fetchVoluntarios()
    } catch (error) {
      if (window.Swal) {
        window.Swal.fire({
          title: "Error",
          text: error.message || "Error al eliminar la solicitud",
          icon: "error",
          confirmButtonColor: "#f44336",
        })
      } else {
        alert(`Error: ${error.message}`)
      }
    }
  }

  const asignarRolVoluntario = async (id, asignar = true) => {
    try {
      const res = await fetch("/api/admin/volunteer/role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId: id, asignarRol: asignar }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      // Mostrar mensaje de éxito
      if (window.Swal) {
        window.Swal.fire({
          title: "¡Éxito!",
          text: asignar 
            ? "Se ha asignado el rol de voluntario correctamente" 
            : "Se ha quitado el rol de voluntario correctamente",
          icon: "success",
          confirmButtonColor: "#4caf50",
        })
      } else {
        alert(asignar 
          ? "Se ha asignado el rol de voluntario correctamente" 
          : "Se ha quitado el rol de voluntario correctamente")
      }

      // Actualizar la lista
      fetchVoluntarios()
      
      // Si estamos viendo el detalle, actualizarlo también
      if (mostrarDetalle && voluntarioDetalle?._id === id) {
        const voluntarioActualizado = {...voluntarioDetalle, es_voluntario: asignar}
        setVoluntarioDetalle(voluntarioActualizado)
      }
    } catch (error) {
      if (window.Swal) {
        window.Swal.fire({
          title: "Error",
          text: error.message || "Error al actualizar el rol",
          icon: "error",
          confirmButtonColor: "#f44336",
        })
      } else {
        alert(`Error: ${error.message}`)
      }
    }
  }

  const verDetalleVoluntario = (voluntario) => {
    setVoluntarioDetalle(voluntario)
    setMostrarDetalle(true)
  }

  const cerrarDetalle = () => {
    setMostrarDetalle(false)
    setVoluntarioDetalle(null)
  }

  return (
    <div className="admin-content">
      <div className="page-header">
        <h1>Gestión de Voluntariado</h1>
        <p>Administra solicitudes, voluntarios activos y testimonios.</p>
      </div>

      {/* Pestañas de navegación - Añadida nueva pestaña "Testimonios" */}
      <div className="tabs-navigation">
        <button 
          className={`tab-button ${tabActiva === "solicitudes" ? "active" : ""}`}
          onClick={() => setTabActiva("solicitudes")}
        >
          <i className="fas fa-clipboard-list"></i> Solicitudes
        </button>
        <button 
          className={`tab-button ${tabActiva === "activos" ? "active" : ""}`}
          onClick={() => setTabActiva("activos")}
        >
          <i className="fas fa-users"></i> Voluntarios Activos
        </button>
        <button 
          className={`tab-button ${tabActiva === "testimonios" ? "active" : ""}`}
          onClick={() => setTabActiva("testimonios")}
        >
          <i className="fas fa-quote-right"></i> Testimonios
        </button>
      </div>

      {/* Contenido de las pestañas - Añadido case para "testimonios" */}
      {tabActiva === "solicitudes" ? (
        <>
          <div className="filtros-voluntarios">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobado">Aprobados</option>
              <option value="rechazado">Rechazados</option>
            </select>
            <button onClick={fetchVoluntarios} className="refresh-btn">
              <i className="fas fa-sync-alt"></i> Actualizar
            </button>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Cargando solicitudes...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              <p>{error}</p>
              <button onClick={fetchVoluntarios}>Reintentar</button>
            </div>
          ) : voluntarios.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-info-circle"></i>
              <p>No se encontraron solicitudes{statusFilter ? ` con estado "${statusFilter}"` : ""}.</p>
            </div>
          ) : (
            <>
              <ul className="voluntarios-lista">
                {voluntarios.map((v) => (
                  <li key={v._id} className="voluntario-item">
                    <h3>{v.nombre}</h3>
                    <p>
                      <strong>Email:</strong> {v.email}
                    </p>
                    <p>
                      <strong>Teléfono:</strong> {v.telefono}
                    </p>
                    <p>
                      <strong>Disponibilidad:</strong> {v.disponibilidad}
                    </p>
                    <p>
                      <strong>Motivación:</strong> {v.motivacion}
                    </p>
                    {v.areas_interes && v.areas_interes.length > 0 && (
                      <p>
                        <strong>Áreas de interés:</strong> {v.areas_interes.join(", ")}
                      </p>
                    )}
                    {v.comentarios && (
                      <p>
                        <strong>Comentarios:</strong> {v.comentarios}
                      </p>
                    )}
                    <p>
                      <strong>Estado:</strong> <span className={`estado ${v.estado}`}>{v.estado}</span>
                    </p>
                    {v.es_voluntario && (
                      <p>
                        <strong>Rol:</strong> <span className="rol-voluntario">Voluntario activo</span>
                      </p>
                    )}
                    <p>
                      <small>Fecha de solicitud: {new Date(v.fecha_solicitud).toLocaleDateString()}</small>
                    </p>

                    <div className="acciones-voluntario">
                      {v.estado === "pendiente" && (
                        <>
                          <button onClick={() => actualizarEstado(v._id, "aprobado")} className="btn-aprobar">
                            <i className="fas fa-check"></i> Aprobar
                          </button>
                          <button onClick={() => actualizarEstado(v._id, "rechazado")} className="btn-rechazar">
                            <i className="fas fa-times"></i> Rechazar
                          </button>
                        </>
                      )}
                      <button onClick={() => verDetalleVoluntario(v)} className="btn-detalle">
                        <i className="fas fa-eye"></i> Ver detalle
                      </button>
                      <button onClick={() => eliminarVoluntario(v._id)} className="btn-eliminar">
                        <i className="fas fa-trash"></i> Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

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

          {/* Modal de detalle de voluntario */}
          {mostrarDetalle && voluntarioDetalle && (
            <div className="modal-backdrop">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Detalle de Voluntario</h2>
                  <button className="btn-cerrar" onClick={cerrarDetalle}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="voluntario-detalle">
                    <h3>{voluntarioDetalle.nombre}</h3>
                    
                    <div className="detalle-seccion">
                      <h4>Información de contacto</h4>
                      <p><strong>Email:</strong> {voluntarioDetalle.email}</p>
                      <p><strong>Teléfono:</strong> {voluntarioDetalle.telefono}</p>
                    </div>
                    
                    <div className="detalle-seccion">
                      <h4>Información de voluntariado</h4>
                      <p><strong>Disponibilidad:</strong> {voluntarioDetalle.disponibilidad}</p>
                      <p><strong>Motivación:</strong> {voluntarioDetalle.motivacion}</p>
                      {voluntarioDetalle.areas_interes && voluntarioDetalle.areas_interes.length > 0 && (
                        <p><strong>Áreas de interés:</strong> {voluntarioDetalle.areas_interes.join(", ")}</p>
                      )}
                      {voluntarioDetalle.experiencia && (
                        <p><strong>Experiencia previa:</strong> {voluntarioDetalle.experiencia}</p>
                      )}
                    </div>
                    
                    <div className="detalle-seccion">
                      <h4>Estado y comentarios</h4>
                      <p>
                        <strong>Estado actual:</strong> 
                        <span className={`estado ${voluntarioDetalle.estado}`}>{voluntarioDetalle.estado}</span>
                      </p>
                      {voluntarioDetalle.comentarios && (
                        <p><strong>Comentarios administrativos:</strong> {voluntarioDetalle.comentarios}</p>
                      )}
                      <p><strong>Fecha de solicitud:</strong> {new Date(voluntarioDetalle.fecha_solicitud).toLocaleDateString()}</p>
                      {voluntarioDetalle.fecha_actualizacion && (
                        <p><strong>Última actualización:</strong> {new Date(voluntarioDetalle.fecha_actualizacion).toLocaleDateString()}</p>
                      )}
                    </div>
                    
                    <div className="detalle-seccion">
                      <h4>Gestión de rol</h4>
                      <p>
                        <strong>Rol de voluntario:</strong> 
                        {voluntarioDetalle.es_voluntario ? 
                          <span className="rol-voluntario">Voluntario activo</span> : 
                          <span className="rol-no-voluntario">Sin rol de voluntario</span>
                        }
                      </p>
                      
                      <div className="acciones-rol">
                        {!voluntarioDetalle.es_voluntario ? (
                          <button 
                            onClick={() => asignarRolVoluntario(voluntarioDetalle._id, true)}
                            className="btn-asignar-rol"
                            disabled={voluntarioDetalle.estado !== "aprobado"}
                          >
                            <i className="fas fa-user-plus"></i> Asignar rol de voluntario
                          </button>
                        ) : (
                          <button 
                            onClick={() => asignarRolVoluntario(voluntarioDetalle._id, false)}
                            className="btn-quitar-rol"
                          >
                            <i className="fas fa-user-minus"></i> Quitar rol de voluntario
                          </button>
                        )}
                      </div>
                      
                      {voluntarioDetalle.estado !== "aprobado" && !voluntarioDetalle.es_voluntario && (
                        <p className="nota-rol">
                          <i className="fas fa-info-circle"></i> 
                          Para asignar el rol de voluntario, primero debe aprobar la solicitud.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-cerrar-modal" onClick={cerrarDetalle}>Cerrar</button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : tabActiva === "activos" ? (
        <ActiveVolunteers />
      ) : (
        // Nueva pestaña de "Testimonios" que muestra el componente TestimonialsManager
        <TestimonialsManager />
      )}
    </div>
  )
}