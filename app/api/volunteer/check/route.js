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

export async function GET() {
  try {
    await dbConnect()

    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    // Buscar solicitud de voluntariado del usuario
    const volunteer = await Volunteer.findOne({ userId: authUser.userId })

    if (!volunteer) {
      return NextResponse.json({ success: true, hasApplication: false })
    }

    return NextResponse.json({
      success: true,
      hasApplication: true,
      status: volunteer.estado,
      application: volunteer
    })
  } catch (error) {
    console.error("Error al verificar solicitud de voluntariado:", error)
    return NextResponse.json({ success: false, message: "Error al verificar la solicitud" }, { status: 500 })
  }
}