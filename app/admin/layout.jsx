import AdminLayout from "@/components/admin/AdminLayout"
import '@/styles/admin/admin-reset.css';
import '@/styles/admin/dashboard.css';
import '@/styles/admin/administración_animales.css';




export const metadata = {
  title: "Panel de Administración - Montañita Adopta",
  description: "Gestión de animales, solicitudes y usuarios para administradores.",
}

export default function AdminRootLayout({ children }) {
  return (
    <div className="admin-root">
      <AdminLayout>{children}</AdminLayout>
    </div>
  )
}