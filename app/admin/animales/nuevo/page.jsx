"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"

export default function NuevoAnimalPage() {
  const router = useRouter()
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
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = formData.image

      if (imageFile) {
        const imgForm = new FormData()
        imgForm.append("image", imageFile)

        const uploadRes = await fetch("/api/admin/animals/upload-image", {
          method: "POST",
          body: imgForm,
        })

        const uploadData = await uploadRes.json()
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.message || "Error al subir la imagen")
        }

        imageUrl = uploadData.imageUrl
      }

      const finalData = { ...formData, image: imageUrl }

      const res = await fetch("/api/admin/animals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      alert("Animal creado correctamente")
      router.push("/admin/animales")
    } catch (err) {
      alert("Error al crear animal: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="admin-form">
        <h1>Nuevo Animal</h1>
        <form onSubmit={handleSubmit} className="animal-form">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre" required />
          <select name="species" value={formData.species} onChange={handleChange}>
            <option value="dog">Perro</option>
            <option value="cat">Gato</option>
          </select>
          <input name="breed" value={formData.breed} onChange={handleChange} placeholder="Raza" required />

          <select name="age" value={formData.age} onChange={handleChange}>
            <option value="puppy">Cachorro</option>
            <option value="kitten">Gatito</option>
            <option value="adult">Adulto</option>
            <option value="senior">Senior</option>
          </select>

          <select name="size" value={formData.size} onChange={handleChange}>
            <option value="small">Pequeño</option>
            <option value="medium">Mediano</option>
            <option value="large">Grande</option>
          </select>

          <select name="sex" value={formData.sex} onChange={handleChange}>
            <option value="male">Macho</option>
            <option value="female">Hembra</option>
          </select>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descripción del animal"
            required
          ></textarea>

          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="available">Disponible</option>
            <option value="adopted">Adoptado</option>
            <option value="pending">En Proceso</option>
            <option value="foster">En Acogida</option>
          </select>

          <label>
            Imagen:
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>

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
