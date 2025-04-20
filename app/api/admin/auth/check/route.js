import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_auth_token")?.value

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      
      const client = await clientPromise
      const db = client.db("montanita_adopta")

      // Buscar en colección de usuarios
      const user = await db.collection("users").findOne({ 
        _id: new ObjectId(decoded.id)
      })

      if (!user) {
        // Si no se encuentra en users, intentamos buscar en admins
        const admin = await db.collection("admins").findOne({
          _id: new ObjectId(decoded.id)
        })

        if (!admin) {
          return NextResponse.json({ authenticated: false, error: "Usuario no encontrado" }, { status: 401 })
        }

        // Si es un administrador de la colección admins
        return NextResponse.json({
          authenticated: true,
          isAdmin: true,
          user: {
            id: admin._id.toString(),
            name: admin.name || admin.nombre || admin.email,
            email: admin.email || admin.correo_electronico,
            role: admin.role || "admin",
          },
        })
      }

      // Verificar si el usuario es administrador
      const isAdmin =
        user.isAdmin === true ||
        user.role === "admin" ||
        user.admin === true ||
        user.es_admin === true ||
        user.esAdmin === true

      // Si no es admin, devolvemos autenticado pero no admin
      if (!isAdmin) {
        return NextResponse.json(
          {
            authenticated: true,
            isAdmin: false,
            user: {
              id: user._id.toString(),
              name: user.nombre || user.name,
              email: user.correo_electronico || user.email,
              role: "user",
            },
          },
          { status: 200 }
        )
      }

      // Si es admin, devolvemos todos los datos
      return NextResponse.json({
        authenticated: true,
        isAdmin: true,
        user: {
          id: user._id.toString(),
          name: user.nombre || user.name,
          email: user.correo_electronico || user.email,
          role: "admin",
        },
      })
    } catch (error) {
      return NextResponse.json({ authenticated: false, error: "Token inválido" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error al verificar autenticación:", error)
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 })
  }
}

// Método OPTIONS para CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        Allow: "GET, OPTIONS",
      },
    }
  )
}