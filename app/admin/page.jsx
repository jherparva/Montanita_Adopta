"use client"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import AdminLogin from "@/components/admin/AdminLogin"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/auth/check", {
          credentials: "include", // Importante: incluir cookies en la solicitud
        })
        const data = await response.json()

        console.log("Respuesta de verificación de autenticación:", data)

        if (data.authenticated) {
          setIsAuthenticated(true)

          // Solo redirigir si NO estamos ya en /admin/dashboard
          if (pathname !== "/admin/dashboard") {
            router.push("/admin/dashboard")
          }
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    router.push("/admin/dashboard")
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner">
          <i className="fas fa-paw fa-spin"></i>
        </div>
        <p>Cargando...</p>
      </div>
    )
  }

  // Si ya está autenticado, no mostramos el login
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  )
}
