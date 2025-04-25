//components/auth/ProfilePhotoUploader.jsx

"use client"
import { useState } from "react"
import PhotoModal from "../modals/PhotoModal"
import { useLanguage } from "@/contexts/language-context"

const ProfilePhotoUploader = ({ user, onPhotoUpdate }) => {
  const { t } = useLanguage()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPhoto, setCurrentPhoto] = useState(user?.profilePhoto || "/placeholder-user.jpg")

  const openPhotoModal = () => setIsModalOpen(true)
  const closePhotoModal = () => setIsModalOpen(false)

  const handlePhotoUpload = async (file) => {
    if (!file) return

    const formData = new FormData()
    formData.append("photo", file)
    formData.append("userId", user.id)

    try {
      const response = await fetch("/api/user/upload-photo", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentPhoto(data.imageUrl)
        
        // Disparar evento de cambio de autenticación
        window.dispatchEvent(new Event("auth-changed"))
        
        if (onPhotoUpdate) {
          onPhotoUpdate(data.imageUrl)
        }
        return data.imageUrl
      } else {
        throw new Error(data.message || "Error al subir la foto")
      }
    } catch (error) {
      console.error("Error al subir la foto:", error)
      throw error
    }
  }

  return (
    <>
      <div className="profile-photo-container">
        <img
          src={currentPhoto || "/placeholder.svg"}
          alt={`${t("PHOTO_PROFILE", "general")} ${user?.nombre || "usuario"}`}
          className="profile-photo"
          onClick={openPhotoModal}
        />
        <button className="change-photo-button" onClick={openPhotoModal}>
          <i className="fas fa-camera"></i> {t("PHOTO_CHANGE", "general")}
        </button>
      </div>

      {isModalOpen && (
        <PhotoModal 
          onClose={closePhotoModal} 
          currentPhoto={currentPhoto} 
          onPhotoUpload={handlePhotoUpload} 
        />
      )}
    </>
  )
}

export default ProfilePhotoUploader