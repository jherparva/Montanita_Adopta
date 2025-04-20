"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

const SponsorForm = ({ user, animals, onClose }) => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    sponsorName: user?.nombre || user?.name || "",
    sponsorEmail: user?.email || "",
    sponsorPhone: user?.telefono || user?.phone || "",
    animalId: "",
    sponsorshipType: "monthly",
    amount: "",
    suppliesDescription: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validaciones
      if (!formData.animalId) {
        throw new Error("Por favor, selecciona un animal para apadrinar")
      }

      if (formData.sponsorshipType !== "supplies" && (!formData.amount || formData.amount <= 0)) {
        throw new Error("Por favor, ingresa un monto válido")
      }

      if (formData.sponsorshipType === "supplies" && !formData.suppliesDescription) {
        throw new Error("Por favor, describe los suministros que donarás")
      }

      const response = await fetch("/api/volunteer/sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al procesar la solicitud")
      }

      if (window.Swal) {
        window.Swal.fire({
          title: "¡Gracias por tu apadrinamiento!",
          text: "Tu solicitud ha sido registrada correctamente. Nos pondremos en contacto contigo pronto para coordinar los detalles.",
          icon: "success",
          confirmButtonColor: "#4caf50",
        }).then(() => {
          if (onClose) onClose()
          router.push("/voluntario")
        })
      } else {
        setSuccess(true)
        setTimeout(() => {
          if (onClose) onClose()
          router.push("/voluntario")
        }, 3000)
      }
    } catch (err) {
      console.error("Error al enviar formulario:", err)
      setError(err.message || "Error al procesar la solicitud")

      if (window.Swal) {
        window.Swal.fire({
          title: "Error",
          text: err.message || "Error al procesar la solicitud",
          icon: "error",
          confirmButtonColor: "#f44336",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="sponsor-form-container">
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          <h3>¡Gracias por tu apadrinamiento!</h3>
          <p>
            Tu solicitud ha sido registrada correctamente. Nos pondremos en contacto contigo pronto para coordinar los
            detalles.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="sponsor-form-container">
      <h2>Formulario de Apadrinamiento</h2>
      <p className="form-intro">
        Completa el siguiente formulario para apadrinar a uno de nuestros animales. Nos pondremos en contacto contigo
        para coordinar los detalles.
      </p>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <form className="sponsor-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Información Personal</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sponsorName">
                Nombre Completo <span className="required">*</span>
              </label>
              <input
                type="text"
                id="sponsorName"
                name="sponsorName"
                value={formData.sponsorName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="sponsorEmail">
                Correo Electrónico <span className="required">*</span>
              </label>
              <input
                type="email"
                id="sponsorEmail"
                name="sponsorEmail"
                value={formData.sponsorEmail}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sponsorPhone">
                Teléfono <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="sponsorPhone"
                name="sponsorPhone"
                value={formData.sponsorPhone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Detalles del Apadrinamiento</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="animalId">
                Animal a Apadrinar <span className="required">*</span>
              </label>
              <select 
                id="animalId" 
                name="animalId" 
                value={formData.animalId} 
                onChange={handleChange} 
                required
              >
                <option value="">Selecciona un animal</option>
                {animals.map((animal) => (
                  <option key={animal._id} value={animal._id}>
                    {animal.name} (
                    {animal.species === "dog" ? "Perro" : animal.species === "cat" ? "Gato" : animal.species})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="sponsorshipType">
                Tipo de Apadrinamiento <span className="required">*</span>
              </label>
              <select
                id="sponsorshipType"
                name="sponsorshipType"
                value={formData.sponsorshipType}
                onChange={handleChange}
                required
              >
                <option value="monthly">Mensual</option>
                <option value="one-time">Aporte Único</option>
                <option value="supplies">Donación de Suministros</option>
              </select>
            </div>
          </div>

          {formData.sponsorshipType !== "supplies" ? (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">
                  Monto (COP) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="1"
                  placeholder={formData.sponsorshipType === "monthly" ? "Mínimo $30,000" : "Mínimo $50,000"}
                  required={formData.sponsorshipType !== "supplies"}
                />
              </div>
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="suppliesDescription">
                  Descripción de Suministros <span className="required">*</span>
                </label>
                <textarea
                  id="suppliesDescription"
                  name="suppliesDescription"
                  value={formData.suppliesDescription}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe los suministros que donarás (tipo, cantidad, etc.)"
                  required={formData.sponsorshipType === "supplies"}
                ></textarea>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="notes">Notas Adicionales</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="¿Algo más que quieras decirnos?"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Procesando...
              </>
            ) : (
              <>
                <i className="fas fa-heart"></i> Enviar Solicitud
              </>
            )}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default SponsorForm