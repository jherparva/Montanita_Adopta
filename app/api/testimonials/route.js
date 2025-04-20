import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Testimonial from "@/lib/models/testimony"

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const limit = parseInt(searchParams.get("limit")) || 10
    const page = parseInt(searchParams.get("page")) || 1
    const skip = (page - 1) * limit
    const showInHome = searchParams.get("mostrarEnHome") === "true"

    // Si se proporciona un ID, devolver ese testimonio específico
    if (id) {
      const testimonial = await Testimonial.findById(id)
      
      if (!testimonial) {
        return NextResponse.json({ success: false, message: "Testimonio no encontrado" }, { status: 404 })
      }
      
      return NextResponse.json({ success: true, testimonial })
    }

    // Construir la consulta
    const query = { estado: "activo" }
    
    // Si se especifica mostrarEnHome, filtrar por esa condición
    if (showInHome !== undefined) {
      query.mostrarEnHome = showInHome
    }

    // Obtener testimonios
    const testimonials = await Testimonial.find(query)
      .sort({ fecha_creacion: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Testimonial.countDocuments(query)

    return NextResponse.json({
      success: true,
      testimonials,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error al obtener testimonios:", error)
    return NextResponse.json({ success: false, message: "Error al obtener testimonios" }, { status: 500 })
  }
}