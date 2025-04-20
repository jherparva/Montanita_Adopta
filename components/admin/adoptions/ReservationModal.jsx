"use client"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import LoginModal from "../auth/LoginModal"

const ReservationModal = ({ service, onClose }) => {
  const [formData, setFormData] = useState({
    petOwner: "",
    petName: "",
    petType: "",
    appointmentDate: "",
    appointmentTime: "",
    notes: "",
  })

  const [availableTimes, setAvailableTimes] = useState([])
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        const data = await response.json()

        if (data.authenticated) {
          setIsAuthenticated(true)
          setUser(data.user)
          setFormData((prev) => ({
            ...prev,
            petOwner: data.user.id,
            petOwnerName: data.user.name || data.user.nombre,
          }))
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    // Generar horarios disponibles
    const times = []
    for (let hour = 9; hour <= 16; hour++) {
      times.push(`${hour}:00`)
      if (hour < 16) {
        times.push(`${hour}:30`)
      }
    }
    setAvailableTimes(times)

    // Establecer fecha mínima como mañana
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const minDate = tomorrow.toISOString().split("T")[0]

    // Establecer el elemento input de fecha con el mínimo
    const dateInput = document.getElementById("appointment-date")
    if (dateInput) {
      dateInput.min = minDate
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    try {
      setIsSubmitting(true)
      setMessage("")

      // Validar fecha
      const selectedDate = new Date(formData.appointmentDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        setMessage("La fecha de la cita no puede ser en el pasado")
        setMessageType("error")
        return
      }

      // Preparar datos para enviar
      const appointmentData = {
        petOwner: formData.petOwner,
        petName: formData.petName,
        petType: formData.petType,
        service: service.name,
        serviceId: service._id,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        notes: formData.notes,
      }

      // Enviar datos a la API
      const response = await fetch("/api/veterinary/appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      })

      const data = await response.json()

      if (data.success) {
        setMessage("¡Reserva confirmada! Te contactaremos pronto para confirmar los detalles.")
        setMessageType("success")
        toast({
          title: "Reserva exitosa",
          description: "Tu cita ha sido reservada correctamente",
        })

        // Cerrar el modal después de 3 segundos
        setTimeout(() => {
          onClose()
        }, 3000)
      } else {
        setMessage(data.message || "Error al procesar la reserva")
        setMessageType("error")
        toast({
          title: "Error",
          description: data.message || "Error al procesar la reserva",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting appointment:", error)
      setMessage("Error al procesar la reserva. Por favor, intenta de nuevo.")
      setMessageType("error")
      toast({
        title: "Error",
        description: "Error al procesar la reserva. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div id="reservationModal" className="modal" style={{ display: "block" }}>
        <div className="modal-content reservation-modal">
          <span className="close" onClick={onClose}>
            &times;
          </span>
          <h2>
            Reservar Cita <span id="service-type">{service.name}</span>
          </h2>
          <form id="reservation-form" onSubmit={handleSubmit}>
            <input type="hidden" id="service-input" name="service" value={service.name} />
            <input type="hidden" id="service-id-input" name="serviceId" value={service._id} />

            {!isAuthenticated && (
              <div className="auth-message" style={{ marginBottom: "20px", color: "#e01e1e" }}>
                <i className="fas fa-info-circle"></i> Debes iniciar sesión para reservar una cita.
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0066cc",
                    textDecoration: "underline",
                    cursor: "pointer",
                    marginLeft: "5px",
                  }}
                >
                  Iniciar sesión
                </button>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="pet-name">Nombre de la Mascota:</label>
              <input
                type="text"
                id="pet-name"
                name="petName"
                value={formData.petName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="pet-type">Tipo de Mascota:</label>
              <select id="pet-type" name="petType" value={formData.petType} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                <option value="dog">Perro</option>
                <option value="cat">Gato</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="appointment-date">Fecha de la Cita:</label>
              <input
                type="date"
                id="appointment-date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="appointment-time">Hora de la Cita:</label>
              <select
                id="appointment-time"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar...</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notas adicionales:</label>
              <textarea id="notes" name="notes" rows="3" value={formData.notes} onChange={handleChange}></textarea>
            </div>

            {message && (
              <div
                id="reservation-message"
                style={{
                  display: "block",
                  color: messageType === "success" ? "green" : "red",
                  backgroundColor: messageType === "success" ? "#d4edda" : "#f8d7da",
                  padding: "10px",
                  borderRadius: "5px",
                  marginBottom: "15px",
                }}
              >
                {message}
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="primary-btn" disabled={isSubmitting || !isAuthenticated}>
                {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : "Confirmar Reserva"}
              </button>
              <button type="button" className="secondary-btn" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </>
  )
}

export default ReservationModal