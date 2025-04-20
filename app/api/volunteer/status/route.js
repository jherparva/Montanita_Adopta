import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Volunteer from "@/lib/models/volunteer"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import User from "@/lib/models/user"

// Verificar autenticación de administrador
async function getAuthAdmin() {
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

export async function PUT(request) {
  try {
    await dbConnect()

    const authAdmin = await getAuthAdmin()
    if (!authAdmin) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()

    if (!data.volunteerId) {
      return NextResponse.json({ success: false, message: "ID de voluntario requerido" }, { status: 400 })
    }

    if (!data.status || !["pendiente", "aprobado", "rechazado"].includes(data.status)) {
      return NextResponse.json({ success: false, message: "Estado de voluntario inválido" }, { status: 400 })
    }

    const volunteer = await Volunteer.findById(data.volunteerId)
    if (!volunteer) {
      return NextResponse.json({ success: false, message: "Solicitud de voluntariado no encontrada" }, { status: 404 })
    }

    // Actualizar estado del voluntario
    volunteer.estado = data.status

    // Si se aprueba, actualizar fecha de aprobación y rol del usuario
    if (data.status === "aprobado") {
      volunteer.fecha_aprobacion = new Date()

      if (volunteer.userId) {
        const user = await User.findById(volunteer.userId)
        if (user && !user.roles.includes("voluntario")) {
          user.roles.push("voluntario")
          await user.save()
        }
      }
    }

    // Agregar comentarios si existen
    if (data.comentarios) {
      volunteer.comentarios = data.comentarios
    }

    await volunteer.save()

    const statusMessage = data.status === "aprobado" 
      ? "aprobada" 
      : data.status === "rechazado" 
        ? "rechazada" 
        : "actualizada";

    return NextResponse.json({
      success: true,
      message: `Solicitud de voluntariado ${statusMessage} correctamente`,
      volunteer
    })
  } catch (error) {
    console.error("Error al actualizar estado de voluntario:", error)
    return NextResponse.json({ success: false, message: "Error al actualizar el estado" }, { status: 500 })
  }
}