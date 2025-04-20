import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Volunteer from "@/lib/models/volunteer"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

// Verificar autenticación
async function getAuthUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    
    if (!token) return null
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return { userId: decoded.userId }
  } catch (error) {
    console.error("Error verificando autenticación:", error)
    return null
  }
}

export async function POST(request) {
  try {
    await dbConnect()

    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    const data = await request.json()

    // Validar datos requeridos
    const requiredFields = ["nombre", "email", "telefono", "disponibilidad", "motivacion", "areas_interes"]
    for (const field of requiredFields) {
      if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
        return NextResponse.json({ success: false, message: `El campo ${field} es requerido` }, { status: 400 })
      }
    }

    // Verificar si el usuario ya tiene una solicitud pendiente o aprobada
    const existingApplication = await Volunteer.findOne({
      userId: authUser.userId,
      estado: { $in: ["pendiente", "aprobado"] }
    })

    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: "Ya tienes una solicitud de voluntariado activa" },
        { status: 400 }
      )
    }

    // Crear nueva solicitud de voluntariado
    const volunteer = new Volunteer({
      ...data,
      userId: authUser.userId,
      estado: "pendiente",
      fecha_solicitud: new Date()
    })

    await volunteer.save()

    return NextResponse.json(
      {
        success: true,
        message: "Solicitud de voluntariado enviada correctamente",
        volunteerId: volunteer._id
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error al procesar la solicitud de voluntariado:", error)
    return NextResponse.json({ success: false, message: "Error al procesar la solicitud" }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Si se proporciona un userId, buscar solicitud específica
    if (userId) {
      const volunteer = await Volunteer.findOne({ userId })
      return NextResponse.json({ success: true, application: volunteer || null })
    } 
    
    // Verificar autenticación para obtener solicitud del usuario actual
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    const volunteer = await Volunteer.findOne({ userId: authUser.userId })
    return NextResponse.json({ success: true, application: volunteer || null })
  } catch (error) {
    console.error("Error al obtener solicitud de voluntariado:", error)
    return NextResponse.json({ success: false, message: "Error al obtener la solicitud" }, { status: 500 })
  }
}