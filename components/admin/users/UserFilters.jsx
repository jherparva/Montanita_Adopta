"use client"
import { useState, useEffect } from "react"

const UserFilters = ({ initialFilters = {}, onFilterChange }) => {
  const [filters, setFilters] = useState({
    role: initialFilters?.role || "all",
    status: initialFilters?.status || "all",
    search: initialFilters?.search || "",
  })

  useEffect(() => {
    setFilters({
      role: initialFilters?.role || "all",
      status: initialFilters?.status || "all",
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
      role: "all",
      status: "all",
      search: "",
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <div className="filters-container">
      <form onSubmit={handleSubmit} className="filters-form">
        <div className="filter-group">
          <label htmlFor="role">Rol:</label>
          <select id="role" name="role" value={filters.role} onChange={handleInputChange}>
            <option value="all">Todos</option>
            <option value="user">Usuarios</option>
            <option value="moderador">Moderadores</option>
            <option value="admin">Administradores</option>
            <option value="voluntario">Voluntarios</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="status">Estado:</label>
          <select id="status" name="status" value={filters.status} onChange={handleInputChange}>
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="blocked">Bloqueados</option>
          </select>
        </div>

        <div className="filter-group search-group">
          <label htmlFor="search">Buscar:</label>
          <input
            type="text"
            id="search"
            name="search"
            placeholder="Nombre, email..."
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

export default UserFilters