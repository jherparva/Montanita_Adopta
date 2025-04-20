"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"

export default function EditAnimalPage({ params }) {
  const { id } = params
  const router = useRouter()
  const [animal, setAnimal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    species: "dog",
    breed: "",
    age: "adult",
    size: "medium",
    sex: "male",
    description: "",
    status: "available",
    image: "",
  })
  const [imagePreview, setImagePreview] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/animals/${id}`)
        const data = await response.json()

        if (response.ok) {
          setAnimal(data.animal)
          setFormData({
            name: data.animal.name || "",
            species: data.animal.species || "dog",
            breed: data.animal.breed || "",
            age: data.animal.age || "adult",
            size: data.animal.size || "medium",
            sex: data.animal.sex || "male",
            description: data.animal.description || "",
            status: data.animal.status || "available",
            image: data.animal.image || "",
          })
          setImagePreview(data.animal.image || "")
        } else {
          setError(data.message || "Error al cargar el animal")
        }
      } catch (error) {
        console.error("Error fetching animal:", error)
        setError("Error al cargar el animal")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchAnimal()
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let imageUrl = formData.image

      // Si hay una nueva imagen, subirla primero
      if (imageFile) {
        const imageFormData = new FormData()
        imageFormData.append("image", imageFile)

        const imageResponse = await fetch("/api/admin/animals/upload-image", {
          method: "POST",
          body: imageFormData,
        })

        const imageData = await imageResponse.json()

        if (imageResponse.ok && imageData.success) {
          imageUrl = imageData.imageUrl
        } else {
          throw new Error(imageData.message || "Error al subir la imagen")
        }
      }

      // Actualizar el animal con la nueva información
      const response = await fetch(`/api/admin/animals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirigir a la lista de animales
        router.push("/admin/animales")
      } else {
        throw new Error(data.message || "Error al actualizar el animal")
      }
    } catch (error) {
      console.error("Error updating animal:", error)
      setError(error.message || "Error al actualizar el animal")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando información del animal...</p>
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
          <button onClick={() => router.push("/admin/animales")} className="btn btn-primary mt-3">
            Volver a la lista
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="admin-form">
        <h2>Editar Animal</h2>

        <form className="animal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre:</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="species">Especie:</label>
            <select id="species" name="species" value={formData.species} onChange={handleChange} required>
              <option value="dog">Perro</option>
              <option value="cat">Gato</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="breed">Raza:</label>
            <input type="text" id="breed" name="breed" value={formData.breed} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="age">Edad:</label>
            <select id="age" name="age" value={formData.age} onChange={handleChange} required>
              <option value="puppy">Cachorro</option>
              <option value="kitten">Gatito</option>
              <option value="adult">Adulto</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="size">Tamaño:</label>
            <select id="size" name="size" value={formData.size} onChange={handleChange} required>
              <option value="small">Pequeño</option>
              <option value="medium">Mediano</option>
              <option value="large">Grande</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sex">Sexo:</label>
            <select id="sex" name="sex" value={formData.sex} onChange={handleChange} required>
              <option value="male">Macho</option>
              <option value="female">Hembra</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Estado:</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} required>
              <option value="available">Disponible</option>
              <option value="adopted">Adoptado</option>
              <option value="pending">En Proceso</option>
              <option value="foster">En Acogida</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción:</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="image">Imagen:</label>
            <input type="file" id="image" name="image" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <div className="image-preview">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Vista previa"
                  style={{ maxWidth: "200px", marginTop: "10px" }}
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? <i className="fas fa-spinner fa-spin"></i> : "Guardar Cambios"}
            </button>
            <button type="button" onClick={() => router.push("/admin/animales")}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
