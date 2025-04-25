"use client"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"
import dynamic from 'next/dynamic'

// Importamos el componente de mapa dinámicamente solo en el cliente
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div style={{ height: '300px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
    <p>Cargando mapa...</p>
  </div>
})

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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { t } = useLanguage()

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
          title: t("FOOD_DONATION_SUCCESS_TITLE", "donaciones"),
          text: t("FOOD_DONATION_SUCCESS_TEXT", "donaciones"),
          icon: "success",
          confirmButtonColor: "#4caf50",
          confirmButtonText: t("FOOD_DONATION_SUCCESS_BUTTON", "donaciones"),
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
          title: t("MONETARY_DONATION_ERROR_TITLE", "donaciones"),
          text: data.message || t("MONETARY_DONATION_ERROR_PROCESSING", "donaciones"),
          icon: "error",
          confirmButtonColor: "#f44336",
        })
      }
    } catch (error) {
      console.error("Error submitting donation:", error)
      window.Swal.fire({
        title: t("MONETARY_DONATION_ERROR_TITLE", "donaciones"),
        text: t("MONETARY_DONATION_ERROR_PROCESSING", "donaciones"),
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
          <h2>{t("FOOD_DONATION_TITLE", "donaciones")}</h2>
          <div className="paw-divider">
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
          </div>
          <p>{t("FOOD_DONATION_SUBTITLE", "donaciones")}</p>
        </div>

        <div className="testimonial-card">
          <div className="donation-actions">
            <button
              className="btn btn-primary donate-btn"
              onClick={isAuthenticated ? () => setShowDonationForm(true) : openLoginModal}
            >
              <i className="fas fa-heart me-1"></i> {t("FOOD_DONATION_BUTTON", "donaciones")}
            </button>
          </div>

          <div className="food-donation-info">
            <div className="food-donation-types">
              <h3>{t("FOOD_DONATION_TYPES_TITLE", "donaciones")}</h3>
              <div className="food-types-grid">
                <div className="food-type-item">
                  <i className="fas fa-bone"></i>
                  <h4>{t("FOOD_DONATION_DOG_TITLE", "donaciones")}</h4>
                  <p>{t("FOOD_DONATION_DOG_TEXT", "donaciones")}</p>
                </div>
                <div className="food-type-item">
                  <i className="fas fa-paw"></i>
                  <h4>{t("FOOD_DONATION_CAT_TITLE", "donaciones")}</h4>
                  <p>{t("FOOD_DONATION_CAT_TEXT", "donaciones")}</p>
                </div>
                <div className="food-type-item">
                  <i className="fas fa-baby"></i>
                  <h4>{t("FOOD_DONATION_PUPPY_TITLE", "donaciones")}</h4>
                  <p>{t("FOOD_DONATION_PUPPY_TEXT", "donaciones")}</p>
                </div>
                <div className="food-type-item">
                  <i className="fas fa-cat"></i>
                  <h4>{t("FOOD_DONATION_KITTEN_TITLE", "donaciones")}</h4>
                  <p>{t("FOOD_DONATION_KITTEN_TEXT", "donaciones")}</p>
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
              <h2>{t("FOOD_DONATION_FORM_TITLE", "donaciones")}</h2>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="foodType" className="form-label">
                    {t("FOOD_DONATION_FORM_TYPE_LABEL", "donaciones")}
                  </label>
                  <select
                    id="foodType"
                    name="foodType"
                    className="form-select"
                    value={formData.foodType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="dog-food">{t("FOOD_DONATION_FORM_TYPE_DOG", "donaciones")}</option>
                    <option value="cat-food">{t("FOOD_DONATION_FORM_TYPE_CAT", "donaciones")}</option>
                    <option value="puppy-food">{t("FOOD_DONATION_FORM_TYPE_PUPPY", "donaciones")}</option>
                    <option value="kitten-food">{t("FOOD_DONATION_FORM_TYPE_KITTEN", "donaciones")}</option>
                    <option value="special-diet">{t("FOOD_DONATION_FORM_TYPE_SPECIAL", "donaciones")}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="quantity" className="form-label">
                    {t("FOOD_DONATION_FORM_QUANTITY_LABEL", "donaciones")}
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    className="form-control"
                    placeholder={t("FOOD_DONATION_FORM_QUANTITY_PLACEHOLDER", "donaciones")}
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="donorName" className="form-label">
                    {t("MONETARY_DONATION_FORM_NAME", "donaciones")}
                  </label>
                  <input
                    type="text"
                    id="donorName"
                    name="donorName"
                    className="form-control"
                    placeholder={t("MONETARY_DONATION_FORM_NAME_PLACEHOLDER", "donaciones")}
                    value={formData.donorName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="donorEmail" className="form-label">
                    {t("MONETARY_DONATION_FORM_EMAIL", "donaciones")}
                  </label>
                  <input
                    type="email"
                    id="donorEmail"
                    name="donorEmail"
                    className="form-control"
                    placeholder={t("MONETARY_DONATION_FORM_EMAIL_PLACEHOLDER", "donaciones")}
                    value={formData.donorEmail}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="donorPhone" className="form-label">
                    {t("MONETARY_DONATION_FORM_PHONE", "donaciones")}
                  </label>
                  <input
                    type="tel"
                    id="donorPhone"
                    name="donorPhone"
                    className="form-control"
                    placeholder={t("MONETARY_DONATION_FORM_PHONE_PLACEHOLDER", "donaciones")}
                    value={formData.donorPhone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t("FOOD_DONATION_DELIVERY_OPTIONS", "donaciones")}</label>
                  <div className="delivery-options">
                    <button
                      type="button"
                      className={`delivery-option btn ${deliveryOption === "self" ? "btn-primary" : "btn-outline-primary"} me-2`}
                      onClick={() => handleDeliveryOptionClick("self")}
                    >
                      <i className="fas fa-hand-holding-heart me-1"></i> {t("FOOD_DONATION_DELIVERY_SELF", "donaciones")}
                    </button>
                    <button
                      type="button"
                      className={`delivery-option btn ${deliveryOption === "pickup" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => handleDeliveryOptionClick("pickup")}
                    >
                      <i className="fas fa-truck me-1"></i> {t("FOOD_DONATION_DELIVERY_PICKUP", "donaciones")}
                    </button>
                  </div>
                </div>

                {/* Mostrar ubicación del refugio con Leaflet si selecciona entrega personal */}
                {deliveryOption === "self" && (
                  <div id="shelter-location" className="form-group">
                    <div className="card">
                      <div className="card-header bg-success text-white">
                        <i className="fas fa-map-marker-alt me-2"></i> {t("FOOD_DONATION_SHELTER_LOCATION", "donaciones")}
                      </div>
                      <div className="card-body">
                        <p>
                          <strong>{t("FOOD_DONATION_SHELTER_ADDRESS", "donaciones").split(":")[0]}:</strong> {t("FOOD_DONATION_SHELTER_ADDRESS", "donaciones").split(":")[1]}
                        </p>
                        <p>
                          <strong>{t("FOOD_DONATION_SHELTER_HOURS", "donaciones").split(":")[0]}:</strong> {t("FOOD_DONATION_SHELTER_HOURS", "donaciones").split(":")[1]}
                        </p>
                        <p>
                          <strong>{t("FOOD_DONATION_SHELTER_PHONE", "donaciones").split(":")[0]}:</strong> {t("FOOD_DONATION_SHELTER_PHONE", "donaciones").split(":")[1]}
                        </p>
                        <div className="map-container">
                          {/* Componente de mapa Leaflet */}
                          <MapComponent position={[refugeLocation.lat, refugeLocation.lng]} />
                        </div>
                        <div className="mt-3 text-center">
                          <p className="mb-2 small">
                            {t("FOOD_DONATION_MAP_TEXT", "donaciones")}
                          </p>
                          <a
                            href="https://maps.apple.com/?ll=1.482825,-75.435075&q=Montañita+Adopta"
                            className="btn btn-sm btn-outline-secondary me-2"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="fab fa-apple me-1"></i> {t("FOOD_DONATION_MAP_APPLE", "donaciones")}
                          </a>
                          <a
                            href="https://www.google.com/maps?q=1.482825,-75.435075"
                            className="btn btn-sm btn-outline-secondary"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="fab fa-google me-1"></i> {t("FOOD_DONATION_MAP_GOOGLE", "donaciones")}
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
                        <i className="fas fa-truck me-2"></i> {t("FOOD_DONATION_PICKUP_INFO", "donaciones")}
                      </div>
                      <div className="card-body">
                        <div className="form-group">
                          <label htmlFor="pickupCity" className="form-label">
                            {t("FOOD_DONATION_PICKUP_CITY_LABEL", "donaciones")}
                          </label>
                          <select
                            id="pickupCity"
                            name="pickupCity"
                            className="form-select"
                            value={formData.pickupCity}
                            onChange={handlePickupCityChange}
                          >
                            <option value="mismo-ciudad">{t("FOOD_DONATION_PICKUP_CITY_SAME", "donaciones")}</option>
                            <option value="otra-ciudad">{t("FOOD_DONATION_PICKUP_CITY_OTHER", "donaciones")}</option>
                          </select>
                        </div>

                        {formData.pickupCity === "mismo-ciudad" && (
                          <div id="local-pickup" className="form-group">
                            <label htmlFor="pickupAddress" className="form-label">
                              {t("FOOD_DONATION_PICKUP_ADDRESS_LABEL", "donaciones")}
                            </label>
                            <input
                              type="text"
                              id="pickupAddress"
                              name="pickupAddress"
                              className="form-control"
                              placeholder={t("FOOD_DONATION_PICKUP_ADDRESS_PLACEHOLDER", "donaciones")}
                              value={formData.pickupAddress}
                              onChange={handleInputChange}
                              required
                            />
                            <small className="text-muted">
                              {t("FOOD_DONATION_PICKUP_TIME", "donaciones")}
                            </small>
                          </div>
                        )}

                        {formData.pickupCity === "otra-ciudad" && (
                          <div id="remote-pickup" className="form-group">
                            <div className="alert alert-info">
                              <i className="fas fa-info-circle me-2"></i> {t("FOOD_DONATION_REMOTE_INFO", "donaciones")}
                              <hr />
                              <p>
                                <strong>{t("FOOD_DONATION_REMOTE_ADDRESS", "donaciones").split(":")[0]}:</strong> {t("FOOD_DONATION_REMOTE_ADDRESS", "donaciones").split(":")[1]}
                              </p>
                              <p>
                                <strong>{t("FOOD_DONATION_REMOTE_CITY", "donaciones").split(":")[0]}:</strong> {t("FOOD_DONATION_REMOTE_CITY", "donaciones").split(":")[1]}
                              </p>
                              <p>
                                <strong>{t("FOOD_DONATION_REMOTE_NAME", "donaciones").split(":")[0]}:</strong> {t("FOOD_DONATION_REMOTE_NAME", "donaciones").split(":")[1]}
                              </p>
                              <p>
                                <strong>{t("FOOD_DONATION_REMOTE_PHONE", "donaciones").split(":")[0]}:</strong> {t("FOOD_DONATION_REMOTE_PHONE", "donaciones").split(":")[1]}
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
                    {t("MONETARY_DONATION_FORM_MESSAGE", "donaciones")}
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    className="form-control"
                    placeholder={t("MONETARY_DONATION_FORM_MESSAGE_PLACEHOLDER", "donaciones")}
                    value={formData.notes}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting || !deliveryOption}>
                    {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : t("FOOD_DONATION_BUTTON_SUBMIT", "donaciones")}
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
                    {t("FOOD_DONATION_BUTTON_CANCEL", "donaciones")}
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