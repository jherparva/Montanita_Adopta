import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/user"
import UserActivity from "@/lib/models/userActivity"
import bcrypt from "bcryptjs"
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
    const { id, nombre, correo_electronico, telefono, direccion, codigo_postal, contrasena } = data

    if (!id) {
      return NextResponse.json({ success: false, message: "ID de usuario requerido" }, { status: 400 })
    }

    // Verificar si el usuario existe
    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 })
    }

    // Preparar datos para actualizar
    const updateData = {
      nombre,
      name: nombre,
      correo_electronico,
      email: correo_electronico,
      telefono,
      phone: telefono,
      direccion,
      codigo_postal,
      updatedAt: new Date(),
    }

    // Si se proporciona una nueva contraseña, hashearla
    if (contrasena) {
      const salt = await bcrypt.genSalt(10)
      updateData.password = await bcrypt.hash(contrasena, salt)
      updateData.contrasena = updateData.password
    }

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Error al actualizar usuario" }, 
        { status: 500 }
      )
    }

    // Registrar actividad
    await UserActivity.create({
      userId: id,
      tipo: "actualización",
      descripcion: "Perfil actualizado por administrador",
      fecha: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Usuario actualizado correctamente",
      user: {
        id: updatedUser._id,
        nombre: updatedUser.nombre,
        email: updatedUser.email,
      },
    })
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error del servidor: " + (error.message || "Error desconocido"),
      },
      { status: 500 },
    )
  }
}