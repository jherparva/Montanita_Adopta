import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Animal from "@/lib/models/animal"
import Volunteer from "@/lib/models/volunteer"
import Donation from "@/lib/models/donation"
import Adoption from "@/lib/models/adoption"

export async function GET() {
  try {
    await dbConnect()
    
    // Consultas paralelas para mejor rendimiento
    const [
      adoptedCount,
      rescuedCount,
      volunteersCount,
      donorsCount
    ] = await Promise.all([
      // Animales adoptados
      Adoption.countDocuments().catch(() => 0),
      
      // Total de animales rescatados
      Animal.countDocuments().catch(() => 0),
      
      // Voluntarios activos
      Volunteer.countDocuments({ activo: true }).catch(() => 0),
      
      // Donantes únicos
      Donation.distinct('usuario').then(donors => donors.length).catch(() => 0)
    ])

    return NextResponse.json({
      success: true,
      stats: {
        adoptedCount,
        rescuedCount,
        volunteersCount,
        donorsCount
      }
    })
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    return NextResponse.json(
      { success: false, error: "Error al cargar estadísticas" },
      { status: 500 }
    )
  }
}