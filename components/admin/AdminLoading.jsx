import styles from "@/styles/admin/Admin_Dashboard.module.css"

const AdminLoading = ({ message = "Cargando..." }) => {
  return (
    <div className={styles.adminLoading}>
      <div className={styles.spinner}>
        <i className="fas fa-spinner fa-spin"></i>
      </div>
      <p>{message}</p>
    </div>
  )
}

export default AdminLoading