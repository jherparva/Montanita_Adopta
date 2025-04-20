"use client"
import { useState, useEffect, useCallback } from "react"
import ReservationModal from "./ReservationModal"
import { useToast } from "@/hooks/use-toast"

const VeterinaryServicesSection = () => {
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState(null)
  const { toast } = useToast()

  // Coordenadas del refugio/veterinaria
  const refugeLocation = { lat: 1.482825, lng: -75.435075 }

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        const data = await response.json()

        if (data.authenticated || data.isAuthenticated) {
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
      }
    }

    checkAuth()
  }, [])

  // Inicializar mapa
  const initMap = useCallback(() => {
    const mapElement = document.getElementById("vet-refuge-map")
    if (mapElement && window.google && window.google.maps) {
      const newMap = new window.google.maps.Map(mapElement, {
        center: refugeLocation,
        zoom: 15,
        mapTypeId: "roadmap",
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      })

      // Añadir un marcador para el refugio/veterinaria
      const marker = new window.google.maps.Marker({
        position: refugeLocation,
        map: newMap,
        title: "Montañita Adopta - Veterinaria",
        animation: window.google.maps.Animation.DROP,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new window.google.maps.Size(40, 40),
        },
      })

      // Añadir un infowindow al marcador
      const infowindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="margin-top: 0; color: #e01e1e; font-size: 16px;">Montañita Adopta - Veterinaria</h3>
            <p style="margin-bottom: 5px;"><strong>Dirección:</strong> carrera 5 calle 8a #04, barrio guillermo escobar</p>
            <p style="margin-bottom: 5px;"><strong>Teléfono:</strong> 3166532433</p>
            <p style="margin-bottom: 0;"><strong>Horario:</strong> Lunes a Viernes 9:00 AM - 5:00 PM</p>
          </div>
        `,
      })

      marker.addListener("click", () => {
        infowindow.open(newMap, marker)
      })

      setMap(newMap)
      setMapLoaded(true)
    }
  }, [refugeLocation])

  // Cargar el mapa de Google Maps
  useEffect(() => {
    const loadMap = () => {
      // Verificar si el API de Google Maps ya está cargado
      if (window.google && window.google.maps) {
        initMap()
      } else {
        // Si no está cargado, crear un script para cargarlo
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBDaeWicvigtP9xPv919E-RNoxfvC-Hqik&callback=initGoogleMapVet`
        script.async = true
        script.defer = true
        document.head.appendChild(script)

        // Definir la función de callback global
        window.initGoogleMapVet = initMap
      }
    }

    // Cargar el mapa cuando el componente se monta
    const timer = setTimeout(() => {
      loadMap()
    }, 1000) // Pequeño retraso para asegurar que el DOM esté listo

    return () => clearTimeout(timer)
  }, [initMap])

  // Cargar servicios
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        console.log("Fetching veterinary services...")

        // Crear servicios por defecto si no existen
        const createDefaultResponse = await fetch("/api/veterinary/services/create-defaults", {
          method: "POST",
        })

        const createDefaultData = await createDefaultResponse.json()
        console.log("Create default services response:", createDefaultData)

        // Obtener los servicios
        const response = await fetch("/api/veterinary/services?active=true")
        const data = await response.json()
        console.log("Veterinary services response:", data)

        if (data.success) {
          setServices(data.services || [])
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

  const handleReserveClick = useCallback((service) => {
    setSelectedService(service)
    setShowReservationModal(true)
  }, [])

  const handleInfoClick = useCallback((service) => {
    setSelectedService(service)
    setShowInfoModal(true)
  }, [])

  const closeReservationModal = useCallback(() => {
    setShowReservationModal(false)
  }, [])

  const closeInfoModal = useCallback(() => {
    setShowInfoModal(false)
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Servicios por defecto en caso de que no se puedan cargar desde la API
  const defaultServices = [
    {
      _id: "default1",
      name: "Vacunación",
      description: "Protege la salud de tu nueva mascota con nuestras vacunas completas.",
      price: 50000,
      icon: "fa-syringe",
      active: true,
    },
    {
      _id: "default2",
      name: "Consulta General",
      description: "Revisión completa de salud para garantizar el bienestar de tu mascota.",
      price: 40000,
      icon: "fa-stethoscope",
      active: true,
    },
    {
      _id: "default3",
      name: "Esterilización",
      description: "Servicios de esterilización seguros y profesionales.",
      price: 120000,
      icon: "fa-cut",
      active: true,
    },
    {
      _id: "default4",
      name: "Primeros Auxilios",
      description: "Atención inmediata y cuidados de emergencia para tu mascota.",
      price: 60000,
      icon: "fa-first-aid",
      active: true,
    },
  ]

  // Usar servicios por defecto si no hay servicios disponibles
  const displayServices = services.length > 0 ? services : defaultServices

  // Renderizado condicional para secciones principales
  const renderServiceCards = () => {
    if (loading) {
      return (
        <div className="vet-loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando servicios veterinarios...</p>
        </div>
      )
    }
    
    if (error) {
      return (
        <div className="vet-error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
        </div>
      )
    }
    
    if (displayServices.length === 0) {
      return (
        <div className="vet-no-results">
          <i className="fas fa-search"></i>
          <p>No se encontraron servicios disponibles</p>
        </div>
      )
    }
    
    return (
      <div className="vet-services-grid">
        {displayServices.map((service) => (
          <div className="vet-service-card" key={service._id}>
            <div className="vet-service-icon">
              <i className={`fas ${service.icon || "fa-paw"}`}></i>
            </div>
            <h3>{service.name}</h3>
            <p className="vet-service-short-description">
              {service.description.length > 80 ? `${service.description.substring(0, 80)}...` : service.description}
            </p>
            <button className="vet-service-btn vet-info-btn" onClick={() => handleInfoClick(service)}>
              Más Información
            </button>
            <button
              className="vet-service-btn vet-reserve-btn"
              data-service={service.name}
              onClick={() => handleReserveClick(service)}
            >
              Reservar Cita
            </button>
          </div>
        ))}
      </div>
    )
  }

  // Función para renderizar beneficios según el servicio
  const renderBenefits = (serviceName) => {
    switch (serviceName) {
      case "Vacunación":
        return (
          <>
            <li>Protección contra enfermedades infecciosas</li>
            <li>Prevención de problemas de salud a largo plazo</li>
            <li>Cumplimiento de requisitos legales para mascotas</li>
          </>
        )
      case "Consulta General":
        return (
          <>
            <li>Evaluación completa del estado de salud</li>
            <li>Detección temprana de problemas potenciales</li>
            <li>Recomendaciones personalizadas para el cuidado</li>
          </>
        )
      case "Esterilización":
        return (
          <>
            <li>Prevención de camadas no deseadas</li>
            <li>Reducción de riesgos de cáncer y otras enfermedades</li>
            <li>Mejora del comportamiento de la mascota</li>
          </>
        )
      case "Primeros Auxilios":
        return (
          <>
            <li>Atención inmediata en situaciones de emergencia</li>
            <li>Estabilización antes de tratamientos más complejos</li>
            <li>Evaluación rápida de la gravedad de lesiones</li>
          </>
        )
      default:
        return <li>Servicio profesional con personal veterinario calificado</li>
    }
  }

  return (
    <section className="vet-services-section">
      <div className="container">
        <h2>SERVICIOS VETERINARIOS</h2>
        {renderServiceCards()}
      </div>

      {/* Sección de ubicación con mapa interactivo */}
      <div className="vet-location-container">
        <div className="container">
          <h3>NUESTRA UBICACIÓN</h3>
          <div className="vet-location-card">
            <div className="vet-card-header">
              <i className="fas fa-map-marker-alt me-2"></i> Ubicación de la Veterinaria
            </div>
            <div className="vet-card-body">
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
                  {/* Botones alternativos para abrir mapas externos */}
                  <div className="mt-3">
                    <p className="mb-2 small">
                      Si el mapa no carga correctamente, puedes abrir nuestra ubicación en:
                    </p>
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
                  <div className="vet-map-container">
                    {/* Mapa interactivo de Google Maps */}
                    <div id="vet-refuge-map" style={{ width: "100%", height: "300px", borderRadius: "8px" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Información del Servicio */}
      {showInfoModal && selectedService && (
        <div className="vet-modal" style={{ display: "block" }}>
          <div className="vet-modal-content vet-service-modal">
            <span className="vet-close" onClick={closeInfoModal}>
              &times;
            </span>
            <h2>{selectedService.name}</h2>
            <div className="vet-service-details">
              <h3>Descripción del Servicio</h3>
              <p>{selectedService.description}</p>
              <h3>Beneficios</h3>
              <ul>
                {renderBenefits(selectedService.name)}
              </ul>
            </div>
            <div className="vet-service-pricing">
              <h3>Precio del Servicio</h3>
              <p>{formatPrice(selectedService.price)}</p>
            </div>
            <button
              onClick={() => {
                closeInfoModal()
                handleReserveClick(selectedService)
              }}
            >
              Reservar Cita
            </button>
          </div>
        </div>
      )}

      {/* Modal de Reserva de Cita */}
      {showReservationModal && selectedService && (
        <ReservationModal 
          service={selectedService} 
          onClose={closeReservationModal} 
          isAuthenticated={isAuthenticated}
        />
      )}
    </section>
  )
}

export default VeterinaryServicesSection