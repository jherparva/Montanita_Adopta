import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

const SuccessStoryCard = ({ story }) => {
  const formattedDate = story.date
    ? formatDistanceToNow(new Date(story.date), { addSuffix: true, locale: es })
    : "Fecha desconocida"

  return (
    <div className={story.id ? "story-card" : "success-story-card"}>
      <div className="story-image">
        {story.image ? (
          <img
            src={story.image}
            alt={`Historia de ${story.author || "adopción"}`}
            className="story-img"
          />
        ) : (
          <img src="/placeholder.svg" alt="Imagen no disponible" className="story-img placeholder" />
        )}
      </div>
      <div className="story-content">
        <h4 className="story-title">{story.title || "Historia sin título"}</h4>
        <p className="story-text">
          {story.content?.length > 150 ? `${story.content.substring(0, 150)}...` : story.content}
        </p>
        <div className="story-footer">
          <span className="story-date">{formattedDate}</span>
          <span className="story-author">Por: {story.author || "Anónimo"}</span>
        </div>
      </div>
    </div>
  )
}

export default SuccessStoryCard