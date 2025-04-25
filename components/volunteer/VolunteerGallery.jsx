"use client"
import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"

const VolunteerGallery = () => {
  const { t } = useLanguage()
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar testimonios al montar el componente
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/testimonials?mostrarEnHome=true&limit=2")
        const data = await res.json()

        if (data.success) {
          setTestimonials(data.testimonials)
        } else {
          setError(t("VOLUNTEER_TESTIMONIALS_ERROR", "voluntario"))
        }
      } catch (err) {
        console.error("Error fetching testimonials:", err)
        setError(t("VOLUNTEER_TESTIMONIALS_ERROR", "voluntario"))
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [t])

  return (
    <section className="voluntarios-galeria">
      <div className="container">
        <h2>{t("VOLUNTEER_GALLERY_TITLE", "voluntario")}</h2>

        <div className="paw-divider">
          <i className="fas fa-paw"></i>
          <i className="fas fa-paw"></i>
          <i className="fas fa-paw"></i>
        </div>

        <div className="voluntarios-grid">
          <div className="voluntario-card">
            <img src="/imagenes/voluntario1.webp" alt={t("VOLUNTEER_GALLERY_CARD1_TITLE", "voluntario")} />
            <div className="voluntario-info">
              <h3>{t("VOLUNTEER_GALLERY_CARD1_TITLE", "voluntario")}</h3>
              <p>{t("VOLUNTEER_GALLERY_CARD1", "voluntario")}</p>
            </div>
          </div>

          <div className="voluntario-card">
            <img src="/imagenes/voluntario2.webp" alt={t("VOLUNTEER_GALLERY_CARD2_TITLE", "voluntario")} />
            <div className="voluntario-info">
              <h3>{t("VOLUNTEER_GALLERY_CARD2_TITLE", "voluntario")}</h3>
              <p>{t("VOLUNTEER_GALLERY_CARD2", "voluntario")}</p>
            </div>
          </div>

          <div className="voluntario-card">
            <img src="/imagenes/voluntario3.webp" alt={t("VOLUNTEER_GALLERY_CARD3_TITLE", "voluntario")} />
            <div className="voluntario-info">
              <h3>{t("VOLUNTEER_GALLERY_CARD3_TITLE", "voluntario")}</h3>
              <p>{t("VOLUNTEER_GALLERY_CARD3", "voluntario")}</p>
            </div>
          </div>
        </div>

        <div className="testimonios-voluntarios">
          <h3>{t("VOLUNTEER_TESTIMONIALS_TITLE", "voluntario")}</h3>

          {loading ? (
            <div className="loading-testimonios">{t("VOLUNTEER_TESTIMONIALS_LOADING", "voluntario")}</div>
          ) : error ? (
            <div className="error-testimonios">{error}</div>
          ) : testimonials.length === 0 ? (
            <div className="no-testimonios">{t("VOLUNTEER_TESTIMONIALS_EMPTY", "voluntario")}</div>
          ) : (
            <div className="testimonios-container">
              {testimonials.map((testimonio) => (
                <div key={testimonio._id} className="testimonio">
                  <div className="testimonio-content">
                    <p>"{testimonio.contenido}"</p>
                  </div>
                  <div className="testimonio-autor">
                    <img 
                      src={testimonio.imagen || "/imagenes/avatar-default.webp"} 
                      alt={testimonio.nombre} 
                    />
                    <div>
                      <h4>{testimonio.nombre}</h4>
                      <p>{testimonio.rol || t("VOLUNTEER_TESTIMONIALS_ROLE", "voluntario")}
                        {testimonio.anioInicio ? ` ${t("VOLUNTEER_TESTIMONIALS_SINCE", "voluntario")} ${testimonio.anioInicio}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default VolunteerGallery