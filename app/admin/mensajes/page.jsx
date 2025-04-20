"use client"
import { useEffect, useState } from "react"
import "@/styles/admin/mensajes.css"

export default function MensajesPage() {
  const [mensajes, setMensajes] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [error, setError] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [expandedMessage, setExpandedMessage] = useState(null)
  const [markingAsRead, setMarkingAsRead] = useState(false)
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    isAdmin: false,
    checked: false,
  })

  // Verificar autenticación primero
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Usamos la ruta correcta para verificar autenticación de administrador
        const authRes = await fetch("/api/admin/auth/check")

        if (!authRes.ok) {
          console.error(`Error de autenticación: ${authRes.status} ${authRes.statusText}`)

          // Si hay un error 401, el usuario no está autenticado
          if (authRes.status === 401) {
            setAuthStatus({ isAuthenticated: false, isAdmin: false, checked: true })
            return false
          }

          // Si hay un error 403, el usuario está autenticado pero no es admin
          if (authRes.status === 403) {
            setAuthStatus({ isAuthenticated: true, isAdmin: false, checked: true })
            return false
          }

          throw new Error(`Error ${authRes.status}: ${authRes.statusText}`)
        }

        const authData = await authRes.json()

        // Verificamos autenticación de administrador
        if (!authData.authenticated) {
          setAuthStatus({ isAuthenticated: false, isAdmin: false, checked: true })
          return false
        }

        if (!authData.user || authData.user.role !== "admin") {
          setAuthStatus({ isAuthenticated: true, isAdmin: false, checked: true })
          return false
        }

        // Usuario autenticado y es admin
        setAuthStatus({ isAuthenticated: true, isAdmin: true, checked: true })
        return true
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        setAuthStatus({ isAuthenticated: false, isAdmin: false, checked: true })
        return false
      }
    }

    checkAuth().then((isAuth) => {
      if (isAuth) {
        fetchMensajes()
      }
    })
  }, [])

  // Efecto para manejar redirecciones basadas en el estado de autenticación
  useEffect(() => {
    if (authStatus.checked) {
      if (!authStatus.isAuthenticated) {
        // Si no está autenticado, mostrar mensaje de error en lugar de redirigir
        setError("No tienes permisos para acceder a esta página. Por favor inicia sesión.")
        setLoading(false)
      } else if (!authStatus.isAdmin) {
        // Si está autenticado pero no es admin, mostrar error de permisos
        setError("No tienes permisos de administrador para acceder a esta página.")
        setLoading(false)
      }
    }
  }, [authStatus])

  // Verificar si hay un ID de mensaje resaltado en la URL
  useEffect(() => {
    if (authStatus.isAuthenticated && authStatus.isAdmin && !loading) {
      const urlParams = new URLSearchParams(window.location.search);
      const highlightId = urlParams.get('highlight');
      
      if (highlightId) {
        const message = mensajes.find(msg => msg._id === highlightId);
        if (message) {
          setExpandedMessage(message._id);
          if (!message.read) {
            handleMarkAsRead(message._id);
          }
        }
      }
    }
  }, [loading, mensajes]);

  const fetchMensajes = async () => {
    if (!authStatus.isAuthenticated || !authStatus.isAdmin) return

    setLoading(true)
    setError(null)
    try {
      // Usamos credentials: 'include' para asegurar que las cookies se envíen con la solicitud
      const res = await fetch(`/api/admin/messages/recent?page=${page}&search=${search}`, {
        credentials: 'include'
      })
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()

      // Manejar los datos dependiendo de la estructura que devuelve la API
      if (data.messages) {
        setMensajes(data.messages)
        setTotalPages(data.totalPages || Math.ceil(data.total / 5))
      } else {
        setMensajes([])
        setTotalPages(1)
        setError("No se pudieron cargar los mensajes correctamente")
      }
    } catch (error) {
      console.error("Error al cargar los mensajes:", error)
      setMensajes([])
      setTotalPages(1)
      setError(`Error al cargar los mensajes: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authStatus.isAuthenticated && authStatus.isAdmin) {
      fetchMensajes()
    }
  }, [page, search, authStatus])

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1) // Reiniciar a la primera página cuando cambia la búsqueda
  }

  // Función para mostrar la confirmación de eliminación
  const handleConfirmDelete = (messageId) => {
    setConfirmDelete(messageId)
  }

  // Función para cancelar la eliminación
  const handleCancelDelete = () => {
    setConfirmDelete(null)
  }

  // Función para expandir/colapsar un mensaje
  const toggleExpandMessage = (messageId) => {
    if (expandedMessage === messageId) {
      setExpandedMessage(null)
    } else {
      setExpandedMessage(messageId)
      const message = mensajes.find(msg => msg._id === messageId)
      if (message && !message.read) {
        handleMarkAsRead(messageId)
      }
    }
  }

  // Función para marcar un mensaje como leído
  const handleMarkAsRead = async (messageId) => {
    if (markingAsRead) return

    setMarkingAsRead(true)
    try {
      const res = await fetch(`/api/admin/messages/${messageId}/read`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }

      // Actualizar el estado del mensaje en la lista
      setMensajes(mensajes.map(msg => 
        msg._id === messageId ? { ...msg, read: true } : msg
      ))
      
    } catch (error) {
      console.error("Error al marcar como leído:", error)
    } finally {
      setMarkingAsRead(false)
    }
  }

  // Función para eliminar un mensaje
  const handleDeleteMessage = async (messageId) => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }

      // Actualizar la lista de mensajes después de eliminar
      setMensajes(mensajes.filter(msg => msg._id !== messageId))
      
      // Mostrar un mensaje de éxito temporal
      const successMessage = document.createElement('div')
      successMessage.className = 'success-message'
      successMessage.textContent = 'Mensaje eliminado correctamente'
      document.body.appendChild(successMessage)
      
      setTimeout(() => {
        document.body.removeChild(successMessage)
      }, 3000)
      
    } catch (error) {
      console.error("Error al eliminar el mensaje:", error)
      setError(`Error al eliminar el mensaje: ${error.message}`)
    } finally {
      setDeleteLoading(false)
      setConfirmDelete(null)
    }
  }

  if (!authStatus.checked) {
    return (
      <div className="admin-content">
        <p>Verificando autenticación...</p>
      </div>
    )
  }

  if (!authStatus.isAuthenticated && error) {
    return (
      <div className="admin-content">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => (window.location.href = "/admin")}>Ir a iniciar sesión</button>
        </div>
      </div>
    )
  }

  if (authStatus.isAuthenticated && !authStatus.isAdmin) {
    return (
      <div className="admin-content">
        <div className="error-message">
          <p>{error || "No tienes permisos de administrador para acceder a esta página."}</p>
          <button onClick={() => (window.location.href = "/admin")}>Volver al panel principal</button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-content">
      <div className="page-header">
        <h1>Mensajes de Contacto</h1>
        <p>Visualiza los mensajes enviados a través del formulario de contacto.</p>
      </div>

      <div className="filtros-mensajes">
        <input
          type="text"
          placeholder="Buscar por nombre, email o asunto"
          value={search}
          onChange={handleSearchChange}
        />
        <button onClick={() => fetchMensajes()} className="btn-refresh">
          Actualizar
        </button>
      </div>

      {loading ? (
        <p>Cargando mensajes...</p>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchMensajes}>Reintentar</button>
        </div>
      ) : mensajes.length === 0 ? (
        <p>No se encontraron mensajes.</p>
      ) : (
        <>
          <ul className="mensajes-lista">
            {mensajes.map((msg) => (
              <li key={msg._id} className={`mensaje-item ${expandedMessage === msg._id ? 'expanded' : ''} ${!msg.read ? 'unread-message' : ''}`}>
                <div className="mensaje-header">
                  <strong>{msg.name}</strong> — <small>{msg.email}</small>
                  <span className="mensaje-fecha">{new Date(msg.date).toLocaleString()}</span>
                </div>
                <div className="mensaje-asunto">
                  <strong>Asunto:</strong> {msg.subject}
                </div>
                
                {expandedMessage === msg._id ? (
                  <div className="mensaje-cuerpo-completo">{msg.message}</div>
                ) : (
                  <div className="mensaje-cuerpo-preview">
                    {msg.message.length > 150 
                      ? `${msg.message.substring(0, 150)}...` 
                      : msg.message}
                  </div>
                )}
                
                <div className="mensaje-actions">
                  <div className="mensaje-status">
                    <span className={`status-badge ${msg.read ? "read" : "unread"}`}>
                      {msg.read ? "Leído" : "No leído"}
                    </span>
                    {msg.userId && typeof msg.userId === "object" && (
                      <span className="user-info">Usuario: {msg.userId.nombre || "Sin nombre"}</span>
                    )}
                  </div>
                  
                  <div className="mensaje-control-actions">
                    <button 
                      onClick={() => toggleExpandMessage(msg._id)}
                      className="btn-view"
                    >
                      {expandedMessage === msg._id ? "Ocultar" : "Ver completo"}
                    </button>
                    
                    {confirmDelete === msg._id ? (
                      <div className="confirm-delete">
                        <span>¿Confirmar eliminación?</span>
                        <button 
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="btn-confirm-delete"
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? "Eliminando..." : "Sí, eliminar"}
                        </button>
                        <button 
                          onClick={handleCancelDelete}
                          className="btn-cancel-delete"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleConfirmDelete(msg._id)} 
                        className="btn-delete"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="paginacion-mensajes">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>
              ← Anterior
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages || totalPages === 0}>
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  )
}