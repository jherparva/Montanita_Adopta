"use client"
import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

const MonetaryDonation = () => {
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [showEvidenceModal, setShowEvidenceModal] = useState(false)
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
  const [evidenceFile, setEvidenceFile] = useState(null)
  const [evidencePreview, setEvidencePreview] = useState("")
  const [currentDonationId, setCurrentDonationId] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef(null)
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        const data = await response.json()

        if ((data.authenticated || data.isAuthenticated) && data.user) {
          setIsAuthenticated(true)
          setUserData(data.user)

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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEvidenceChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEvidenceFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setEvidencePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      document.dispatchEvent(new CustomEvent("open-login-modal"))
      window.dispatchEvent(new CustomEvent("open-login-modal"))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        if (data.donationId) {
          setCurrentDonationId(data.donationId)
        }

        setShowDonationForm(false)

        window.Swal.fire({
          title: "¡Donación Registrada!",
          text: "Tu donación ha sido registrada correctamente. ¿Deseas subir un comprobante de pago?",
          icon: "success",
          showCancelButton: true,
          confirmButtonColor: "#4caf50",
          cancelButtonColor: "#f44336",
          confirmButtonText: "Sí, subir comprobante",
          cancelButtonText: "No, más tarde",
        }).then((result) => {
          if (result.isConfirmed) {
            setShowEvidenceModal(true)
          } else {
            window.Swal.fire({
              title: "¡Gracias por tu donación!",
              text: "Tu generosidad nos ayuda a seguir rescatando y cuidando animales necesitados.",
              icon: "success",
              confirmButtonColor: "#4caf50",
            })
            resetForm()
          }
        })
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

  const handleEvidenceSubmit = async (e) => {
    e.preventDefault()

    if (!evidenceFile) {
      window.Swal.fire({
        title: "Error",
        text: "Por favor, selecciona un archivo de comprobante",
        icon: "warning",
        confirmButtonColor: "#f44336",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("file", evidenceFile)

      if (currentDonationId) {
        formData.append("donationId", String(currentDonationId))
      }

      const response = await fetch("/api/donations/evidence", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setShowEvidenceModal(false)

        window.Swal.fire({
          title: "¡Comprobante Recibido!",
          text: "Gracias por enviar tu comprobante. Tu donación será verificada pronto.",
          icon: "success",
          confirmButtonColor: "#4caf50",
        })

        resetForm()
      } else {
        window.Swal.fire({
          title: "Error",
          text: data.message || "Error al subir el comprobante",
          icon: "error",
          confirmButtonColor: "#f44336",
        })
      }
    } catch (error) {
      console.error("Error uploading evidence:", error)
      window.Swal.fire({
        title: "Error",
        text: "Error al subir el comprobante. Por favor, intenta de nuevo.",
        icon: "error",
        confirmButtonColor: "#f44336",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      type: "monetary",
      amount: "",
      paymentMethod: "nequi",
      donorName: userData ? userData.name || userData.nombre : "",
      donorEmail: userData ? userData.email : "",
      donorPhone: "",
      notes: "",
    })
    setEvidenceFile(null)
    setEvidencePreview("")
    setShowEvidenceModal(false)
    setShowDonationForm(false)
    setCurrentDonationId(null)
  }

  const handlePaymentMethodClick = (method) => {
    if (!isAuthenticated) {
      document.dispatchEvent(new CustomEvent("open-login-modal"))
      window.dispatchEvent(new CustomEvent("open-login-modal"))
      return
    }

    setFormData(prev => ({
      ...prev,
      paymentMethod: method,
    }))
    setShowDonationForm(true)
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
              <button className="btn btn-primary donate-btn" onClick={() => handlePaymentMethodClick("nequi")}>
                <i className="fas fa-heart me-1"></i> Donar con Nequi
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
              <button className="btn btn-primary donate-btn" onClick={() => handlePaymentMethodClick("banco-bogota")}>
                <i className="fas fa-heart me-1"></i> Donar por Transferencia
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
              <button className="btn btn-primary donate-btn" onClick={() => handlePaymentMethodClick("paypal")}>
                <i className="fas fa-heart me-1"></i> Donar con PayPal
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
              <p className="donation-method-selected">
                Método de pago seleccionado:{" "}
                <strong>
                  {formData.paymentMethod === "nequi"
                    ? "Nequi"
                    : formData.paymentMethod === "banco-bogota"
                      ? "Banco de Bogotá"
                      : "PayPal"}
                </strong>
              </p>
              <form onSubmit={handleSubmit}>
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

                <div className="payment-instructions">
                  <h4>Instrucciones de Pago:</h4>
                  {formData.paymentMethod === "nequi" && (
                    <div className="instruction-steps">
                      <p>1. Abre tu aplicación Nequi</p>
                      <p>
                        2. Selecciona "Enviar" y envía tu donación al número: <strong>3166532433</strong>
                      </p>
                      <p>3. Toma una captura de pantalla del comprobante</p>
                      <p>4. Completa este formulario y envíalo</p>
                      <p>5. Sube el comprobante en el siguiente paso</p>
                    </div>
                  )}
                  {formData.paymentMethod === "banco-bogota" && (
                    <div className="instruction-steps">
                      <p>
                        1. Realiza una transferencia a la cuenta de ahorros: <strong>312334428</strong>
                      </p>
                      <p>2. Titular: Montañita Adopta</p>
                      <p>3. Guarda el comprobante de la transferencia</p>
                      <p>4. Completa este formulario y envíalo</p>
                      <p>5. Sube el comprobante en el siguiente paso</p>
                    </div>
                  )}
                  {formData.paymentMethod === "paypal" && (
                    <div className="instruction-steps">
                      <p>1. Escanea el código QR con tu aplicación PayPal o visita nuestro enlace de donación</p>
                      <p>2. Completa la donación en PayPal</p>
                      <p>3. Guarda el comprobante o toma una captura de pantalla</p>
                      <p>4. Completa este formulario y envíalo</p>
                      <p>5. Sube el comprobante en el siguiente paso</p>
                    </div>
                  )}
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

        {showEvidenceModal && (
          <div className="donation-modal">
            <div className="donation-modal-content">
              <span className="close" onClick={() => setShowEvidenceModal(false)}>
                &times;
              </span>
              <h2>Subir Comprobante de Donación</h2>
              <p>Por favor, sube una imagen o captura de pantalla de tu comprobante de donación.</p>

              <form onSubmit={handleEvidenceSubmit}>
                <div className="form-group">
                  <label htmlFor="evidence-file">Seleccionar archivo:</label>
                  <input
                    type="file"
                    id="evidence-file"
                    name="evidence"
                    accept="image/*"
                    onChange={handleEvidenceChange}
                    ref={fileInputRef}
                    className="file-input"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-file-select"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <i className="fas fa-file-upload me-1"></i> Seleccionar Archivo
                  </button>
                </div>

                {evidencePreview && (
                  <div className="evidence-preview">
                    <h4>Vista previa:</h4>
                    <img src={evidencePreview} alt="Vista previa del comprobante" />
                  </div>
                )}

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting || !evidenceFile}>
                    {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : "Enviar Comprobante"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEvidenceModal(false)}
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