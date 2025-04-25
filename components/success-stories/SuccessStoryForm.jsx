"use client"
import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"

const SuccessStoryForm = ({ onSubmit }) => {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    story: "",
    image: null,
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formProgress, setFormProgress] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check")
        const data = await res.json()

        setIsAuthenticated(data.authenticated || data.isAuthenticated)

        if (data.authenticated || data.isAuthenticated) {
          setUser(data.user)
          setFormData((prev) => ({
            ...prev,
            name: data.user.name || data.user.nombre || "",
            email: data.user.email || "",
          }))
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    const calculateProgress = () => {
      const fields = ["name", "email", "title", "story"]
      const filledFields = fields.filter((field) => formData[field].trim() !== "").length
      return Math.round((filledFields / fields.length) * 100)
    }

    setFormProgress(calculateProgress())
  }, [formData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!validTypes.includes(file.type)) {
        setError("Formato de archivo no válido. Por favor, sube una imagen JPG, PNG, GIF o WEBP.")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen es demasiado grande. El tamaño máximo es 5MB.")
        return
      }

      setError("")
      setFormData((prev) => ({
        ...prev,
        image: file,
      }))

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const openLoginModal = () => {
    document.dispatchEvent(new CustomEvent("open-login-modal"))
    window.dispatchEvent(new CustomEvent("open-login-modal"))
    window.dispatchEvent(
      new CustomEvent("openModal", {
        detail: { modalId: "loginModal" },
      })
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      if (window.Swal) {
        window.Swal.fire({
          title: t("STORIES_LOGIN_BUTTON", "historias"),
          text: t("STORIES_AUTH_NEEDED", "historias"),
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#e01e1e",
          cancelButtonColor: "#6c757d",
          confirmButtonText: t("STORIES_LOGIN_BUTTON", "historias"),
          cancelButtonText: t("STORIES_CANCEL_BUTTON", "historias"),
        }).then((result) => {
          if (result.isConfirmed) {
            openLoginModal()
          }
        })
      } else {
        alert(t("STORIES_AUTH_NEEDED", "historias"))
        openLoginModal()
      }
      return
    }

    setLoading(true)
    setError("")

    try {
      let imageUrl = null
      if (formData.image) {
        const imageFormData = new FormData()
        imageFormData.append("image", formData.image)

        const imageResponse = await fetch("/api/success-stories/upload-image", {
          method: "POST",
          body: imageFormData,
        })

        const imageData = await imageResponse.json()

        if (!imageResponse.ok) {
          throw new Error(imageData.message || t("STORIES_ERROR_TEXT", "historias"))
        }

        imageUrl = imageData.imageUrl
      }

      const storyData = {
        nombre: formData.name,
        email: formData.email,
        titulo: formData.title,
        contenido: formData.story,
        imagen: imageUrl,
      }

      await onSubmit(storyData)

      const button = document.querySelector(".submit-btn")
      if (button) {
        button.classList.add("success-animation")
        setTimeout(() => {
          button.classList.remove("success-animation")
        }, 2000)
      }

      setFormData({
        name: user ? user.name || user.nombre || "" : "",
        email: user ? user.email || "" : "",
        title: "",
        story: "",
        image: null,
      })
      setImagePreview(null)
      setFormProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error al enviar la historia:", error)
      setError(error.message || t("STORIES_ERROR_TEXT", "historias"))

      if (window.Swal) {
        window.Swal.fire({
          title: t("STORIES_ERROR_TITLE", "historias"),
          text: error.message || t("STORIES_ERROR_TEXT", "historias"),
          icon: "error",
          confirmButtonColor: "#d33",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const createRipple = (event) => {
    const button = event.currentTarget
    const ripple = document.createElement("span")

    const diameter = Math.max(button.clientWidth, button.clientHeight)
    const radius = diameter / 2

    ripple.style.width = ripple.style.height = `${diameter}px`
    ripple.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`
    ripple.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`
    ripple.classList.add("button-ripple")

    const existingRipple = button.querySelector(".button-ripple")
    if (existingRipple) {
      existingRipple.remove()
    }

    button.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 800)
  }

  return (
    <div className="success-story-form">
      <h3>{t("STORIES_FORM_TITLE", "historias")}</h3>

      <div className="cta-banner">
        <div className="cta-icon">
          <i className="fas fa-paw"></i>
        </div>
        <div className="cta-content">
          <h3>{t("STORIES_FORM_CTA_TITLE", "historias")}</h3>
          <p>{t("STORIES_FORM_CTA_TEXT", "historias")}</p>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="auth-warning">
          <p>
            <i className="fas fa-exclamation-circle"></i> {t("STORIES_AUTH_NEEDED", "historias")}
          </p>
          <button
            type="button"
            className="login-btn"
            onClick={openLoginModal}
            style={{
              display: "inline-block",
              padding: "10px 15px",
              backgroundColor: "#e01e1e",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
              marginBottom: "10px",
              border: "none",
              fontWeight: "bold",
            }}
          >
            <i className="fas fa-sign-in-alt"></i> {t("STORIES_LOGIN_BUTTON", "historias")}
          </button>
        </div>
      )}

      {isAuthenticated && (
        <>
          <div className="form-progress">
            <div className="progress-bar" style={{ width: `${formProgress}%` }}></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">{t("STORIES_FORM_NAME", "historias")}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("STORIES_FORM_NAME_PLACEHOLDER", "historias")}
                  required
                  disabled={user && (user.name || user.nombre)}
                />
                <span className="input-complete">✓</span>
              </div>

              <div className="form-group">
                <label htmlFor="email">{t("STORIES_FORM_EMAIL", "historias")}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("STORIES_FORM_EMAIL_PLACEHOLDER", "historias")}
                  required
                  disabled={user && user.email}
                />
                <span className="input-complete">✓</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="title">{t("STORIES_FORM_TITLE_LABEL", "historias")}</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={t("STORIES_FORM_TITLE_PLACEHOLDER", "historias")}
                required
              />
              <span className="input-complete">✓</span>
            </div>

            <div className="form-group">
              <label htmlFor="story">{t("STORIES_FORM_STORY", "historias")}</label>
              <textarea
                id="story"
                name="story"
                value={formData.story}
                onChange={handleChange}
                rows="5"
                placeholder={t("STORIES_FORM_STORY_PLACEHOLDER", "historias")}
                required
              ></textarea>
              <span className="input-complete">✓</span>
            </div>

            <div className="form-group">
              <label htmlFor="image">{t("STORIES_FORM_IMAGE", "historias")}</label>
              <div className="file-upload-container">
                <button
                  type="button"
                  className="file-upload-btn"
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    display: "inline-block",
                    padding: "10px 15px",
                    backgroundColor: "#e01e1e",
                    color: "white",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginBottom: "10px",
                  }}
                >
                  <i className="fas fa-cloud-upload-alt"></i> {t("STORIES_FORM_IMAGE_SELECT", "historias")}
                </button>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  style={{ display: "none" }}
                />
                {formData.image && <div className="file-name-display">{formData.image.name}</div>}
              </div>
              <small>{t("STORIES_FORM_IMAGE_FORMATS", "historias")}</small>
            </div>

            {imagePreview && (
              <div className="image-preview">
                <h4>{t("STORIES_FORM_IMAGE_PREVIEW", "historias")}</h4>
                <img src={imagePreview} alt="Vista previa" />
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading} onClick={createRipple}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> {t("STORIES_FORM_SUBMITTING", "historias")}
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i> {t("STORIES_FORM_SUBMIT", "historias")}
                </>
              )}
            </button>
          </form>
        </>
      )}

      <div className="paw-prints paw-1"></div>
      <div className="paw-prints paw-2"></div>
      <div className="form-decoration decoration-1"></div>
      <div className="form-decoration decoration-2"></div>
      <div className="wave-decoration"></div>
    </div>
  )
}

export default SuccessStoryForm