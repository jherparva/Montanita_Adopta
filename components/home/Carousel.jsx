"use client"
import { useState, useEffect, useRef } from "react"

const HomeCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isInViewport, setIsInViewport] = useState(false)
  const carouselRef = useRef(null)
  const carouselItemsRef = useRef([])
  
  // Slides del carrusel principal
  const slides = [
    {
      image: "/imagenes/1.webp",
      title: "Montañita Adopta",
      description: "Únete a nuestra comunidad y forma parte del cambio que queremos ver.",
    },
    {
      image: "/imagenes/2.webp",
      title: "Cambia su destino",
      description: "Nuestros amigos peludos buscan una familia que les brinde el amor que merecen.",
    },
    {
      image: "/imagenes/3.webp",
      title: "Encuentra tu compañero ideal",
      description: "Descubre la alegría de dar un hogar a quien realmente lo necesita.",
    },
    {
      image: "/imagenes/4.webp",
      title: "Dale un hogar a quien lo necesita",
      description: "La felicidad tiene cuatro patas y está esperando por ti en Montañita Adopta.",
    },
    {
      image: "/imagenes/5.webp",
      title: "Una familia para cada mascota",
      description: "Juntos podemos crear un futuro mejor para los animales de La Montañita.",
    },
    {
      image: "/imagenes/6.webp",
      title: "Ellos esperan por ti",
      description: "Tu hogar puede ser el refugio que un animal ha estado esperando.",
    },
    {
      image: "/imagenes/7.webp",
      title: "Amor de cuatro patas",
      description: "No compres, adopta. Hay miles de corazones latiendo en busca de un hogar.",
    },
    {
      image: "/imagenes/8.webp",
      title: "Montañita Adopta",
      description: "Únete a nuestra comunidad y forma parte del cambio que queremos ver.",
    },
  ]
  
  // Función de throttle reutilizable
  const throttle = (func, limit) => {
    let inThrottle
    return function() {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
  
  // Verificar si el carrusel está en el viewport
  useEffect(() => {
    const checkIfInViewport = () => {
      if (!carouselRef.current) return
      
      const rect = carouselRef.current.getBoundingClientRect()
      const isVisible = 
        rect.top >= -rect.height / 2 &&
        rect.bottom <= window.innerHeight + rect.height / 2
      
      setIsInViewport(isVisible)
    }
    
    const throttledCheck = throttle(checkIfInViewport, 100)
    
    checkIfInViewport()
    window.addEventListener('scroll', throttledCheck)
    window.addEventListener('resize', throttledCheck)
    
    return () => {
      window.removeEventListener('scroll', throttledCheck)
      window.removeEventListener('resize', throttledCheck)
    }
  }, [])
  
  // Configurar el intervalo del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning && isInViewport) {
        handleNextSlide()
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isTransitioning, isInViewport])
  
  // Efecto de entrada inicial con fade-in
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.style.opacity = '0'
      setTimeout(() => {
        carouselRef.current.style.opacity = '1'
        carouselRef.current.style.transition = 'opacity 1s ease-in-out'
      }, 100)
    }
  }, [])
  
  // Efecto parallax para las imágenes
  useEffect(() => {
    const parallaxEffect = () => {
      if (!isInViewport || !carouselRef.current) return
      
      const scrollPosition = window.pageYOffset
      const carouselItems = carouselItemsRef.current
      
      carouselItems.forEach(item => {
        if (!item) return
        const img = item.querySelector('img')
        if (!img) return
        
        const speed = 0.15
        const yPos = -(scrollPosition * speed)
        img.style.transform = `translateY(${yPos}px)`
      })
    }
    
    const throttledParallax = throttle(parallaxEffect, 20)
    
    window.addEventListener('scroll', throttledParallax)
    return () => window.removeEventListener('scroll', throttledParallax)
  }, [isInViewport])
  
  // Funciones para navegación del carrusel
  const goToSlide = (index) => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      setCurrentSlide(index)
      setTimeout(() => setIsTransitioning(false), 600)
    }
  }
  
  const handleNextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
      setTimeout(() => setIsTransitioning(false), 600)
    }
  }
  
  const handlePrevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
      setTimeout(() => setIsTransitioning(false), 600)
    }
  }
  
  return (
    <div className="carousel-wrapper">
      <div 
        className="carousel slide" 
        ref={carouselRef}
        id="homeCarousel"
      >
        {/* Indicadores */}
        <div className="carousel-indicators">
          {slides.map((_, index) => (
            <button
              key={`indicator-${index}`}
              type="button"
              className={index === currentSlide ? "active" : ""}
              aria-current={index === currentSlide ? "true" : "false"}
              aria-label={`Slide ${index + 1}`}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
            ></button>
          ))}
        </div>
        
        {/* Slides */}
        <div className="carousel-inner">
          {slides.map((slide, index) => (
            <div
              key={`slide-${index}`}
              className={`carousel-item ${index === currentSlide ? "active" : ""}`}
              ref={el => carouselItemsRef.current[index] = el}
            >
              <div className="overlay"></div>
              <img 
                src={slide.image} 
                className="d-block w-100" 
                alt={slide.title} 
                loading={index === 0 ? "eager" : "lazy"}
              />
              <div className="carousel-caption d-none d-md-block">
                <h5>{slide.title}</h5>
                <p>{slide.description}</p>
              </div>
              
              <div className="carousel-caption-mobile d-md-none">
                <h5>{slide.title}</h5>
                <p>{slide.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Controles de navegación */}
        <button 
          className="carousel-control-prev" 
          type="button"
          onClick={handlePrevSlide}
          aria-label="Previous slide"
          disabled={isTransitioning}
        >
          <span className="carousel-control-prev-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 16 16">
              <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
            </svg>
          </span>
        </button>
        <button 
          className="carousel-control-next" 
          type="button"
          onClick={handleNextSlide}
          aria-label="Next slide"
          disabled={isTransitioning}
        >
          <span className="carousel-control-next-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 16 16">
              <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </span>
        </button>
      </div>
    </div>
  )
}

export default HomeCarousel