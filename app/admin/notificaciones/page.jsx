"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { useRouter } from "next/navigation"
import "@/styles/admin/notifications.css";

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [filter, setFilter] = useState("all") // all, unread, read
  const [sortBy, setSortBy] = useState("date") // date, type
  const [sortOrder, setSortOrder] = useState("desc") // asc, desc
  const router = useRouter()

  // Cargar notificaciones
  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/notifications?full=true")
      if (!response.ok) {
        throw new Error("Error al cargar notificaciones")
      }
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error("Error:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Marcar notificación como leída
  const markAsRead = async (id) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}/read`, {
        method: "POST",
      })

      if (response.ok) {
        // Actualizar estado local
        setNotifications(
          notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
        )
      }
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error)
    }
  }

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/admin/notifications/read-all", {
        method: "POST",
      })

      if (response.ok) {
        // Actualizar estado local
        setNotifications(notifications.map((notif) => ({ ...notif, read: true })))
      }
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error)
    }
  }

  // Eliminar notificación
  const deleteNotification = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta notificación?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Actualizar estado local
        setNotifications(notifications.filter((notif) => notif.id !== id))
      }
    } catch (error) {
      console.error("Error al eliminar notificación:", error)
    }
  }

  // Eliminar seleccionadas
  const deleteSelected = async () => {
    if (selectedItems.length === 0) return
    
    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedItems.length} notificaciones?`)) {
      return
    }

    try {
      const response = await fetch("/api/admin/notifications/batch", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedItems }),
      })

      if (response.ok) {
        // Actualizar estado local
        setNotifications(notifications.filter((notif) => !selectedItems.includes(notif.id)))
        setSelectedItems([])
      }
    } catch (error) {
      console.error("Error al eliminar notificaciones seleccionadas:", error)
    }
  }

  // Gestionar selección
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      const filteredIds = filteredNotifications.map((notif) => notif.id)
      setSelectedItems(filteredIds)
    } else {
      setSelectedItems([])
    }
  }

  const toggleSelect = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  // Navegar a la página relacionada
  const navigateToLink = (link, id) => {
    // Marcar como leída automáticamente
    if (id) {
      markAsRead(id)
    }
    
    // Navegar al enlace
    if (link) {
      router.push(link)
    }
  }

  // Filtrar y ordenar notificaciones
  const getFilteredNotifications = () => {
    let filtered = [...notifications]

    // Aplicar filtro
    if (filter === "unread") {
      filtered = filtered.filter((notif) => !notif.read)
    } else if (filter === "read") {
      filtered = filtered.filter((notif) => notif.read)
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0
      
      if (sortBy === "date") {
        comparison = new Date(a.date) - new Date(b.date)
      } else if (sortBy === "type") {
        comparison = (a.type || "").localeCompare(b.type || "")
      }
      
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter(n => !n.read).length

  // Obtener el nombre del tipo de notificación
  const getNotificationTypeName = (type) => {
    const types = {
      info: "Información",
      success: "Éxito",
      warning: "Advertencia",
      error: "Error",
      adoption: "Adopción",
      message: "Mensaje",
      user: "Usuario",
      animal: "Animal",
      donation: "Donación",
      volunteer: "Voluntario"
    }
    
    return types[type] || "Información"
  }

  return (
    <AdminLayout>
      <div className="admin-page-container">
        <div className="admin-page-header">
          <div className="header-title">
            <h1>Notificaciones</h1>
            {unreadCount > 0 && <span className="header-badge">{unreadCount} sin leer</span>}
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={fetchNotifications}
            >
              <i className="fas fa-sync-alt"></i> Actualizar
            </button>
            
            {unreadCount > 0 && (
              <button 
                className="btn btn-secondary"
                onClick={markAllAsRead}
              >
                <i className="fas fa-check-double"></i> Marcar todas como leídas
              </button>
            )}
          </div>
        </div>

        <div className="admin-filters">
          <div className="filter-group">
            <label>Filtrar:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todas</option>
              <option value="unread">Sin leer</option>
              <option value="read">Leídas</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Ordenar por:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date">Fecha</option>
              <option value="type">Tipo</option>
            </select>
            
            <button 
              className="btn btn-icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              title={sortOrder === "asc" ? "Orden ascendente" : "Orden descendente"}
            >
              <i className={`fas fa-sort-${sortOrder === "asc" ? "up" : "down"}`}></i>
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Cargando notificaciones...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <>
            <div className="notifications-actions">
              <div className="select-all">
                <input 
                  type="checkbox" 
                  id="select-all"
                  checked={selectedItems.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={toggleSelectAll}
                />
                <label htmlFor="select-all">Seleccionar todas</label>
              </div>
              
              {selectedItems.length > 0 && (
                <div className="bulk-actions">
                  <span>{selectedItems.length} seleccionadas</span>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={deleteSelected}
                  >
                    <i className="fas fa-trash"></i> Eliminar
                  </button>
                </div>
              )}
            </div>
            
            <div className="notifications-table-container">
              <table className="notifications-table">
                <thead>
                  <tr>
                    <th className="select-column"></th>
                    <th className="icon-column"></th>
                    <th>Mensaje</th>
                    <th>Tipo</th>
                    <th>Fecha</th>
                    <th className="actions-column">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.map((notification) => (
                    <tr 
                      key={notification.id} 
                      className={notification.read ? "" : "unread-row"}
                    >
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedItems.includes(notification.id)}
                          onChange={() => toggleSelect(notification.id)}
                        />
                      </td>
                      <td>
                        <div className="notification-icon">
                          <i className={notification.icon || "fas fa-info-circle"}></i>
                        </div>
                      </td>
                      <td>
                        <div className="notification-message" onClick={() => navigateToLink(notification.link, notification.id)}>
                          {notification.message}
                        </div>
                      </td>
                      <td>{getNotificationTypeName(notification.type)}</td>
                      <td>{new Date(notification.date).toLocaleString()}</td>
                      <td>
                        <div className="table-actions">
                          {!notification.read && (
                            <button 
                              className="btn btn-icon btn-sm"
                              onClick={() => markAsRead(notification.id)}
                              title="Marcar como leída"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                          
                          {notification.link && (
                            <button 
                              className="btn btn-icon btn-sm"
                              onClick={() => navigateToLink(notification.link)}
                              title="Ir al enlace"
                            >
                              <i className="fas fa-external-link-alt"></i>
                            </button>
                          )}
                          
                          <button 
                            className="btn btn-icon btn-sm btn-danger"
                            onClick={() => deleteNotification(notification.id)}
                            title="Eliminar"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <i className="fas fa-bell-slash"></i>
            <p>No hay notificaciones{filter !== "all" ? " que coincidan con el filtro actual" : ""}</p>
            {filter !== "all" && (
              <button 
                className="btn btn-outline"
                onClick={() => setFilter("all")}
              >
                Ver todas las notificaciones
              </button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}