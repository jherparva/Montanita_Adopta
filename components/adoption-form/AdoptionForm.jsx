"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

const AdoptionForm = ({ animal, isAuthenticated }) => {
  const router = useRouter()
  const { t } = useLanguage()
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
        title: t("ADOPTION_LOGIN_REQUIRED_TITLE", "form_adopcion"),
        text: t("ADOPTION_LOGIN_REQUIRED_TEXT", "form_adopcion"),
        icon: "warning",
        confirmButtonColor: "#4caf50",
        confirmButtonText: t("ADOPTION_LOGIN_CONFIRM", "form_adopcion"),
        cancelButtonText: t("ADOPTION_LOGIN_CANCEL", "form_adopcion"),
        showCancelButton: true,
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
          title: t("ADOPTION_SUCCESS_TITLE", "form_adopcion"),
          text: t("ADOPTION_SUCCESS_TEXT", "form_adopcion"),
          icon: "success",
          confirmButtonColor: "#4caf50",
          confirmButtonText: t("ADOPTION_SUCCESS_BUTTON", "form_adopcion"),
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/adopcion?success=true")
          }
        })
      } else {
        console.error("Error al enviar la solicitud:", result.message)
        setSubmitError(result.message || t("ADOPTION_ERROR_TEXT", "form_adopcion"))
        
        window.Swal.fire({
          title: t("ADOPTION_ERROR_TITLE", "form_adopcion"),
          text: result.message || t("ADOPTION_ERROR_TEXT", "form_adopcion"),
          icon: "error",
          confirmButtonColor: "#f44336",
          confirmButtonText: t("ADOPTION_SUCCESS_BUTTON", "form_adopcion"),
        })
      }
    } catch (error) {
      console.error("Error en la solicitud:", error)
      setSubmitError(t("ADOPTION_ERROR_CONNECTION", "form_adopcion"))
      
      window.Swal.fire({
        title: t("ADOPTION_ERROR_TITLE", "form_adopcion"),
        text: t("ADOPTION_ERROR_CONNECTION", "form_adopcion"),
        icon: "error",
        confirmButtonColor: "#f44336",
        confirmButtonText: t("ADOPTION_SUCCESS_BUTTON", "form_adopcion"),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Si no está autenticado, mostrar mensaje y botón para iniciar sesión
  if (!isAuthenticated) {
    return (
      <div className="auth-required-container">
        <h3>{t("ADOPTION_LOGIN_REQUIRED_TITLE", "form_adopcion")}</h3>
        <p>{t("ADOPTION_AUTH_NEEDED", "form_adopcion")}</p>
        <button 
          className="login-button" 
          onClick={() => {
            window.Swal.fire({
              title: t("ADOPTION_LOGIN_BUTTON", "form_adopcion"),
              text: t("ADOPTION_LOGIN_REQUIRED_TEXT", "form_adopcion"),
              icon: "question",
              showCancelButton: true,
              confirmButtonColor: "#4caf50",
              cancelButtonColor: "#f44336",
              confirmButtonText: t("ADOPTION_LOGIN_CONFIRM", "form_adopcion"),
              cancelButtonText: t("ADOPTION_LOGIN_CANCEL", "form_adopcion")
            }).then((result) => {
              if (result.isConfirmed) {
                router.push("/auth/login?redirect=/formulario-adopcion")
              }
            })
          }}
        >
          {t("ADOPTION_LOGIN_BUTTON", "form_adopcion")}
        </button>
      </div>
    )
  }

  const getSexDisplayText = (animal) => {
    const sexValue = animal?.sex || animal?.sexo || '';
    const normalizedSex = typeof sexValue === 'string' ? sexValue.toLowerCase() : '';
    
    if (['male', 'macho'].includes(normalizedSex)) return t("ADOPTION_SEX_MALE", "form_adopcion");
    if (['female', 'hembra'].includes(normalizedSex)) return t("ADOPTION_SEX_FEMALE", "form_adopcion");
    return t("ADOPTION_SEX_UNSPECIFIED", "form_adopcion");
  }

  const getAgeDisplayText = (animal) => {
    const ageValue = animal?.age || '';
    const normalizedAge = typeof ageValue === 'string' ? ageValue.toLowerCase() : '';
    
    if (['puppy', 'cachorro'].includes(normalizedAge)) return t("ADOPTION_AGE_PUPPY", "form_adopcion");
    if (['kitten', 'gatito'].includes(normalizedAge)) return t("ADOPTION_AGE_KITTEN", "form_adopcion");
    if (['adult', 'adulto'].includes(normalizedAge)) return t("ADOPTION_AGE_ADULT", "form_adopcion");
    return t("ADOPTION_AGE_SENIOR", "form_adopcion");
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
            <i className="fas fa-birthday-cake"></i> {t("ADOPTION_PET_AGE", "form_adopcion")}: {getAgeDisplayText(animal)}
          </p>
          <p>
            <i className="fas fa-paw"></i> {t("ADOPTION_PET_BREED", "form_adopcion")}: {animal?.breed || animal?.raza || t("ADOPTION_SEX_UNSPECIFIED", "form_adopcion")}
          </p>
          <p>
            <i className="fas fa-venus-mars"></i> {t("ADOPTION_PET_SEX", "form_adopcion")}: {getSexDisplayText(animal)}
          </p>
          <div className="mascota-tag">{t("ADOPTION_PET_STATUS", "form_adopcion")}</div>
        </div>
      </div>

      {submitError && <div className="error-message">{submitError}</div>}

      {submitSuccess && (
        <div className="success-message">
          {t("ADOPTION_SUCCESS_TEXT", "form_adopcion")}
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
              <h3 className="card-title">{t("ADOPTION_PERSONAL_INFO", "form_adopcion")}</h3>

              <div className="form-group">
                <label htmlFor="nombre-completo">{t("ADOPTION_FORM_FULLNAME", "form_adopcion")}:</label>
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
                <label htmlFor="estado-civil">{t("ADOPTION_FORM_MARITAL_STATUS", "form_adopcion")}:</label>
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
                <label htmlFor="documento-identificacion">{t("ADOPTION_FORM_ID_DOCUMENT", "form_adopcion")}:</label>
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
                <label htmlFor="celular">{t("ADOPTION_FORM_PHONE", "form_adopcion")}:</label>
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
              <h3 className="card-title">{t("ADOPTION_HOME_INFO", "form_adopcion")}</h3>

              <div className="form-group">
                <label htmlFor="direccion">{t("ADOPTION_FORM_ADDRESS", "form_adopcion")}:</label>
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
                <label htmlFor="departamento">{t("ADOPTION_FORM_DEPARTMENT", "form_adopcion")}:</label>
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
                <label htmlFor="municipio">{t("ADOPTION_FORM_MUNICIPALITY", "form_adopcion")}:</label>
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
                <label htmlFor="nombre-companero">{t("ADOPTION_FORM_PET_NAME", "form_adopcion")}:</label>
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
              <h3 className="card-title">{t("ADOPTION_FAMILY_INFO", "form_adopcion")}</h3>

              <div className="form-group">
                <label htmlFor="hay-ninos">{t("ADOPTION_FORM_KIDS", "form_adopcion")}</label>
                <select id="hay-ninos" name="hay_ninos" value={formData.hay_ninos} onChange={handleChange} required>
                  <option value="" disabled>
                    {t("ADOPTION_SELECT_OPTION", "form_adopcion")}
                  </option>
                  <option value="si">{t("ADOPTION_OPTION_YES", "form_adopcion")}</option>
                  <option value="no">{t("ADOPTION_OPTION_NO", "form_adopcion")}</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edad-ninos">{t("ADOPTION_FORM_KIDS_AGE", "form_adopcion")}</label>
                <input
                  type="text"
                  id="edad-ninos"
                  name="edad_ninos"
                  value={formData.edad_ninos}
                  onChange={handleChange}
                  placeholder={t("ADOPTION_FORM_KIDS_AGE_PLACEHOLDER", "form_adopcion")}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="hay-alergicos">{t("ADOPTION_FORM_ALLERGIES", "form_adopcion")}</label>
                <select
                  id="hay-alergicos"
                  name="hay_alergicos"
                  value={formData.hay_alergicos}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    {t("ADOPTION_SELECT_OPTION", "form_adopcion")}
                  </option>
                  <option value="si">{t("ADOPTION_OPTION_YES", "form_adopcion")}</option>
                  <option value="no">{t("ADOPTION_OPTION_NO", "form_adopcion")}</option>
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
              <h3 className="card-title">{t("ADOPTION_EXPERIENCE_INFO", "form_adopcion")}</h3>

              <div className="form-group">
                <label htmlFor="ha-tenido-mascotas">{t("ADOPTION_FORM_HAD_PETS", "form_adopcion")}</label>
                <select
                  id="ha-tenido-mascotas"
                  name="ha_tenido_mascotas"
                  value={formData.ha_tenido_mascotas}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    {t("ADOPTION_SELECT_OPTION", "form_adopcion")}
                  </option>
                  <option value="si">{t("ADOPTION_OPTION_YES", "form_adopcion")}</option>
                  <option value="no">{t("ADOPTION_OPTION_NO", "form_adopcion")}</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="motivo-adopcion">{t("ADOPTION_FORM_ADOPTION_REASON", "form_adopcion")}:</label>
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
              <h3 className="card-title">{t("ADOPTION_COMMITMENT_INFO", "form_adopcion")}</h3>

              <div className="commitment-text">
                <p>
                  {t("ADOPTION_FORM_COMMITMENT_TEXT", "form_adopcion")}
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
                  {t("ADOPTION_FORM_COMMITMENT_YES", "form_adopcion")}
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
                  {t("ADOPTION_FORM_COMMITMENT_NO", "form_adopcion")}
                </label>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          <span>{isSubmitting ? t("ADOPTION_SUBMITTING", "form_adopcion") : t("ADOPTION_SUBMIT_BUTTON", "form_adopcion")}</span>
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