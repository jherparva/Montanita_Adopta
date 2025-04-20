import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/user"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })
}

export async function POST(request) {
  // Set CORS headers for the actual request
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    await dbConnect()

    const data = await request.json()

    if (!data.accessToken) {
      return NextResponse.json({ success: false, message: "Token de Facebook requerido" }, { status: 400, headers })
    }

    // Obtener datos del usuario de Facebook
    const fbResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${data.accessToken}`,
    )

    if (!fbResponse.ok) {
      return NextResponse.json({ success: false, message: "Token de Facebook inválido" }, { status: 400, headers })
    }

    const fbData = await fbResponse.json()

    if (!fbData.email) {
      return NextResponse.json(
        { success: false, message: "No se pudo obtener el correo electrónico de Facebook" },
        { status: 400, headers },
      )
    }

    // Verificar si el usuario ya existe
    let user = await User.findOne({ email: fbData.email })

    if (user) {
      // Si el usuario existe pero no tiene facebook_id, actualizarlo
      if (!user.facebook_id) {
        user.facebook_id = fbData.id
        await user.save()
      }
    } else {
      // Crear nuevo usuario
      user = new User({
        nombre: fbData.name,
        name: fbData.name,
        correo_electronico: fbData.email,
        email: fbData.email,
        facebook_id: fbData.id,
        profilePhoto: fbData.picture?.data?.url,
        profileImage: fbData.picture?.data?.url,
        // Generar una contraseña aleatoria que no se usará
        contrasena: Math.random().toString(36).slice(-10) + Math.random().toString(36).toUpperCase().slice(-2) + "1",
        password: Math.random().toString(36).slice(-10) + Math.random().toString(36).toUpperCase().slice(-2) + "1",
        fecha_registro: new Date(),
      })

      await user.save()
    }

    // Generar token JWT para inicio de sesión automático
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Establecer cookie de sesión
    const cookieStore = cookies()
    cookieStore.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Changed from 'strict' to 'lax' for better cross-origin compatibility
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    })

    return NextResponse.json(
      {
        success: true,
        message: "Registro con Facebook exitoso",
        userId: user._id,
        autoLogin: true, // Indicar que se ha iniciado sesión automáticamente
      },
      { headers },
    )
  } catch (error) {
    console.error("Error en registro con Facebook:", error)
    return NextResponse.json({ success: false, message: "Error al procesar la solicitud" }, { status: 500, headers })
  }
}
