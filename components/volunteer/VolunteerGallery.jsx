"use client"
import { useState, useEffect } from "react"

const VolunteerGallery = () => {
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
          setError("Error al cargar testimonios")
        }
      } catch (err) {
        console.error("Error fetching testimonials:", err)
        setError("Error al cargar testimonios")
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  return (
    <section className="voluntarios-galeria">
      <div className="container">
        <h2>Nuestros Voluntarios en Acción</h2>

        <div className="paw-divider">
          <i className="fas fa-paw"></i>
          <i className="fas fa-paw"></i>
          <i className="fas fa-paw"></i>
        </div>

        <div className="voluntarios-grid">
          <div className="voluntario-card">
            <img src="/imagenes/voluntario1.webp" alt="Voluntario cuidando animales" />
            <div className="voluntario-info">
              <h3>Cuidado en el Refugio</h3>
              <p>Nuestros voluntarios dedican tiempo para cuidar y jugar con los perritos en el refugio.</p>
            </div>
          </div>

          <div className="voluntario-card">
            <img src="/imagenes/voluntario2.webp" alt="Jornada de adopción" />
            <div className="voluntario-info">
              <h3>Jornadas de Adopción</h3>
              <p>Voluntarios apoyando en nuestras jornadas de adopción mensuales en diferentes puntos de la ciudad.</p>
            </div>
          </div>

          <div className="voluntario-card">
            <img src="/imagenes/voluntario3.webp" alt="Promoción en redes sociales" />
            <div className="voluntario-info">
              <h3>Promoción en Redes</h3>
              <p>
                Voluntarios ayudando a difundir nuestra labor en redes sociales y creando contenido para nuestras
                campañas.
              </p>
            </div>
          </div>
        </div>

        <div className="testimonios-voluntarios">
          <h3>Testimonios de Voluntarios</h3>

          {loading ? (
            <div className="loading-testimonios">Cargando testimonios...</div>
          ) : error ? (
            <div className="error-testimonios">{error}</div>
          ) : testimonials.length === 0 ? (
            <div className="no-testimonios">No hay testimonios disponibles en este momento.</div>
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
                      <p>{testimonio.rol || "Voluntario"}{testimonio.anioInicio ? ` desde ${testimonio.anioInicio}` : ""}</p>
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