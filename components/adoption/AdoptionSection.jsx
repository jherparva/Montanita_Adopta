"use client"
import { useState, useEffect, useCallback, memo } from "react"
import AnimalModal from "./AnimalModal"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

const CarouselItem = memo(({ animal, onOpenModal, onAdopt, t }) => (
  <div className="adoption-carousel-item">
    <img src={animal.image || "/placeholder.svg"} alt={animal.name} />
    <div className="adoption-carousel-caption">
      <h4>{animal.name}</h4>
      <div className="adoption-carousel-buttons">
        <button onClick={() => onOpenModal(animal)}>{t("ADOPTION_VIEW_DETAILS", "adopcion")}</button>
        <button onClick={() => onAdopt(animal.id)}>{t("ADOPTION_ADOPT_BUTTON", "adopcion")}</button>
      </div>
    </div>
  </div>
))

CarouselItem.displayName = 'CarouselItem'

const AnimalCarousel = memo(({ 
  animals, 
  currentSlide, 
  loading, 
  type, 
  onOpenModal, 
  onAdopt, 
  onChangeSlide, 
  onGoToSlide,
  t
}) => {
  if (loading) {
    return (
      <div className="loading-spinner">
        <i className="fas fa-paw fa-spin"></i>
        <p>{type === 'dog' ? t("ADOPTION_LOADING_DOGS", "adopcion") : t("ADOPTION_LOADING_CATS", "adopcion")}</p>
      </div>
    )
  }

  if (animals.length === 0) {
    return <p>{type === 'dog' ? t("ADOPTION_NO_DOGS", "adopcion") : t("ADOPTION_NO_CATS", "adopcion")}</p>
  }

  return (
    <div className="adoption-carousel">
      <div className="adoption-carousel-container">
        {animals.map((animal, index) => (
          <div
            key={animal.id}
            className={`adoption-carousel-item ${index === currentSlide ? 'active' : ''}`}
          >
            <img src={animal.image || "/placeholder.svg"} alt={animal.name} />
            <div className="adoption-carousel-caption">
              <h4>{animal.name}</h4>
              <div className="adoption-carousel-buttons">
                <button onClick={() => onOpenModal(animal)}>{t("ADOPTION_VIEW_DETAILS", "adopcion")}</button>
                <button onClick={() => onAdopt(animal.id)}>{t("ADOPTION_ADOPT_BUTTON", "adopcion")}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        className="adoption-carousel-control prev" 
        onClick={() => onChangeSlide('prev')}
        aria-label={type === 'dog' ? t("ADOPTION_PREV_DOG", "adopcion") : t("ADOPTION_PREV_CAT", "adopcion")}
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      <button 
        className="adoption-carousel-control next" 
        onClick={() => onChangeSlide('next')}
        aria-label={type === 'dog' ? t("ADOPTION_NEXT_DOG", "adopcion") : t("ADOPTION_NEXT_CAT", "adopcion")}
      >
        <i className="fas fa-chevron-right"></i>
      </button>
      
      <div className="adoption-carousel-indicators">
        {animals.map((_, index) => (
          <button
            key={index}
            className={`adoption-carousel-indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => onGoToSlide(index)}
            aria-label={`${type === 'dog' ? t("ANIMALS_TAB_DOGS", "adopcion") : t("ANIMALS_TAB_CATS", "adopcion")} ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  )
})

AnimalCarousel.displayName = 'AnimalCarousel'

const AdoptionSection = () => {
  const router = useRouter()
  const { t } = useLanguage()
  const [dogs, setDogs] = useState([])
  const [cats, setCats] = useState([])
  const [dogsLoading, setDogsLoading] = useState(true)
  const [catsLoading, setCatsLoading] = useState(true)
  const [dogSlide, setDogSlide] = useState(0)
  const [catSlide, setCatSlide] = useState(0)
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const formatAnimalData = useCallback((animals, species) => {
    return animals
      .filter(a => a.species === species)
      .map(animal => ({
        id: animal._id,
        name: animal.name,
        species: animal.species,
        breed: animal.breed,
        age: animal.age,
        size: animal.size,
        sex: animal.sex,
        status: animal.status,
        description: animal.description,
        image: animal.image || "/placeholder.svg",
      }))
  }, [])

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const res = await fetch("/api/animals?status=available&limit=100")
        const data = await res.json()

        if (res.ok && data.success) {
          const formattedDogs = formatAnimalData(data.animals, "dog")
          const formattedCats = formatAnimalData(data.animals, "cat")

          setDogs(formattedDogs)
          setCats(formattedCats)
        }
      } catch (error) {
        console.error("Error al cargar animales:", error)
      } finally {
        setDogsLoading(false)
        setCatsLoading(false)
      }
    }

    fetchAnimals()
  }, [formatAnimalData])

  useEffect(() => {
    if (dogs.length === 0 || cats.length === 0) return;

    const dogInterval = setInterval(() => {
      setDogSlide(prev => (prev + 1) % dogs.length)
    }, 4000)

    const catInterval = setInterval(() => {
      setCatSlide(prev => (prev + 1) % cats.length)
    }, 4500)

    return () => {
      clearInterval(dogInterval)
      clearInterval(catInterval)
    }
  }, [dogs.length, cats.length])

  const handleOpenModal = useCallback((animal) => {
    setSelectedAnimal(animal)
    setShowModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, [])

  const handleAdopt = useCallback((animalId) => {
    router.push(`/formulario-adopcion?id=${animalId}`)
  }, [router])

  const changeDogSlide = useCallback((direction) => {
    if (direction === 'prev') {
      setDogSlide(prev => (prev === 0 ? dogs.length - 1 : prev - 1))
    } else {
      setDogSlide(prev => (prev + 1) % dogs.length)
    }
  }, [dogs.length])

  const changeCatSlide = useCallback((direction) => {
    if (direction === 'prev') {
      setCatSlide(prev => (prev === 0 ? cats.length - 1 : prev - 1))
    } else {
      setCatSlide(prev => (prev + 1) % cats.length)
    }
  }, [cats.length])

  const goToDogSlide = useCallback((index) => {
    setDogSlide(index)
  }, [])

  const goToCatSlide = useCallback((index) => {
    setCatSlide(index)
  }, [])

  return (
    <section className="adoptions-section">
      <div className="container">
        <h2>{t("ADOPTION_TITLE", "adopcion")}</h2>
        <div className="categories-container">
          {/* PERROS */}
          <div className="category">
            <h3>{t("ADOPTION_DOGS_TITLE", "adopcion")}</h3>
            <AnimalCarousel
              animals={dogs}
              currentSlide={dogSlide}
              loading={dogsLoading}
              type="dog"
              onOpenModal={handleOpenModal}
              onAdopt={handleAdopt}
              onChangeSlide={changeDogSlide}
              onGoToSlide={goToDogSlide}
              t={t}
            />
          </div>

          {/* GATOS */}
          <div className="category">
            <h3>{t("ADOPTION_CATS_TITLE", "adopcion")}</h3>
            <AnimalCarousel
              animals={cats}
              currentSlide={catSlide}
              loading={catsLoading}
              type="cat"
              onOpenModal={handleOpenModal}
              onAdopt={handleAdopt}
              onChangeSlide={changeCatSlide}
              onGoToSlide={goToCatSlide}
              t={t}
            />
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      {showModal && selectedAnimal && (
        <AnimalModal animal={selectedAnimal} onClose={handleCloseModal} />
      )}
    </section>
  )
}

export default AdoptionSection