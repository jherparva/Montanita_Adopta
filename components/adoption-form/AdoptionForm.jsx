"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

const AdoptionForm = ({ animal, isAuthenticated }) => {
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [formData, setFormData] = useState({
    mascota_id: animal?.id || animal?._id || "",
    nombre_completo: "",
    estado_civil: "",
    documento_identificacion: "",
    celular: "",
    direccion: "",
    departamento: "",
    municipio: "",
    nombre_companero: animal?.name || "",
    hay_ninos: "",
    edad_ninos: "",
    hay_alergicos: "",
    ha_tenido_mascotas: "",
    motivo_adopcion: "",
    compromiso: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Cargar datos del usuario autenticado
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/check")
        const data = await res.json()

        if ((data.authenticated || data.isAuthenticated) && data.user) {
          setUserData(data.user)

          // Pre-llenar algunos campos del formulario con datos del usuario
          setFormData(prev => ({
            ...prev,
            nombre_completo: data.user.name || data.user.nombre || prev.nombre_completo,
          }))
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error)
      }
    }

    fetchUserData()
  }, [isAuthenticated])

  // Mostrar información de depuración en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Datos del animal recibidos:", animal)
    }
  }, [animal])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Verificar autenticación
    if (!isAuthenticated) {
      window.Swal.fire({
        title: "Autenticación Requerida",
        text: "Debes iniciar sesión para enviar una solicitud de adopción",
        icon: "warning",
        confirmButtonColor: "#4caf50",
        confirmButtonText: "Iniciar Sesión",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/auth/login?redirect=/formulario-adopcion")
        }
      })
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Enviando datos de adopción:", formData)
      }

      const response = await fetch("/api/adoption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: userData?.id,
        }),
      })

      const result = await response.json()

      if (process.env.NODE_ENV === 'development') {
        console.log("Respuesta del servidor:", result)
      }

      if (result.success) {
        setSubmitSuccess(true)
        // Limpiar el formulario después de enviar exitosamente
        setFormData({
          mascota_id: animal?.id || animal?._id || "",
          nombre_completo: userData?.name || userData?.nombre || "",
          estado_civil: "",
          documento_identificacion: "",
          celular: "",
          direccion: "",
          departamento: "",
          municipio: "",
          nombre_companero: animal?.name || "",
          hay_ninos: "",
          edad_ninos: "",
          hay_alergicos: "",
          ha_tenido_mascotas: "",
          motivo_adopcion: "",
          compromiso: "",
        })

        window.Swal.fire({
          title: "¡Solicitud Enviada!",
          text: "Gracias por tu solicitud. Nos pondremos en contacto contigo pronto.",
          icon: "success",
          confirmButtonColor: "#4caf50",
          confirmButtonText: "Aceptar",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/adopcion?success=true")
          }
        })
      } else {
        console.error("Error al enviar la solicitud:", result.message)
        setSubmitError(result.message || "Error al enviar la solicitud")
        
        window.Swal.fire({
          title: "Error",
          text: result.message || "Error al enviar la solicitud. Por favor intenta nuevamente.",
          icon: "error",
          confirmButtonColor: "#f44336",
          confirmButtonText: "Aceptar",
        })
      }
    } catch (error) {
      console.error("Error en la solicitud:", error)
      setSubmitError("Error de conexión. Por favor intenta nuevamente.")
      
      window.Swal.fire({
        title: "Error de Conexión",
        text: "No pudimos procesar tu solicitud. Por favor intenta nuevamente.",
        icon: "error",
        confirmButtonColor: "#f44336",
        confirmButtonText: "Aceptar",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Si no está autenticado, mostrar mensaje y botón para iniciar sesión
  if (!isAuthenticated) {
    return (
      <div className="auth-required-container">
        <h3>Autenticación Requerida</h3>
        <p>Debes iniciar sesión para enviar una solicitud de adopción.</p>
        <button 
          className="login-button" 
          onClick={() => {
            window.Swal.fire({
              title: "Iniciar Sesión",
              text: "Necesitas una cuenta para adoptar. ¿Deseas iniciar sesión ahora?",
              icon: "question",
              showCancelButton: true,
              confirmButtonColor: "#4caf50",
              cancelButtonColor: "#f44336",
              confirmButtonText: "Sí, iniciar sesión",
              cancelButtonText: "No, más tarde"
            }).then((result) => {
              if (result.isConfirmed) {
                router.push("/auth/login?redirect=/formulario-adopcion")
              }
            })
          }}
        >
          Iniciar Sesión
        </button>
      </div>
    )
  }

  const getSexDisplayText = (animal) => {
    const sexValue = animal?.sex || animal?.sexo || '';
    const normalizedSex = typeof sexValue === 'string' ? sexValue.toLowerCase() : '';
    
    if (['male', 'macho'].includes(normalizedSex)) return "Macho";
    if (['female', 'hembra'].includes(normalizedSex)) return "Hembra";
    return "No especificado";
  }

  const getAgeDisplayText = (animal) => {
    const ageValue = animal?.age || '';
    const normalizedAge = typeof ageValue === 'string' ? ageValue.toLowerCase() : '';
    
    if (['puppy', 'cachorro'].includes(normalizedAge)) return "Cachorro";
    if (['kitten', 'gatito'].includes(normalizedAge)) return "Gatito";
    if (['adult', 'adulto'].includes(normalizedAge)) return "Adulto";
    return "Senior";
  }
  
  return (
    <>
      {/* Información de la mascota a adoptar */}
      <div className="mascota-info-card">
        <div className="mascota-img-container">
          <img 
            src={animal?.image || animal?.photo || "/placeholder.svg"} 
            alt={animal?.name || "Mascota"} 
            className="mascota-img"
          />
        </div>
        <div className="mascota-details">
          <h3>{animal?.name}</h3>
          <p>
            <i className="fas fa-birthday-cake"></i> Edad: {getAgeDisplayText(animal)}
          </p>
          <p>
            <i className="fas fa-paw"></i> Raza: {animal?.breed || animal?.raza || "No especificada"}
          </p>
          <p>
            <i className="fas fa-venus-mars"></i> Sexo: {getSexDisplayText(animal)}
          </p>
          <div className="mascota-tag">Esperando un hogar</div>
        </div>
      </div>

      {submitError && <div className="error-message">{submitError}</div>}

      {submitSuccess && (
        <div className="success-message">
          ¡Tu solicitud ha sido enviada con éxito! Nos pondremos en contacto contigo pronto.
        </div>
      )}

      {/* Formulario en columnas con tarjetas */}
      <form id="formulario-adopcion" onSubmit={handleSubmit}>
        {/* Campo oculto para el ID de la mascota */}
        <input type="hidden" id="mascota-id" name="mascota_id" value={formData.mascota_id} />

        <div className="row form-cards">
          {/* Tarjeta 1: Información Personal */}
          <div className="col-md-6">
            <div className="form-card">
              <div className="card-icon">
                <i className="fas fa-user-circle"></i>
              </div>
              <h3 className="card-title">Información Personal</h3>

              <div className="form-group">
                <label htmlFor="nombre-completo">Nombre Completo:</label>
                <input
                  type="text"
                  id="nombre-completo"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="estado-civil">Estado Civil:</label>
                <input
                  type="text"
                  id="estado-civil"
                  name="estado_civil"
                  value={formData.estado_civil}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="documento-identificacion">Documento de Identificación:</label>
                <input
                  type="text"
                  id="documento-identificacion"
                  name="documento_identificacion"
                  value={formData.documento_identificacion}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="celular">Celular:</label>
                <input
                  type="tel"
                  id="celular"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Domicilio */}
          <div className="col-md-6">
            <div className="form-card">
              <div className="card-icon">
                <i className="fas fa-home"></i>
              </div>
              <h3 className="card-title">Domicilio</h3>

              <div className="form-group">
                <label htmlFor="direccion">Dirección:</label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="departamento">Departamento:</label>
                <input
                  type="text"
                  id="departamento"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="municipio">Municipio:</label>
                <input
                  type="text"
                  id="municipio"
                  name="municipio"
                  value={formData.municipio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nombre-companero">Nombre del Compañero que Desea Adoptar:</label>
                <input
                  type="text"
                  id="nombre-companero"
                  name="nombre_companero"
                  value={formData.nombre_companero}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Entorno Familiar */}
          <div className="col-md-6">
            <div className="form-card">
              <div className="card-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="card-title">Entorno Familiar</h3>

              <div className="form-group">
                <label htmlFor="hay-ninos">¿Hay niños en la casa?</label>
                <select id="hay-ninos" name="hay_ninos" value={formData.hay_ninos} onChange={handleChange} required>
                  <option value="" disabled>
                    Seleccione una opción
                  </option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edad-ninos">¿Qué edad tienen los niños?</label>
                <input
                  type="text"
                  id="edad-ninos"
                  name="edad_ninos"
                  value={formData.edad_ninos}
                  onChange={handleChange}
                  placeholder="Si no hay niños, escriba 'No aplica'"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="hay-alergicos">¿Hay personas alérgicas en la casa?</label>
                <select
                  id="hay-alergicos"
                  name="hay_alergicos"
                  value={formData.hay_alergicos}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Seleccione una opción
                  </option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tarjeta 4: Experiencia con Mascotas */}
          <div className="col-md-6">
            <div className="form-card">
              <div className="card-icon">
                <i className="fas fa-paw"></i>
              </div>
              <h3 className="card-title">Experiencia con Mascotas</h3>

              <div className="form-group">
                <label htmlFor="ha-tenido-mascotas">¿Ha tenido mascotas antes?</label>
                <select
                  id="ha-tenido-mascotas"
                  name="ha_tenido_mascotas"
                  value={formData.ha_tenido_mascotas}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Seleccione una opción
                  </option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="motivo-adopcion">Motivo por el cual desea adoptar:</label>
                <textarea
                  id="motivo-adopcion"
                  name="motivo_adopcion"
                  rows="4"
                  value={formData.motivo_adopcion}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
            </div>
          </div>

          {/* Tarjeta 5: Compromiso */}
          <div className="col-12">
            <div className="form-card commitment-card">
              <div className="card-icon large-icon">
                <i className="fas fa-handshake"></i>
              </div>
              <h3 className="card-title">Compromiso</h3>

              <div className="commitment-text">
                <p>
                  ¿Se compromete a llevar la mascota a un centro veterinario posterior a la entrega para hacer revisión
                  veterinaria, esquema de vacunación si no lo tiene o si desea iniciarlo de nuevo, exámenes de sangre o
                  coprológicos según recomendación veterinaria? ¿ESTÁ DE ACUERDO CON ESTO?
                </p>
              </div>

              <div className="radio-options">
                <label className="radio-container">
                  <input
                    type="radio"
                    name="compromiso"
                    value="si"
                    checked={formData.compromiso === "si"}
                    onChange={handleChange}
                    required
                  />
                  <span className="checkmark"></span>
                  Sí, me comprometo
                </label>
                <label className="radio-container">
                  <input
                    type="radio"
                    name="compromiso"
                    value="no"
                    checked={formData.compromiso === "no"}
                    onChange={handleChange}
                    required
                  />
                  <span className="checkmark"></span>
                  No, no puedo comprometerme
                </label>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          <span>{isSubmitting ? "Enviando..." : "Enviar Solicitud"}</span>
          <i className="fas fa-paw"></i>
        </button>
      </form>

      {/* Elementos decorativos de huellas */}
      <div className="paw-dog paw-dog-1">
        <div className="paw-dog-digit paw-dog-digit-1"></div>
        <div className="paw-dog-digit paw-dog-digit-2"></div>
        <div className="paw-dog-digit paw-dog-digit-3"></div>
        <div className="paw-dog-digit paw-dog-digit-4"></div>
      </div>
    </>
  )
}

export default AdoptionForm