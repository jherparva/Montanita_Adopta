import Link from "next/link"

const DashboardStats = ({ stats }) => {
  // Garantizar que stats siempre sea un objeto
  const data = stats || {}
  
  const StatCard = ({ icon, title, number, smallText, linkHref, linkText = "Ver todos" }) => (
    <div className="stat-card">
      <div className="stat-icon">
        <i className={`fas fa-${icon}`}></i>
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-number">{number}</p>
        {smallText && <small>{smallText}</small>}
      </div>
      <Link href={linkHref} className="stat-link">
        {linkText} <i className="fas fa-arrow-right"></i>
      </Link>
    </div>
  )

  const StatSection = ({ title, children }) => (
    <div className="stats-section">
      <h3 className="stats-category">{title}</h3>
      <div className="dashboard-stats">
        {children}
      </div>
    </div>
  )

  return (
    <div className="dashboard-stats-container">
      <h2 className="section-title">Estadísticas Generales</h2>
      
      <StatSection title="Adopciones">
        <StatCard 
          icon="paw" 
          title="Total de Animales" 
          number={data.totalAnimals || 0} 
          linkHref="/admin/animales" 
        />
        <StatCard 
          icon="home" 
          title="Animales Adoptados" 
          number={data.adoptedAnimals || 0} 
          linkHref="/admin/animales?status=adopted" 
        />
        <StatCard 
          icon="search" 
          title="Animales Disponibles" 
          number={data.availableAnimals || 0} 
          linkHref="/admin/animales?status=available" 
        />
        <StatCard 
          icon="file-alt" 
          title="Solicitudes Pendientes" 
          number={data.pendingAdoptions || 0} 
          linkHref="/admin/solicitudes?status=pending" 
          linkText="Ver todas" 
        />
      </StatSection>

      <StatSection title="Comunicación">
        <StatCard 
          icon="envelope" 
          title="Mensajes Pendientes" 
          number={data.pendingMessages || 0} 
          linkHref="/admin/mensajes?status=unread" 
          linkText="Ver todos" 
        />
        <StatCard 
          icon="heart" 
          title="Historias de Éxito" 
          number={data.totalStories || 0} 
          linkHref="/admin/historias" 
          linkText="Ver todas" 
        />
      </StatSection>

      <StatSection title="Apoyo">
        <StatCard 
          icon="users" 
          title="Voluntarios" 
          number={data.totalVolunteers || 0} 
          smallText={`Activos: ${data.activeVolunteers || 0}`} 
          linkHref="/admin/voluntarios" 
        />
        <StatCard 
          icon="hand-holding-heart" 
          title="Donaciones" 
          number={`$${(data.totalDonationAmount || 0).toFixed(2)}`} 
          smallText={`Total: ${data.totalDonations || 0}`} 
          linkHref="/admin/donaciones" 
          linkText="Ver todas" 
        />
        <StatCard 
          icon="star" 
          title="Patrocinadores" 
          number={data.totalSponsors || 0} 
          smallText={`Activos: ${data.activeSponsors || 0}`} 
          linkHref="/admin/patrocinios" 
        />
      </StatSection>

      <StatSection title="Salud">
        <StatCard 
          icon="stethoscope" 
          title="Servicios Veterinarios" 
          number={data.pendingVetServices || 0} 
          smallText="Pendientes" 
          linkHref="/admin/veterinario" 
        />
        <StatCard 
          icon="calendar-check" 
          title="Citas Pendientes" 
          number={data.pendingAppointments || 0} 
          smallText={`Completadas: ${data.completedAppointments || 0}`} 
          linkHref="/admin/citas" 
          linkText="Ver todas" 
        />
      </StatSection>

      <StatSection title="Usuarios">
        <StatCard 
          icon="user-shield" 
          title="Total Usuarios" 
          number={data.totalUsers || 0} 
          smallText={`Administradores: ${data.adminUsers || 0}`} 
          linkHref="/admin/usuarios" 
        />
        <StatCard 
          icon="chart-line" 
          title="Actividad Reciente" 
          number={data.recentActivities || 0} 
          smallText="Últimos 7 días" 
          linkHref="/admin/actividades" 
          linkText="Ver detalles" 
        />
      </StatSection>
    </div>
  )
}

export default DashboardStats