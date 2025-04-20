"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const RecentAdoptions = () => {
  const [adoptions, setAdoptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentAdoptions = async () => {
      try {
        const response = await fetch("/api/admin/adoptions/recent")
        if (response.ok) {
          const data = await response.json()
          setAdoptions(data.adoptions)
        }
      } catch (error) {
        console.error("Error al obtener adopciones recientes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentAdoptions()
  }, [])

  return (
    <div className="dashboard-card recent-adoptions">
      <div className="card-header">
        <h3>Adopciones Recientes</h3>
        <Link href="/admin/solicitudes?status=approved" className="view-all">
          Ver todas <i className="fas fa-arrow-right"></i>
        </Link>
      </div>

      <div className="card-content">
        {loading ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Cargando adopciones recientes...</p>
          </div>
        ) : adoptions.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mascota</th>
                <th>Adoptante</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {adoptions.map((adoption) => (
                <tr key={adoption._id}>
                  <td className="with-image">
                    <img
                      src={adoption.animal.image || "/placeholder.svg"}
                      alt={adoption.animal.name}
                      className="small-image"
                    />
                    <span>{adoption.animal.name}</span>
                  </td>
                  <td>{adoption.adopter.name}</td>
                  <td>{new Date(adoption.approvedDate).toLocaleDateString()}</td>
                  <td>
                    <span className="status-badge approved">Aprobada</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No hay adopciones recientes</p>
        )}
      </div>
    </div>
  )
}

export default RecentAdoptions