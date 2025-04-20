"use client"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

const FoodDonation = () => {
  const [deliveryOption, setDeliveryOption] = useState("")
  const [pickupCity, setPickupCity] = useState("mismo-ciudad")
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
  const [showThankYou, setShowThankYou] = useState(false)
  const { toast } = useToast()

  const handleDeliveryOptionClick = (option) => {
    setDeliveryOption(option)
    setFormData(prev => ({
      ...prev,
      deliveryOption: option,
    }))
  }

  const handlePickupCityChange = (e) => {
    const value = e.target.value
    setPickupCity(value)
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

  const resetForm = () => {
    setFormData({
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
    setDeliveryOption("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "¡Gracias por tu donación!",
          description: "Tu donación ha sido registrada correctamente.",
        })
        setShowThankYou(true)
        setShowDonationForm(false)
        resetForm()
      } else {
        toast({
          title: "Error",
          description: data.message || "Error al procesar la donación",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting donation:", error)
      toast({
        title: "Error",
        description: "Error al procesar la donación. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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

        {showThankYou && (
          <div className="thank-you-message">
            <div className="thank-you-content">
              <i className="fas fa-heart thank-you-icon"></i>
              <h3>¡Gracias por tu generosidad!</h3>
              <p>
                Tu donación de alimentos nos ayudará a mantener bien alimentados a nuestros rescatados. Nos pondremos en
                contacto contigo pronto para coordinar los detalles.
              </p>
              <button className="btn btn-secondary mt-3" onClick={() => setShowThankYou(false)}>
                Cerrar
              </button>
            </div>
          </div>
        )}

        <div className="testimonial-card">
          <div className="donation-actions">
            <button className="btn btn-primary donate-btn" onClick={() => setShowDonationForm(true)}>
              <i className="fas fa-heart me-1"></i> Registrar Donación de Alimentos
            </button>
          </div>
        </div>

        {showDonationForm && (
          <div className="donation-modal">
            <div className="donation-modal-content">
              <span className="close" onClick={() => setShowDonationForm(false)}>
                &times;
              </span>
              <h2>Registrar Donación de Alimentos</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="foodType">Tipo de Alimento:</label>
                  <select id="foodType" name="foodType" value={formData.foodType} onChange={handleInputChange} required>
                    <option value="dog-food">Comida para Perros</option>
                    <option value="cat-food">Comida para Gatos</option>
                    <option value="puppy-food">Comida para Cachorros</option>
                    <option value="kitten-food">Comida para Gatitos</option>
                    <option value="special-diet">Dietas Especiales/Medicadas</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="quantity">Cantidad (Kg):</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="Ej. 5, 10, 20"
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Opciones de entrega:</label>
                  <div className="delivery-options">
                    <button
                      type="button"
                      className={`delivery-option btn ${
                        formData.deliveryOption === "self" ? "btn-primary" : "btn-outline-primary"
                      } me-2`}
                      onClick={() => handleDeliveryOptionClick("self")}
                    >
                      <i className="fas fa-hand-holding-heart me-1"></i> Entregaré personalmente
                    </button>
                    <button
                      type="button"
                      className={`delivery-option btn ${
                        formData.deliveryOption === "pickup" ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => handleDeliveryOptionClick("pickup")}
                    >
                      <i className="fas fa-truck me-1"></i> Solicitar recogida
                    </button>
                  </div>
                </div>

                {formData.deliveryOption === "self" && (
                  <div className="form-group">
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
                          <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3986.7971416573864!2d-75.435075!3d1.482825!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMjgnNTguMiJOIDc1wrAyNicwNi4zIlc!5e0!3m2!1ses!2sco!4v1710619500000!5m2!1ses!2sco"
                            width="100%"
                            height="200"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          ></iframe>
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

                {formData.deliveryOption === "pickup" && (
                  <div className="form-group">
                    <div className="card">
                      <div className="card-header bg-primary text-white">
                        <i className="fas fa-truck me-2"></i> Información para la recogida
                      </div>
                      <div className="card-body">
                        <div className="form-group mb-3">
                          <label htmlFor="pickup-city">Ciudad:</label>
                          <select
                            id="pickup-city"
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
                          <div className="form-group mb-3">
                            <label htmlFor="pickupAddress">Dirección para recogida:</label>
                            <input
                              type="text"
                              id="pickupAddress"
                              name="pickupAddress"
                              value={formData.pickupAddress}
                              onChange={handleInputChange}
                              className="form-control"
                              placeholder="Ingresa tu dirección completa"
                              required
                            />
                            <small className="text-muted">Recogeremos la donación en los próximos 2-3 días hábiles.</small>
                          </div>
                        )}

                        {formData.pickupCity === "otra-ciudad" && (
                          <div className="form-group mb-3">
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
                  <label htmlFor="donorName">Tu Nombre:</label>
                  <input
                    type="text"
                    id="donorName"
                    name="donorName"
                    value={formData.donorName}
                    onChange={handleInputChange}
                    placeholder="Nombre completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="donorEmail">Correo Electrónico:</label>
                  <input
                    type="email"
                    id="donorEmail"
                    name="donorEmail"
                    value={formData.donorEmail}
                    onChange={handleInputChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="donorPhone">Teléfono:</label>
                  <input
                    type="tel"
                    id="donorPhone"
                    name="donorPhone"
                    value={formData.donorPhone}
                    onChange={handleInputChange}
                    placeholder="Ej. 3001234567"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Mensaje (opcional):</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="¿Quieres dejarnos un mensaje?"
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : "Registrar Donación"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDonationForm(false)}
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