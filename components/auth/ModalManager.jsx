//components/auth/ModalManager.jsx

"use client"
import { useState, useEffect } from "react"
import LoginModal from "./LoginModal"
import RegisterModal from "./RegisterModal"
import SettingsModal from "./SettingsModal"
import ResetPasswordModal from "./ResetPasswordModal"
import VerifyCodeModal from "./VerifyCodeModal"
import PhotoModal from "../modals/PhotoModal"
import "@/styles/components/auth/modal-manager-styles.css"

const ModalManager = ({ user }) => {
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
    // Actualizar el estado cuando cambia el prop
    setCurrentUser(user)
  }, [user])

  useEffect(() => {
    // Manejador para el evento personalizado de abrir modales
    const handleOpenModal = (event) => {
      const { modalId } = event.detail
      closeAllModals()

      // Abrir el modal correspondiente
      switch (modalId) {
        case "loginModal": setIsLoginOpen(true); break;
        case "registerModal": setIsRegisterOpen(true); break;
        case "settingsModal": setIsSettingsOpen(true); break;
        case "resetPasswordModal": setIsResetPasswordOpen(true); break;
        case "verifyCodeModal": setIsVerifyCodeOpen(true); break;
        case "photoModal": setIsPhotoModalOpen(true); break;
        default: break;
      }
    }

    // Manejadores para eventos específicos
    const handleOpenLoginModal = () => {
      closeAllModals()
      setIsLoginOpen(true)
    }

    const handleOpenRegisterModal = () => {
      closeAllModals()
      setIsRegisterOpen(true)
    }

    // Manejador para eventos de autenticación
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

    // Agregar los event listeners
    window.addEventListener("openModal", handleOpenModal)
    window.addEventListener("auth-changed", handleAuthChanged)
    document.addEventListener("open-login-modal", handleOpenLoginModal)
    document.addEventListener("open-register-modal", handleOpenRegisterModal)
    window.addEventListener("open-login-modal", handleOpenLoginModal)
    window.addEventListener("open-register-modal", handleOpenRegisterModal)

    // Limpiar los event listeners
    return () => {
      window.removeEventListener("openModal", handleOpenModal)
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

  const openResetPasswordModal = () => {
    closeAllModals()
    setIsResetPasswordOpen(true)
  }

  const openVerifyCodeModal = (email) => {
    setResetEmail(email)
    closeAllModals()
    setIsVerifyCodeOpen(true)
  }

  return (
    <>
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

export default ModalManager