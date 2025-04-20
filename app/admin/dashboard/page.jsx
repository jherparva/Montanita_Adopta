"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import RecentMessages from "@/components/admin/dashboard/RecentMessages"
import PendingRequests from "@/components/admin/dashboard/PendingRequests"
import RecentAdoptions from "@/components/admin/dashboard/RecentAdoptions"
import ActividadReciente from "@/components/admin/dashboard/ActividadReciente"
import DashboardStats from "@/components/admin/dashboard/DashboardStats"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalAnimals: 0,
    adoptedAnimals: 0,
    availableAnimals: 0,
    pendingAdoptions: 0,
    completedAdoptions: 0,
    pendingMessages: 0,
    totalMessages: 0,
    totalUsers: 0,
    adminUsers: 0,
    totalVolunteers: 0,
    activeVolunteers: 0,
    totalDonations: 0,
    totalDonationAmount: 0,
    totalSponsors: 0,
    activeSponsors: 0,
    totalStories: 0,
    pendingVetServices: 0,
    completedVetServices: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    recentActivities: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const router = useRouter()

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth/check", {
          credentials: "include", // Importante: incluir cookies en la solicitud
        })
        const data = await res.json()

        if (!data.authenticated) {
          console.log("No autenticado, redirigiendo a /admin")
          router.push("/admin")
          return false
        }

        setUser(data.user)
        return true
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        router.push("/admin")
        return false
      }
    }

    checkAuth().then((isAuth) => {
      if (isAuth) {
        fetchStats()
      }
    })
  }, [router])

  // Cargar estadísticas desde la API
  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/dashboard", {
        credentials: "include",
      })
      
      if (!res.ok) {
        throw new Error("Error al cargar estadísticas")
      }
      
      const data = await res.json()
      setStats(data.stats)
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
      setError("No se pudieron cargar las estadísticas")
    } finally {
      setLoading(false)
    }
  }

  // Función para actualizar manualmente los datos
  const handleRefresh = () => {
    fetchStats()
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">
          <i className="fas fa-paw fa-spin"></i>
        </div>
        <p>Cargando dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchStats} className="refresh-button">
          <i className="fas fa-sync"></i> Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1>Bienvenido, {user?.name || "Administrador"}</h1>
          <p>Panel de administración de Montañita Adopta</p>
        </div>
        <button onClick={handleRefresh} className="refresh-button">
          <i className="fas fa-sync"></i> Actualizar datos
        </button>
      </div>

      {/* Estadísticas principales */}
      <DashboardStats stats={stats} />

      <div className="dashboard-grid">
        <div className="dashboard-column">
          {/* Mensajes recientes */}
          <RecentMessages />
          
          {/* Solicitudes pendientes */}
          <PendingRequests />
        </div>

        <div className="dashboard-column">
          {/* Adopciones recientes */}
          <RecentAdoptions />
          
          {/* Actividad reciente */}
          <ActividadReciente />
        </div>
      </div>
    </div>
  )
}