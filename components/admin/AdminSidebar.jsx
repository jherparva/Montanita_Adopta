"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "@/styles/admin/Admin_Dashboard.module.css"

const Icon = ({ name }) => <i className={name} aria-hidden="true"></i>

const AdminSidebar = ({ isOpen }) => {
  const pathname = usePathname()

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "fas fa-tachometer-alt" },
    { name: "Animales", path: "/admin/animales", icon: "fas fa-paw" },
    { name: "Solicitudes de Adopción", path: "/admin/solicitudes", icon: "fas fa-file-alt" },
    { name: "Mensajes de Contacto", path: "/admin/mensajes", icon: "fas fa-envelope" },
    { name: "Historias de Éxito", path: "/admin/historias", icon: "fas fa-heart" },
    { name: "Veterinario", path: "/admin/veterinario", icon: "fas fa-stethoscope" },
    { name: "Donaciones", path: "/admin/donaciones", icon: "fas fa-hand-holding-heart" },
    { name: "Voluntarios", path: "/admin/voluntarios", icon: "fas fa-users" },
    { name: "Patrocinios", path: "/admin/patrocinios", icon: "fas fa-star" },
    { name: "Usuarios", path: "/admin/usuarios", icon: "fas fa-user-shield" },
    { name: "Configuración", path: "/admin/configuracion", icon: "fas fa-cog" },
  ]

  return (
    <div className={`${styles.adminSidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.sidebarHeader}>
        <img src="/imagenes/logo.webp" alt="Logo Montañita Adopta" className={styles.sidebarLogo} />
        <h2>Montañita Adopta</h2>
      </div>

      <nav className={styles.sidebarNav}>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path} className={pathname === item.path ? styles.active : ""}>
                <Icon name={item.icon} />
                <span>{item.name}</span>
                {item.path === "/admin/solicitudes" && <span className={styles.notificationBadge}>5</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        <p>© 2025 Montañita Adopta</p>
      </div>
    </div>
  )
}

export default AdminSidebar