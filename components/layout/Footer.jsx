"use client"
import Link from "next/link"
import "@/styles/components/footer.css"
import { useLanguage } from "@/contexts/language-context"

const Footer = () => {
  const { t } = useLanguage()

  return (
    <footer className="footer-mejorado">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-info">
            <img src="/imagenes/logo.webp" alt="Logo Montañita Adopta" className="footer-logo" />
            <p>{t("FOOTER_TITLE")}</p>
          </div>

          <div className="footer-links">
            <h3>{t("FOOTER_QUICK_LINKS")}</h3>
            <ul>
              <li>
                <Link href="/">{t("FOOTER_HOME")}</Link>
              </li>
              <li>
                <Link href="/#adoptar">{t("FOOTER_HOW_TO_ADOPT")}</Link>
              </li>
              <li>
                <Link href="/adopcion">{t("FOOTER_AVAILABLE_ANIMALS")}</Link>
              </li>
              <li>
                <Link href="/donaciones">{t("FOOTER_DONATE")}</Link>
              </li>
              <li>
                <Link href="/contacto">{t("FOOTER_CONTACT")}</Link>
              </li>
            </ul>
          </div>

          <div className="footer-contact">
            <h3>{t("FOOTER_CONTACT_US")}</h3>
            <p>
              <i className="fas fa-map-marker-alt"></i> La Montañita, Caquetá, Colombia
            </p>
            <p>
              <i className="fas fa-phone"></i> +57 320 206 4950
            </p>
            <p>
              <i className="fas fa-envelope"></i> montanitaadopta@gmail.com
            </p>
          </div>

          <div className="footer-social">
            <h3>{t("FOOTER_FOLLOW_US")}</h3>
            <div className="social-icons">
              <a
                href="https://www.facebook.com/share/1Dz6tRcM9o/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://wa.me/+573202064950" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t("FOOTER_RIGHTS")}</p>
          <p>{t("FOOTER_CREATED_BY")}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
