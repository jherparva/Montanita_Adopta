'use client'
import { useEffect, useState, useCallback } from "react"

export default function ActividadReciente() {
  const [actividades, setActividades] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchActividad = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/user/activity?limit=5")
      const data = await res.json()
      
      if (data.success) {
        setActividades(data.actividades)
      } else {
        console.error("Error en la respuesta:", data.message || "Error desconocido")
        setActividades([])
      }
    } catch (err) {
      console.error("Error al obtener actividad:", err)
      setActividades([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActividad()
  }, [fetchActividad])

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString()
  }

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>Actividad Reciente</h3>
      </div>
      <div className="card-content">
        {loading ? (
          <p>Cargando actividad...</p>
        ) : actividades.length === 0 ? (
          <p>No hay actividad reciente.</p>
        ) : (
          <ul className="actividad-lista">
            {actividades.map((act) => (
              <li key={act._id}>
                <span><strong>{act.tipo}</strong>: {act.descripcion}</span>
                <br />
                <small>{formatearFecha(act.fecha)}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}