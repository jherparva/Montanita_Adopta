"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import styles from "@/styles/admin/Admin_Dashboard.module.css"

const AdminHeader = ({ toggleSidebar, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const userMenuRef = useRef(null)
  const notificationsRef = useRef(null)
  const router = useRouter()

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, {
        method: "POST",
      })
      setNotifications(notifications.map((notif) => 
        notif.id === id ? { ...notif, read: true } : notif
      ))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/admin/notifications/read-all", {
        method: "POST",
      })
      
      if (response.ok) {
        setNotifications(notifications.map(notif => ({ ...notif, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Error al marcar todas las notificaciones como leídas:", error)
    }
  }

  const goToProfile = () => {
    setShowUserMenu(false)
    router.push("/admin/perfil")
  }

  const goToSettings = () => {
    setShowUserMenu(false)
    router.push("/admin/configuracion")
  }

  const refreshNotifications = (e) => {
    e.stopPropagation()
    fetchNotifications()
  }

  return (
    <header className={styles.adminHeader}>
      <div className={styles.headerLeft}>
        <button className={styles.sidebarToggle} onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <div className={styles.headerSearch}>
          <input type="text" placeholder="Buscar..." />
          <button>
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.notificationsContainer} ref={notificationsRef}>
          <button className={styles.notificationBtn} onClick={() => setShowNotifications(!showNotifications)}>
            <i className="fas fa-bell"></i>
            {unreadCount > 0 && <span className={styles.notificationCount}>{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className={`${styles.userDropdown} ${styles.notificationsDropdown}`}>
              <div className={styles.notificationsHeader}>
                <h3>Notificaciones</h3>
                <div className={styles.notificationsActions}>
                  <button className={styles.refreshNotifications} onClick={refreshNotifications}>
                    <i className="fas fa-sync-alt"></i>
                  </button>
                  {unreadCount > 0 && (
                    <button className={styles.markAllRead} onClick={markAllAsRead}>
                      Marcar todas como leídas
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.notificationsList}>
                {loading ? (
                  <p className={styles.notificationsLoading}>
                    <i className="fas fa-spinner fa-spin"></i> Cargando...
                  </p>
                ) : notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`${styles.notificationItem} ${notification.read ? "" : styles.unread}`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id)
                        }
                        if (notification.link) {
                          router.push(notification.link)
                        }
                        setShowNotifications(false)
                      }}
                    >
                      <div className={styles.notificationIcon}>
                        <i className={notification.icon || "fas fa-info-circle"}></i>
                      </div>
                      <div className={styles.notificationContent}>
                        <p>{notification.message}</p>
                        <span className={styles.notificationTime}>
                          {new Date(notification.date).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.noNotifications}>No hay notificaciones</p>
                )}
              </div>

              <div className={styles.notificationsFooter}>
                <Link href="/admin/notificaciones">Ver todas</Link>
              </div>
            </div>
          )}
        </div>

        <div className={styles.userMenuContainer} ref={userMenuRef}>
          <button className={styles.userMenuBtn} onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className={styles.userAvatar}>
              <i className="fas fa-user"></i>
            </div>
            <span className={styles.userName}>Administrador</span>
            <i className="fas fa-chevron-down"></i>
          </button>

          {showUserMenu && (
            <div className={styles.userDropdown}>
              <button className={styles.dropdownItem} onClick={goToProfile}>
                <i className="fas fa-user-circle"></i>
                Mi Perfil
              </button>
              <button className={styles.dropdownItem} onClick={goToSettings}>
                <i className="fas fa-cog"></i>
                Configuración
              </button>
              <div className={styles.dropdownDivider}></div>
              <button className={styles.dropdownItem} onClick={onLogout}>
                <i className="fas fa-sign-out-alt"></i>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminHeader