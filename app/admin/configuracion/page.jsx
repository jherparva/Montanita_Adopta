"use client"
import { useState, useEffect } from "react"
import "@/styles/admin/configuracion.css"

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [config, setConfig] = useState({
    siteName: "Montañita Adopta",
    siteDescription: "Plataforma de adopción de mascotas",
    contactEmail: "contacto@montanitaadopta.com",
    phoneNumber: "+57 123 456 7890",
    address: "Calle Principal #123, Montañita",
    socialMedia: {
      facebook: "https://facebook.com/montanitaadopta",
      instagram: "https://instagram.com/montanitaadopta",
      twitter: "https://twitter.com/montanitaadopta",
    },
    notificationsEnabled: true,
    emailNotifications: true,
  })

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/admin/config")

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()

        if (data.config) {
          setConfig({
            ...config,
            ...data.config,
          })
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error)
        setError("No se pudo cargar la configuración. Por favor intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.includes(".")) {
      // Manejar campos anidados (como socialMedia.facebook)
      const [parent, child] = name.split(".")
      setConfig({
        ...config,
        [parent]: {
          ...config[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      })
    } else {
      // Manejar campos simples
      setConfig({
        ...config,
        [name]: type === "checkbox" ? checked : value,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage("")

    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ config }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Error al guardar configuración")
      }

      setSuccessMessage("Configuración guardada correctamente")
    } catch (error) {
      console.error("Error al guardar configuración:", error)
      setError(error.message || "Error al guardar la configuración. Intente nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">
          <i className="fas fa-paw fa-spin"></i>
        </div>
        <p>Cargando configuración...</p>
      </div>
    )
  }

  return (
    <div className="config-container">
      <h1>Configuración</h1>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="config-form">
        <div className="config-section">
          <h2>Información del Sitio</h2>

          <div className="form-group">
            <label htmlFor="siteName">Nombre del sitio</label>
            <input type="text" id="siteName" name="siteName" value={config.siteName} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="siteDescription">Descripción del sitio</label>
            <textarea
              id="siteDescription"
              name="siteDescription"
              value={config.siteDescription}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>
        </div>

        <div className="config-section">
          <h2>Información de Contacto</h2>

          <div className="form-group">
            <label htmlFor="contactEmail">Email de contacto</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={config.contactEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Número de teléfono</label>
            <input type="text" id="phoneNumber" name="phoneNumber" value={config.phoneNumber} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="address">Dirección</label>
            <input type="text" id="address" name="address" value={config.address} onChange={handleChange} />
          </div>
        </div>

        <div className="config-section">
          <h2>Redes Sociales</h2>

          <div className="form-group">
            <label htmlFor="socialMedia.facebook">Facebook</label>
            <input
              type="url"
              id="socialMedia.facebook"
              name="socialMedia.facebook"
              value={config.socialMedia.facebook}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="socialMedia.instagram">Instagram</label>
            <input
              type="url"
              id="socialMedia.instagram"
              name="socialMedia.instagram"
              value={config.socialMedia.instagram}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="socialMedia.twitter">Twitter</label>
            <input
              type="url"
              id="socialMedia.twitter"
              name="socialMedia.twitter"
              value={config.socialMedia.twitter}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="config-section">
          <h2>Notificaciones</h2>

          <div className="form-check">
            <input
              type="checkbox"
              id="notificationsEnabled"
              name="notificationsEnabled"
              checked={config.notificationsEnabled}
              onChange={handleChange}
            />
            <label htmlFor="notificationsEnabled">Habilitar notificaciones</label>
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              id="emailNotifications"
              name="emailNotifications"
              checked={config.emailNotifications}
              onChange={handleChange}
            />
            <label htmlFor="emailNotifications">Enviar notificaciones por email</label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </form>
    </div>
  )
}
