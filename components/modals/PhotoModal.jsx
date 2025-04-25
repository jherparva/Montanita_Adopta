"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import "@/styles/components/specific-modals-styles.css"

const UserPhotoUploader = ({ isOpen, onClose, currentPhoto }) => {
  const { t } = useLanguage()
  const [previewSrc, setPreviewSrc] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [showEnlarged, setShowEnlarged] = useState(false)
  const [enlargedImage, setEnlargedImage] = useState(null)
  const fileInputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) return
    
    setPreviewSrc(null)
    setErrorMessage("")
    setLoading(false)
    setShowEnlarged(false)
    document.body.classList.add("uploader-modal-open")
    
    const modalElement = document.getElementById("userPhotoUploader")
    if (modalElement) {
      modalElement.style.display = "block"
      modalElement.classList.add("show")
    }
    
    return () => {
      document.body.classList.remove("uploader-modal-open")
    }
  }, [isOpen])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) validateFile(file)
  }

  const validateFile = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif"]
    
    if (!validTypes.includes(file.type)) {
      setErrorMessage(t("PHOTO_MODAL_ERROR_FORMAT", "modales"))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(t("PHOTO_MODAL_ERROR_SIZE", "modales"))
      return
    }

    setErrorMessage("")
    const reader = new FileReader()
    reader.onload = (e) => setPreviewSrc(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.add("drag-over")
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.remove("drag-over")
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.remove("drag-over")

    const file = e.dataTransfer.files?.[0]
    if (file) validateFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const file = fileInputRef.current?.files[0]
    if (!file && !previewSrc) {
      const errorMsg = t("PHOTO_MODAL_ERROR_SELECT", "modales")
      setErrorMessage(errorMsg)
      window.Swal?.fire({
        title: t("CONTACT_ERROR_TITLE", "contact"),
        text: errorMsg,
        icon: "error",
        confirmButtonColor: "#d33",
      })
      return
    }

    setLoading(true)
    setErrorMessage("")

    try {
      const formData = new FormData()
      formData.append("photo", file)

      const userId = localStorage.getItem("userId")
      if (!userId) {
        throw new Error("No se pudo obtener el ID del usuario")
      }
      formData.append("userId", userId)

      const response = await fetch("/api/user/upload-photo", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        window.Swal?.fire({
          title: t("PHOTO_MODAL_SUCCESS_TITLE", "modales"),
          text: t("PHOTO_MODAL_SUCCESS_TEXT", "modales"),
          icon: "success",
          confirmButtonText: t("PHOTO_MODAL_CONTINUE", "modales"),
          confirmButtonColor: "#27b80b",
          timer: 2000,
          timerProgressBar: true,
        })

        const profilePhotoElement = document.getElementById("profile-photo")
        if (profilePhotoElement) {
          profilePhotoElement.src = data.imageUrl
        }

        onClose()
        setTimeout(() => router.refresh(), 500)
      } else {
        throw new Error(data.message || t("PHOTO_MODAL_ERROR_DEFAULT", "modales"))
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error)
      setErrorMessage(error.message || t("PHOTO_MODAL_ERROR_DEFAULT", "modales"))
      
      window.Swal?.fire({
        title: t("CONTACT_ERROR_TITLE", "contact"),
        text: error.message || t("PHOTO_MODAL_ERROR_DEFAULT", "modales"),
        icon: "error",
        confirmButtonColor: "#d33",
      })
    } finally {
      setLoading(false)
    }
  }

  const openEnlargedImage = (src) => {
    setEnlargedImage(src);
    setShowEnlarged(true);
  }

  const closeEnlargedImage = () => {
    setShowEnlarged(false);
  }

  if (!isOpen) return null

  return (
    <div id="userPhotoUploader" className="uploader-modal" style={{ display: "block" }}>
      <div className="uploader-modal-content">
        <div className="uploader-modal-header">
          <h2>{t("PHOTO_MODAL_TITLE", "modales")}</h2>
          <span className="uploader-modal-close" onClick={onClose}>
            &times;
          </span>
        </div>
        <div className="uploader-container">
          <div className="uploader-preview-section">
            <div className="uploader-current-photo">
              <h4>{t("PHOTO_MODAL_CURRENT", "modales")}</h4>
              <div className="uploader-preview-container">
                <img 
                  id="current-profile-photo" 
                  src={currentPhoto || "/placeholder.svg"} 
                  alt={t("PHOTO_MODAL_CURRENT", "modales")} 
                  style={{ objectFit: 'cover', width: '100%', height: '120px' }}
                  onClick={() => currentPhoto && openEnlargedImage(currentPhoto)}
                />
                {currentPhoto && (
                  <div className="uploader-preview-overlay">
                    <button 
                      type="button" 
                      className="uploader-preview-button" 
                      onClick={() => openEnlargedImage(currentPhoto)}
                    >
                      <i className="fas fa-search-plus"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div
              className={`uploader-new-photo ${previewSrc ? "" : "uploader-empty-preview"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <h4>{t("PHOTO_MODAL_NEW", "modales")}</h4>
              {previewSrc ? (
                <div className="uploader-preview-container">
                  <img 
                    id="uploader-photo-preview" 
                    src={previewSrc} 
                    alt={t("PHOTO_MODAL_NEW", "modales")} 
                    style={{ objectFit: 'cover', width: '100%', height: '120px' }}
                    onClick={() => openEnlargedImage(previewSrc)}
                  />
                  <div className="uploader-preview-overlay">
                    <button 
                      type="button" 
                      className="uploader-preview-button" 
                      onClick={() => openEnlargedImage(previewSrc)}
                    >
                      <i className="fas fa-search-plus"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="uploader-empty-preview-placeholder">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <span>{t("PHOTO_MODAL_DRAG_HERE", "modales")}</span>
                </div>
              )}
              <div className="uploader-drag-overlay">
                <i className="fas fa-cloud-arrow-up"></i>
                <span>{t("PHOTO_MODAL_DROP_HERE", "modales")}</span>
              </div>
            </div>
          </div>

          <form id="profile-photo-form" onSubmit={handleSubmit}>
            <div className="uploader-file-input-container">
              <div className="uploader-btn-wrapper">
                <button type="button" className="uploader-file-button" onClick={() => fileInputRef.current?.click()}>
                  <i className="fas fa-upload"></i> {t("PHOTO_MODAL_SELECT_BUTTON", "modales")}
                </button>
                <input
                  type="file"
                  id="profile-photo-upload"
                  name="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </div>
              <div className="uploader-drag-drop-info">
                <p>{t("PHOTO_MODAL_DRAG_DROP_INFO", "modales")}</p>
                <p className="uploader-file-requirements">{t("PHOTO_MODAL_FILE_REQUIREMENTS", "modales")}</p>
              </div>
            </div>

            {errorMessage && (
              <div id="uploader-error" className="uploader-error-message">
                {errorMessage}
              </div>
            )}

            <div className="uploader-modal-footer">
              <button type="button" className="uploader-btn-cancel" onClick={onClose}>
                <i className="fas fa-times"></i> {t("PHOTO_MODAL_CANCEL", "modales")}
              </button>
              <button
                type="submit"
                className={`uploader-btn-save ${loading ? "loading" : ""}`}
                id="save-photo-btn"
                disabled={!previewSrc || loading}
              >
                {loading ? "" : (
                  <>
                    <i className="fas fa-save"></i> {t("PHOTO_MODAL_SAVE", "modales")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal para ver la imagen ampliada */}
      {showEnlarged && (
        <div className="uploader-enlarged-image-modal" onClick={closeEnlargedImage}>
          <div className="uploader-enlarged-image-container" onClick={(e) => e.stopPropagation()}>
            <span className="uploader-enlarged-image-close" onClick={closeEnlargedImage}>
              &times;
            </span>
            <img src={enlargedImage} alt="Imagen ampliada" />
          </div>
        </div>
      )}
    </div>
  )
}

export default UserPhotoUploader