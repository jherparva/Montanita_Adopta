//C:\Users\jhon\Music\montanita-adopta\app\(main)\formulario-adopcion\page.jsx
"use client"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import AdoptionForm from "@/components/adoption-form/AdoptionForm"
import "@/styles/pages/formulario-adopcion.css"

export default function FormularioAdopcionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const animalId = searchParams.get("id")
  const [animal, setAnimal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check")
        const data = await res.json()

        if (data.authenticated || data.isAuthenticated) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          // No usamos unauthorized() para evitar redirecciones automáticas
          // y poder mostrar un mensaje personalizado
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error)
        setIsAuthenticated(false)
      } finally {
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [])

  // Cargar datos del animal
  useEffect(() => {
    if (!authChecked) return

    const fetchAnimal = async () => {
      setLoading(true)
      setError(null)

      try {
        // Si tenemos un ID específico, intentamos cargar ese animal
        if (animalId) {
          try {
            const res = await fetch(`/api/animals?id=${animalId}`)

            if (res.ok) {
              const data = await res.json()
              if (data.success && data.animal) {
                setAnimal(data.animal)
                return
              }
            }
          } catch (err) {
            console.error("Error al cargar animal específico:", err)
            // Continuamos con los datos de ejemplo si falla
          }
        }

        // Si no hay ID o falló la carga, usamos datos de ejemplo
        const sampleAnimals = [
          {
            id: 1,
            name: "Max",
            species: "dog",
            breed: "Labrador",
            age: "adult",
            size: "large",
            description: "Max es un labrador amigable y juguetón que adora a los niños y otros perros.",
            image: "/imagenes/mascotas/perro1.webp",
          },
          {
            id: 2,
            name: "Luna",
            species: "dog",
            breed: "Pastor Alemán",
            age: "puppy",
            size: "medium",
            description: "Luna es una cachorra muy activa y cariñosa que busca una familia que le dé mucho amor.",
            image: "/imagenes/mascotas/perro2.webp",
          },
        ]

        if (animalId) {
          const foundAnimal = sampleAnimals.find((a) => a.id === Number.parseInt(animalId))
          setAnimal(foundAnimal || sampleAnimals[0])
        } else {
          setAnimal(sampleAnimals[0])
        }
      } catch (error) {
        console.error("Error al cargar datos del animal:", error)
        setError("No se pudo cargar la información del animal. Por favor intenta nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchAnimal()
  }, [animalId, authChecked])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">
          <i className="fas fa-paw fa-spin"></i>
        </div>
        <p>Cargando información de la mascota...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error al cargar la información</h2>
        <p>{error}</p>
        <button onClick={() => router.push("/adopcion")}>Ver todos los animales disponibles</button>
      </div>
    )
  }

  return (
    <main className="adopcion-page">
      {/* Banner con imagen inspiradora */}
      <div className="adopcion-banner">
        <div className="banner-overlay">
          <h1>Cambia una Vida Adopta con Amor</h1>
          <p>Das un hogar, recibes amor incondicional</p>
        </div>
      </div>

      <div className="adopcion-container">
        <h2 className="main-title">Formulario de Adopción</h2>

        {animal && <AdoptionForm animal={animal} isAuthenticated={isAuthenticated} />}
      </div>
    </main>
  )
}
