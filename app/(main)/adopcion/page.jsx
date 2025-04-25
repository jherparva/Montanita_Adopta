//C:\Users\jhon\Music\montanita-adopta\app\(main)\adopcion\page.jsx
import AdoptionSection from "@/components/adoption/AdoptionSection"
import AnimalsSection from "@/components/adoption/AnimalsSection"
import VeterinaryServicesSection from "@/components/adoption/VeterinaryServicesSection"
import "@/styles/pages/adopcion.css"

export const metadata = {
  title: "Adopciones - Montañita Adopta",
  description: "Conoce a los animales disponibles para adopción y encuentra a tu compañero ideal.",
}

export default function AdopcionPage() {
  return (
    <main>
      <AdoptionSection />
      <AnimalsSection />
      <VeterinaryServicesSection />
    </main>
  )
}

