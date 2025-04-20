import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/user"
import UserActivity from "@/lib/models/userActivity"

export async function PUT(request) {
  try {
    await dbConnect()

    const { id, bloqueado } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, message: "ID de usuario requerido" }, { status: 400 })
    }

    if (bloqueado === undefined) {
      return NextResponse.json({ success: false, message: "Estado de bloqueo requerido" }, { status: 400 })
    }

    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 })
    }

    user.bloqueado = bloqueado
    await user.save()

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