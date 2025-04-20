"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import "@/styles/components/specific-modals-styles.css"

const PhotoModal = ({ isOpen, onClose, currentPhoto }) => {
  const [previewSrc, setPreviewSrc] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) return
    
    setPreviewSrc(null)
    setErrorMessage("")
    setLoading(false)
    document.body.classList.add("modal-open")
    
    const modalElement = document.getElementById("photoModal")
    if (modalElement) {
      modalElement.style.display = "block"
      modalElement.classList.add("show")
    }
    
    return () => {
      document.body.classList.remove("modal-open")
    }
  }, [isOpen])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) validateFile(file)
  }

  const validateFile = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif"]
    
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Formato de archivo no válido. Por favor, sube una imagen JPG, PNG o GIF.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("La imagen es demasiado grande. El tamaño máximo es 5MB.")
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
      setErrorMessage("Por favor, selecciona una imagen")
      window.Swal?.fire({
        title: "Error",
        text: "Por favor, selecciona una imagen",
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
          title: "¡Foto actualizada!",
          text: "Tu foto de perfil ha sido actualizada correctamente",
          icon: "success",
          confirmButtonText: "Continuar",
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
        throw new Error(data.message || "Error al subir la imagen")
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error)
      setErrorMessage(error.message || "Error al subir la imagen. Por favor, inténtalo de nuevo.")
      
      window.Swal?.fire({
        title: "Error",
        text: error.message || "Error al subir la imagen. Por favor, inténtalo de nuevo.",
        icon: "error",
        confirmButtonColor: "#d33",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div id="photoModal" className="photo-modal" style={{ display: "block" }}>
      <div className="photo-modal-content">
        <div className="photo-modal-header">
          <h2>Cambiar foto de perfil</h2>
          <span className="photo-modal-close" onClick={onClose}>
            &times;
          </span>
        </div>
        <div className="photo-upload-container">
          <div className="photo-preview-section">
            <div className="current-photo">
              <h4>Foto actual</h4>
              <img id="current-profile-photo" src={currentPhoto || "/placeholder.svg"} alt="Foto actual" />
            </div>
            <div
              className={`new-photo ${previewSrc ? "" : "empty-preview"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <h4>Nueva foto</h4>
              {previewSrc ? (
                <img id="photo-preview" src={previewSrc} alt="Vista previa" />
              ) : (
                <div className="empty-preview-placeholder">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <span>Arrastra una imagen aquí</span>
                </div>
              )}
              <div className="drag-overlay">
                <i className="fas fa-cloud-arrow-up"></i>
                <span>Suelta la imagen aquí</span>
              </div>
            </div>
          </div>

          <form id="profile-photo-form" onSubmit={handleSubmit}>
            <div className="file-input-container">
              <div className="upload-btn-wrapper">
                <button type="button" className="file-upload-button" onClick={() => fileInputRef.current?.click()}>
                  <i className="fas fa-upload"></i> Seleccionar imagen
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
              <div className="drag-drop-info">
                <p>O arrastra y suelta una imagen aquí</p>
                <p className="file-requirements">Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB</p>
              </div>
            </div>

            {errorMessage && (
              <div id="photo-error" className="error-message">
                {errorMessage}
              </div>
            )}

            <div className="photo-modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>
                <i className="fas fa-times"></i> Cancelar
              </button>
              <button
                type="submit"
                className={`btn-save ${loading ? "loading" : ""}`}
                id="save-photo-btn"
                disabled={!previewSrc || loading}
              >
                {loading ? "" : (
                  <>
                    <i className="fas fa-save"></i> Guardar cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PhotoModal