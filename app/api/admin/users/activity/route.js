import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import UserActivity from "@/lib/models/userActivity"
import mongoose from "mongoose"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function GET(request) {
  try {
    // Verificar autenticación con admin token
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    // Verificar que sea admin
    if (decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Acceso denegado" }, { status: 403 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "ID de usuario requerido" }, { status: 400 })
    }

    // Obtener actividades del usuario
    const actividades = await UserActivity.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ fecha: -1 })
      .limit(20)

    return NextResponse.json({
      success: true,
      actividades,
    })
  } catch (error) {
    console.error("Error al obtener actividades:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error del servidor: " + (error.message || "Error desconocido"),
      },
      { status: 500 },
    )
  }
}