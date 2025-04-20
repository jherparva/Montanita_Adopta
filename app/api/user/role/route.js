import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/user"
import UserActivity from "@/lib/models/userActivity"

export async function PUT(request) {
  try {
    await dbConnect()

    const { id, role } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, message: "ID de usuario requerido" }, { status: 400 })
    }

    if (!role || !["user", "moderador", "admin"].includes(role)) {
      return NextResponse.json({ success: false, message: "Rol inválido" }, { status: 400 })
    }

    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 })
    }

    user.role = role
    await user.save()

    await UserActivity.create({
      userId: id,
      tipo: "cambio_rol",
      descripcion: `Rol actualizado a: ${role}`,
      fecha: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Rol actualizado correctamente",
    })
  } catch (error) {
    console.error("Error al actualizar rol:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error del servidor: " + (error.message || "Error desconocido"),
      },
      { status: 500 },
    )
  }
}