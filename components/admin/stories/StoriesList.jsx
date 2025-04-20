"use client"
import Link from "next/link"

const StoriesList = ({
  stories,
  loading,
  currentPage,
  totalPages,
  totalStories,
  onPageChange,
  onDeleteStory,
  onApproveStory,
  onFeatureStory,
  onTestimonyStory,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    try {
      return new Date(dateString).toLocaleDateString('es-ES', options)
    } catch (e) {
      console.error("Error al formatear fecha:", e);
      return dateString;
    }
  }

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length <= maxLength ? text : `${text.substring(0, maxLength)}...`
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

  return (
    <div className="stories-list-container">
      <div className="list-header">
        <p>
          Mostrando {stories?.length || 0} de {totalStories || 0} historias
        </p>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando historias...</p>
        </div>
      ) : stories?.length > 0 ? (
        <>
          <table className="data-table stories-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Título</th>
                <th>Autor</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Destacado</th>
                <th>Testimonio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story) => (
                <tr key={story._id}>
                  <td className="story-image">
                    <img src={story.image || "/placeholder.svg"} alt={story.title} />
                  </td>
                  <td>
                    <div className="story-title">{story.title}</div>
                    <div className="story-excerpt">{truncateText(story.content)}</div>
                  </td>
                  <td>{story.author}</td>
                  <td>{formatDate(story.date)}</td>
                  <td>
                    <span className={`status-badge ${story.approved ? 'approved' : 'pending'}`}>
                      {story.approved ? 'Aprobada' : 'Pendiente'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`feature-toggle ${story.isFeatured ? 'featured' : ''}`}
                      onClick={() => onFeatureStory(story._id, !story.isFeatured)}
                      title={story.isFeatured ? 'Quitar de destacados' : 'Marcar como destacada'}
                    >
                      <i className={`fas ${story.isFeatured ? 'fa-star' : 'fa-star-o'}`}></i>
                    </button>
                  </td>
                  <td>
                    <button 
                      className={`testimony-toggle ${story.isTestimony ? 'testimony' : ''}`}
                      onClick={() => onTestimonyStory(story._id, !story.isTestimony)}
                      title={story.isTestimony ? 'Quitar de testimonios' : 'Marcar como testimonio'}
                    >
                      <i className={`fas ${story.isTestimony ? 'fa-quote-right' : 'fa-quote-left'}`}></i>
                    </button>
                  </td>
                  <td className="actions-column">
                    <div className="story-actions">
                      <Link href={`/admin/historias/${story._id}`} className="action-btn edit" title="Editar">
                        <i className="fas fa-edit"></i>
                      </Link>
                      
                      <button 
                        className={`action-btn approve ${story.approved ? 'active' : ''}`}
                        onClick={() => onApproveStory(story._id, !story.approved)}
                        title={story.approved ? 'Rechazar' : 'Aprobar'}
                      >
                        <i className={`fas ${story.approved ? 'fa-times-circle' : 'fa-check-circle'}`}></i>
                      </button>
                      
                      <button 
                        className="action-btn delete"
                        onClick={() => onDeleteStory(story._id)}
                        title="Eliminar"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Página {currentPage} de {totalPages}
              </div>
              <div className="pagination-controls">
                {renderPagination()}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="no-data">
          <i className="fas fa-exclamation-circle"></i>
          <p>No se encontraron historias que coincidan con los criterios de búsqueda.</p>
          <p className="help-text">Si esperabas ver historias, verifica que la base de datos esté correctamente configurada y contenga registros.</p>
        </div>
      )}
    </div>
  )
}

export default StoriesList