"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "./AdminSidebar"
import AdminHeader from "./AdminHeader"
import styles from "@/styles/admin/Admin_Dashboard.module.css" 

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
      })
      router.push("/admin")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <div 
      className={`${styles.adminRoot} ${styles.adminLayout} ${
        sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
      }`}
    >
      <AdminSidebar isOpen={sidebarOpen} />
      <div className={styles.adminMain}>
        <AdminHeader toggleSidebar={toggleSidebar} onLogout={handleLogout} />
        <div className={styles.adminContent}>{children}</div>
      </div>
    </div>
  )
}

export default AdminLayout