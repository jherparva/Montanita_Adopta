"use client"
import { useState, useEffect } from "react"
import ReservationModal from "./ReservationModal"
import { useToast } from "@/hooks/use-toast"

const VeterinaryServicesSection = () => {
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/veterinary/services?active=true")
        const data = await response.json()

        if (data.success) {
          setServices(data.services)
        } else {
          setError("Error al cargar los servicios veterinarios")
          toast({
            title: "Error",
            description: "No se pudieron cargar los servicios veterinarios",
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error("Error fetching veterinary services:", err)
        setError("Error al cargar los servicios veterinarios")
        toast({
          title: "Error",
          description: "No se pudieron cargar los servicios veterinarios",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [toast])

  const handleReserveClick = (service) => {
    setSelectedService(service)
    setShowReservationModal(true)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <section className="veterinary-services-section">
      <div className="container">
        <h2>SERVICIOS VETERINARIOS</h2>
        {loading ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Cargando servicios veterinarios...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
          </div>
        ) : services.length === 0 ? (
          <div className="no-results">
            <i className="fas fa-info-circle"></i>
            <p>No hay servicios veterinarios disponibles en este momento.</p>
          </div>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <div className="service-card" key={service._id}>
                <div className="service-icon">
                  <i className={`fas ${service.icon || "fa-paw"}`}></i>
                </div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <p>
                  <strong>Precio: </strong>
                  <span className="service-price">{formatPrice(service.price)}</span>
                </p>
                <button className="service-btn info-btn" onClick={() => handleReserveClick(service)}>
                  Más Información
                </button>
                <button
                  className="service-btn reserve-btn"
                  onClick={() => handleReserveClick(service)}
                >
                  Reservar Cita
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="vet-location-container mt-5">
        <div className="container">
          <h3>NUESTRA UBICACIÓN</h3>
          <div className="card">
            <div className="card-header bg-success text-white">
              <i className="fas fa-map-marker-alt me-2"></i> Ubicación de la Veterinaria
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Dirección:</strong> carrera 5 calle 8a #04, barrio guillermo escobar
                  </p>
                  <p>
                    <strong>Horarios de atención:</strong> Lunes a Viernes de 9:00 AM a 5:00 PM
                  </p>
                  <p>
                    <strong>Teléfono:</strong> 3166532433
                  </p>
                  <div className="mt-3">
                    <p className="mb-2 small">También puedes encontrarnos en:</p>
                    <a
                      href="https://maps.apple.com/?ll=1.482825,-75.435075&q=Montañita+Adopta"
                      className="btn btn-sm btn-outline-secondary me-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-apple me-1"></i> Apple Maps
                    </a>
                    <a
                      href="https://www.google.com/maps?q=1.482825,-75.435075"
                      className="btn btn-sm btn-outline-secondary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-google me-1"></i> Google Maps
                    </a>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="map-container">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3986.7971416573864!2d-75.435075!3d1.482825!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMjgnNTguMiJOIDc1wrAyNicwNi4zIlc!5e0!3m2!1ses!2sco!4v1710619500000!5m2!1ses!2sco"
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReservationModal && selectedService && (
        <ReservationModal service={selectedService} onClose={() => setShowReservationModal(false)} />
      )}
    </section>
  )
}

export default VeterinaryServicesSection