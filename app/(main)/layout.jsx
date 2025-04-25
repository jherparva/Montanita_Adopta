import Menu from "@/components/layout/Menu"
import Footer from "@/components/layout/Footer"
import ModalManager from "@/components/auth/ModalManager"
import { getUserFromCookies } from "@/lib/utils/getUserFromCookies"
import "@/styles/components/language-flags.css"

export default async function MainLayout({ children }) {
  const user = await getUserFromCookies()

  return (
    <div className="page-container">
      <Menu user={user} />
      {children}
      <Footer />
      <ModalManager user={user} />
    </div>
  )
}
