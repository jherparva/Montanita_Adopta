"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdoptionContract from "@/components/admin/adoptions/AdoptionContract"
import "@/styles/admin/solicitud-detalle.css"

export default function SolicitudDetallePage({ params }) {
  const [solicitud, setSolicitud] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showContract, setShowContract] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        const res = await fetch(`/api/admin/adoptions/${id}`)

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()
        setSolicitud(data.adoption)
      } catch (error) {
        console.error("Error al cargar la solicitud:", error)
        setError("No se pudo cargar la información de la solicitud. Por favor intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSolicitud()
    }
  }, [id])

  const handleAction = async (action) => {
    if (isProcessing) return

    setIsProcessing(true)
    try {
      if (action === "approved") {
        setShowContract(true)
        setIsProcessing(false)
        return
      }

      const res = await fetch(`/api/admin/adoptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || `Error ${res.status}`)
      }

      alert(
        data.message ||
          (action === "approved" ? "Solicitud aprobada correctamente" : "Solicitud rechazada correctamente"),
      )
      router.push("/admin/solicitudes")
    } catch (error) {
      console.error(`Error al ${action === "approved" ? "aprobar" : "rechazar"} la solicitud:`, error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApproveAfterContract = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch(`/api/admin/adoptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || `Error ${res.status}`)
      }

      alert("Solicitud aprobada correctamente")
      setShowContract(false)
      router.push("/admin/solicitudes")
    } catch (error) {
      console.error("Error al aprobar la solicitud:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">
          <i className="fas fa-paw fa-spin"></i>
        </div>
        <p>Cargando información de la solicitud...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => router.push("/admin/solicitudes")} className="btn-back">
          Volver a solicitudes
        </button>
      </div>
    )
  }

  if (!solicitud) {
    return (
      <div className="error-container">
        <h2>Solicitud no encontrada</h2>
        <p>La solicitud que busca no existe o ha sido eliminada.</p>
        <button onClick={() => router.push("/admin/solicitudes")} className="btn-back">
          Volver a solicitudes
        </button>
      </div>
    )
  }

  return (
    <div className="solicitud-detalle">
      {showContract && (
        <AdoptionContract
          adoption={{
            _id: solicitud._id,
            adopter: solicitud.adopter,
            animal: solicitud.animal,
            requestDate: solicitud.requestDate,
          }}
          onClose={() => setShowContract(false)}
          onApprove={handleApproveAfterContract}
        />
      )}

      <div className="detalle-header">
        <h1>Detalle de Solicitud de Adopción</h1>
        <button onClick={() => router.push("/admin/solicitudes")} className="btn-back">
          <i className="fas fa-arrow-left"></i> Volver
        </button>
      </div>

      <div className="detalle-content">
        <div className="detalle-section animal-info">
          <h2>Información del Animal</h2>
          <div className="animal-card">
            <div className="animal-image">
              <img src={solicitud.animal.image || "/placeholder.svg"} alt={solicitud.animal.name} />
            </div>
            <div className="animal-details">
              <h3>{solicitud.animal.name}</h3>
              <p>
                <strong>Especie:</strong>{" "}
                {solicitud.animal.species === "dog"
                  ? "Perro"
                  : solicitud.animal.species === "cat"
                    ? "Gato"
                    : solicitud.animal.species}
              </p>
              <p>
                <strong>Raza:</strong> {solicitud.animal.breed}
              </p>
              <p>
                <strong>Edad:</strong>{" "}
                {solicitud.animal.age === "puppy" || solicitud.animal.age === "kitten"
                  ? "Cachorro"
                  : solicitud.animal.age === "adult"
                    ? "Adulto"
                    : solicitud.animal.age === "senior"
                      ? "Senior"
                      : "No especificada"}
              </p>
            </div>
          </div>
        </div>

        <div className="detalle-section adopter-info">
          <h2>Información del Solicitante</h2>
          <div className="adopter-card">
            <div className="adopter-details">
              <p>
                <strong>Nombre:</strong> {solicitud.adopter.name}
              </p>
              <p>
                <strong>Email:</strong> {solicitud.adopter.email}
              </p>
              <p>
                <strong>Teléfono:</strong> {solicitud.adopter.phone || "No proporcionado"}
              </p>
              <p>
                <strong>Dirección:</strong> {solicitud.adopter.address || "No proporcionada"}
              </p>
              <p>
                <strong>Ciudad:</strong> {solicitud.adopter.city || "No proporcionada"}
              </p>
            </div>
          </div>
        </div>

        <div className="detalle-section request-info">
          <h2>Detalles de la Solicitud</h2>
          <div className="request-card">
            <p>
              <strong>Fecha de solicitud:</strong>{" "}
              {new Date(solicitud.requestDate).toLocaleString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              <span className={`status-badge ${solicitud.status}`}>
                {solicitud.status === "pending"
                  ? "Pendiente"
                  : solicitud.status === "approved"
                    ? "Aprobada"
                    : "Rechazada"}
              </span>
            </p>
            <div className="request-notes">
              <h3>Información adicional:</h3>
              <pre>{solicitud.details || "No hay información adicional"}</pre>
            </div>
          </div>
        </div>

        {solicitud.status === "pending" && (
          <div className="detalle-actions">
            <button onClick={() => handleAction("approved")} className="btn-approve" disabled={isProcessing}>
              {isProcessing ? "Procesando..." : "✅ Aprobar y generar contrato"}
            </button>
            <button onClick={() => handleAction("rejected")} className="btn-reject" disabled={isProcessing}>
              {isProcessing ? "Procesando..." : "❌ Rechazar"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
