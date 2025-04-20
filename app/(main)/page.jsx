import HomeCarousel from "@/components/home/Carousel"
import HeroSection from "@/components/home/HeroSection"
import AboutSection from "@/components/home/AboutSection"
import StatsSection from "@/components/home/StatsSection"
import AdoptionStepsSection from "@/components/home/AdoptionStepsSection"
import CtaSection from "@/components/home/CtaSection"
import WelcomePopup from "@/components/home/WelcomePopup"
import "@/styles/components/index.css"

export const metadata = {
  title: "Montañita Adopta - Encuentra un amigo peludo",
  description:
    "Plataforma de adopción de animales en La Montañita Caquetá. Encuentra perros y gatos que buscan un hogar amoroso.",
}
export default function HomePage() {
  return (
    <>
      <header>
        <WelcomePopup />
        <HomeCarousel />
      </header>

      <main className="home-page">
        <HeroSection />
        <AboutSection />
        <StatsSection />
        <AdoptionStepsSection />
        <CtaSection />
      </main>
    </>
  )
}

