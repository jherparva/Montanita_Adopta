//C:\Users\jhon\Videos\montanita-adopta\components\layout\Menu.jsx

"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import "@/styles/components/menu.css"

const Menu = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [profilePhoto, setProfilePhoto] = useState("/imagenes/perfil/default-profile.webp")
  const router = useRouter()

  // Variable para almacenar el ID del temporizador de inactividad
  const [inactivityTimer, setInactivityTimer] = useState(null)

  // Tiempo de inactividad en milisegundos (30 minutos)
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000

  // Add this at the top of your component, after your state declarations:
  const [lastCheckTime, setLastCheckTime] = useState(0)
  const CHECK_THROTTLE_TIME = 10000 // 10 segundos

  // Then replace your checkAuth function with this:
  const checkAuth = async () => {
    // Evitar verificaciones demasiado frecuentes
    const now = Date.now()
    if (now - lastCheckTime < CHECK_THROTTLE_TIME) {
      return
    }

    setLastCheckTime(now)

    try {
      const response = await fetch("/api/auth/check", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok && data.isAuthenticated) {
        setIsLoggedIn(true)
        setUsername(data.user.nombre || "Usuario")
        setProfilePhoto(data.user.profilePhoto || "/imagenes/perfil/default-profile.webp")

        // Guardar el ID del usuario para usarlo en otras partes
        localStorage.setItem("userId", data.user.id)

        // Reiniciar el temporizador de inactividad
        resetInactivityTimer()
      } else {
        setIsLoggedIn(false)
        localStorage.removeItem("userId")

        // Limpiar el temporizador si no hay sesión
        if (inactivityTimer) {
          clearTimeout(inactivityTimer)
          setInactivityTimer(null)
        }
      }
    } catch (error) {
      console.error("Error al verificar autenticación:", error)
      setIsLoggedIn(false)
    }
  }

  // Función para reiniciar el temporizador de inactividad
  const resetInactivityTimer = () => {
    // Limpiar el temporizador existente si hay uno
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }

    // Establecer un nuevo temporizador
    const timerId = setTimeout(() => {
      // Cerrar sesión por inactividad
      if (isLoggedIn) {
        handleLogout(true)
      }
    }, INACTIVITY_TIMEOUT)

    setInactivityTimer(timerId)
  }

  // Función para manejar eventos de actividad del usuario
  const handleUserActivity = () => {
    if (isLoggedIn) {
      resetInactivityTimer()
    }
  }

  useEffect(() => {
    // Verificar autenticación al cargar el componente
    checkAuth()

    // Configurar un intervalo para verificar periódicamente
    // Aumentamos el intervalo a 60 segundos en lugar de 5 segundos
    const authCheckInterval = setInterval(checkAuth, 60000) // 60 segundos

    // Configurar listeners para eventos de actividad del usuario
    window.addEventListener("mousemove", handleUserActivity)
    window.addEventListener("keydown", handleUserActivity)
    window.addEventListener("click", handleUserActivity)
    window.addEventListener("scroll", handleUserActivity)

    // Configurar listener para detectar cuando el usuario abandona la página
    window.addEventListener("beforeunload", () => {
      localStorage.setItem("lastActive", Date.now().toString())
    })

    // Verificar si el usuario ha estado inactivo desde la última visita
    const lastActive = localStorage.getItem("lastActive")
    if (lastActive) {
      const inactiveTime = Date.now() - Number.parseInt(lastActive)
      if (inactiveTime > INACTIVITY_TIMEOUT) {
        // Si ha estado inactivo por más tiempo que el límite, cerrar sesión
        handleLogout(true)
      }
    }

    // Configurar un listener para eventos de autenticación
    const handleAuthEvent = () => {
      checkAuth()
    }

    // Escuchar eventos personalizados de autenticación
    window.addEventListener("auth-changed", handleAuthEvent)

    // Limpiar al desmontar
    return () => {
      clearInterval(authCheckInterval)
      window.removeEventListener("auth-changed", handleAuthEvent)
      window.removeEventListener("mousemove", handleUserActivity)
      window.removeEventListener("keydown", handleUserActivity)
      window.removeEventListener("click", handleUserActivity)
      window.removeEventListener("scroll", handleUserActivity)

      // Limpiar el temporizador de inactividad
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
      }
    }
  }, [isLoggedIn, inactivityTimer])

  const openModal = (modalId) => {
    window.dispatchEvent(new CustomEvent("openModal", { detail: { modalId } }))
  }

  const handleLogout = async (isAutoLogout = false) => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setIsLoggedIn(false)
        setUsername("")
        setProfilePhoto("/imagenes/perfil/default-profile.webp")
        localStorage.removeItem("userId")

        // Limpiar el temporizador de inactividad
        if (inactivityTimer) {
          clearTimeout(inactivityTimer)
          setInactivityTimer(null)
        }

        // Disparar evento de cambio de autenticación
        window.dispatchEvent(new Event("auth-changed"))

        // Mostrar mensaje de éxito
        if (window.Swal && !isAutoLogout) {
          window.Swal.fire({
            title: "Sesión cerrada",
            text: "Has cerrado sesión correctamente",
            icon: "success",
            confirmButtonText: "Continuar",
            confirmButtonColor: "#27b80b",
            timer: 2000,
            timerProgressBar: true,
          })
        } else if (window.Swal && isAutoLogout) {
          window.Swal.fire({
            title: "Sesión expirada",
            text: "Tu sesión ha expirado por inactividad",
            icon: "info",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#3085d6",
          })
        }

        // Refrescar la página
        router.refresh()
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <>
      <div className="content">
        <nav>
          <input type="checkbox" id="check" />
          <label htmlFor="check" className="checkbtn">
            <i className="fa-solid fa-bars"></i>
          </label>
          <Link href="/" className="enlace">
            <div className="logo-container">
              <img src="/imagenes/logo.webp" alt="Logo Montañita" className="logo" />
              <div className="brand-name">
                <div className="nombre_1">MONTAÑITA</div>
                <div className="huella">
                  <img src="/imagenes/huella de perro.webp" alt="Huella de perro" />
                </div>
                <div className="nombre_2">ADOPTA</div>
              </div>
            </div>
          </Link>
          <ul className="main-menu">
            {/* Selector de idiomas mejorado */}
            <li className="has-submenu language-menu">
              <a href="#" className="menu-link language-selector">
                <i className="fa-solid fa-globe"></i> ES <i className="fa-solid fa-chevron-down"></i>
              </a>
              <ul className="submenu language-submenu">
                <li>
                  <a href="?lang=es" className="submenu-link">
                    <i className="flag-icon flag-icon-es"></i> Español
                  </a>
                </li>
                <li>
                  <a href="?lang=en" className="submenu-link">
                    <i className="flag-icon flag-icon-gb"></i> English
                  </a>
                </li>
                <li>
                  <a href="?lang=fr" className="submenu-link">
                    <i className="flag-icon flag-icon-fr"></i> Français
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <Link href="/" className="menu-link">
                <i className="fa-solid fa-home"></i> INICIO
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="menu-link">
                <i className="fa-solid fa-envelope"></i> CONTACTO
              </Link>
            </li>
            <li className="has-submenu">
              <a href="#" className="menu-link">
                <i className="fa-solid fa-paw"></i> ADOPTA <i className="fa-solid fa-chevron-down"></i>
              </a>
              <ul className="submenu">
                <li>
                  <Link href="/adopcion" className="submenu-link">
                    Adopciones
                  </Link>
                </li>
                <li>
                  <Link href="/historias-exito" className="submenu-link">
                    Historias felices
                  </Link>
                </li>
                <li>
                  <Link href="/donaciones" className="submenu-link">
                    Donaciones
                  </Link>
                </li>
                <li>
                  <Link href="/voluntario" className="submenu-link">
                    Voluntario
                  </Link>
                </li>
              </ul>
            </li>
            {isLoggedIn ? (
              <li id="user-menu" className="has-submenu">
                <a href="#" id="user-name" className="menu-link user-profile-link">
                  <div className="profile-photo-container">
                    <img
                      id="profile-photo"
                      src={profilePhoto || "/imagenes/default-profile.webp"}
                      alt="Foto de perfil"
                    />
                  </div>
                  <span id="username-text">{username}</span>
                  <i className="fa-solid fa-chevron-down"></i>
                </a>
                <ul className="submenu user-submenu">
                  <li>
                    <a href="#" onClick={() => openModal("settingsModal")} className="submenu-link">
                      <i className="fa-solid fa-gear"></i> Configuración
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={() => openModal("photoModal")} className="submenu-link">
                      <i className="fa-solid fa-camera"></i> Cambiar foto
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={() => handleLogout(false)} className="submenu-link">
                      <i className="fa-solid fa-sign-out-alt"></i> Cerrar sesión
                    </a>
                  </li>
                </ul>
              </li>
            ) : (
              <li id="login-menu" className="has-submenu">
                <a href="#" className="menu-link login-link">
                  <i className="fa-solid fa-user"></i> LOGIN <i className="fa-solid fa-chevron-down"></i>
                </a>
                <ul className="submenu login-submenu">
                  <li>
                    <a href="#" onClick={() => openModal("loginModal")} className="submenu-link">
                      <i className="fa-solid fa-sign-in-alt"></i> Iniciar sesión
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={() => openModal("registerModal")} className="submenu-link">
                      <i className="fa-solid fa-user-plus"></i> Registrarse
                    </a>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </>
  )
}

export default Menu

