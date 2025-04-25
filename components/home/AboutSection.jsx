"use client"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

const AboutSection = () => {
  const { t } = useLanguage()

  return (
    <section className="about-section" id="nosotros">
      <div className="container">
        <div className="section-header">
          <h2>{t("HOME_ABOUT_TITLE", "home")}</h2>
          <div className="paw-divider">
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
          </div>
          <p>{t("HOME_ABOUT_DESCRIPTION", "home")}</p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <div className="about-icon">
              <i className="fas fa-heart"></i>
            </div>
            <h3>{t("HOME_ABOUT_MISSION_TITLE", "home")}</h3>
            <p>{t("HOME_ABOUT_MISSION_DESCRIPTION", "home")}</p>
          </div>

          <div className="about-card">
            <div className="about-icon">
              <i className="fas fa-eye"></i>
            </div>
            <h3>{t("HOME_ABOUT_VISION_TITLE", "home")}</h3>
            <p>{t("HOME_ABOUT_VISION_DESCRIPTION", "home")}</p>
          </div>

          <div className="about-card">
            <div className="about-icon">
              <i className="fas fa-hands-helping"></i>
            </div>
            <h3>{t("HOME_ABOUT_HELP_TITLE", "home")}</h3>
            <p>{t("HOME_ABOUT_HELP_DESCRIPTION", "home")}</p>
          </div>

          <div className="about-card">
            <div className="about-icon">
              <i className="fas fa-users"></i>
            </div>
            <h3>{t("HOME_ABOUT_TEAM_TITLE", "home")}</h3>
            <p>{t("HOME_ABOUT_TEAM_DESCRIPTION", "home")}</p>
            <Link href="/voluntario" className="about-link">
              {t("HOME_ABOUT_JOIN_US", "home")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection