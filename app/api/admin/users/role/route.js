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
    const { id, role, tipo_voluntario } = data

    if (!id) {
      return NextResponse.json({ success: false, message: "ID de usuario requerido" }, { status: 400 })
    }

    if (!role || !["user", "moderador", "admin", "voluntario"].includes(role)) {
      return NextResponse.json({ success: false, message: "Rol inválido" }, { status: 400 })
    }

    // Verificar si es rol voluntario y tiene tipo
    if (role === "voluntario" && !tipo_voluntario) {
      return NextResponse.json({ success: false, message: "Tipo de voluntario requerido" }, { status: 400 })
    }

    // Verificar si el usuario existe
    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 })
    }

    // Actualizar rol
    user.role = role
    
    // Si es voluntario, actualizar tipo_voluntario
    if (role === "voluntario") {
      user.tipo_voluntario = tipo_voluntario
    } else {
      // Si deja de ser voluntario, eliminar el tipo
      user.tipo_voluntario = undefined
    }
    
    await user.save()

    // Registrar actividad
    await UserActivity.create({
      userId: id,
      tipo: "cambio_rol",
      descripcion: role === "voluntario" 
        ? `Rol actualizado a: ${role} (${tipo_voluntario})`
        : `Rol actualizado a: ${role}`,
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