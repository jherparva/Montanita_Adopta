"use client"
import Image from "next/image"
import { useState } from "react"
import AdoptionContract from "./AdoptionContract"

export default function SolicitudCard({ solicitud, onAction }) {
  const { _id, adopter, animal, requestDate, details } = solicitud
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionError, setActionError] = useState("")
  const [showDetails, setShowDetails] = useState(false)
  const [showContract, setShowContract] = useState(false)

  const handleAction = async (action) => {
    if (isProcessing) return

    setIsProcessing(true)
    setActionError("")

    try {
      if (action === "approved" || action === "rejected") {
        await onAction(_id, action)
      }
    } catch (error) {
      console.error(`Error al ${action === "approved" ? "aprobar" : "rechazar"} la solicitud:`, error)
      setActionError(`Error al procesar la solicitud. Intente nuevamente.`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Formatear la fecha
  const formattedDate = new Date(requestDate).toLocaleString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <li className="solicitud-item">
      {showContract && (
        <AdoptionContract
          adoption={{
            _id,
            adopter,
            animal,
            requestDate,
          }}
          onClose={() => setShowContract(false)}
        />
      )}

      <div className="solicitud-header">
        <div>
          <strong>{adopter.name}</strong> solicitó adoptar a <strong>{animal.name}</strong>
        </div>
        <button onClick={() => setShowDetails(!showDetails)} className="btn-toggle-details">
          {showDetails ? "Ocultar detalles" : "Ver detalles"}
        </button>
      </div>

      <div className="solicitud-basic-info">
        <div className="solicitud-animal-info">
          <div>
            <span>
              {animal.species === "dog" ? "Perro" : animal.species === "cat" ? "Gato" : animal.species} - {animal.breed}
            </span>
          </div>
          <div className="solicitud-image">
            <Image
              src={animal.image || "/placeholder.svg?height=80&width=120"}
              alt={animal.name}
              width={120}
              height={80}
              style={{ borderRadius: "6px", objectFit: "cover" }}
            />
          </div>
        </div>

        <div className="solicitud-contact-info">
          <p>
            <strong>Contacto:</strong> {adopter.email}
          </p>
          <p>
            <strong>Teléfono:</strong> {adopter.phone || "No proporcionado"}
          </p>
          <p>
            <strong>Fecha:</strong> {formattedDate}
          </p>
        </div>
      </div>

      {showDetails && (
        <div className="solicitud-details">
          <h4>Detalles de la solicitud</h4>

          <div className="solicitud-address">
            <p>
              <strong>Dirección:</strong> {adopter.address || "No proporcionada"}
            </p>
            <p>
              <strong>Ciudad:</strong> {adopter.city || "No proporcionada"}
            </p>
          </div>

          <div className="solicitud-notes">
            <h5>Información adicional:</h5>
            <pre>{details}</pre>
          </div>
        </div>
      )}

      {actionError && (
        <div className="error-message" style={{ fontSize: "0.8rem", marginTop: "5px" }}>
          {actionError}
        </div>
      )}

      <div className="solicitud-actions">
        <button onClick={() => handleAction("approved")} className="btn-approve" disabled={isProcessing}>
          {isProcessing ? "Procesando..." : "✅ Aprobar"}
        </button>
        <button onClick={() => setShowContract(true)} className="btn-print" disabled={isProcessing}>
          {isProcessing ? "Procesando..." : "🖨️ Imprimir Contrato"}
        </button>
        <button onClick={() => handleAction("rejected")} className="btn-reject" disabled={isProcessing}>
          {isProcessing ? "Procesando..." : "❌ Rechazar"}
        </button>
      </div>
    </li>
  )
}