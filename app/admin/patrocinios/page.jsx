"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import "@/styles/admin/patrocinios.css"

export default function PatrociniosPage() {
  const [patrocinios, setPatrocinios] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [error, setError] = useState(null)

  const fetchPatrocinios = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page,
        limit: 5,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(typeFilter ? { sponsorshipType: typeFilter } : {}),
      })

      const res = await fetch(`/api/admin/sponsor?${params}`)
      const data = await res.json()

      console.log("Respuesta de la API:", data) // Para depuración

      if (data.success) {
        setPatrocinios(data.sponsors || [])
        setTotalPages(data.pagination?.pages || 1)
      } else {
        setError(data.message || "Error al cargar patrocinios")
        setPatrocinios([])
      }
    } catch (error) {
      console.error("Error al obtener patrocinios:", error)
      setError("Error al cargar patrocinios. Por favor, intente nuevamente.")
      setPatrocinios([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatrocinios()
  }, [page, statusFilter, typeFilter])

  const actualizarEstado = async (id, nuevoEstado) => {
    const notas = prompt(`Notas para el cambio a "${nuevoEstado}" (opcional):`) || ""

    try {
      const res = await fetch("/api/admin/sponsor/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sponsorId: id, status: nuevoEstado, notes: notas }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      // Mostrar mensaje de éxito con SweetAlert2 si está disponible
      if (window.Swal) {
        window.Swal.fire({
          title: "¡Éxito!",
          text: `Estado actualizado a "${nuevoEstado}" correctamente`,
          icon: "success",
          confirmButtonColor: "#4caf50",
        })
      } else {
        alert(`Estado actualizado a "${nuevoEstado}" correctamente`)
      }

      fetchPatrocinios()
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
        alert(`Error al actualizar estado: ${error.message}`)
      }
    }
  }

  const eliminarPatrocinio = async (id) => {
    // Mostrar confirmación con SweetAlert2 si está disponible
    let confirmacion = false
    if (window.Swal) {
      const result = await window.Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f44336",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })
      confirmacion = result.isConfirmed
    } else {
      confirmacion = confirm("¿Estás seguro de eliminar este patrocinio?")
    }

    if (!confirmacion) return

    try {
      const res = await fetch(`/api/admin/sponsor/${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      // Mostrar mensaje de éxito con SweetAlert2 si está disponible
      if (window.Swal) {
        window.Swal.fire({
          title: "¡Eliminado!",
          text: "El patrocinio ha sido eliminado correctamente",
          icon: "success",
          confirmButtonColor: "#4caf50",
        })
      } else {
        alert("Patrocinio eliminado correctamente")
      }

      fetchPatrocinios()
    } catch (error) {
      // Mostrar error con SweetAlert2 si está disponible
      if (window.Swal) {
        window.Swal.fire({
          title: "Error",
          text: error.message || "Error al eliminar patrocinio",
          icon: "error",
          confirmButtonColor: "#f44336",
        })
      } else {
        alert(`Error al eliminar patrocinio: ${error.message}`)
      }
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Activo"
      case "paused":
        return "Pausado"
      case "ended":
        return "Finalizado"
      default:
        return status
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case "monthly":
        return "Mensual"
      case "one-time":
        return "Único"
      case "supplies":
        return "Suministros"
      default:
        return type
    }
  }

  // Función para extraer el ID del animal si es un objeto
  const getAnimalId = (animalId) => {
    if (!animalId) return "";
    // Si es un string, devuélvelo directamente
    if (typeof animalId === 'string') return animalId;
    // Si es un objeto MongoDB (tiene _id)
    if (animalId._id) return animalId._id;
    // Si es un objeto pero tiene toString() (como ObjectId de MongoDB)
    if (typeof animalId.toString === 'function') {
      const stringId = animalId.toString();
      // Evitar que devuelva "[object Object]"
      return stringId === '[object Object]' ? '' : stringId;
    }
    return "";
  }

  return (
    <div className="admin-content">
      <div className="page-header">
        <h1>Gestión de Patrocinios</h1>
        <p>Filtra, administra y elimina patrocinios registrados.</p>
      </div>

      <div className="filtros-patrocinios">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Estado: Todos</option>
          <option value="active">Activos</option>
          <option value="paused">Pausados</option>
          <option value="ended">Finalizados</option>
        </select>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">Tipo: Todos</option>
          <option value="monthly">Mensual</option>
          <option value="one-time">Único</option>
          <option value="supplies">Suministros</option>
        </select>

        <button onClick={fetchPatrocinios} className="refresh-btn">
          <i className="fas fa-sync-alt"></i> Actualizar
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando patrocinios...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={fetchPatrocinios}>Reintentar</button>
        </div>
      ) : patrocinios.length === 0 ? (
        <div className="no-results">
          <i className="fas fa-info-circle"></i>
          <p>
            No se encontraron patrocinios{statusFilter ? ` con estado "${getStatusLabel(statusFilter)}"` : ""}
            {typeFilter ? ` de tipo "${getTypeLabel(typeFilter)}"` : ""}.
          </p>
        </div>
      ) : (
        <>
          <ul className="patrocinios-lista">
            {patrocinios.map((p) => (
              <li key={p._id} className="patrocinio-item">
                <h3>{p.sponsorName}</h3>
                <p>
                  <strong>Email:</strong> {p.sponsorEmail}
                </p>
                <p>
                  <strong>Teléfono:</strong> {p.sponsorPhone}
                </p>
                <p>
                  <strong>Animal:</strong>{" "}
                  {p.animalId ? (
                    <Link
                      href={`/admin/animales/${getAnimalId(p.animalId)}`}
                      className="enlace-animal"
                    >
                      {p.animalName || "Ver animal"}
                    </Link>
                  ) : (
                    "No disponible"
                  )}
                </p>
                <p>
                  <strong>Tipo:</strong> {getTypeLabel(p.sponsorshipType)}
                </p>
                {p.amount && (
                  <p>
                    <strong>Monto:</strong> ${p.amount.toLocaleString()}
                  </p>
                )}
                {p.suppliesDescription && (
                  <p>
                    <strong>Suministros:</strong> {p.suppliesDescription}
                  </p>
                )}
                <p>
                  <strong>Estado:</strong> <span className={`estado ${p.status}`}>{getStatusLabel(p.status)}</span>
                </p>
                {p.notes && (
                  <p>
                    <strong>Notas:</strong> {p.notes}
                  </p>
                )}
                <p>
                  <small>Registrado: {new Date(p.createdAt).toLocaleString()}</small>
                </p>

                <div className="acciones-patrocinio">
                  {["active", "paused", "ended"].map((estado) =>
                    estado !== p.status ? (
                      <button
                        key={estado}
                        onClick={() => actualizarEstado(p._id, estado)}
                        className={`btn-${estado}`}
                      >
                        {estado === "active" ? (
                          <>
                            <i className="fas fa-check"></i> Activar
                          </>
                        ) : estado === "paused" ? (
                          <>
                            <i className="fas fa-pause"></i> Pausar
                          </>
                        ) : (
                          <>
                            <i className="fas fa-stop"></i> Finalizar
                          </>
                        )}
                      </button>
                    ) : null,
                  )}
                  <button onClick={() => eliminarPatrocinio(p._id)} className="btn-eliminar">
                    <i className="fas fa-trash"></i> Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="paginacion-patrocinios">
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
    </div>
  )
}