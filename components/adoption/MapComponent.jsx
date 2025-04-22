"use client"
import { useEffect, useRef } from 'react'

const MapComponent = ({ position }) => {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

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
          
          // Añadir popup al marcador
          marker.bindPopup(`
            <div style="padding: 5px; max-width: 200px;">
              <h3 style="margin-top: 0; color: #e01e1e; font-size: 16px;">Montañita Adopta - Veterinaria</h3>
              <p style="margin-bottom: 5px;"><strong>Dirección:</strong> carrera 5 calle 8a #04, barrio guillermo escobar</p>
              <p style="margin-bottom: 5px;"><strong>Teléfono:</strong> 3166532433</p>
              <p style="margin-bottom: 0;"><strong>Horario:</strong> Lunes a Viernes 9:00 AM - 5:00 PM</p>
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
  }, [position])

  return <div ref={mapRef} style={{ width: '100%', height: '300px', borderRadius: '8px' }} />
}

export default MapComponent