//C:\Users\jhon\Videos\montanita-adopta\app\admin\historias\[id]\page.jsx

"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"

export default function EditarHistoriaPage({ params }) {
  const { id } = params
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    email: "",
    content: "",
    approved: false,
    isFeatured: false,
    isTestimony: false,
  })
  const [imageFile, setImageFile] = useState(null)
  const [currentImage, setCurrentImage] = useState("")
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/success-stories/${id}`)
        const data = await response.json()

        if (response.ok && data.success) {
          const story = data.story
          setFormData({
            title: story.title || "",
            author: story.author || "",
            email: story.email || "",
            content: story.content || "",
            approved: !!story.approved,
            isFeatured: !!story.isFeatured,
            isTestimony: !!story.isTestimony,
          })
          setCurrentImage(story.image || "")
          setPreviewUrl(story.image || null)
        } else {
          setError(data.message || "Error al cargar la historia")
        }
      } catch (error) {
        console.error("Error al cargar la historia:", error)
        setError("Error al cargar la historia")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchStory()
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      // Crear una URL para previsualizar la imagen
      const fileReader = new FileReader()
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result)
      }
      fileReader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let imageUrl = currentImage

      // Si hay una nueva imagen, subirla primero
      if (imageFile) {
        const imgForm = new FormData()
        imgForm.append("image", imageFile)

        const uploadRes = await fetch("/api/admin/success-stories/upload-image", {
          method: "POST",
          body: imgForm,
        })

        const uploadData = await uploadRes.json()
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.message || "Error al subir la imagen")
        }

        imageUrl = uploadData.imageUrl
      }

      // Actualizar la historia
      const res = await fetch(`/api/admin/success-stories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error al actualizar la historia")
      }

      alert("Historia actualizada correctamente")
      router.push("/admin/historias")
    } catch (err) {
      alert("Error: " + err.message)
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando información de la historia...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={() => router.push("/admin/historias")} className="btn">
            Volver a la lista
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="admin-form">
        <h1>Editar Historia de Éxito</h1>
        <form onSubmit={handleSubmit} className="story-form">
          <div className="form-group">
            <label htmlFor="title">Título:</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="author">Autor:</label>
            <input 
              type="text" 
              id="author" 
              name="author" 
              value={formData.author} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email de contacto:</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Historia:</label>
            <textarea 
              id="content" 
              name="content" 
              value={formData.content} 
              onChange={handleChange} 
              required 
              rows="8"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="image">Imagen:</label>
            <input 
              type="file" 
              id="image" 
              name="image" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Vista previa" style={{ maxWidth: "200px", marginTop: "10px" }} />
              </div>
            )}
          </div>

          <div className="form-options">
            <div className="form-checkbox">
              <input 
                type="checkbox" 
                id="approved" 
                name="approved" 
                checked={formData.approved} 
                onChange={handleChange} 
              />
              <label htmlFor="approved">Aprobada</label>
            </div>

            <div className="form-checkbox">
              <input 
                type="checkbox" 
                id="isFeatured" 
                name="isFeatured" 
                checked={formData.isFeatured} 
                onChange={handleChange} 
              />
              <label htmlFor="isFeatured">Destacada</label>
            </div>

            <div className="form-checkbox">
              <input 
                type="checkbox" 
                id="isTestimony" 
                name="isTestimony" 
                checked={formData.isTestimony} 
                onChange={handleChange} 
              />
              <label htmlFor="isTestimony">Testimonio</label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? <i className="fas fa-spinner fa-spin"></i> : "Guardar Cambios"}
            </button>
            <button type="button" onClick={() => router.push("/admin/historias")}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}