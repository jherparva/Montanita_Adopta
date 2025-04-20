"use client"
import { useState, useEffect } from "react"

const AnimalFilters = ({ initialFilters, onFilterChange }) => {
  const [filters, setFilters] = useState({
    status: initialFilters.status || "all",
    species: initialFilters.species || "all",
    search: initialFilters.search || "",
  })

  useEffect(() => {
    setFilters({
      status: initialFilters.status || "all",
      species: initialFilters.species || "all",
      search: initialFilters.search || "",
    })
  }, [initialFilters])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onFilterChange(filters)
  }

  const handleReset = () => {
    const resetFilters = {
      status: "all",
      species: "all",
      search: "",
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <div className="filters-container">
      <form onSubmit={handleSubmit} className="filters-form">
        <div className="filter-group">
          <label htmlFor="status">Estado:</label>
          <select id="status" name="status" value={filters.status} onChange={handleInputChange}>
            <option value="all">Todos</option>
            <option value="available">Disponible</option>
            <option value="adopted">Adoptado</option>
            <option value="pending">En Proceso</option>
            <option value="foster">En Acogida</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="species">Especie:</label>
          <select id="species" name="species" value={filters.species} onChange={handleInputChange}>
            <option value="all">Todas</option>
            <option value="dog">Perros</option>
            <option value="cat">Gatos</option>
          </select>
        </div>

        <div className="filter-group search-group">
          <label htmlFor="search">Buscar:</label>
          <input
            type="text"
            id="search"
            name="search"
            placeholder="Nombre, raza..."
            value={filters.search}
            onChange={handleInputChange}
          />
        </div>

        <div className="filter-buttons">
          <button type="submit" className="filter-btn apply">
            <i className="fas fa-search"></i> Aplicar
          </button>
          <button type="button" className="filter-btn reset" onClick={handleReset}>
            <i className="fas fa-undo"></i> Restablecer
          </button>
        </div>
      </form>
    </div>
  )
}

export default AnimalFilters