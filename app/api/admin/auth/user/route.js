import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    // Verificar autenticación
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_auth_token")?.value

    if (!token) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      
      // Conectar a la base de datos
      const client = await clientPromise
      const db = client.db("montanita_adopta")

      const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) })

      if (!user) {
        return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 })
      }

      // Eliminar campos sensibles
      const { password, ...userWithoutPassword } = user

      return NextResponse.json({
        user: {
          ...userWithoutPassword,
          id: user._id.toString(),
        },
      })
    } catch (error) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error)
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 })
  }
}