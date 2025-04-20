import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Animal from "@/lib/models/animal"

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      // Obtener un animal específico
      const animal = await Animal.findById(id)

      if (!animal) {
        return NextResponse.json({ success: false, message: "Animal no encontrado" }, { status: 404 })
      }

      return NextResponse.json({ success: true, animal })
    } else {
      // Obtener todos los animales (con paginación y filtros)
      const page = parseInt(searchParams.get("page")) || 1
      const limit = parseInt(searchParams.get("limit")) || 10
      const skip = (page - 1) * limit

      // Filtros
      const species = searchParams.get("species")
      const age = searchParams.get("age")
      const size = searchParams.get("size")
      const status = searchParams.get("status") || "disponible" // Por defecto, solo mostrar disponibles

      const query = {}

      if (species) query.species = species
      if (age) query.age = age
      if (size) query.size = size
      if (status !== "all") query.status = status

      const animals = await Animal.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
      const total = await Animal.countDocuments(query)

      return NextResponse.json({
        success: true,
        animals,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      })
    }
  } catch (error) {
    console.error("Error al obtener animales:", error)
    return NextResponse.json({ success: false, message: "Error al obtener los animales" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await dbConnect()

    const data = await request.json()

    // Validar datos requeridos
    const requiredFields = ["name", "species", "breed", "age", "size"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ success: false, message: `El campo ${field} es requerido` }, { status: 400 })
      }
    }

    // Crear nuevo animal
    const animal = new Animal({
      name: data.name,
      species: data.species,
      breed: data.breed,
      age: data.age,
      size: data.size,
      description: data.description || "",
      image: data.image || null,
      sex: data.sex || "unknown",
      status: data.status || "available",
      createdAt: new Date(),
    })

    await animal.save()

    return NextResponse.json(
      {
        success: true,
        message: "Animal registrado correctamente",
        animalId: animal._id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al registrar animal:", error)
    return NextResponse.json({ success: false, message: "Error al registrar el animal" }, { status: 500 })
  }
}