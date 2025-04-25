"use client"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

const AdoptionStepsSection = () => {
  const { t } = useLanguage()

  return (
    <section className="adoption-steps-section" id="adoptar">
      <div className="container">
        <div className="section-header">
          <h2>{t("HOME_STEPS_TITLE", "home")}</h2>
          <div className="paw-divider">
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
            <i className="fas fa-paw"></i>
          </div>
          <p>{t("HOME_STEPS_DESCRIPTION", "home")}</p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon">
              <i className="fas fa-search"></i>
            </div>
            <h3>{t("HOME_STEPS_1_TITLE", "home")}</h3>
            <p>{t("HOME_STEPS_1_DESCRIPTION", "home")}</p>
            <Link href="/adopcion" className="step-link">
              {t("HOME_STEPS_1_BUTTON", "home")}
            </Link>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <h3>{t("HOME_STEPS_2_TITLE", "home")}</h3>
            <p>{t("HOME_STEPS_2_DESCRIPTION", "home")}</p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon">
              <i className="fas fa-comments"></i>
            </div>
            <h3>{t("HOME_STEPS_3_TITLE", "home")}</h3>
            <p>{t("HOME_STEPS_3_DESCRIPTION", "home")}</p>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-icon">
              <i className="fas fa-handshake"></i>
            </div>
            <h3>{t("HOME_STEPS_4_TITLE", "home")}</h3>
            <p>{t("HOME_STEPS_4_DESCRIPTION", "home")}</p>
          </div>

          <div className="step-card">
            <div className="step-number">5</div>
            <div className="step-icon">
              <i className="fas fa-home"></i>
            </div>
            <h3>{t("HOME_STEPS_5_TITLE", "home")}</h3>
            <p>{t("HOME_STEPS_5_DESCRIPTION", "home")}</p>
          </div>
        </div>

        <div className="adoption-cta">
          <p>{t("HOME_STEPS_CTA_TEXT", "home")}</p>
          <Link href="/adopcion" className="btn btn-primary">
            {t("HOME_STEPS_CTA_BUTTON", "home")}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default AdoptionStepsSection