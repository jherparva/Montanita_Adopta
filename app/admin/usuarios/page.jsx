"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import UsersList from "@/components/admin/users/UsersList"
import UserFilters from "@/components/admin/users/UserFilters"
import Link from "next/link"
import "@/styles/admin/usuarios.css";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()
  const searchParams = useSearchParams()

  const role = searchParams.get("role") || "all"
  const status = searchParams.get("status") || "all"
  const search = searchParams.get("search") || ""

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: "10",
          role,
          status,
          search,
        })

        const response = await fetch(`/api/admin/users?${queryParams}`)
        const data = await response.json()

        if (response.ok) {
          setUsers(data.users)
          setTotalUsers(data.total)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error("Error al obtener usuarios:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [currentPage, role, status, search])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleFilterChange = (filters) => {
    const queryParams = new URLSearchParams()

    if (filters.role && filters.role !== "all") {
      queryParams.set("role", filters.role)
    }

    if (filters.status && filters.status !== "all") {
      queryParams.set("status", filters.status)
    }

    if (filters.search) {
      queryParams.set("search", filters.search)
    }

    router.push(`/admin/usuarios?${queryParams.toString()}`)
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.")) {
      try {
        const response = await fetch(`/api/admin/users/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: userId }),
        })

        if (response.ok) {
          // Actualizar la lista de usuarios
          setUsers(users.filter((user) => user._id !== userId))
          setTotalUsers(totalUsers - 1)
          alert("Usuario eliminado correctamente")
        } else {
          const data = await response.json()
          alert(data.message || "Error al eliminar el usuario")
        }
      } catch (error) {
        console.error("Error al eliminar usuario:", error)
        alert("Error al eliminar el usuario")
      }
    }
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus
      const actionText = newStatus ? "bloquear" : "desbloquear"
      
      if (window.confirm(`¿Estás seguro de que deseas ${actionText} este usuario?`)) {
        const response = await fetch('/api/admin/users/status', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: userId,
            bloqueado: newStatus
          })
        })
        
        if (response.ok) {
          // Actualizar el estado del usuario en la lista
          setUsers(users.map(user => 
            user._id === userId 
              ? {...user, bloqueado: newStatus} 
              : user
          ))
          alert(`Usuario ${actionText}do correctamente`)
        } else {
          const data = await response.json()
          alert(data.message || `Error al ${actionText} el usuario`)
        }
      }
    } catch (error) {
      console.error(`Error al cambiar estado del usuario:`, error)
      alert(`Error al procesar la solicitud`)
    }
  }

  const handleChangeRole = async (userId, newRole) => {
    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          role: newRole
        })
      })
      
      if (response.ok) {
        // Actualizar el rol del usuario en la lista
        setUsers(users.map(user => 
          user._id === userId 
            ? {...user, role: newRole} 
            : user
        ))
        alert(`Rol actualizado correctamente a: ${newRole}`)
      } else {
        const data = await response.json()
        alert(data.message || `Error al actualizar el rol del usuario`)
      }
    } catch (error) {
      console.error(`Error al cambiar rol del usuario:`, error)
      alert(`Error al procesar la solicitud`)
    }
  }

  return (
    <AdminLayout>
      <div className="admin-users">
        <div className="page-header">
          <h1>Gestión de Usuarios</h1>
          <Link href="/admin/usuarios/crear" className="btn btn-primary">
            <i className="fas fa-plus"></i> Crear Usuario
          </Link>
        </div>

        <UserFilters initialFilters={{ role, status, search }} onFilterChange={handleFilterChange} />

        <UsersList
          users={users}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalUsers={totalUsers}
          onPageChange={handlePageChange}
          onDeleteUser={handleDeleteUser}
          onToggleStatus={handleToggleUserStatus}
          onChangeRole={handleChangeRole}
        />
      </div>
    </AdminLayout>
  )
}