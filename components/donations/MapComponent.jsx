"use client"
import { useEffect, useRef } from 'react'
import { useLanguage } from "@/contexts/language-context"

const MapComponent = ({ position }) => {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const { t } = useLanguage()

  useEffect(() => {
    // Importa Leaflet dinámicamente solo en el cliente
    const loadMap = async () => {
      try {
        // Importa las dependencias de Leaflet
        const L = await import('leaflet')
        
        // Importa los estilos de Leaflet
        await import('leaflet/dist/leaflet.css')
        
        // Inicializa el mapa si no existe
        if (!mapInstance.current && mapRef.current) {
          // Crear el mapa
          mapInstance.current = L.map(mapRef.current).setView(position, 15)
          
          // Añadir la capa de OpenStreetMap
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(mapInstance.current)
          
          // Añadir marcador
          const marker = L.marker(position).addTo(mapInstance.current)
          
          // Añadir popup al marcador con texto traducido
          marker.bindPopup(`
            <div style="padding: 5px; max-width: 200px;">
              <h3 style="margin-top: 0; color: #e01e1e; font-size: 16px;">${t("MAP_TITLE", "adopcion")}</h3>
              <p style="margin-bottom: 5px;"><strong>${t("VET_ADDRESS_LABEL", "adopcion")}</strong> ${t("MAP_ADDRESS", "adopcion")}</p>
              <p style="margin-bottom: 5px;"><strong>${t("VET_PHONE_LABEL", "adopcion")}</strong> ${t("MAP_PHONE", "adopcion")}</p>
              <p style="margin-bottom: 0;"><strong>${t("VET_SCHEDULE_LABEL", "adopcion")}</strong> ${t("MAP_SCHEDULE", "adopcion")}</p>
            </div>
          `).openPopup()
        }
      } catch (error) {
        console.error('Error loading map:', error)
      }
    }
    
    loadMap()
    
    // Limpieza al desmontar el componente
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [position, t])

  return <div ref={mapRef} style={{ width: '100%', height: '300px', borderRadius: '8px' }} />
}

export default MapComponent