//C:\Users\jhon\Music\montanita-adopta\components\layout\Menu.jsx

"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import "@/styles/components/menu.css"
import { useLanguage } from "@/contexts/language-context"

const Menu = () => {
  const { language, setLanguage, t } = useLanguage()
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
    e.preventDefault()
    e.stopPropagation() // Evitar propagación del evento

    // Si el menú ya está activo, lo cerramos
    if (activeSubmenu === menuName) {
      setActiveSubmenu(null)
    } else {
      // Si no está activo, lo activamos
      setActiveSubmenu(menuName)
    }
  }

  // Función para cambiar el idioma
  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    closeMenu()
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
    window.addEventListener("touchstart", handleUserActivity) // Añadido para táctil
    window.addEventListener("touchmove", handleUserActivity) // Añadido para táctil

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

    // Limpiar al desmontar
    return () => {
      clearInterval(authCheckInterval)
      window.removeEventListener("auth-changed", handleAuthEvent)
      window.removeEventListener("mousemove", handleUserActivity)
      window.removeEventListener("keydown", handleUserActivity)
      window.removeEventListener("click", handleUserActivity)
      window.removeEventListener("scroll", handleUserActivity)
      window.removeEventListener("touchstart", handleUserActivity)
      window.removeEventListener("touchmove", handleUserActivity)

      // Limpiar el temporizador de inactividad
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
      }
    }
  }, [isLoggedIn, inactivityTimer, pathname])

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
            title: t("SESSION_CLOSED"),
            text: t("SESSION_CLOSED_SUCCESS"),
            icon: "success",
            confirmButtonText: t("SESSION_CONTINUE"),
            confirmButtonColor: "#27b80b",
            timer: 2000,
            timerProgressBar: true,
          })
        } else if (window.Swal && isAutoLogout) {
          window.Swal.fire({
            title: t("SESSION_EXPIRED"),
            text: t("SESSION_EXPIRED_INFO"),
            icon: "info",
            confirmButtonText: t("SESSION_UNDERSTOOD"),
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

  // Función para obtener el texto del idioma actual
  const getLanguageText = () => {
    switch (language) {
      case "en":
        return "EN"
      case "fr":
        return "FR"
      default:
        return "ES"
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
            <li className={`has-submenu language-menu ${activeSubmenu === "language" ? "active" : ""}`}>
              <a href="#" className="menu-link language-selector" onClick={(e) => handleSubmenuToggle(e, "language")}>
                <div className="menu-link-content">
                  <i className="fa-solid fa-globe"></i>
                  <span className="menu-text">{getLanguageText()}</span>
                </div>
                <i className="fa-solid fa-chevron-down"></i>
              </a>
              <ul className="submenu language-submenu">
                <li>
                  <a href="#" className="submenu-link" onClick={() => handleLanguageChange("es")}>
                    <i className="flag-icon flag-icon-es"></i> Español
                  </a>
                </li>
                <li>
                  <a href="#" className="submenu-link" onClick={() => handleLanguageChange("en")}>
                    <i className="flag-icon flag-icon-gb"></i> English
                  </a>
                </li>
                <li>
                  <a href="#" className="submenu-link" onClick={() => handleLanguageChange("fr")}>
                    <i className="flag-icon flag-icon-fr"></i> Français
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <Link href="/" className="menu-link" onClick={closeMenu}>
                <div className="menu-link-content">
                  <i className="fa-solid fa-home"></i>
                  <span className="menu-text">{t("MENU_HOME")}</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="menu-link" onClick={closeMenu}>
                <div className="menu-link-content">
                  <i className="fa-solid fa-envelope"></i>
                  <span className="menu-text">{t("MENU_CONTACT")}</span>
                </div>
              </Link>
            </li>
            <li className={`has-submenu ${activeSubmenu === "adopta" ? "active" : ""}`}>
              <a href="#" className="menu-link" onClick={(e) => handleSubmenuToggle(e, "adopta")}>
                <div className="menu-link-content">
                  <i className="fa-solid fa-paw"></i>
                  <span className="menu-text">{t("MENU_ADOPT")}</span>
                </div>
                <i className="fa-solid fa-chevron-down"></i>
              </a>
              <ul className="submenu">
                <li>
                  <Link href="/adopcion" className="submenu-link" onClick={closeMenu}>
                    {t("MENU_ADOPTIONS")}
                  </Link>
                </li>
                <li>
                  <Link href="/historias-exito" className="submenu-link" onClick={closeMenu}>
                    {t("MENU_SUCCESS_STORIES")}
                  </Link>
                </li>
                <li>
                  <Link href="/donaciones" className="submenu-link" onClick={closeMenu}>
                    {t("MENU_DONATIONS")}
                  </Link>
                </li>
                <li>
                  <Link href="/voluntario" className="submenu-link" onClick={closeMenu}>
                    {t("MENU_VOLUNTEER")}
                  </Link>
                </li>
              </ul>
            </li>
            {isLoggedIn ? (
              <li id="user-menu" className={`has-submenu ${activeSubmenu === "user" ? "active" : ""}`}>
                <a
                  href="#"
                  id="user-name"
                  className="menu-link user-profile-link"
                  onClick={(e) => handleSubmenuToggle(e, "user")}
                >
                  <div className="menu-link-content">
                    <div className="profile-photo-container">
                      <img
                        id="profile-photo"
                        src={profilePhoto || "/imagenes/default-profile.webp"}
                        alt="Foto de perfil"
                      />
                    </div>
                    <span id="username-text" className="menu-text">
                      {username}
                    </span>
                  </div>
                  <i className="fa-solid fa-chevron-down"></i>
                </a>
                <ul className="submenu user-submenu">
                  <li>
                    <a
                      href="#"
                      onClick={() => {
                        openModal("settingsModal")
                        closeMenu()
                      }}
                      className="submenu-link"
                    >
                      <i className="fa-solid fa-gear"></i> {t("MENU_SETTINGS")}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={() => {
                        openModal("photoModal")
                        closeMenu()
                      }}
                      className="submenu-link"
                    >
                      <i className="fa-solid fa-camera"></i> {t("MENU_CHANGE_PHOTO")}
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={() => handleLogout(false)} className="submenu-link">
                      <i className="fa-solid fa-sign-out-alt"></i> {t("MENU_LOGOUT")}
                    </a>
                  </li>
                </ul>
              </li>
            ) : (
              <li id="login-menu" className={`has-submenu ${activeSubmenu === "login" ? "active" : ""}`}>
                <a href="#" className="menu-link login-link" onClick={(e) => handleSubmenuToggle(e, "login")}>
                  <div className="menu-link-content">
                    <i className="fa-solid fa-user"></i>
                    <span className="menu-text">{t("MENU_LOGIN")}</span>
                  </div>
                  <i className="fa-solid fa-chevron-down"></i>
                </a>
                <ul className="submenu login-submenu">
                  <li>
                    <a
                      href="#"
                      onClick={() => {
                        openModal("loginModal")
                        closeMenu()
                      }}
                      className="submenu-link"
                    >
                      <i className="fa-solid fa-sign-in-alt"></i> {t("MENU_LOGIN")}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={() => {
                        openModal("registerModal")
                        closeMenu()
                      }}
                      className="submenu-link"
                    >
                      <i className="fa-solid fa-user-plus"></i> {t("MENU_REGISTER")}
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
