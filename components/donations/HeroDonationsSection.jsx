"use client"
import { useLanguage } from "@/contexts/language-context"

const DonationsHero = () => {
  const { t, isLoaded } = useLanguage()
  
  
  return (
    <section className="hero-section">
      <div className="container">
        <h1>{t("DONATIONS_TITLE", "donaciones") || "Donaciones"}</h1>
        <p className="urgent-message">
          <i className="fas fa-exclamation-circle"></i> {t("DONATIONS_URGENT_MESSAGE", "donaciones") || "Necesitamos tu ayuda urgentemente"}
        </p>
        <p>{t("DONATIONS_SUBTITLE", "donaciones") || "Tu apoyo es fundamental para nuestra misión"}</p>
        <div className="hero-buttons">
          <a href="#donacion-monetaria" className="btn btn-primary">
            {t("DONATIONS_BUTTON_DONATE", "donaciones") || "Donar ahora"}
          </a>
          <a href="#donacion-alimentos" className="btn btn-outline-primary">
            {t("DONATIONS_BUTTON_DONATE_FOOD", "donaciones") || "Donar alimentos"}
          </a>
        </div>
      </div>
    </section>
  )
}

export default DonationsHero