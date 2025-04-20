"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const PendingRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await fetch("/api/admin/adoptions/pending")
        if (response.ok) {
          const data = await response.json()
          setRequests(data.requests)
        }
      } catch (error) {
        console.error("Error al obtener solicitudes pendientes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPendingRequests()
  }, [])

  return (
    <div className="dashboard-card pending-requests">
      <div className="card-header">
        <h3>Solicitudes Pendientes</h3>
        <Link href="/admin/solicitudes?status=pending" className="view-all">
          Ver todas <i className="fas fa-arrow-right"></i>
        </Link>
      </div>

      <div className="card-content">
        {loading ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Cargando solicitudes pendientes...</p>
          </div>
        ) : requests.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mascota</th>
                <th>Solicitante</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td className="with-image">
                    <img
                      src={request.animal.image || "/placeholder.svg"}
                      alt={request.animal.name}
                      className="small-image"
                    />
                    <span>{request.animal.name}</span>
                  </td>
                  <td>{request.adopter.name}</td>
                  <td>{new Date(request.requestDate).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/admin/solicitudes/${request._id}`} className="action-btn">
                      <i className="fas fa-eye"></i>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No hay solicitudes pendientes</p>
        )}
      </div>
    </div>
  )
}

export default PendingRequests