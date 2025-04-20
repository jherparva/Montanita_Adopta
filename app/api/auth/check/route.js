import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/user"

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })
}

export async function GET() {
  // Set CORS headers for the actual request
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    // Usar await con cookies()
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        {
          authenticated: false,
          isAuthenticated: false, // Para mantener compatibilidad con ambos formatos
          user: null,
          message: "No autenticado",
        },
        { status: 200, headers },
      ) // Uso 200 para que el frontend pueda manejar este caso sin error
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      await dbConnect()
      const user = await User.findById(decoded.userId)

      if (!user) {
        return NextResponse.json(
          {
            authenticated: false,
            isAuthenticated: false,
            user: null,
            message: "Usuario no encontrado",
          },
          { status: 200, headers },
        )
      }

      return NextResponse.json(
        {
          authenticated: true,
          isAuthenticated: true, // Para mantener compatibilidad con ambos formatos
          user: {
            id: user._id.toString(),
            name: user.nombre,
            nombre: user.nombre, // Para mantener compatibilidad con ambos formatos
            email: user.correo_electronico || user.email,
            isAdmin: user.isAdmin || false,
            role: user.role || "user",
            profilePhoto: user.profilePhoto || "/imagenes/perfil/default-profile.webp",
          },
        },
        { headers },
      )
    } catch (jwtError) {
      console.error("Error al verificar token JWT:", jwtError)
      return NextResponse.json(
        {
          authenticated: false,
          isAuthenticated: false,
          user: null,
          message: "Sesión inválida",
        },
        { status: 200, headers },
      )
    }
  } catch (error) {
    console.error("Error al verificar autenticación:", error)
    return NextResponse.json(
      {
        authenticated: false,
        isAuthenticated: false,
        user: null,
        error: "Error al verificar la autenticación",
      },
      { status: 500, headers },
    )
  }
}
