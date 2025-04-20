"use client"
import { useEffect, useState, useCallback, memo } from "react"
import { useRouter } from "next/navigation"

const AnimalTag = memo(({ children }) => (
  <span className="tag">{children}</span>
))

AnimalTag.displayName = 'AnimalTag'

const AnimalModal = ({ animal, onClose }) => {
  const router = useRouter()
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
      alert("Debes iniciar sesión para guardar favoritos.")
      return
    }

    // Aquí puedes hacer una solicitud a tu API para guardar como favorito
    alert(`${animal.name} ha sido añadido a tus favoritos.`)
  }, [isAuthenticated, animal.name])

  const getAgeText = (age) => {
    switch (age) {
      case "puppy": return "Cachorro"
      case "kitten": return "Gatito"
      case "adult": return "Adulto"
      case "senior": return "Senior"
      default: return age
    }
  }

  const getSizeText = (size) => {
    switch (size) {
      case "small": return "Pequeño"
      case "medium": return "Mediano"
      case "large": return "Grande"
      default: return size
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "available": return "Disponible"
      case "pending": return "En proceso"
      default: return "Otro"
    }
  }

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
              <AnimalTag>{animal.species === "dog" ? "Perro" : "Gato"}</AnimalTag>
              <AnimalTag>{getAgeText(animal.age)}</AnimalTag>
              <AnimalTag>{getSizeText(animal.size)}</AnimalTag>
              <AnimalTag>{animal.sex === "male" ? "Macho" : "Hembra"}</AnimalTag>
              <AnimalTag>Raza: {animal.breed}</AnimalTag>
              <AnimalTag>Estado: {getStatusText(animal.status)}</AnimalTag>
            </div>
            <p id="modal-animal-description">{animal.description}</p>
            <div className="animal-actions">
              <button id="adopt-button" className="primary-btn" onClick={handleAdopt}>
                <i className="fas fa-paw"></i> Adoptar
              </button>
              <button id="favorite-button" className="secondary-btn" onClick={handleFavorite}>
                <i className="far fa-heart"></i> Guardar como favorito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(AnimalModal)