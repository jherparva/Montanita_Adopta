"use client"
import { useState, useEffect } from "react"
import SuccessStoryCard from "./SuccessStoryCard"
import SuccessStoryForm from "./SuccessStoryForm"
import AdoptionCta from "./AdoptionCta_video"
import { useLanguage } from "@/contexts/language-context"

const SuccessStoriesSection = () => {
  const { t } = useLanguage()
  const [stories, setStories] = useState([])
  const [featuredStories, setFeaturedStories] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [visibleFeatured, setVisibleFeatured] = useState(3)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await fetchStories()
        await fetchFeaturedStories()
        await fetchTestimonials()
      } catch (err) {
        console.error("Error cargando datos:", err)
        setError(t("STORIES_ERROR", "historias"))
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/check")
      const data = await res.json()
      setIsAuthenticated(data.authenticated || data.isAuthenticated)
    } catch (error) {
      console.error("Error al verificar autenticación:", error)
      setIsAuthenticated(false)
    }
  }

  const fetchStories = async () => {
    const response = await fetch("/api/success-stories?approved=true")
    if (!response.ok) {
      throw new Error(t("STORIES_ERROR", "historias"))
    }

    const data = await response.json()
    if (data.success) {
      setStories(data.stories || [])
    } else {
      throw new Error(data.message || t("STORIES_ERROR", "historias"))
    }
  }

  const fetchFeaturedStories = async () => {
    try {
      const response = await fetch("/api/success-stories/featured-stories")
      
      if (!response.ok) {
        const fallbackResponse = await fetch("/api/success-stories?approved=true&featured=true")
        
        if (!fallbackResponse.ok) {
          throw new Error(t("STORIES_ERROR", "historias"))
        }
        
        const data = await fallbackResponse.json()
        if (data.success) {
          const featured = (data.stories || []).filter(story => story.isFeatured)
          setFeaturedStories(featured)
          return
        }
      }
      
      const data = await response.json()
      if (data.success) {
        setFeaturedStories(data.stories || [])
      } else {
        throw new Error(data.message || t("STORIES_ERROR", "historias"))
      }
    } catch (error) {
      console.error("Error en fetchFeaturedStories:", error)
      throw error
    }
  }

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/success-stories/testimonials")
      
      if (!response.ok) {
        const fallbackResponse = await fetch("/api/success-stories?approved=true&testimony=true")
        
        if (!fallbackResponse.ok) {
          throw new Error(t("STORIES_ERROR", "historias"))
        }
        
        const data = await fallbackResponse.json()
        if (data.success) {
          const testimonials = (data.stories || []).filter(story => story.isTestimony)
          setTestimonials(testimonials)
          return
        }
      }
      
      const data = await response.json()
      if (data.success) {
        setTestimonials(data.stories || [])
      } else {
        throw new Error(data.message || t("STORIES_ERROR", "historias"))
      }
    } catch (error) {
      console.error("Error en fetchTestimonials:", error)
      throw error
    }
  }

  const handleSubmitStory = async (storyData) => {
    try {
      const response = await fetch("/api/success-stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storyData),
      })

      const data = await response.json()

      if (response.ok) {
        if (window.Swal) {
          window.Swal.fire({
            title: t("STORIES_SUCCESS_TITLE", "historias"),
            text: t("STORIES_SUCCESS_TEXT", "historias"),
            icon: "success",
            confirmButtonText: "Continuar",
            confirmButtonColor: "#27b80b",
          })
        }

        setShowForm(false)
      } else {
        throw new Error(data.message || t("STORIES_ERROR_TEXT", "historias"))
      }
    } catch (error) {
      console.error("Error al enviar historia:", error)

      if (window.Swal) {
        window.Swal.fire({
          title: t("STORIES_ERROR_TITLE", "historias"),
          text: error.message || t("STORIES_ERROR_TEXT", "historias"),
          icon: "error",
          confirmButtonColor: "#d33",
        })
      }
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

  const toggleForm = () => {
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

    setShowForm((prevState) => !prevState)
  }

  const loadMoreStories = () => {
    setVisibleFeatured((prev) => Math.min(prev + 3, featuredStories.length))
    setIsCollapsed(false)
  }

  const loadLessStories = () => {
    setVisibleFeatured(3)
    setIsCollapsed(true)

    const storiesSection = document.getElementById("featured-stories-section")
    if (storiesSection) {
      storiesSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">
          <i className="fas fa-paw fa-spin"></i>
        </div>
        <p>{t("STORIES_LOADING", "historias")}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>
          {t("STORIES_RETRY", "historias")}
        </button>
      </div>
    )
  }

  const renderTestimonialItem = (testimonial) => {
    const content = testimonial.content || testimonial.contenido || testimonial.story || ""
    return (
      <div key={testimonial._id} className="testimonial-item">
        <div className="testimonial-content">"{content}"</div>
        <div className="testimonial-author">{testimonial.author || testimonial.autor || testimonial.nombre || "Anónimo"}</div>
      </div>
    )
  }

  return (
    <>
      <div className="success-stories-container">
        <div className="stories-header">
          <h3>{t("STORIES_TITLE", "historias")}</h3>
          <button className="share-story-btn" onClick={toggleForm}>
            {showForm ? t("STORIES_CANCEL_BUTTON", "historias") : t("STORIES_SHARE_BUTTON", "historias")}
          </button>
        </div>

        {showForm && (
          <div className="story-form-container">
            <SuccessStoryForm onSubmit={handleSubmitStory} />
          </div>
        )}

        {stories.length > 0 ? (
          <div className="stories-grid">
            {stories.map((story) => (
              <SuccessStoryCard key={story._id} story={story} />
            ))}
          </div>
        ) : (
          <div className="no-stories">
            <p>{t("STORIES_NO_STORIES", "historias")}</p>
          </div>
        )}
      </div>

      {/* Sección de historias destacadas */}
      <div id="featured-stories-section" className="featured-stories">
        <h3>{t("STORIES_FEATURED_TITLE", "historias")}</h3>
        <div className={`stories-container ${isCollapsed ? "collapsed" : ""}`}>
          {featuredStories.slice(0, visibleFeatured).map((story) => (
            <SuccessStoryCard key={story._id} story={story} />
          ))}
        </div>

        <div className="load-more-container">
          {isCollapsed && visibleFeatured < featuredStories.length && (
            <button className="load-more" onClick={loadMoreStories}>
              {t("STORIES_VIEW_MORE", "historias")}
            </button>
          )}

          {!isCollapsed && visibleFeatured > 3 && (
            <button className="load-less" onClick={loadLessStories}>
              {t("STORIES_VIEW_LESS", "historias")}
            </button>
          )}
        </div>
      </div>

      {/* Sección de testimonios */}
      <div className="testimonials">
        <h3>{t("STORIES_TESTIMONIALS_TITLE", "historias")}</h3>
        <div className="testimonial-carousel">
          {testimonials.map(renderTestimonialItem)}
        </div>
      </div>
      <AdoptionCta />
    </>
  )
}

export default SuccessStoriesSection