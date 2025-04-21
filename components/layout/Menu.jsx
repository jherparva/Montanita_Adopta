"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import "@/styles/components/menu.css"

const Menu = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [profilePhoto, setProfilePhoto] = useState("/imagenes/perfil/default-profile.webp")
  const router = useRouter()
  const pathname = usePathname()
  
  // Ref para el checkbox del menú hamburguesa
  const checkRef = useRef(null)
  
  // Estado para controlar qué submenú está activo en móvil
  const [activeSubmenu, setActiveSubmenu] = useState(null)

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

  // Función mejorada para manejar clics en los enlaces del menú con submenús
  const handleSubmenuToggle = (e, menuName) => {
    e.preventDefault();
    e.stopPropagation(); // Evitar que el evento se propague
    // Si el menú ya está activo, lo cerramos
    if (activeSubmenu === menuName) {
      setActiveSubmenu(null);
    } else {
      // Si no está activo, primero cerramos cualquier submenú abierto
      setActiveSubmenu(null);
      
      // Pequeño tiempo de espera para evitar conflictos de renderizado
      setTimeout(() => {
        // Y luego activamos el nuevo
        setActiveSubmenu(menuName);
      }, 10);
    }
  }

  // Función para cerrar el menú al navegar
  const closeMenu = () => {
    if (checkRef.current) {
      checkRef.current.checked = false
    }
    setActiveSubmenu(null)
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

    // Cerrar el menú cuando cambia la ruta
    const handleRouteChange = () => {
      closeMenu()
    }

    // Observar cambios en la ruta
    if (pathname) {
      handleRouteChange()
    }

    // Añade esta función para cerrar submenús al hacer clic fuera
    const handleClickOutside = (event) => {
      // Si se hace clic fuera de un submenú, cerrar todos los submenús
      if (activeSubmenu && !event.target.closest('.has-submenu')) {
        setActiveSubmenu(null);
      }
    };
    // Agregar evento al montar
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);

    // Limpiar al desmontar
    return () => {
      clearInterval(authCheckInterval)
      window.removeEventListener("auth-changed", handleAuthEvent)
      window.removeEventListener("mousemove", handleUserActivity)
      window.removeEventListener("keydown", handleUserActivity)
      window.removeEventListener("click", handleUserActivity)
      window.removeEventListener("scroll", handleUserActivity)
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);

      // Limpiar el temporizador de inactividad
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
      }
    }
  }, [isLoggedIn, inactivityTimer, pathname, activeSubmenu])

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

        // Cerrar el menú
        closeMenu()

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
          <input type="checkbox" id="check" ref={checkRef} />
          <label htmlFor="check" className="checkbtn">
            <i className="fa-solid fa-bars"></i>
          </label>
          <Link href="/" className="enlace" onClick={closeMenu}>
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
            <li className={`has-submenu language-menu ${activeSubmenu === 'language' ? 'active' : ''}`}>
              <a href="#" className="menu-link language-selector" onClick={(e) => handleSubmenuToggle(e, 'language')}>
                <div className="menu-link-content">
                  <i className="fa-solid fa-globe"></i>
                  <span className="menu-text">ES</span>
                </div>
                <i className="fa-solid fa-chevron-down"></i>
              </a>
              <ul className="submenu language-submenu">
                <li>
                  <a href="?lang=es" className="submenu-link" onClick={closeMenu}>
                    <i className="flag-icon flag-icon-es"></i> Español
                  </a>
                </li>
                <li>
                  <a href="?lang=en" className="submenu-link" onClick={closeMenu}>
                    <i className="flag-icon flag-icon-gb"></i> English
                  </a>
                </li>
                <li>
                  <a href="?lang=fr" className="submenu-link" onClick={closeMenu}>
                    <i className="flag-icon flag-icon-fr"></i> Français
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <Link href="/" className="menu-link" onClick={closeMenu}>
                <div className="menu-link-content">
                  <i className="fa-solid fa-home"></i>
                  <span className="menu-text">INICIO</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="menu-link" onClick={closeMenu}>
                <div className="menu-link-content">
                  <i className="fa-solid fa-envelope"></i>
                  <span className="menu-text">CONTACTO</span>
                </div>
              </Link>
            </li>
            <li className={`has-submenu ${activeSubmenu === 'adopta' ? 'active' : ''}`}>
              <a href="#" className="menu-link" onClick={(e) => handleSubmenuToggle(e, 'adopta')}>
                <div className="menu-link-content">
                  <i className="fa-solid fa-paw"></i>
                  <span className="menu-text">ADOPTA</span>
                </div>
                <i className="fa-solid fa-chevron-down"></i>
              </a>
              <ul className="submenu">
                <li>
                  <Link href="/adopcion" className="submenu-link" onClick={closeMenu}>
                    Adopciones
                  </Link>
                </li>
                <li>
                  <Link href="/historias-exito" className="submenu-link" onClick={closeMenu}>
                    Historias felices
                  </Link>
                </li>
                <li>
                  <Link href="/donaciones" className="submenu-link" onClick={closeMenu}>
                    Donaciones
                  </Link>
                </li>
                <li>
                  <Link href="/voluntario" className="submenu-link" onClick={closeMenu}>
                    Voluntario
                  </Link>
                </li>
              </ul>
            </li>
            {isLoggedIn ? (
              <li id="user-menu" className={`has-submenu ${activeSubmenu === 'user' ? 'active' : ''}`}>
                <a href="#" id="user-name" className="menu-link user-profile-link" onClick={(e) => handleSubmenuToggle(e, 'user')}>
                  <div className="menu-link-content">
                    <div className="profile-photo-container">
                      <img
                        id="profile-photo"
                        src={profilePhoto || "/imagenes/default-profile.webp"}
                        alt="Foto de perfil"
                      />
                    </div>
                    <span id="username-text" className="menu-text">{username}</span>
                  </div>
                  <i className="fa-solid fa-chevron-down"></i>
                </a>
                <ul className="submenu user-submenu">
                  <li>
                    <a href="#" onClick={() => {openModal("settingsModal"); closeMenu();}} className="submenu-link">
                      <i className="fa-solid fa-gear"></i> Configuración
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={() => {openModal("photoModal"); closeMenu();}} className="submenu-link">
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
              <li id="login-menu" className={`has-submenu ${activeSubmenu === 'login' ? 'active' : ''}`}>
                <a href="#" className="menu-link login-link" onClick={(e) => handleSubmenuToggle(e, 'login')}>
                  <div className="menu-link-content">
                    <i className="fa-solid fa-user"></i>
                    <span className="menu-text">LOGIN</span>
                  </div>
                  <i className="fa-solid fa-chevron-down"></i>
                </a>
                <ul className="submenu login-submenu">
                  <li>
                    <a href="#" onClick={() => {openModal("loginModal"); closeMenu();}} className="submenu-link">
                      <i className="fa-solid fa-sign-in-alt"></i> Iniciar sesión
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={() => {openModal("registerModal"); closeMenu();}} className="submenu-link">
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