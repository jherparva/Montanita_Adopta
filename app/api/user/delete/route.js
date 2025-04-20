import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/user"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function DELETE(request) {
  try {
    await dbConnect()

    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    const isAdmin = decoded.role === 'admin'
    
    const data = await request.json()
    if (!data.id) {
      return NextResponse.json({ success: false, message: "ID de usuario requerido" }, { status: 400 })
    }

    if (!isAdmin && decoded.userId !== data.id) {
      return NextResponse.json({ success: false, message: "No autorizado para eliminar este usuario" }, { status: 403 })
    }

    const user = await User.findByIdAndDelete(data.id)

    if (!user) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 })
    }

    if (decoded.userId === data.id) {
      const response = NextResponse.json({
        success: true,
        message: "Usuario eliminado correctamente",
        sessionClosed: true
      })
      
      response.cookies.delete("auth_token")
      return response
    }

    return NextResponse.json({
      success: true,
      message: "Usuario eliminado correctamente",
      sessionClosed: false
    })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return NextResponse.json({ success: false, message: "Error al procesar la solicitud" }, { status: 500 })
  }
}