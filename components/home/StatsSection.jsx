'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from "@/contexts/language-context"
import LoadingSpinner from '../ui/LoadingSpinner'

const StatsSection = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { t } = useLanguage()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/home/stats')
        const data = await response.json()
        
        if (data.success) {
          setStats(data.stats)
        } else {
          setError("No se pudieron cargar las estadísticas")
        }
      } catch (err) {
        console.error("Error al obtener estadísticas:", err)
        setError("Error al conectar con el servidor")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Componente para mostrar cuando hay un error
  const ErrorDisplay = () => (
    <div className="stats-error">
      <p>No se pudieron cargar las estadísticas. Por favor, intenta más tarde.</p>
      <button 
        className="retry-button" 
        onClick={() => {
          setLoading(true);
          setError(null);
          fetchStats();
        }}
      >
        Reintentar
      </button>
    </div>
  )

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <section className="stats-section">
        <div className="container">
          <div className="stats-loading">
            <LoadingSpinner />
          </div>
        </div>
      </section>
    )
  }

  // Si hay un error, mostrar mensaje
  if (error || !stats) {
    return (
      <section className="stats-section">
        <div className="container">
          <ErrorDisplay />
        </div>
      </section>
    )
  }

  // Renderizar estadísticas con datos reales
  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-home"></i>
            </div>
            <div className="stat-number">{stats.adoptedCount}+</div>
            <div className="stat-label">{t("HOME_STATS_ANIMALS_ADOPTED", "home")}</div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-medkit"></i>
            </div>
            <div className="stat-number">{stats.rescuedCount}+</div>
            <div className="stat-label">{t("HOME_STATS_ANIMALS_RESCUED", "home")}</div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-user-friends"></i>
            </div>
            <div className="stat-number">{stats.volunteersCount}+</div>
            <div className="stat-label">{t("HOME_STATS_ACTIVE_VOLUNTEERS", "home")}</div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-hand-holding-heart"></i>
            </div>
            <div className="stat-number">{stats.donorsCount}+</div>
            <div className="stat-label">{t("HOME_STATS_DONORS", "home")}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StatsSection