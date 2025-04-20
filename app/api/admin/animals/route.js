import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Animal from "@/lib/models/animal"

export async function GET(request) {
  try {
    await dbConnect()

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const status = searchParams.get("status")
    const species = searchParams.get("species")
    const search = searchParams.get("search")

    // Construir filtro
    const filter = {}

    if (status && status !== "all") {
      filter.status = status
    }

    if (species && species !== "all") {
      filter.species = species
    }

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }, { breed: { $regex: search, $options: "i" } }]
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit

    // Obtener animales
    const animals = await Animal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)

    // Obtener total de animales para paginación
    const total = await Animal.countDocuments(filter)

    return NextResponse.json({
      animals,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error("Error al obtener animales:", error)
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await dbConnect()

    const data = await request.json()

    // Crear nuevo animal
    const animal = new Animal(data)
    await animal.save()

    return NextResponse.json({
      message: "Animal creado exitosamente",
      animal,
    })
  } catch (error) {
    console.error("Error al crear animal:", error)
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 })
  }
}