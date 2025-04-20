import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Adoption from "@/lib/models/adoption"
import Animal from "@/lib/models/animal"

export async function GET() {
  try {
    await dbConnect()

    // Obtener adopciones recientes
    const adoptions = await Adoption.find({ status: "approved" }).sort({ approvedDate: -1 }).limit(5)

    // Obtener detalles de los animales
    const adoptionsWithDetails = await Promise.all(
      adoptions.map(async (adoption) => {
        const animal = await Animal.findById(adoption.animal)

        return {
          _id: adoption._id,
          animal: {
            _id: animal._id,
            name: animal.name,
            species: animal.species,
            breed: animal.breed,
            image: animal.image,
          },
          adopter: {
            name: adoption.adopter.name,
            email: adoption.adopter.email,
          },
          approvedDate: adoption.approvedDate,
        }
      }),
    )

    return NextResponse.json({
      adoptions: adoptionsWithDetails,
    })
  } catch (error) {
    console.error("Error al obtener adopciones recientes:", error)
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 })
  }
}