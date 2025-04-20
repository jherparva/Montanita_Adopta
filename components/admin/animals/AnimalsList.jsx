"use client"
import Link from "next/link"

const AnimalsList = ({ animals, loading, currentPage, totalPages, totalAnimals, onPageChange, onDeleteAnimal }) => {
  const getStatusBadge = (status) => {
    const statusMap = {
      available: <span className="status-badge available">Disponible</span>,
      adopted: <span className="status-badge adopted">Adoptado</span>,
      pending: <span className="status-badge pending">En Proceso</span>,
      foster: <span className="status-badge foster">En Acogida</span>
    }
    return statusMap[status] || <span className="status-badge">{status}</span>
  }

  const getAgeLabel = (age) => {
    const ageMap = {
      puppy: "Cachorro",
      kitten: "Gatito",
      adult: "Adulto",
      senior: "Senior"
    }
    return ageMap[age] || age
  }

  const renderPagination = () => {
    const pages = []
    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, startPage + 4)

    pages.push(
      <button
        key="prev"
        className="pagination-btn prev"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <i className="fas fa-chevron-left"></i>
      </button>
    )

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? "active" : ""}`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      )
    }

    pages.push(
      <button
        key="next"
        className="pagination-btn next"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    )

    return pages
  }

  if (loading) {
    return (
      <div className="animals-list-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando animales...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animals-list-container">
      <div className="list-header">
        <p>
          Mostrando {animals.length} de {totalAnimals} animales
        </p>
      </div>

      {animals.length > 0 ? (
        <>
          <table className="data-table animals-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nombre</th>
                <th>Especie</th>
                <th>Raza</th>
                <th>Edad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {animals.map((animal) => (
                <tr key={animal._id}>
                  <td className="animal-image">
                    <img src={animal.image || "/placeholder.svg"} alt={animal.name} />
                  </td>
                  <td>{animal.name}</td>
                  <td>{animal.species === "dog" ? "Perro" : "Gato"}</td>
                  <td>{animal.breed}</td>
                  <td>{getAgeLabel(animal.age)}</td>
                  <td>{getStatusBadge(animal.status)}</td>
                  <td className="actions-cell">
                    <Link href={`/admin/animales/${animal._id}`} className="action-btn edit" title="Editar">
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button className="action-btn delete" title="Eliminar" onClick={() => onDeleteAnimal(animal._id)}>
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">{renderPagination()}</div>
        </>
      ) : (
        <div className="no-data">
          <i className="fas fa-search"></i>
          <p>No se encontraron animales con los filtros seleccionados</p>
        </div>
      )}
    </div>
  )
}

export default AnimalsList