import DonationsHero from "@/components/donations/HeroDonationsSection"
import MonetaryDonation from "@/components/donations/MonetaryDonationSection"
import FoodDonation from "@/components/donations/FoodDonationSection"
import "@/styles/pages/donaciones.css"

export const metadata = {
  title: "Donaciones - Ayúdanos a Salvar Vidas",
  description: "Realiza tu donación para ayudar a los animales rescatados por Montañita Adopta",
}

export default function DonacionesPage() {
  return (
    <main>
      <div className="donations-page">
        <DonationsHero />
        <MonetaryDonation />
        <FoodDonation />
      </div>
    </main>
  )
}