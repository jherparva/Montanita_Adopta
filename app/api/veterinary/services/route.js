import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import mongoose from "mongoose"

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const activeOnly = searchParams.get("active") === "true"

    // Verificar si la colección existe
    const collections = await mongoose.connection.db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)
    
    // Buscar la colección correcta
    const collectionName = collectionNames.includes("veterinaryservices") ? "veterinaryservices" : null

    if (!collectionName) {
      // Crear servicios por defecto si no existen
      const defaultServices = [
        {
          name: "Vacunación",
          description: "Protege la salud de tu nueva mascota con nuestras vacunas completas.",
          price: 50000,
          icon: "fa-syringe",
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Consulta General",
          description: "Revisión completa de salud para garantizar el bienestar de tu mascota.",
          price: 40000,
          icon: "fa-stethoscope",
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Esterilización",
          description: "Servicios de esterilización seguros y profesionales.",
          price: 120000,
          icon: "fa-cut",
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Primeros Auxilios",
          description: "Atención inmediata y cuidados de emergencia para tu mascota.",
          price: 60000,
          icon: "fa-first-aid",
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      // Crear la colección e insertar servicios por defecto
      await mongoose.connection.db.createCollection("veterinaryservices")
      await mongoose.connection.db.collection("veterinaryservices").insertMany(defaultServices)

      return NextResponse.json({
        success: true,
        services: defaultServices,
      })
    }

    if (id) {
      // Obtener un servicio específico
      const service = await mongoose.connection.db
        .collection(collectionName)
        .findOne({ _id: new mongoose.Types.ObjectId(id) })

      if (!service) {
        return NextResponse.json({ success: false, message: "Servicio no encontrado" }, { status: 404 })
      }

      return NextResponse.json({ success: true, service })
    } else {
      // Obtener todos los servicios
      const query = activeOnly ? { active: true } : {}
      const services = await mongoose.connection.db.collection(collectionName).find(query).sort({ name: 1 }).toArray()

      return NextResponse.json({
        success: true,
        services,
      })
    }
  } catch (error) {
    console.error("Error al obtener servicios veterinarios:", error)
    return NextResponse.json({ success: false, message: "Error al obtener los servicios" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await dbConnect()

    const data = await request.json()

    // Validar datos requeridos
    const requiredFields = ["name", "description", "price"]

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ success: false, message: `El campo ${field} es requerido` }, { status: 400 })
      }
    }

    // Crear nuevo servicio
    const service = {
      name: data.name,
      description: data.description,
      price: data.price,
      icon: data.icon || "fa-paw",
      active: data.active !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await mongoose.connection.db.collection("veterinaryservices").insertOne(service)

    return NextResponse.json(
      {
        success: true,
        message: "Servicio creado correctamente",
        serviceId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al crear servicio veterinario:", error)
    return NextResponse.json({ success: false, message: "Error al crear el servicio" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    await dbConnect()

    const data = await request.json()

    if (!data.serviceId) {
      return NextResponse.json({ success: false, message: "ID de servicio requerido" }, { status: 400 })
    }

    const service = await mongoose.connection.db.collection("veterinaryservices").findOne({
      _id: new mongoose.Types.ObjectId(data.serviceId),
    })

    if (!service) {
      return NextResponse.json({ success: false, message: "Servicio no encontrado" }, { status: 404 })
    }

    // Actualizar campos del servicio
    const updateData = {
      $set: {
        updatedAt: new Date(),
      },
    }

    if (data.name) updateData.$set.name = data.name
    if (data.description) updateData.$set.description = data.description
    if (data.price !== undefined) updateData.$set.price = data.price
    if (data.icon) updateData.$set.icon = data.icon
    if (data.active !== undefined) updateData.$set.active = data.active

    await mongoose.connection.db
      .collection("veterinaryservices")
      .updateOne({ _id: new mongoose.Types.ObjectId(data.serviceId) }, updateData)

    const updatedService = await mongoose.connection.db.collection("veterinaryservices").findOne({
      _id: new mongoose.Types.ObjectId(data.serviceId),
    })

    return NextResponse.json({
      success: true,
      message: "Servicio actualizado correctamente",
      service: updatedService,
    })
  } catch (error) {
    console.error("Error al actualizar servicio veterinario:", error)
    return NextResponse.json({ success: false, message: "Error al actualizar el servicio" }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, message: "ID de servicio requerido" }, { status: 400 })
    }

    const service = await mongoose.connection.db.collection("veterinaryservices").findOne({
      _id: new mongoose.Types.ObjectId(id),
    })

    if (!service) {
      return NextResponse.json({ success: false, message: "Servicio no encontrado" }, { status: 404 })
    }

    // En lugar de eliminar, marcar como inactivo
    await mongoose.connection.db
      .collection("veterinaryservices")
      .updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: { active: false, updatedAt: new Date() } })

    return NextResponse.json({
      success: true,
      message: "Servicio desactivado correctamente",
    })
  } catch (error) {
    console.error("Error al desactivar servicio veterinario:", error)
    return NextResponse.json({ success: false, message: "Error al desactivar el servicio" }, { status: 500 })
  }
}