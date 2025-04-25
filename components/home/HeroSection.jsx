"use client"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

const HeroSection = () => {
  const { t } = useLanguage()
  
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <h1>{t("HOME_HERO_TITLE", "home")}</h1>
          <p className="hero-subtitle">{t("HOME_HERO_SUBTITLE", "home")}</p>
          <p className="hero-description">{t("HOME_HERO_DESCRIPTION", "home")}</p>
          <div className="hero-buttons">
            <Link href="/adopcion" className="btn btn-primary">
              <i className="fas fa-paw"></i> {t("HOME_HERO_BUTTON_ADOPT", "home")}
            </Link>
            <Link href="/donaciones" className="btn btn-secondary">
              <i className="fas fa-heart"></i> {t("HOME_HERO_BUTTON_DONATE", "home")}
            </Link>
          </div>
        </div>
      </div>
      <div className="hero-wave"></div>
    </section>
  )
}

export default HeroSection