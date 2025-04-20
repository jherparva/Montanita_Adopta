import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/user"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request) {
  try {
    await dbConnect()

    const data = await request.json()

    if (!data.email || !data.code || !data.newPassword) {
      return NextResponse.json({ success: false, message: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Buscar usuario por correo electrónico
    const user = await User.findOne({
      correo_electronico: data.email,
      reset_code: data.code,
      reset_code_expires: { $gt: new Date() }, // Código no expirado
    })

    if (!user) {
      return NextResponse.json({ success: false, message: "Código inválido o expirado" }, { status: 400 })
    }

    // Validar que la contraseña cumpla con los requisitos
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(data.newPassword)) {
      return NextResponse.json(
        {
          success: false,
          message: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número",
        },
        { status: 400 },
      )
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(data.newPassword, salt)

    // Actualizar contraseña y limpiar código de recuperación
    user.contrasena = hashedPassword
    user.reset_code = undefined
    user.reset_code_expires = undefined

    await user.save()

    // NUEVO: Crear y establecer token de autenticación (inicio de sesión automático)
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Establecer cookie de autenticación
    cookies().set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 días
    })

    return NextResponse.json({
      success: true,
      message: "Contraseña restablecida correctamente e inicio de sesión completado",
      user: {
        id: user._id.toString(),
        nombre: user.nombre,
        email: user.correo_electronico,
        profilePhoto: user.profilePhoto || "/imagenes/perfil/default-profile.webp",
      }
    })
  } catch (error) {
    console.error("Error al verificar código de recuperación:", error)
    return NextResponse.json({ success: false, message: "Error al procesar la solicitud" }, { status: 500 })
  }
}