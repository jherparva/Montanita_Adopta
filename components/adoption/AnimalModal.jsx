"use client"
import { useEffect, useState, useCallback, memo } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

const AnimalTag = memo(({ children }) => (
  <span className="tag">{children}</span>
))

AnimalTag.displayName = 'AnimalTag'

const AnimalModal = ({ animal, onClose }) => {
  const router = useRouter()
  const { t } = useLanguage()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check")
        const data = await res.json()
        setIsAuthenticated(data.isAuthenticated)
      } catch (error) {
        console.error("Error verificando autenticación:", error)
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [])

  const handleAdopt = useCallback(() => {
    router.push(`/formulario-adopcion?id=${animal.id}`)
  }, [router, animal.id])

  const handleFavorite = useCallback(() => {
    if (!isAuthenticated) {
      alert(t("ANIMAL_MODAL_LOGIN_REQUIRED", "adopcion"))
      return
    }

    // Aquí puedes hacer una solicitud a tu API para guardar como favorito
    alert(`${animal.name} ${t("ANIMAL_MODAL_ADDED_FAVORITE", "adopcion")}`)
  }, [isAuthenticated, animal.name, t])

  const getAgeText = (age) => {
    switch (age) {
      case "puppy": return t("ANIMAL_MODAL_PUPPY", "adopcion")
      case "kitten": return t("ANIMAL_MODAL_KITTEN", "adopcion")
      case "adult": return t("ANIMAL_MODAL_ADULT", "adopcion")
      case "senior": return t("ANIMAL_MODAL_SENIOR", "adopcion")
      default: return age
    }
  }

  const getSizeText = (size) => {
    switch (size) {
      case "small": return t("ANIMAL_MODAL_SMALL", "adopcion")
      case "medium": return t("ANIMAL_MODAL_MEDIUM", "adopcion")
      case "large": return t("ANIMAL_MODAL_LARGE", "adopcion")
      default: return size
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "available": return t("ANIMAL_MODAL_AVAILABLE", "adopcion")
      case "pending": return t("ANIMAL_MODAL_PENDING", "adopcion")
      default: return t("ANIMAL_MODAL_OTHER", "adopcion")
    }
  }

  // Función para compartir en redes sociales - usando tus estilos existentes
  const shareAnimal = useCallback((platform) => {
    // Crear URL base para compartir
    const shareUrl = `${window.location.origin}/animales/${animal.id}`
    const shareText = `¡Conoce a ${animal.name}! Un(a) ${animal.breed} que busca hogar.`
    
    let shareLink = '';
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        break
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        break
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
        break
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400')
    }
  }, [animal.id, animal.name, animal.breed])

  return (
    <div id="animalModal" className="modal" style={{ display: "block" }}>
      <div className="modal-content animal-modal">
        <span className="close" onClick={onClose}>&times;</span>
        <div className="animal-detail-container">
          <div className="animal-image-container">
            <img 
              id="modal-animal-image" 
              src={animal.image || "/placeholder.svg"} 
              alt={animal.name}
              loading="lazy" 
            />
          </div>
          <div className="animal-info-container">
            <h2 id="modal-animal-name">{animal.name}</h2>
            <div className="animal-tags">
              <AnimalTag>{animal.species === "dog" ? t("ANIMAL_MODAL_DOG", "adopcion") : t("ANIMAL_MODAL_CAT", "adopcion")}</AnimalTag>
              <AnimalTag>{getAgeText(animal.age)}</AnimalTag>
              <AnimalTag>{getSizeText(animal.size)}</AnimalTag>
              <AnimalTag>{animal.sex === "male" ? t("ANIMAL_MODAL_MALE", "adopcion") : t("ANIMAL_MODAL_FEMALE", "adopcion")}</AnimalTag>
              <AnimalTag>{t("ANIMAL_MODAL_BREED", "adopcion")} {animal.breed}</AnimalTag>
              <AnimalTag>{t("ANIMAL_MODAL_STATUS", "adopcion")} {getStatusText(animal.status)}</AnimalTag>
            </div>
            <p id="modal-animal-description">{animal.description}</p>
            <div className="animal-actions">
              <button id="adopt-button" className="primary-btn" onClick={handleAdopt}>
                <i className="fas fa-paw"></i> {t("ANIMAL_MODAL_ADOPT", "adopcion")}
              </button>
              <button id="favorite-button" className="secondary-btn" onClick={handleFavorite}>
                <i className="far fa-heart"></i> {t("ANIMAL_MODAL_FAVORITE", "adopcion")}
              </button>
            </div>
            
            {/* Sección de compartir en redes sociales - usando tus clases CSS existentes */}
            <div className="social-share-container">
              <p className="share-title">{t("ANIMAL_MODAL_SHARE_TEXT", "adopcion")} {animal.name} {t("ANIMAL_MODAL_SHARE_PROFILE", "adopcion")}</p>
              <div className="social-buttons">
                <button 
                  className="social-btn facebook" 
                  onClick={() => shareAnimal('facebook')}
                  aria-label="Compartir en Facebook"
                >
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button 
                  className="social-btn twitter" 
                  onClick={() => shareAnimal('twitter')}
                  aria-label="Compartir en Twitter"
                >
                  <i className="fab fa-twitter"></i>
                </button>
                <button 
                  className="social-btn whatsapp" 
                  onClick={() => shareAnimal('whatsapp')}
                  aria-label="Compartir en WhatsApp"
                >
                  <i className="fab fa-whatsapp"></i>
                </button>
                <button 
                  className="social-btn telegram" 
                  onClick={() => shareAnimal('telegram')}
                  aria-label="Compartir en Telegram"
                >
                  <i className="fab fa-telegram-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(AnimalModal)