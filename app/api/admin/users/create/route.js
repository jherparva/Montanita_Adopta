import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/user" 
import UserActivity from "@/lib/models/userActivity"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function POST(request) {
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
    const { 
      nombre, 
      correo_electronico, 
      telefono, 
      direccion, 
      codigo_postal, 
      contrasena, 
      role,
      tipo_voluntario,
      observaciones
    } = data

    // Validar campos requeridos
    if (!nombre || !correo_electronico || !contrasena) {
      return NextResponse.json(
        { success: false, message: "Nombre, correo electrónico y contraseña son requeridos" },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ 
      $or: [
        { correo_electronico },
        { email: correo_electronico }
      ] 
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Este correo electrónico ya está registrado" },
        { status: 400 }
      )
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(contrasena, salt)

    // Crear el usuario
    const newUser = await User.create({
      nombre,
      name: nombre,
      correo_electronico,
      email: correo_electronico,
      telefono,
      phone: telefono,
      direccion,
      codigo_postal,
      password: hashedPassword,
      contrasena: hashedPassword,
      role,
      tipo_voluntario: role === 'voluntario' ? tipo_voluntario : undefined,
      observaciones,
      bloqueado: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      creadoPor: decoded.id // Registrar quién creó el usuario
    })

    // Registrar actividad
    await UserActivity.create({
      userId: newUser._id,
      tipo: "registro",
      descripcion: `Usuario creado por administrador (${decoded.email || decoded.name || decoded.id})`,
      fecha: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Usuario creado correctamente",
      user: {
        id: newUser._id,
        nombre: newUser.nombre,
        email: newUser.correo_electronico,
        role: newUser.role
      },
    })
  } catch (error) {
    console.error("Error al crear usuario:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error del servidor: " + (error.message || "Error desconocido"),
      },
      { status: 500 },
    )
  }
}