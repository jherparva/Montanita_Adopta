//C:\Users\jhon\Downloads\montanita-adopta\components\success-stories\VideoSection.jsx

"use client"
import { useState, useRef } from "react"

const VideoSection = () => {
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
    <div className="media-section">
      <h3>Videos Motivacionales</h3>
      <div className="video-gallery">
        <video ref={videoRef} controls poster="/static/images/video-thumbnail1.webp">
          <source src={`imagenes/videos/${activeVideo}`} type="video/mp4" />
          Tu navegador no soporta videos HTML5.
        </video>
        <div className="video-selector">
          <button
            className={`video-btn ${activeVideo === "motivacional1.mp4" ? "active" : ""}`}
            onClick={() => handleVideoChange("motivacional1.mp4")}
          >
            Historia 1
          </button>
          <button
            className={`video-btn ${activeVideo === "motivacional2.mp4" ? "active" : ""}`}
            onClick={() => handleVideoChange("motivacional2.mp4")}
          >
            Historia 2
          </button>
          <button
            className={`video-btn ${activeVideo === "motivacional3.mp4" ? "active" : ""}`}
            onClick={() => handleVideoChange("motivacional3.mp4")}
          >
            Historia 3
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoSection

