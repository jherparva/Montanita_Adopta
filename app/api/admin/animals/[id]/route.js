import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Animal from "@/lib/models/animal"

export async function GET(request, { params }) {
  try {
    await dbConnect()

    const { id } = await params

    // Obtener animal por ID
    const animal = await Animal.findById(id)

    if (!animal) {
      return NextResponse.json({ message: "Animal no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ animal })
  } catch (error) {
    console.error("Error al obtener animal:", error)
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect()

    const { id } = await params
    const data = await request.json()

    // Actualizar animal
    const animal = await Animal.findByIdAndUpdate(
      id,
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true },
    )

    if (!animal) {
      return NextResponse.json({ message: "Animal no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Animal actualizado exitosamente",
      animal,
    })
  } catch (error) {
    console.error("Error al actualizar animal:", error)
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect()

    const { id } = await params

    // Eliminar animal
    const animal = await Animal.findByIdAndDelete(id)

    if (!animal) {
      return NextResponse.json({ message: "Animal no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Animal eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar animal:", error)
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 })
  }
}