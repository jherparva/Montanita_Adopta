"use client"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

const MonetaryDonation = () => {
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [formData, setFormData] = useState({
    type: "monetary",
    amount: "",
    paymentMethod: "nequi",
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      type: "monetary",
      amount: "",
      paymentMethod: "nequi",
      donorName: "",
      donorEmail: "",
      donorPhone: "",
      notes: "",
    })
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

  const handleSendEvidence = () => {
    window.open("https://wa.me/+573166532433", "_blank")
  }

  return (
    <section id="donacion-monetaria" className="about-section">
      <div className="container">
        <div className="section-header">
          <h2>Opciones de Donación</h2>
          <div className="paw-divider">
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
          </div>
          <p>Tu aporte económico es vital para mantener nuestros rescates y cuidados veterinarios.</p>
        </div>

        {showThankYou && (
          <div className="thank-you-message">
            <div className="thank-you-content">
              <i className="fas fa-heart thank-you-icon"></i>
              <h3>¡Gracias por tu generosidad!</h3>
              <p>
                Tu donación nos ayudará a seguir rescatando y cuidando a animales necesitados. Por favor, envía el
                comprobante de tu donación a través de WhatsApp para que podamos confirmarla.
              </p>
              <button className="btn btn-success send-evidence mt-3" onClick={handleSendEvidence}>
                <i className="fab fa-whatsapp me-1"></i> Enviar comprobante
              </button>
              <button className="btn btn-secondary mt-3" onClick={() => setShowThankYou(false)}>
                Cerrar
              </button>
            </div>
          </div>
        )}

        <div className="donation-info-card">
          <h3>¿En qué se utilizan tus donaciones?</h3>
          <div className="donation-usage">
            <div className="usage-item">
              <i className="fas fa-medkit"></i>
              <h4>Atención Veterinaria</h4>
              <p>Vacunas, desparasitación, esterilización y tratamientos médicos para animales rescatados.</p>
            </div>
            <div className="usage-item">
              <i className="fas fa-utensils"></i>
              <h4>Alimentación</h4>
              <p>Alimento de calidad para todos los animales bajo nuestro cuidado.</p>
            </div>
            <div className="usage-item">
              <i className="fas fa-home"></i>
              <h4>Refugio</h4>
              <p>Mantenimiento de instalaciones, camas, cobijas y elementos de higiene.</p>
            </div>
          </div>
        </div>

        <div className="about-grid">
          <div className="about-card payment-method" id="nequi">
            <div className="about-icon">
              <i className="fas fa-mobile-alt"></i>
            </div>
            <h3>Nequi</h3>
            <p>Envía tu donación a:</p>
            <p className="payment-number">📱 3166532433</p>
            <div className="payment-actions">
              <button className="btn btn-primary donate-btn" onClick={() => setShowDonationForm(true)}>
                <i className="fas fa-heart me-1"></i> Registrar Donación
              </button>
              <button className="btn btn-success send-evidence mt-2" onClick={handleSendEvidence}>
                <i className="fab fa-whatsapp me-1"></i> Enviar comprobante
              </button>
            </div>
          </div>

          <div className="about-card payment-method" id="banco-bogota">
            <div className="about-icon">
              <i className="fas fa-university"></i>
            </div>
            <h3>Banco de Bogotá</h3>
            <p>Transfiere tu donación a la cuenta de ahorros:</p>
            <p className="payment-number">🏦 312334428</p>
            <div className="payment-actions">
              <button className="btn btn-primary donate-btn" onClick={() => setShowDonationForm(true)}>
                <i className="fas fa-heart me-1"></i> Registrar Donación
              </button>
              <button className="btn btn-success send-evidence mt-2" onClick={handleSendEvidence}>
                <i className="fab fa-whatsapp me-1"></i> Enviar comprobante
              </button>
            </div>
          </div>

          <div className="about-card payment-method" id="paypal">
            <div className="about-icon">
              <i className="fab fa-paypal"></i>
            </div>
            <h3>PayPal</h3>
            <p>Escanea el siguiente código QR para donar:</p>
            <img src="/imagenes/codigo_qr_paypal.png" alt="Código QR PayPal" className="qr-code" />
            <div className="payment-actions">
              <button className="btn btn-primary donate-btn" onClick={() => setShowDonationForm(true)}>
                <i className="fas fa-heart me-1"></i> Registrar Donación
              </button>
              <button className="btn btn-success send-evidence mt-2" onClick={handleSendEvidence}>
                <i className="fab fa-whatsapp me-1"></i> Enviar comprobante
              </button>
            </div>
          </div>
        </div>

        {showDonationForm && (
          <div className="donation-modal">
            <div className="donation-modal-content">
              <span className="close" onClick={() => setShowDonationForm(false)}>
                &times;
              </span>
              <h2>Registrar Donación</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="paymentMethod">Método de Pago:</label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="nequi">Nequi</option>
                    <option value="banco-bogota">Banco de Bogotá</option>
                    <option value="paypal">PayPal</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="amount">Monto de la Donación (COP):</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Ej. 50000"
                    required
                    min="1000"
                  />
                </div>

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

export default MonetaryDonation