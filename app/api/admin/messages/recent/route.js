import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req) {
  try {
    // Verificar autenticación de administrador con token específico para admin
    const userId = await validateAdminAuth("admin_auth_token")
    if (typeof userId !== 'string') return userId // Retorna el error si no es admin

    const client = await clientPromise
    const db = client.db("montanita_adopta")

    // Procesar parámetros de búsqueda
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const limit = 10
    const skip = (page - 1) * limit

    // Construir la consulta
    let query = {}
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
        ],
      }
    }

    // Ejecutar consultas en paralelo para mejorar rendimiento
    const [total, messages] = await Promise.all([
      db.collection("messages").countDocuments(query),
      db.collection("messages").find(query).sort({ date: -1 }).skip(skip).limit(limit).toArray()
    ])

    return NextResponse.json({
      messages,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error al obtener mensajes:", error)
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 })
  }
}

// Función auxiliar para validar autenticación de administrador
async function validateAdminAuth(tokenName = "auth_token") {
  // Verificar autenticación
  const cookieStore = await cookies()
  const token = cookieStore.get(tokenName)?.value

  if (!token) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 })
  }

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return NextResponse.json({ message: "Token inválido" }, { status: 401 })
  }

  const userId = decoded.id

  // Conectar a la base de datos
  const client = await clientPromise
  const db = client.db("montanita_adopta")

  // Verificar si el usuario existe (en cualquiera de las colecciones)
  let user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
  
  if (!user) {
    // Intentar buscar en la colección de admins
    user = await db.collection("admins").findOne({ _id: new ObjectId(userId) })
    
    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 401 })
    }
  }

  // Verificar si es administrador
  const isAdmin =
    user.isAdmin === true ||
    user.role === "admin" ||
    user.admin === true ||
    user.es_admin === true ||
    user.esAdmin === true

  if (!isAdmin) {
    return NextResponse.json({ message: "Acceso denegado" }, { status: 403 })
  }

  return userId
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