import SuccessStoriesSection from "@/components/success-stories/SuccessStoriesSection"
import "@/styles/pages/historias-exito.css"

export const metadata = {
  title: "Historias Felices - Montañita Adopta",
  description: "Conoce las historias de éxito de nuestros animales adoptados y comparte la tuya.",
}

export default function HistoriasExitoPage() {
  console.log("Renderizando página de Historias de Éxito")
  return (
    <main>
      <section className="success-stories-section">
        <div className="container">
          <SuccessStoriesSection />
        </div>
      </section>
    </main>
  )
}

