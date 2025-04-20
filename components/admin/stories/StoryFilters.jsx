"use client"
import { useState, useEffect } from "react"

const StoryFilters = ({ initialFilters = {}, onFilterChange }) => {
  const [filters, setFilters] = useState({
    approved: initialFilters?.approved || "all",
    featured: initialFilters?.featured || "all",
    search: initialFilters?.search || "",
  })

  useEffect(() => {
    setFilters({
      approved: initialFilters?.approved || "all",
      featured: initialFilters?.featured || "all",
      search: initialFilters?.search || "",
    })
  }, [initialFilters])

  const handleInputChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onFilterChange(filters)
  }

  const handleReset = () => {
    const resetFilters = {
      approved: "all",
      featured: "all",
      search: "",
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <div className="filters-container">
      <form onSubmit={handleSubmit} className="filters-form">
        <div className="filter-group">
          <label htmlFor="approved">Estado:</label>
          <select id="approved" name="approved" value={filters.approved} onChange={handleInputChange}>
            <option value="all">Todos</option>
            <option value="true">Aprobadas</option>
            <option value="false">No Aprobadas</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="featured">Destacado:</label>
          <select id="featured" name="featured" value={filters.featured} onChange={handleInputChange}>
            <option value="all">Todos</option>
            <option value="featured">Destacadas</option>
            <option value="not-featured">No Destacadas</option>
          </select>
        </div>

        <div className="filter-group search-group">
          <label htmlFor="search">Buscar:</label>
          <input
            type="text"
            id="search"
            name="search"
            placeholder="Título, autor, contenido..."
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

export default StoryFilters