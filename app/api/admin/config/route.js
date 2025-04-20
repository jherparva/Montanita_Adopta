import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const userId = await validateAdminAuth()
    if (typeof userId !== 'string') return userId // Retorna el error si no es admin

    // Conectar a la base de datos
    const client = await clientPromise
    const db = client.db("montanita_adopta")

    // Obtener configuración de la base de datos
    let config = await db.collection("config").findOne({ type: "site_config" })

    // Si no hay configuración, devolver valores predeterminados
    if (!config) {
      config = {
        siteName: "Montañita Adopta",
        siteDescription: "Plataforma de adopción de mascotas",
        contactEmail: "contacto@montanitaadopta.com",
        phoneNumber: "+57 123 456 7890",
        address: "Calle Principal #123, Montañita",
        socialMedia: {
          facebook: "https://facebook.com/montanitaadopta",
          instagram: "https://instagram.com/montanitaadopta",
          twitter: "https://twitter.com/montanitaadopta",
        },
        notificationsEnabled: true,
        emailNotifications: true,
      }
    }

    return NextResponse.json({ config })
  } catch (error) {
    console.error("Error al obtener configuración:", error)
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const userId = await validateAdminAuth()
    if (typeof userId !== 'string') return userId // Retorna el error si no es admin

    // Obtener datos de configuración
    const { config } = await req.json()

    // Conectar a la base de datos
    const client = await clientPromise
    const db = client.db("montanita_adopta")

    // Guardar configuración en la base de datos
    await db
      .collection("config")
      .updateOne(
        { type: "site_config" }, 
        { $set: { ...config, updatedAt: new Date() } }, 
        { upsert: true }
      )

    return NextResponse.json({
      success: true,
      message: "Configuración guardada correctamente",
    })
  } catch (error) {
    console.error("Error al guardar configuración:", error)
    return NextResponse.json({ message: "Error del servidor: " + error.message }, { status: 500 })
  }
}

// Función auxiliar para validar autenticación de administrador
async function validateAdminAuth(tokenName = "admin_auth_token") {
  // Verificar autenticación
  const cookieStore = await cookies()
  const token = cookieStore.get(tokenName)?.value

  if (!token) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id

    // Conectar a la base de datos
    const client = await clientPromise
    const db = client.db("montanita_adopta")

    // Verificar si el usuario existe
    let user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
    
    if (!user) {
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
  } catch (error) {
    return NextResponse.json({ message: "Token inválido" }, { status: 401 })
  }
}

// Método OPTIONS para CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        Allow: "GET, POST, OPTIONS",
      },
    }
  )
}