"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const RecentMessages = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchRecentMessages = async () => {
      try {
        const response = await fetch("/api/admin/messages/recent?limit=5")
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages || [])
        }
      } catch (error) {
        console.error("Error al obtener mensajes recientes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentMessages()
  }, [])

  const handleViewAll = (e) => {
    e.preventDefault()
    router.push("/admin/mensajes")
  }

  const handleViewMessage = (e, messageId) => {
    e.preventDefault()
    router.push(`/admin/mensajes?highlight=${messageId}`)
  }

  return (
    <div className="dashboard-card recent-messages">
      <div className="card-header">
        <h3>Mensajes Recientes</h3>
        <a href="#" onClick={handleViewAll} className="view-all">
          Ver todos <i className="fas fa-arrow-right"></i>
        </a>
      </div>

      <div className="card-content">
        {loading ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Cargando mensajes recientes...</p>
          </div>
        ) : messages.length > 0 ? (
          <div className="messages-list">
            {messages.map((message) => (
              <div key={message._id} className={`message-item ${message.read ? "" : "unread"}`}>
                <div className="message-header">
                  <div className="message-sender">
                    <i className="fas fa-user-circle"></i>
                    <span>{message.name}</span>
                  </div>
                  <div className="message-date">{new Date(message.date).toLocaleDateString()}</div>
                </div>
                <div className="message-subject">
                  <strong>Asunto:</strong> {message.subject}
                </div>
                <div className="message-preview">{message.message?.substring(0, 100)}...</div>
                <div className="message-actions">
                  <a href="#" onClick={(e) => handleViewMessage(e, message._id)} className="view-message">
                    Ver mensaje completo <i className="fas fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No hay mensajes recientes</p>
        )}
      </div>
    </div>
  )
}

export default RecentMessages