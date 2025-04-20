import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req, { params }) {
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

    const client = await clientPromise
    const db = client.db("montanita_adopta")

    // Verificar si el usuario es administrador
    let user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) })
    
    // Si no encuentra en users, buscar en admins
    if (!user) {
      user = await db.collection("admins").findOne({ _id: new ObjectId(decoded.id) })
      
      if (!user) {
        return NextResponse.json({ message: "Usuario no encontrado" }, { status: 401 })
      }
      
      // Si es de la colección admins, considerarlo admin automáticamente
      user.isAdmin = true;
    }

    const isAdmin =
      user?.isAdmin === true ||
      user?.role === "admin" ||
      user?.admin === true ||
      user?.es_admin === true ||
      user?.esAdmin === true

    if (!user || !isAdmin) {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 })
    }

    // Obtener la solicitud de adopción
    const adoptionId = params.id
    let adoption

    try {
      adoption = await db.collection("adoptions").findOne({ _id: new ObjectId(adoptionId) })
    } catch (error) {
      return NextResponse.json({ message: "ID de solicitud inválido" }, { status: 400 })
    }

    if (!adoption) {
      return NextResponse.json({ message: "Solicitud no encontrada" }, { status: 404 })
    }

    // Obtener detalles del animal
    let animal = null
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

    // Formatear la respuesta
    const formattedAdoption = {
      _id: adoption._id,
      animal: {
        _id: animal._id,
        name: animal.name,
        species: animal.species,
        breed: animal.breed,
        age: animal.age,
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
      status: adoption.status,
      details: adoption.notes || "Sin detalles adicionales",
    }

    return NextResponse.json({
      adoption: formattedAdoption,
    })
  } catch (error) {
    console.error("Error al obtener solicitud:", error)
    return NextResponse.json({ message: "Error en el servidor: " + error.message }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
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

    const client = await clientPromise
    const db = client.db("montanita_adopta")

    // Verificar si el usuario es administrador
    let user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) })
    
    // Si no encuentra en users, buscar en admins
    if (!user) {
      user = await db.collection("admins").findOne({ _id: new ObjectId(decoded.id) })
      
      if (!user) {
        return NextResponse.json({ message: "Usuario no encontrado" }, { status: 401 })
      }
      
      // Si es de la colección admins, considerarlo admin automáticamente
      user.isAdmin = true;
    }

    // Aceptamos cualquier indicador de que el usuario es administrador
    const isAdmin =
      user?.isAdmin === true ||
      user?.role === "admin" ||
      user?.admin === true ||
      user?.es_admin === true ||
      user?.esAdmin === true

    if (!user || !isAdmin) {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 })
    }

    // Obtener datos de la solicitud
    const { status } = await req.json()

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ message: "Estado inválido" }, { status: 400 })
    }

    // Buscar la solicitud de adopción
    const adoptionId = new ObjectId(params.id)
    const adoption = await db.collection("adoptions").findOne({ _id: adoptionId })

    if (!adoption) {
      return NextResponse.json({ message: "Solicitud no encontrada" }, { status: 404 })
    }

    // Actualizar la solicitud con el nuevo estado
    const updateData = {
      status: status,
    }

    // Agregar campos adicionales según el estado
    if (status === "approved") {
      updateData.approvedDate = new Date()
    } else if (status === "rejected") {
      updateData.rejectedDate = new Date()
    }

    // Actualizar la solicitud
    await db.collection("adoptions").updateOne({ _id: adoptionId }, { $set: updateData })

    // Si hay un animal asociado, actualizar su estado
    if (adoption.animal) {
      try {
        let animalId

        // Intentar convertir a ObjectId si es posible
        try {
          animalId = new ObjectId(adoption.animal)
        } catch (error) {
          animalId = adoption.animal
        }

        if (status === "approved") {
          // Si se aprueba, marcar el animal como adoptado
          await db
            .collection("animals")
            .updateOne({ $or: [{ _id: animalId }, { id: animalId }] }, { $set: { status: "adopted" } })
        } else if (status === "rejected") {
          // Si se rechaza, marcar el animal como disponible nuevamente
          await db
            .collection("animals")
            .updateOne({ $or: [{ _id: animalId }, { id: animalId }] }, { $set: { status: "available" } })
        }
      } catch (error) {
        console.error("Error al actualizar el estado del animal:", error)
        // Continuamos aunque haya error con el animal
      }
    }

    return NextResponse.json({
      success: true,
      message: status === "approved" ? "Solicitud aprobada correctamente" : "Solicitud rechazada correctamente",
    })
  } catch (error) {
    console.error("Error actualizando solicitud:", error)
    return NextResponse.json({ message: "Error del servidor: " + error.message }, { status: 500 })
  }
}