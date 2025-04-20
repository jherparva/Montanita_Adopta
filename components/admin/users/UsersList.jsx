"use client"
import Link from "next/link"

const UsersList = ({ 
  users = [], 
  loading, 
  currentPage, 
  totalPages, 
  totalUsers, 
  onPageChange, 
  onDeleteUser,
  onToggleStatus,
  onChangeRole
}) => {
  
  const getStatusBadge = (blocked) => (
    <span className={`status-badge ${blocked ? "blocked" : "active"}`}>
      {blocked ? "Bloqueado" : "Activo"}
    </span>
  )

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

  const getVolunteerInfo = (user) => {
    if (user.role === 'voluntario') {
      return user.tipo_voluntario ? 
        ` (${user.tipo_voluntario.charAt(0).toUpperCase() + user.tipo_voluntario.slice(1)})` : 
        ' (Sin especificar)';
    }
    return '';
  }

  return (
    <div className="users-list-container">
      <div className="list-header">
        <p>
          Mostrando {users.length} de {totalUsers || 0} usuarios
        </p>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando usuarios...</p>
        </div>
      ) : users.length > 0 ? (
        <>
          <table className="data-table users-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.nombre || user.name}</td>
                  <td>{user.correo_electronico || user.email}</td>
                  <td>{user.telefono || user.phone || "-"}</td>
                  <td>
                    <select 
                      value={user.role} 
                      onChange={(e) => onChangeRole(user._id, e.target.value)}
                      className="role-select"
                    >
                      <option value="user">Usuario</option>
                      <option value="moderador">Moderador</option>
                      <option value="admin">Administrador</option>
                      <option value="voluntario">Voluntario{getVolunteerInfo(user)}</option>
                    </select>
                  </td>
                  <td>{getStatusBadge(user.bloqueado)}</td>
                  <td className="actions-cell">
                    <Link href={`/admin/usuarios/${user._id}`} className="action-btn edit" title="Editar">
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button 
                      className={`action-btn ${user.bloqueado ? "unlock" : "lock"}`} 
                      title={user.bloqueado ? "Desbloquear" : "Bloquear"}
                      onClick={() => onToggleStatus(user._id, user.bloqueado)}
                    >
                      <i className={`fas fa-${user.bloqueado ? "unlock" : "lock"}`}></i>
                    </button>
                    <button className="action-btn delete" title="Eliminar" onClick={() => onDeleteUser(user._id)}>
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">{renderPagination()}</div>
          )}
        </>
      ) : (
        <div className="no-data">
          <i className="fas fa-search"></i>
          <p>No se encontraron usuarios con los filtros seleccionados</p>
        </div>
      )}
    </div>
  )
}

export default UsersList