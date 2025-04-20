import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/user"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function DELETE(request) {
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
    if (!data.id) {
      return NextResponse.json({ success: false, message: "ID de usuario requerido" }, { status: 400 })
    }

    // Eliminar usuario
    const user = await User.findByIdAndDelete(data.id)

    if (!user) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Usuario eliminado correctamente",
    })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return NextResponse.json(
      { success: false, message: "Error al procesar la solicitud" }, 
      { status: 500 }
    )
  }
}