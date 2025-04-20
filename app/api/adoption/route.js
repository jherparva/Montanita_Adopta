import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    // Obtener datos del formulario
    const formData = await req.json()

    // Conectar a la base de datos
    const client = await clientPromise
    const db = client.db("montanita_adopta")

    // Obtener datos del usuario
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 })
    }

    // Obtener datos del animal
    let animalId = formData.mascota_id
    let animal

    try {
      // Intentar convertir a ObjectId si es un string válido
      if (typeof animalId === "string" && animalId.match(/^[0-9a-fA-F]{24}$/)) {
        animalId = new ObjectId(animalId)
        animal = await db.collection("animals").findOne({ _id: animalId })
      } else if (typeof animalId === "number") {
        // Si es un ID numérico (de los datos de ejemplo)
        animal = await db.collection("animals").findOne({ id: animalId })
      }

      // Si no encontramos el animal, usamos datos básicos del formulario
      if (!animal) {
        animal = {
          _id: new ObjectId(),
          name: formData.nombre_companero,
          species: "unknown",
        }
      }
    } catch (error) {
      // Crear un ID temporal para el animal en caso de error
      animal = {
        _id: new ObjectId(),
        name: formData.nombre_companero,
        species: "unknown",
      }
    }

    // Crear objeto de adopción según el esquema
    const adoption = {
      animal: animal._id,
      adopter: {
        name: formData.nombre_completo,
        email: user.correo_electronico || user.email,
        phone: formData.celular,
        address: formData.direccion,
        city: `${formData.municipio}, ${formData.departamento}`,
      },
      requestDate: new Date(),
      status: "pending",
      notes: `
        Estado Civil: ${formData.estado_civil}
        Documento: ${formData.documento_identificacion}
        Niños en casa: ${formData.hay_ninos}
        Edad de niños: ${formData.edad_ninos}
        Personas alérgicas: ${formData.hay_alergicos}
        Ha tenido mascotas: ${formData.ha_tenido_mascotas}
        Motivo de adopción: ${formData.motivo_adopcion}
        Compromiso: ${formData.compromiso}
      `,
    }

    // Guardar en la base de datos
    const result = await db.collection("adoptions").insertOne(adoption)

    if (result.acknowledged) {
      // Actualizar el estado del animal a "pending" si existe en la base de datos
      if (animal._id) {
        await db.collection("animals").updateOne({ _id: animal._id }, { $set: { status: "pending" } })
      }

      return NextResponse.json({
        success: true,
        message: "Solicitud de adopción enviada correctamente",
        adoptionId: result.insertedId,
      })
    } else {
      throw new Error("Error al guardar la solicitud")
    }
  } catch (error) {
    console.error("Error al procesar la solicitud de adopción:", error)
    return NextResponse.json(
      { success: false, message: "Error al procesar la solicitud: " + error.message },
      { status: 500 },
    )
  }
}