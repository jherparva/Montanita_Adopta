import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req) {
  try {
    // Verificar autenticación de administrador
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_auth_token")?.value

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
      
      // Si es de la colección admins, considerarlo admin automáticamente
      user.isAdmin = true;
    }

    // Verificar si el usuario es administrador
    const isAdmin =
      user.isAdmin === true ||
      user.role === "admin" ||
      user.admin === true ||
      user.es_admin === true ||
      user.esAdmin === true

    if (!isAdmin) {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 })
    }

    // Procesar parámetros de búsqueda
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const limit = 5
    const skip = (page - 1) * limit

    // Filtro por nombre del adoptante o email
    const baseQuery = { status: "pending" }

    if (search) {
      baseQuery.$or = [
        { "adopter.name": { $regex: search, $options: "i" } },
        { "adopter.email": { $regex: search, $options: "i" } },
      ]
    }

    const total = await db.collection("adoptions").countDocuments(baseQuery)
    const adoptions = await db
      .collection("adoptions")
      .find(baseQuery)
      .sort({ requestDate: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Obtener detalles completos de cada solicitud
    const requestsWithDetails = await Promise.all(
      adoptions.map(async (adoption) => {
        let animal = null

        // Intentar obtener el animal
        if (adoption.animal) {
          try {
            let animalId
            try {
              animalId = new ObjectId(adoption.animal)
              animal = await db.collection("animals").findOne({ _id: animalId })
            } catch (error) {
              // Si no es un ObjectId válido, intentar buscar por id numérico
              animal = await db.collection("animals").findOne({ id: adoption.animal })
            }
          } catch (error) {
            console.error("Error al obtener animal:", error)
          }
        }

        // Si no se encontró el animal, usar datos básicos
        if (!animal) {
          animal = {
            _id: adoption.animal || "unknown",
            name: "Animal no encontrado",
            species: "unknown",
            breed: "Desconocida",
            image: "/placeholder.svg",
          }
        }

        return {
          _id: adoption._id,
          animal: {
            _id: animal._id,
            name: animal.name,
            species: animal.species,
            breed: animal.breed,
            image: animal.image,
          },
          adopter: {
            name: adoption.adopter?.name || "Sin nombre",
            email: adoption.adopter?.email || "Sin email",
            phone: adoption.adopter?.phone || "Sin teléfono",
            address: adoption.adopter?.address || "Sin dirección",
            city: adoption.adopter?.city || "Sin ciudad",
          },
          requestDate: adoption.requestDate,
          details: adoption.notes || "Sin detalles adicionales",
        }
      })
    )

    return NextResponse.json({
      requests: requestsWithDetails,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error al obtener solicitudes pendientes:", error)
    return NextResponse.json({ message: "Error en el servidor: " + error.message }, { status: 500 })
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