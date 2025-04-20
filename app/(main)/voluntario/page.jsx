"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import VolunteerBanner from "@/components/volunteer/VolunteerBanner"
import VolunteerSection from "@/components/volunteer/VolunteerSection"
import VolunteerRequirements from "@/components/volunteer/VolunteerRequirements"
import VolunteerGallery from "@/components/volunteer/VolunteerGallery"
import SponsorSection from "@/components/volunteer/SponsorSection"
import "@/styles/pages/voluntariado.css"

export default function VoluntarioPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasApplication, setHasApplication] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check")
        const data = await res.json()

        if (data.authenticated || data.isAuthenticated) {
          setUser(data.user)
          checkVolunteerApplication(data.user.id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const checkVolunteerApplication = async (userId) => {
    try {
      const res = await fetch(`/api/volunteer/check`)
      const data = await res.json()

      if (data.success && data.hasApplication) {
        setHasApplication(true)
        setApplicationStatus(data.status || data.application?.estado)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error al verificar solicitud de voluntariado:", error)
      setLoading(false)
    }
  }

  return (
    <main>
      <VolunteerBanner />

      {hasApplication && (
        <div className={`application-status ${applicationStatus}`}>
          <div className="status-content">
            <h3>
              Estado de tu solicitud:{" "}
              {applicationStatus === "pendiente"
                ? "En revisión"
                : applicationStatus === "aprobado"
                ? "Aprobada"
                : "Rechazada"}
            </h3>

            {applicationStatus === "pendiente" && (
              <p>Tu solicitud está siendo revisada por nuestro equipo. Te contactaremos pronto.</p>
            )}

            {applicationStatus === "aprobado" && (
              <p>
                ¡Felicidades! Tu solicitud ha sido aprobada. Nos pondremos en contacto contigo para coordinar tu
                incorporación.
              </p>
            )}

            {applicationStatus === "rechazado" && (
              <p>
                Lo sentimos, tu solicitud no ha sido aprobada en esta ocasión. Puedes enviar una nueva solicitud si lo
                deseas.
              </p>
            )}
          </div>
        </div>
      )}

      <VolunteerSection />
      <VolunteerRequirements />
      <div id="formulario"></div>
      <VolunteerGallery />
      <SponsorSection />
    </main>
  )
}