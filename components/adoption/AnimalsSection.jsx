"use client"
import { useState, useEffect, useCallback, useMemo, memo } from "react"
import AnimalModal from "./AnimalModal"
import { useRouter } from "next/navigation"

const AnimalCard = memo(({ animal, onOpenModal, onAdopt }) => {
  const getAgeText = (age) => {
    switch (age) {
      case "puppy": return "Cachorro"
      case "kitten": return "Gatito"
      case "adult": return "Adulto"
      case "senior": return "Senior"
      default: return age
    }
  }

  return (
    <div className="animal-card">
      <div className="animal-image">
        <img 
          src={animal.image || "/placeholder.svg"} 
          alt={animal.name}
          loading="lazy" 
        />
      </div>
      <div className="animal-info">
        <h3>{animal.name}</h3>
        <p>{animal.breed}</p>
        <div className="animal-tags">
          <span className="tag">{animal.species === "dog" ? "Perro" : "Gato"}</span>
          <span className="tag">{getAgeText(animal.age)}</span>
        </div>
        <div className="animal-actions">
          <button className="primary-btn" onClick={() => onOpenModal(animal)}>
            Ver detalles
          </button>
          <button className="secondary-btn" onClick={() => onAdopt(animal.id)}>
            Adoptar
          </button>
        </div>
      </div>
    </div>
  )
})

AnimalCard.displayName = 'AnimalCard'

const TabButtons = memo(({ activeCategory, onCategoryClick }) => {
  const categories = [
    { id: "all", label: "Todos" },
    { id: "dog", label: "Perros" },
    { id: "cat", label: "Gatos" }
  ]
  
  return (
    <div className="animal-tabs">
      {categories.map(category => (
        <button
          key={category.id}
          className={`tab-button ${activeCategory === category.id ? "active" : ""}`}
          onClick={() => onCategoryClick(category.id)}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
})

TabButtons.displayName = 'TabButtons'

const FilterControls = memo(({ ageFilter, sizeFilter, onAgeChange, onSizeChange, onFilterClick }) => {
  return (
    <div className="animal-filters">
      <select value={ageFilter} onChange={onAgeChange}>
        <option value="">Todas las edades</option>
        <option value="puppy">Cachorro</option>
        <option value="kitten">Gatito</option>
        <option value="adult">Adulto</option>
        <option value="senior">Senior</option>
      </select>
      <select value={sizeFilter} onChange={onSizeChange}>
        <option value="">Todos los tamaños</option>
        <option value="small">Pequeño</option>
        <option value="medium">Mediano</option>
        <option value="large">Grande</option>
      </select>
    </div>
  )
})

FilterControls.displayName = 'FilterControls'

const Pagination = memo(({ currentPage, totalPages, onPrevPage, onNextPage }) => {
  return (
    <div className="animals-pagination">
      <button className="pagination-btn" disabled={currentPage === 1} onClick={onPrevPage}>
        <i className="fas fa-chevron-left"></i> Anterior
      </button>
      <span>Página {currentPage} de {totalPages}</span>
      <button className="pagination-btn" disabled={currentPage === totalPages} onClick={onNextPage}>
        <i className="fas fa-chevron-right"></i> Siguiente
      </button>
    </div>
  )
})

Pagination.displayName = 'Pagination'

const AnimalsSection = () => {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState("all")
  const [ageFilter, setAgeFilter] = useState("")
  const [sizeFilter, setSizeFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [animals, setAnimals] = useState([])
  const [filteredAnimals, setFilteredAnimals] = useState([])
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [showModal, setShowModal] = useState(false)
  
  const fetchAnimals = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        status: "available",
        page: 1,
        limit: 100,
      })

      const res = await fetch(`/api/animals?${queryParams}`)
      const data = await res.json()

      if (res.ok && data.success) {
        const formatted = data.animals.map((animal) => ({
          id: animal._id,
          name: animal.name,
          species: animal.species,
          breed: animal.breed,
          age: animal.age,
          size: animal.size,
          description: animal.description,
          image: animal.image || "/placeholder.svg",
        }))
        setAnimals(formatted)
        setFilteredAnimals(formatted)
        setTotalPages(Math.ceil(formatted.length / 8))
      } else {
        console.error("Error al cargar animales:", data.message)
      }
    } catch (error) {
      console.error("Error al obtener animales:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnimals()
  }, [fetchAnimals])

  const applyFilters = useCallback(() => {
    let filtered = [...animals]

    if (activeCategory !== "all") {
      filtered = filtered.filter((a) => a.species === activeCategory)
    }

    if (ageFilter) {
      filtered = filtered.filter((a) => a.age === ageFilter)
    }

    if (sizeFilter) {
      filtered = filtered.filter((a) => a.size === sizeFilter)
    }

    setFilteredAnimals(filtered)
    setTotalPages(Math.ceil(filtered.length / 8))
    setCurrentPage(1)
  }, [animals, activeCategory, ageFilter, sizeFilter])

  useEffect(() => {
    applyFilters()
  }, [activeCategory, ageFilter, sizeFilter, animals, applyFilters])

  const handleCategoryClick = useCallback((category) => {
    setActiveCategory(category)
  }, [])

  const handleAgeFilterChange = useCallback((e) => {
    setAgeFilter(e.target.value)
  }, [])

  const handleSizeFilterChange = useCallback((e) => {
    setSizeFilter(e.target.value)
  }, [])

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1)
    }
  }, [currentPage])

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(p => p + 1)
    }
  }, [currentPage, totalPages])

  const openAnimalModal = useCallback((animal) => {
    setSelectedAnimal(animal)
    setShowModal(true)
  }, [])

  const closeAnimalModal = useCallback(() => {
    setShowModal(false)
  }, [])

  const handleAdopt = useCallback((id) => {
    router.push(`/formulario-adopcion?id=${id}`)
  }, [router])

  // Calculate current animals to display based on pagination
  const currentAnimals = useMemo(() => {
    const startIndex = (currentPage - 1) * 8
    return filteredAnimals.slice(startIndex, startIndex + 8)
  }, [filteredAnimals, currentPage])

  return (
    <section className="animals-section">
      <div className="container">
        <h2>NUESTROS ANIMALES PARA ADOPCIÓN</h2>

        <TabButtons
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
        />

        <FilterControls
          ageFilter={ageFilter}
          sizeFilter={sizeFilter}
          onAgeChange={handleAgeFilterChange}
          onSizeChange={handleSizeFilterChange}
          onFilterClick={applyFilters}
        />

        <div
          className={`animals-container ${activeCategory !== "all" || ageFilter || sizeFilter ? "filtered" : ""}`}
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "30px" }}
        >
          {loading ? (
            <div className="loading-spinner">
              <i className="fas fa-paw fa-spin"></i>
              <p>Cargando animales...</p>
            </div>
          ) : currentAnimals.length > 0 ? (
            currentAnimals.map((animal) => (
              <AnimalCard
                key={animal.id}
                animal={animal}
                onOpenModal={openAnimalModal}
                onAdopt={handleAdopt}
              />
            ))
          ) : (
            <div className="no-results">
              <p>No se encontraron animales con los filtros seleccionados.</p>
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
        />
      </div>

      {showModal && selectedAnimal && (
        <AnimalModal 
          animal={selectedAnimal} 
          onClose={closeAnimalModal} 
        />
      )}
    </section>
  )
}

export default AnimalsSection