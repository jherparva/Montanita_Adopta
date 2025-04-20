//components/auth/AuthManager.jsx

"use client"
import { useState, useEffect } from "react"
import LoginModal from "./LoginModal"
import RegisterModal from "./RegisterModal"
import SettingsModal from "./SettingsModal"
import ResetPasswordModal from "./ResetPasswordModal"
import VerifyCodeModal from "./VerifyCodeModal"
import PhotoModal from "../modals/PhotoModal"

const AuthManager = ({ user }) => {
  // Estado para los modales
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
  const [isVerifyCodeOpen, setIsVerifyCodeOpen] = useState(false)
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState("")

  // Estado para el usuario actual
  const [currentUser, setCurrentUser] = useState(user)

  useEffect(() => {
    // Actualizar el estado local cuando cambia el prop user
    setCurrentUser(user)
  }, [user])

  // Efecto para escuchar eventos
  useEffect(() => {
    const handleAuthChanged = async () => {
      try {
        const response = await fetch("/api/auth/check")
        const data = await response.json()

        if (data.isAuthenticated || data.authenticated) {
          setCurrentUser(data.user)
        } else {
          setCurrentUser(null)
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
      }
    }

    const handleOpenLoginModal = () => openLoginModal()
    const handleOpenRegisterModal = () => openRegisterModal()

    // Agregar event listeners
    window.addEventListener("auth-changed", handleAuthChanged)
    document.addEventListener("open-login-modal", handleOpenLoginModal)
    document.addEventListener("open-register-modal", handleOpenRegisterModal)
    window.addEventListener("open-login-modal", handleOpenLoginModal)
    window.addEventListener("open-register-modal", handleOpenRegisterModal)

    // Limpiar los event listeners
    return () => {
      window.removeEventListener("auth-changed", handleAuthChanged)
      document.removeEventListener("open-login-modal", handleOpenLoginModal)
      document.removeEventListener("open-register-modal", handleOpenRegisterModal)
      window.removeEventListener("open-login-modal", handleOpenLoginModal)
      window.removeEventListener("open-register-modal", handleOpenRegisterModal)
    }
  }, [])

  const closeAllModals = () => {
    setIsLoginOpen(false)
    setIsRegisterOpen(false)
    setIsSettingsOpen(false)
    setIsResetPasswordOpen(false)
    setIsVerifyCodeOpen(false)
    setIsPhotoModalOpen(false)
  }

  const openLoginModal = () => {
    closeAllModals()
    setIsLoginOpen(true)
  }

  const openRegisterModal = () => {
    closeAllModals()
    setIsRegisterOpen(true)
  }

  const openSettingsModal = () => {
    closeAllModals()
    setIsSettingsOpen(true)
  }

  const openResetPasswordModal = () => {
    closeAllModals()
    setIsResetPasswordOpen(true)
  }

  const openVerifyCodeModal = (email) => {
    setResetEmail(email)
    closeAllModals()
    setIsVerifyCodeOpen(true)
  }

  const openPhotoModal = () => {
    closeAllModals()
    setIsPhotoModalOpen(true)
  }

  // Función para manejar el cierre de sesión
  const handleLogout = async (e) => {
    e.preventDefault()
    try {
      await fetch("/api/auth/logout", { method: "post" })
      setCurrentUser(null)
      window.dispatchEvent(new Event("auth-changed"))
      window.location.reload()
    } catch (error) {
      console.error("Error durante el cierre de sesión:", error)
    }
  }

  return (
    <>
      {/* Botones de autenticación */}
      <div className="auth-buttons">
        {currentUser ? (
          <>
            <button onClick={openSettingsModal} className="auth-button settings-button">
              <i className="fas fa-cog"></i> Configuración
            </button>
            <button onClick={openPhotoModal} className="auth-button photo-button">
              <i className="fas fa-camera"></i> Cambiar Foto
            </button>
            <button onClick={handleLogout} className="auth-button logout-button">
              <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            <button onClick={openLoginModal} className="auth-button login-button">
              <i className="fas fa-sign-in-alt"></i> Iniciar Sesión
            </button>
            <button onClick={openRegisterModal} className="auth-button register-button">
              <i className="fas fa-user-plus"></i> Registrarse
            </button>
          </>
        )}
      </div>

      {/* Modales */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={closeAllModals}
        openRegisterModal={openRegisterModal}
        openResetPasswordModal={openResetPasswordModal}
      />

      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={closeAllModals} 
        openLoginModal={openLoginModal} 
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={closeAllModals} 
        userData={currentUser} 
      />

      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={closeAllModals}
        openVerifyCodeModal={openVerifyCodeModal}
      />

      <VerifyCodeModal 
        isOpen={isVerifyCodeOpen} 
        onClose={closeAllModals} 
        email={resetEmail} 
      />

      <PhotoModal
        isOpen={isPhotoModalOpen}
        onClose={closeAllModals}
        currentPhoto={currentUser?.profilePhoto || "/placeholder.svg"}
      />
    </>
  )
}

export default AuthManager