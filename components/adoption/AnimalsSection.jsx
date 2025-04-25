"use client"
import { useState, useEffect, useCallback, useMemo, memo } from "react"
import AnimalModal from "./AnimalModal"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

const AnimalCard = memo(({ animal, onOpenModal, onAdopt, t }) => {
  const getAgeText = (age) => {
    switch (age) {
      case "puppy": return t("ANIMAL_MODAL_PUPPY", "adopcion")
      case "kitten": return t("ANIMAL_MODAL_KITTEN", "adopcion")
      case "adult": return t("ANIMAL_MODAL_ADULT", "adopcion")
      case "senior": return t("ANIMAL_MODAL_SENIOR", "adopcion")
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
          <span className="tag">{animal.species === "dog" ? t("ANIMAL_MODAL_DOG", "adopcion") : t("ANIMAL_MODAL_CAT", "adopcion")}</span>
          <span className="tag">{getAgeText(animal.age)}</span>
        </div>
        <div className="animal-actions">
          <button className="primary-btn" onClick={() => onOpenModal(animal)}>
            {t("ADOPTION_VIEW_DETAILS", "adopcion")}
          </button>
          <button className="secondary-btn" onClick={() => onAdopt(animal.id)}>
            {t("ADOPTION_ADOPT_BUTTON", "adopcion")}
          </button>
        </div>
      </div>
    </div>
  )
})

AnimalCard.displayName = 'AnimalCard'

const TabButtons = memo(({ activeCategory, onCategoryClick, t }) => {
  const categories = [
    { id: "all", label: t("ANIMALS_TAB_ALL", "adopcion") },
    { id: "dog", label: t("ANIMALS_TAB_DOGS", "adopcion") },
    { id: "cat", label: t("ANIMALS_TAB_CATS", "adopcion") }
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

const FilterControls = memo(({ ageFilter, sizeFilter, onAgeChange, onSizeChange, t }) => {
  return (
    <div className="animal-filters">
      <select value={ageFilter} onChange={onAgeChange}>
        <option value="">{t("ANIMALS_FILTER_ALL_AGES", "adopcion")}</option>
        <option value="puppy">{t("ANIMALS_FILTER_PUPPY", "adopcion")}</option>
        <option value="kitten">{t("ANIMALS_FILTER_KITTEN", "adopcion")}</option>
        <option value="adult">{t("ANIMALS_FILTER_ADULT", "adopcion")}</option>
        <option value="senior">{t("ANIMALS_FILTER_SENIOR", "adopcion")}</option>
      </select>
      <select value={sizeFilter} onChange={onSizeChange}>
        <option value="">{t("ANIMALS_FILTER_ALL_SIZES", "adopcion")}</option>
        <option value="small">{t("ANIMALS_FILTER_SMALL", "adopcion")}</option>
        <option value="medium">{t("ANIMALS_FILTER_MEDIUM", "adopcion")}</option>
        <option value="large">{t("ANIMALS_FILTER_LARGE", "adopcion")}</option>
      </select>
    </div>
  )
})

FilterControls.displayName = 'FilterControls'

const Pagination = memo(({ currentPage, totalPages, onPrevPage, onNextPage, t }) => {
  return (
    <div className="animals-pagination">
      <button className="pagination-btn" disabled={currentPage === 1} onClick={onPrevPage}>
        <i className="fas fa-chevron-left"></i> {t("ANIMALS_PAGINATION_PREV", "adopcion")}
      </button>
      <span>{t("ANIMALS_PAGINATION_PAGE", "adopcion")} {currentPage} {t("ANIMALS_PAGINATION_OF", "adopcion")} {totalPages}</span>
      <button className="pagination-btn" disabled={currentPage === totalPages} onClick={onNextPage}>
        {t("ANIMALS_PAGINATION_NEXT", "adopcion")} <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  )
})

Pagination.displayName = 'Pagination'

const AnimalsSection = () => {
  const router = useRouter()
  const { t } = useLanguage()
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
        <h2>{t("ANIMALS_SECTION_TITLE", "adopcion")}</h2>

        <TabButtons
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
          t={t}
        />

        <FilterControls
          ageFilter={ageFilter}
          sizeFilter={sizeFilter}
          onAgeChange={handleAgeFilterChange}
          onSizeChange={handleSizeFilterChange}
          t={t}
        />

        <div
          className={`animals-container ${activeCategory !== "all" || ageFilter || sizeFilter ? "filtered" : ""}`}
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "30px" }}
        >
          {loading ? (
            <div className="loading-spinner">
              <i className="fas fa-paw fa-spin"></i>
              <p>{t("ANIMALS_LOADING", "adopcion")}</p>
            </div>
          ) : currentAnimals.length > 0 ? (
            currentAnimals.map((animal) => (
              <AnimalCard
                key={animal.id}
                animal={animal}
                onOpenModal={openAnimalModal}
                onAdopt={handleAdopt}
                t={t}
              />
            ))
          ) : (
            <div className="no-results">
              <p>{t("ANIMALS_NO_RESULTS", "adopcion")}</p>
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          t={t}
        />
      </div>

      {showModal && selectedAnimal && (
        <AnimalModal 
          animal={selectedAnimal} 
          onClose={closeAnimalModal}
          t={t}
        />
      )}
    </section>
  )
}

export default AnimalsSection