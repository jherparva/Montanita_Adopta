"use client"
import { useState, useRef } from "react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

const SuccessSections = () => {
  const { t } = useLanguage()
  const [activeVideo, setActiveVideo] = useState("motivacional1.mp4")
  const videoRef = useRef(null)

  const handleVideoChange = (videoName) => {
    setActiveVideo(videoName)
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch((error) => {
        console.error("Error al reproducir el video:", error)
      })
    }
  }

  return (
    <div className="success-sections-container">
      {/* Sección de Video */}
      <div className="media-section">
        <h3>{t("STORIES_VIDEO_TITLE", "historias")}</h3>
        <div className="video-gallery">
          <video ref={videoRef} controls poster="/static/images/video-thumbnail1.webp">
            <source src={`imagenes/videos/${activeVideo}`} type="video/mp4" />
            {t("STORIES_VIDEO_UNSUPPORTED", "historias")}
          </video>
          <div className="video-selector">
            <button
              className={`video-btn ${activeVideo === "motivacional1.mp4" ? "active" : ""}`}
              onClick={() => handleVideoChange("motivacional1.mp4")}
            >
              {t("STORIES_VIDEO_HISTORY1", "historias")}
            </button>
            <button
              className={`video-btn ${activeVideo === "motivacional2.mp4" ? "active" : ""}`}
              onClick={() => handleVideoChange("motivacional2.mp4")}
            >
              {t("STORIES_VIDEO_HISTORY2", "historias")}
            </button>
            <button
              className={`video-btn ${activeVideo === "motivacional3.mp4" ? "active" : ""}`}
              onClick={() => handleVideoChange("motivacional3.mp4")}
            >
              {t("STORIES_VIDEO_HISTORY3", "historias")}
            </button>
          </div>
        </div>
      </div>

      {/* Sección CTA de Adopción */}
      <div className="historia-cta">
        <h3>{t("STORIES_CTA_TITLE", "historias")}</h3>
        <p className="historia-text">
          {t("STORIES_CTA_TEXT", "historias")}
        </p>
        <div className="historia-buttons">
          <Link href="/adopcion" className="btn-historia">
            {t("STORIES_CTA_BUTTON1", "historias")}
          </Link>
          <Link href="/#adoptar" className="btn-historia secondary">
            {t("STORIES_CTA_BUTTON2", "historias")}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SuccessSections