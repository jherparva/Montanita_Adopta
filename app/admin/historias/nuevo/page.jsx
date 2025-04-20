//C:\Users\jhon\Videos\montanita-adopta\app\admin\historias\nuevo\page.jsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"

export default function NuevaHistoriaPage() {
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
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

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
    setLoading(true)

    try {
      let imageUrl = ""

      // Si hay una imagen, subirla primero
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

      // Enviar los datos de la historia
      const res = await fetch("/api/admin/success-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          date: new Date().toISOString(),
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error al crear la historia")
      }

      alert("Historia creada correctamente")
      router.push("/admin/historias")
    } catch (err) {
      alert("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="admin-form">
        <h1>Nueva Historia de Éxito</h1>
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
              <label htmlFor="approved">Aprobar inmediatamente</label>
            </div>

            <div className="form-checkbox">
              <input 
                type="checkbox" 
                id="isFeatured" 
                name="isFeatured" 
                checked={formData.isFeatured} 
                onChange={handleChange} 
              />
              <label htmlFor="isFeatured">Marcar como destacada</label>
            </div>

            <div className="form-checkbox">
              <input 
                type="checkbox" 
                id="isTestimony" 
                name="isTestimony" 
                checked={formData.isTestimony} 
                onChange={handleChange} 
              />
              <label htmlFor="isTestimony">Marcar como testimonio</label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" onClick={() => router.back()}>Cancelar</button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}