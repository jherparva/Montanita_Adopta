import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/user"
import UserActivity from "@/lib/models/userActivity"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function PUT(request) {
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

    const data = await request.json()
    const { id, bloqueado } = data

    if (!id) {
      return NextResponse.json({ success: false, message: "ID de usuario requerido" }, { status: 400 })
    }

    if (bloqueado === undefined) {
      return NextResponse.json({ success: false, message: "Estado de bloqueo requerido" }, { status: 400 })
    }

    // Verificar si el usuario existe
    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 })
    }

    // Actualizar estado de bloqueo
    user.bloqueado = bloqueado
    await user.save()

    // Registrar actividad
    await UserActivity.create({
      userId: id,
      tipo: bloqueado ? "bloqueo" : "desbloqueo",
      descripcion: bloqueado ? "Usuario bloqueado" : "Usuario desbloqueado",
      fecha: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: bloqueado ? "Usuario bloqueado correctamente" : "Usuario desbloqueado correctamente",
    })
  } catch (error) {
    console.error("Error al actualizar estado de bloqueo:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error del servidor: " + (error.message || "Error desconocido"),
      },
      { status: 500 },
    )
  }
}