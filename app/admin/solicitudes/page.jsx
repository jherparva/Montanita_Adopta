"use client"
import { useEffect, useState } from "react"
import SolicitudCard from "@/components/admin/adoptions/SolicitudCard"
import "@/styles/admin/solicitudes.css"
import "@/styles/admin/adoption-contract.css"

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [authChecked, setAuthChecked] = useState(false)

  // Verificar autenticación primero
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authRes = await fetch("/api/admin/auth/check")
        
        if (!authRes.ok) {
          if (authRes.status === 401) {
            setError("No tienes permisos para acceder a esta página. Por favor inicia sesión.")
            setLoading(false)
            return false
          }
          if (authRes.status === 403) {
            setError("No tienes permisos de administrador para acceder a esta página.")
            setLoading(false)
            return false
          }
          throw new Error(`Error ${authRes.status}: ${authRes.statusText}`)
        }
        
        const authData = await authRes.json()
        
        if (!authData.authenticated || !authData.isAdmin) {
          setError("No tienes permisos de administrador para acceder a esta página.")
          setLoading(false)
          return false
        }
        
        return true
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        setError("Error al verificar autenticación")
        setLoading(false)
        return false
      } finally {
        setAuthChecked(true)
      }
    }
    
    checkAuth().then((isAuth) => {
      if (isAuth) {
        fetchSolicitudes()
      }
    })
  }, [])

  const fetchSolicitudes = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/adoptions/pending?page=${page}&search=${search}`, {
        credentials: 'include' // Asegúrate de incluir las cookies en la solicitud
      })

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      setSolicitudes(data.requests || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error("Error al cargar las solicitudes:", error)
      setError(`Error al cargar las solicitudes: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authChecked && !error) {
      fetchSolicitudes()
    }
  }, [page, search, authChecked])

  const actualizarEstado = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/adoptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: 'include' // Asegúrate de incluir las cookies en la solicitud
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || `Error ${res.status}`)
      }

      // Mostrar mensaje de éxito
      alert(
        data.message ||
          (status === "approved" ? "Solicitud aprobada correctamente" : "Solicitud rechazada correctamente"),
      )

      // Actualizar la lista de solicitudes
      fetchSolicitudes()
    } catch (error) {
      console.error(`Error al actualizar estado:`, error)
      alert(`Error: ${error.message}`)
      throw error // Re-lanzar el error para que el componente SolicitudCard pueda manejarlo
    }
  }

  if (!authChecked) {
    return (
      <div className="admin-content">
        <p>Verificando autenticación...</p>
      </div>
    )
  }

  if (error && !loading) {
    return (
      <div className="admin-content">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.href = "/admin"}>Ir a iniciar sesión</button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-content">
      <div className="page-header">
        <h1>Solicitudes de Adopción</h1>
        <p>Gestiona las solicitudes pendientes enviadas por los usuarios.</p>
      </div>

      <div className="filtros-solicitudes">
        <input
          type="text"
          placeholder="Buscar por nombre o email"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1) // Resetear a la primera página al buscar
          }}
        />
        <button onClick={fetchSolicitudes} className="btn-refresh">
          Actualizar
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchSolicitudes}>Reintentar</button>
        </div>
      )}

      {loading ? (
        <p>Cargando solicitudes...</p>
      ) : solicitudes.length === 0 ? (
        <p>No hay solicitudes pendientes.</p>
      ) : (
        <>
          <ul className="solicitudes-list">
            {solicitudes.map((sol) => (
              <SolicitudCard key={sol._id} solicitud={sol} onAction={actualizarEstado} />
            ))}
          </ul>

          <div className="paginacion-solicitudes">
            <button onClick={() => setPage(page - 1)} disabled={page === 1 || loading}>
              ← Anterior
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages || totalPages === 0 || loading}>
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  )
}