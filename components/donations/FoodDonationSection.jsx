"use client"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

const FoodDonation = () => {
  const [deliveryOption, setDeliveryOption] = useState("")
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [formData, setFormData] = useState({
    type: "food",
    foodType: "dog-food",
    quantity: "",
    deliveryOption: "",
    pickupAddress: "",
    pickupCity: "mismo-ciudad",
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Coordenadas del refugio
  const refugeLocation = { lat: 1.482825, lng: -75.435075 }

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        const data = await response.json()

        if ((data.authenticated || data.isAuthenticated) && data.user) {
          setIsAuthenticated(true)
          setUserData(data.user)

          // Prellenar el formulario con datos del usuario
          setFormData((prev) => ({
            ...prev,
            donorName: data.user.name || data.user.nombre || prev.donorName,
            donorEmail: data.user.email || prev.donorEmail,
          }))
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    // Cargar el mapa cuando se muestre la sección de entrega personal
    if (deliveryOption === "self" && !mapLoaded && showDonationForm) {
      const loadMap = () => {
        if (window.google && window.google.maps) {
          initMap()
        } else {
          const script = document.createElement("script")
          script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBDaeWicvigtP9xPv919E-RNoxfvC-Hqik&callback=initGoogleMap`
          script.async = true
          script.defer = true
          document.head.appendChild(script)
          window.initGoogleMap = initMap
        }
      }

      const initMap = () => {
        const mapElement = document.getElementById("refuge-map")
        if (mapElement) {
          const newMap = new window.google.maps.Map(mapElement, {
            center: refugeLocation,
            zoom: 15,
            mapTypeId: "roadmap",
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
          })

          // Añadir un marcador para el refugio
          const marker = new window.google.maps.Marker({
            position: refugeLocation,
            map: newMap,
            title: "Montañita Adopta",
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
                <h3 style="margin-top: 0; color: #e01e1e; font-size: 16px;">Montañita Adopta</h3>
                <p style="margin-bottom: 5px;"><strong>Dirección:</strong> carrera 5 calle 8a #04, barrio guillermo escobar</p>
                <p style="margin-bottom: 5px;"><strong>Teléfono:</strong> 3166532433</p>
                <p style="margin-bottom: 0;"><strong>Horario:</strong> Lunes a Viernes 9:00 AM - 5:00 PM</p>
              </div>
            `,
          })

          marker.addListener("click", () => {
            infowindow.open(newMap, marker)
          })

          setMapLoaded(true)
        }
      }

      loadMap()
    }
  }, [deliveryOption, mapLoaded, showDonationForm])

  const handleDeliveryOptionClick = (option) => {
    // Verificar si el usuario está autenticado
    if (!isAuthenticated) {
      // Abrir el modal de login
      document.dispatchEvent(new CustomEvent("open-login-modal"))
      window.dispatchEvent(new CustomEvent("open-login-modal"))
      return
    }

    setDeliveryOption(option)
    setFormData({
      ...formData,
      deliveryOption: option,
    })
  }

  const handlePickupCityChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      pickupCity: value,
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Verificar si el usuario está autenticado
    if (!isAuthenticated) {
      document.dispatchEvent(new CustomEvent("open-login-modal"))
      window.dispatchEvent(new CustomEvent("open-login-modal"))
      return
    }

    setIsSubmitting(true)

    try {
      // Asegurarse de que deliveryOption esté establecido
      const submitData = {
        ...formData,
        deliveryOption: formData.deliveryOption || deliveryOption || "self"
      }

      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (data.success) {
        window.Swal.fire({
          title: "¡Gracias por tu donación!",
          text: "Tu donación de alimentos ha sido registrada correctamente. Nos pondremos en contacto contigo pronto para coordinar los detalles.",
          icon: "success",
          confirmButtonColor: "#4caf50",
          confirmButtonText: "Entendido",
        })

        // Resetear el formulario
        setFormData({
          type: "food",
          foodType: "dog-food",
          quantity: "",
          deliveryOption: "",
          pickupAddress: "",
          pickupCity: "mismo-ciudad",
          donorName: userData ? userData.name || userData.nombre : "",
          donorEmail: userData ? userData.email : "",
          donorPhone: "",
          notes: "",
        })
        setDeliveryOption("")
        setShowDonationForm(false)
      } else {
        window.Swal.fire({
          title: "Error",
          text: data.message || "Error al procesar la donación",
          icon: "error",
          confirmButtonColor: "#f44336",
        })
      }
    } catch (error) {
      console.error("Error submitting donation:", error)
      window.Swal.fire({
        title: "Error",
        text: "Error al procesar la donación. Por favor, intenta de nuevo.",
        icon: "error",
        confirmButtonColor: "#f44336",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para abrir el modal de login
  const openLoginModal = () => {
    document.dispatchEvent(new CustomEvent("open-login-modal"))
    window.dispatchEvent(new CustomEvent("open-login-modal"))
  }

  return (
    <section id="donacion-alimentos" className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <h2>Donación de Alimentos</h2>
          <div className="paw-divider">
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
          </div>
          <p>Ayuda a alimentar a nuestros rescatados con comida de calidad.</p>
        </div>

        <div className="testimonial-card">
          <div className="donation-actions">
            <button
              className="btn btn-primary donate-btn"
              onClick={isAuthenticated ? () => setShowDonationForm(true) : openLoginModal}
            >
              <i className="fas fa-heart me-1"></i> Registrar Donación de Alimentos
            </button>
          </div>

          <div className="food-donation-info">
            <div className="food-donation-types">
              <h3>Tipos de alimentos que necesitamos:</h3>
              <div className="food-types-grid">
                <div className="food-type-item">
                  <i className="fas fa-bone"></i>
                  <h4>Comida para Perros</h4>
                  <p>Alimento seco o húmedo para perros adultos.</p>
                </div>
                <div className="food-type-item">
                  <i className="fas fa-paw"></i>
                  <h4>Comida para Gatos</h4>
                  <p>Alimento seco o húmedo para gatos adultos.</p>
                </div>
                <div className="food-type-item">
                  <i className="fas fa-baby"></i>
                  <h4>Comida para Cachorros</h4>
                  <p>Alimento especial para cachorros en crecimiento.</p>
                </div>
                <div className="food-type-item">
                  <i className="fas fa-cat"></i>
                  <h4>Comida para Gatitos</h4>
                  <p>Alimento especial para gatitos en crecimiento.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de formulario de donación de alimentos */}
        {showDonationForm && (
          <div className="donation-modal">
            <div className="donation-modal-content">
              <span className="close" onClick={() => {
                setShowDonationForm(false);
                setDeliveryOption("");
              }}>
                &times;
              </span>
              <h2>Formulario de Donación de Alimentos</h2>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="foodType" className="form-label">
                    Tipo de Alimento:
                  </label>
                  <select
                    id="foodType"
                    name="foodType"
                    className="form-select"
                    value={formData.foodType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="dog-food">Comida para Perros</option>
                    <option value="cat-food">Comida para Gatos</option>
                    <option value="puppy-food">Comida para Cachorros</option>
                    <option value="kitten-food">Comida para Gatitos</option>
                    <option value="special-diet">Dietas Especiales/Medicadas</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="quantity" className="form-label">
                    Cantidad (Kg):
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    className="form-control"
                    placeholder="Ej. 5, 10, 20"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="donorName" className="form-label">
                    Tu Nombre:
                  </label>
                  <input
                    type="text"
                    id="donorName"
                    name="donorName"
                    className="form-control"
                    placeholder="Nombre completo"
                    value={formData.donorName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="donorEmail" className="form-label">
                    Correo Electrónico:
                  </label>
                  <input
                    type="email"
                    id="donorEmail"
                    name="donorEmail"
                    className="form-control"
                    placeholder="correo@ejemplo.com"
                    value={formData.donorEmail}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="donorPhone" className="form-label">
                    Teléfono:
                  </label>
                  <input
                    type="tel"
                    id="donorPhone"
                    name="donorPhone"
                    className="form-control"
                    placeholder="Ej. 3001234567"
                    value={formData.donorPhone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Opciones de entrega:</label>
                  <div className="delivery-options">
                    <button
                      type="button"
                      className={`delivery-option btn ${deliveryOption === "self" ? "btn-primary" : "btn-outline-primary"} me-2`}
                      onClick={() => handleDeliveryOptionClick("self")}
                    >
                      <i className="fas fa-hand-holding-heart me-1"></i> Entregaré personalmente
                    </button>
                    <button
                      type="button"
                      className={`delivery-option btn ${deliveryOption === "pickup" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => handleDeliveryOptionClick("pickup")}
                    >
                      <i className="fas fa-truck me-1"></i> Solicitar recogida
                    </button>
                  </div>
                </div>

                {/* Mostrar ubicación del refugio si selecciona entrega personal */}
                {deliveryOption === "self" && (
                  <div id="shelter-location" className="form-group">
                    <div className="card">
                      <div className="card-header bg-success text-white">
                        <i className="fas fa-map-marker-alt me-2"></i> Ubicación del Refugio
                      </div>
                      <div className="card-body">
                        <p>
                          <strong>Dirección:</strong> carrera 5 calle 8a #04, barrio guillermo escobar
                        </p>
                        <p>
                          <strong>Horarios de recepción:</strong> Lunes a Viernes de 9:00 AM a 5:00 PM
                        </p>
                        <p>
                          <strong>Teléfono:</strong> 3166532433
                        </p>
                        <div className="map-container">
                          <div id="refuge-map" style={{ width: "100%", height: "300px", borderRadius: "8px" }}></div>
                        </div>
                        <div className="mt-3 text-center">
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
                    </div>
                  </div>
                )}

                {/* Formulario para recogida */}
                {deliveryOption === "pickup" && (
                  <div id="pickup-address" className="form-group">
                    <div className="card">
                      <div className="card-header bg-primary text-white">
                        <i className="fas fa-truck me-2"></i> Información para la recogida
                      </div>
                      <div className="card-body">
                        <div className="form-group">
                          <label htmlFor="pickupCity" className="form-label">
                            Ciudad:
                          </label>
                          <select
                            id="pickupCity"
                            name="pickupCity"
                            className="form-select"
                            value={formData.pickupCity}
                            onChange={handlePickupCityChange}
                          >
                            <option value="mismo-ciudad">Misma ciudad del refugio</option>
                            <option value="otra-ciudad">Otra ciudad</option>
                          </select>
                        </div>

                        {formData.pickupCity === "mismo-ciudad" && (
                          <div id="local-pickup" className="form-group">
                            <label htmlFor="pickupAddress" className="form-label">
                              Dirección para recogida:
                            </label>
                            <input
                              type="text"
                              id="pickupAddress"
                              name="pickupAddress"
                              className="form-control"
                              placeholder="Ingresa tu dirección completa"
                              value={formData.pickupAddress}
                              onChange={handleInputChange}
                              required
                            />
                            <small className="text-muted">
                              Recogeremos la donación en los próximos 2-3 días hábiles.
                            </small>
                          </div>
                        )}

                        {formData.pickupCity === "otra-ciudad" && (
                          <div id="remote-pickup" className="form-group">
                            <div className="alert alert-info">
                              <i className="fas fa-info-circle me-2"></i> Para donaciones desde otras ciudades, puedes
                              enviar los alimentos a nuestra dirección:
                              <hr />
                              <p>
                                <strong>Dirección:</strong> carrera 5 calle 8a #04, barrio guillermo escobar
                              </p>
                              <p>
                                <strong>Ciudad:</strong> La Montañita, Caqueta
                              </p>
                              <p>
                                <strong>A nombre de:</strong> Montañita Adopta
                              </p>
                              <p>
                                <strong>Teléfono:</strong> 3166532433
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="notes" className="form-label">
                    Mensaje (opcional):
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    className="form-control"
                    placeholder="¿Quieres dejarnos un mensaje?"
                    value={formData.notes}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting || !deliveryOption}>
                    {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : "Registrar Donación"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowDonationForm(false)
                      setDeliveryOption("")
                    }}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default FoodDonation