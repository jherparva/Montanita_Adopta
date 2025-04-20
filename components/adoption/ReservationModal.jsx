"use client"
import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import LoginModal from "../auth/LoginModal"

const ReservationModal = ({ service, onClose }) => {
  const router = useRouter()
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

  // Verificar autenticación - función reutilizable
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/check")
      const data = await response.json()

      if (data.authenticated || data.isAuthenticated) {
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
  }, [])

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Verificar autenticación después de cerrar el modal de login
  useEffect(() => {
    if (!showLoginModal) {
      checkAuth()
    }
  }, [showLoginModal, checkAuth])

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
    const dateInput = document.getElementById("vet-appointment-date")
    if (dateInput) {
      dateInput.min = minDate
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLoginClick = () => {
    setShowLoginModal(true)
  }

  const closeLoginModal = () => {
    setShowLoginModal(false)
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
        // Usar SweetAlert2 si está disponible
        if (window.Swal) {
          window.Swal.fire({
            title: "¡Gracias por tu reserva!",
            text: "Tu cita ha sido reservada correctamente. Nos pondremos en contacto contigo pronto para confirmar los detalles.",
            icon: "success",
            confirmButtonColor: "#4caf50",
          }).then(() => {
            router.push("/adopcion")
          })
        } else {
          // Fallback si SweetAlert2 no está disponible
          setMessage("¡Reserva confirmada! Te contactaremos pronto para confirmar los detalles.")
          setMessageType("success")
          toast({
            title: "Reserva exitosa",
            description: "Tu cita ha sido reservada correctamente",
          })

          // Redireccionar después de 3 segundos
          setTimeout(() => {
            router.push("/adopcion")
          }, 3000)
        }
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
      
      // Usar SweetAlert2 si está disponible
      if (window.Swal) {
        window.Swal.fire({
          title: "Error",
          text: "Error al procesar la reserva. Por favor, intenta de nuevo.",
          icon: "error",
          confirmButtonColor: "#f44336",
        })
      } else {
        // Fallback sin SweetAlert2
        setMessage("Error al procesar la reserva. Por favor, intenta de nuevo.")
        setMessageType("error")
        toast({
          title: "Error",
          description: "Error al procesar la reserva. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div id="vetReservationModal" className="vet-modal" style={{ display: "block" }}>
        <div className="vet-modal-content vet-reservation-modal">
          <span className="vet-close" onClick={onClose}>
            &times;
          </span>
          <h2>
            Reservar Cita: <span id="vet-service-type">{service.name}</span>
          </h2>

          {!isAuthenticated && (
            <div className="vet-auth-message">
              <i className="fas fa-info-circle"></i>
              <span>Debes iniciar sesión para reservar una cita.</span>
            </div>
          )}

          <form id="vet-reservation-form" onSubmit={handleSubmit}>
            <input type="hidden" id="vet-service-input" name="service" value={service.name} />
            <input type="hidden" id="vet-service-id-input" name="serviceId" value={service._id} />

            <div className="vet-form-group">
              <label htmlFor="vet-pet-name">Nombre de la Mascota:</label>
              <input
                type="text"
                id="vet-pet-name"
                name="petName"
                value={formData.petName}
                onChange={handleChange}
                required
                disabled={!isAuthenticated}
              />
            </div>

            <div className="vet-form-group">
              <label htmlFor="vet-pet-type">Tipo de Mascota:</label>
              <select
                id="vet-pet-type"
                name="petType"
                value={formData.petType}
                onChange={handleChange}
                required
                disabled={!isAuthenticated}
              >
                <option value="">Seleccionar...</option>
                <option value="dog">Perro</option>
                <option value="cat">Gato</option>
              </select>
            </div>

            <div className="vet-form-group">
              <label htmlFor="vet-appointment-date">Fecha de la Cita:</label>
              <input
                type="date"
                id="vet-appointment-date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                required
                disabled={!isAuthenticated}
              />
            </div>

            <div className="vet-form-group">
              <label htmlFor="vet-appointment-time">Hora de la Cita:</label>
              <select
                id="vet-appointment-time"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleChange}
                required
                disabled={!isAuthenticated}
              >
                <option value="">Seleccionar...</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div className="vet-form-group">
              <label htmlFor="vet-notes">Notas adicionales:</label>
              <textarea
                id="vet-notes"
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                disabled={!isAuthenticated}
              ></textarea>
            </div>

            {message && (
              <div id="vet-reservation-message" className={`vet-reservation-message ${messageType}`}>
                <i className={messageType === "success" ? "fas fa-check-circle" : "fas fa-exclamation-circle"}></i>
                {message}
              </div>
            )}

            <div className="vet-form-actions">
              <button type="submit" className="vet-primary-btn" disabled={isSubmitting || !isAuthenticated}>
                {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : "Confirmar Reserva"}
              </button>
              <button type="button" className="vet-secondary-btn" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Elementos decorativos */}
      <div className="vet-paw-prints vet-paw-1"></div>
      <div className="vet-paw-prints vet-paw-2"></div>

      {/* Modal de inicio de sesión */}
      {showLoginModal && <LoginModal onClose={closeLoginModal} />}
    </>
  )
}

export default ReservationModal