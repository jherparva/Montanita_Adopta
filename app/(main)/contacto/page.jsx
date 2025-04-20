import ContactForm from "@/components/contact/ContactForm"
import "@/styles/pages/contacto.css"

export const metadata = {
  title: "Contacto - Montañita Adopta",
  description: "Ponte en contacto con nosotros para cualquier consulta sobre adopción o nuestros servicios.",
}

export default function ContactoPage() {
  return (
    <main className="contacto-page">
      <div className="contact-wrapper">
        <ContactForm />
      </div>

      {/* Onda decorativa */}
      <div className="wave-decoration"></div>
    </main>
  )
}

