import Link from "next/link"
import "@/styles/components/footer.css"

const Footer = () => {
  return (
    <footer className="footer-mejorado">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-info">
            <img src="/imagenes/logo.webp" alt="Logo Montañita Adopta" className="footer-logo" />
            <p>Ayudando a encontrar hogares amorosos para mascotas desde 2024</p>
          </div>

          <div className="footer-links">
            <h3>Enlaces rápidos</h3>
            <ul>
              <li>
                <Link href="/">Inicio</Link>
              </li>
              <li>
                <Link href="/#adoptar">Cómo adoptar</Link>
              </li>
              <li>
                <Link href="/adopcion">Animales disponibles</Link>
              </li>
              <li>
                <Link href="/donaciones">Donar</Link>
              </li>
              <li>
                <Link href="/contacto">Contacto</Link>
              </li>
            </ul>
          </div>

          <div className="footer-contact">
            <h3>Contáctanos</h3>
            <p>
              <i className="fas fa-map-marker-alt"></i> La Montañita, Caquetá, Colombia
            </p>
            <p>
              <i className="fas fa-phone"></i> +57 316 653 2433
            </p>
            <p>
              <i className="fas fa-envelope"></i> info@montanitaadopta.com
            </p>
          </div>

          <div className="footer-social">
            <h3>Síguenos</h3>
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
              <a href="https://wa.me/+573166532433" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Montañita Adopta - Todos los derechos reservados</p>
          <p>Creado por John Hernando Parra Valderrama</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

