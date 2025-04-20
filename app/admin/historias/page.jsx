"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import StoriesList from "@/components/admin/stories/StoriesList"
import StoryFilters from "@/components/admin/stories/StoryFilters"
import "@/styles/admin/historias.css"

export default function AdminStoriesPage() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalStories, setTotalStories] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()
  const searchParams = useSearchParams()

  const approved = searchParams.get("approved") || "all"
  const featured = searchParams.get("featured") || "all"
  const search = searchParams.get("search") || ""

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true)
      setError(null)
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: "10",
        })

        if (search) {
          queryParams.set("search", search)
        }

        if (approved !== "all") {
          queryParams.set("approved", approved)
        }

        if (featured !== "all") {
          queryParams.set("featured", featured)
        }

        console.log("Fetching stories with params:", queryParams.toString())
        
        const response = await fetch(`/api/admin/success-stories?${queryParams}`)
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Error de servidor: ${response.status} - ${errorText}`)
        }
        
        const data = await response.json()

        if (data.success) {
          console.log("Historias recibidas:", data.stories?.length || 0)
          setStories(data.stories || [])
          setTotalStories(data.total || 0)
          setTotalPages(data.totalPages || 1)
        } else {
          throw new Error(data.message || "Error desconocido al obtener historias")
        }
      } catch (error) {
        console.error("Error al obtener historias:", error)
        setError(`Error al cargar las historias: ${error.message}`)
        setStories([])
        setTotalStories(0)
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [currentPage, approved, featured, search])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleFilterChange = (filters) => {
    const queryParams = new URLSearchParams()

    if (filters.approved && filters.approved !== "all") {
      queryParams.set("approved", filters.approved)
    }

    if (filters.featured && filters.featured !== "all") {
      queryParams.set("featured", filters.featured)
    }

    if (filters.search) {
      queryParams.set("search", filters.search)
    }

    router.push(`/admin/historias?${queryParams.toString()}`)
  }

  const handleDeleteStory = async (storyId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta historia? Esta acción no se puede deshacer.")) {
      try {
        const response = await fetch(`/api/admin/success-stories/${storyId}`, {
          method: "DELETE",
        })

        const data = await response.json()

        if (response.ok && data.success) {
          // Actualizar la lista de historias
          setStories(stories.filter((story) => story._id !== storyId))
          setTotalStories(totalStories - 1)
          alert("Historia eliminada correctamente")
        } else {
          alert(data.message || "Error al eliminar la historia")
        }
      } catch (error) {
        console.error("Error al eliminar historia:", error)
        alert("Error al eliminar la historia: " + error.message)
      }
    }
  }

  const handleApproveStory = async (storyId, isApproved) => {
    try {
      const response = await fetch("/api/admin/success-stories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storyId,
          approved: isApproved,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Actualizar el estado en la lista local
        setStories(
          stories.map((story) =>
            story._id === storyId ? { ...story, approved: isApproved } : story
          )
        )
        alert(isApproved ? "Historia aprobada correctamente" : "Historia rechazada correctamente")
      } else {
        alert(data.message || "Error al actualizar el estado de la historia")
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error)
      alert("Error al actualizar el estado de la historia: " + error.message)
    }
  }

  const handleFeatureStory = async (storyId, isFeatured) => {
    try {
      const response = await fetch("/api/admin/success-stories/feature", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storyId,
          isFeatured,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Actualizar el estado en la lista local
        setStories(
          stories.map((story) =>
            story._id === storyId ? { ...story, isFeatured } : story
          )
        )
        alert(isFeatured ? "Historia marcada como destacada" : "Historia desmarcada como destacada")
      } else {
        alert(data.message || "Error al actualizar el estado destacado de la historia")
      }
    } catch (error) {
      console.error("Error al actualizar estado destacado:", error)
      alert("Error al actualizar el estado destacado de la historia: " + error.message)
    }
  }

  const handleTestimonyStory = async (storyId, isTestimony) => {
    try {
      const response = await fetch("/api/admin/success-stories/testimony", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storyId,
          isTestimony,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Actualizar el estado en la lista local
        setStories(
          stories.map((story) =>
            story._id === storyId ? { ...story, isTestimony } : story
          )
        )
        alert(isTestimony ? "Historia marcada como testimonio destacado" : "Historia desmarcada como testimonio destacado")
      } else {
        alert(data.message || "Error al actualizar el estado de testimonio de la historia")
      }
    } catch (error) {
      console.error("Error al actualizar estado de testimonio:", error)
      alert("Error al actualizar el estado de testimonio de la historia: " + error.message)
    }
  }

  return (
    <AdminLayout>
      <div className="admin-stories">
        <div className="page-header">
          <h1>Gestión de Historias de Éxito</h1>
          <button className="add-button" onClick={() => router.push("/admin/historias/nuevo")}>
            <i className="fas fa-plus"></i> Nueva Historia
          </button>
        </div>

        <StoryFilters 
          initialFilters={{ approved, featured, search }} 
          onFilterChange={handleFilterChange} 
        />
        
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        )}

        <StoriesList
          stories={stories}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalStories={totalStories}
          onPageChange={handlePageChange}
          onDeleteStory={handleDeleteStory}
          onApproveStory={handleApproveStory}
          onFeatureStory={handleFeatureStory}
          onTestimonyStory={handleTestimonyStory}
        />
      </div>
    </AdminLayout>
  )
}