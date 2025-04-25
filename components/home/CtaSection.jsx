"use client"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

const AyudaSection = () => {
  const { t } = useLanguage()

  return (
    <section className="ayuda-section">
      <div className="container">
        <div className="ayuda-content">
          <h2>{t("HOME_CTA_TITLE", "home")}</h2>
          <p>{t("HOME_CTA_DESCRIPTION", "home")}</p>

          <div className="ayuda-buttons">
            <Link href="/adopcion" className="btn btn-primary">
              <i className="fas fa-paw"></i> {t("HOME_CTA_BUTTON_ADOPT", "home")}
            </Link>
            <Link href="/donaciones" className="btn btn-secondary">
              <i className="fas fa-heart"></i> {t("HOME_CTA_BUTTON_DONATE", "home")}
            </Link>
            <Link href="/voluntario" className="btn btn-tertiary">
              <i className="fas fa-hands-helping"></i> {t("HOME_CTA_BUTTON_VOLUNTEER", "home")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AyudaSection