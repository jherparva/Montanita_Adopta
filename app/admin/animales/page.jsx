"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import AnimalsList from "@/components/admin/animals/AnimalsList"
import AnimalFilters from "@/components/admin/animals/AnimalFilters"
import "@/styles/admin/animales.css"


export default function AdminAnimalsPage() {
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalAnimals, setTotalAnimals] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()
  const searchParams = useSearchParams()

  const status = searchParams.get("status") || "all"
  const species = searchParams.get("species") || "all"
  const search = searchParams.get("search") || ""

  useEffect(() => {
    const fetchAnimals = async () => {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: "10",
          status,
          species,
          search,
        })

        const response = await fetch(`/api/admin/animals?${queryParams}`)
        const data = await response.json()

        if (response.ok) {
          setAnimals(data.animals)
          setTotalAnimals(data.total)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error("Error al obtener animales:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnimals()
  }, [currentPage, status, species, search])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleFilterChange = (filters) => {
    const queryParams = new URLSearchParams()

    if (filters.status && filters.status !== "all") {
      queryParams.set("status", filters.status)
    }

    if (filters.species && filters.species !== "all") {
      queryParams.set("species", filters.species)
    }

    if (filters.search) {
      queryParams.set("search", filters.search)
    }

    router.push(`/admin/animales?${queryParams.toString()}`)
  }

  const handleDeleteAnimal = async (animalId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este animal?")) {
      try {
        const response = await fetch(`/api/admin/animals/${animalId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          // Actualizar la lista de animales
          setAnimals(animals.filter((animal) => animal._id !== animalId))
          setTotalAnimals(totalAnimals - 1)
        } else {
          const data = await response.json()
          alert(data.message || "Error al eliminar el animal")
        }
      } catch (error) {
        console.error("Error al eliminar animal:", error)
        alert("Error al eliminar el animal")
      }
    }
  }

  return (
    <AdminLayout>
      <div className="admin-animals">
        <div className="page-header">
          <h1>Gestión de Animales</h1>
          <button className="add-button" onClick={() => router.push("/admin/animales/nuevo")}>
            <i className="fas fa-plus"></i> Nuevo Animal
          </button>
        </div>

        <AnimalFilters initialFilters={{ status, species, search }} onFilterChange={handleFilterChange} />

        <AnimalsList
          animals={animals}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalAnimals={totalAnimals}
          onPageChange={handlePageChange}
          onDeleteAnimal={handleDeleteAnimal}
        />
      </div>
    </AdminLayout>
  )
}

