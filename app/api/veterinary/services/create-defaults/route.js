import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import mongoose from "mongoose"

export async function POST() {
  try {
    await dbConnect()

    // Verificar si la colección existe
    const collections = await mongoose.connection.db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    // Verificar si ya existen servicios
    let servicesCount = 0
    if (collectionNames.includes("veterinaryservices")) {
      servicesCount = await mongoose.connection.db.collection("veterinaryservices").countDocuments()
    }

    // Si no hay servicios, crear los servicios por defecto
    if (servicesCount === 0) {
      // Crear servicios por defecto
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

      // Crear la colección si no existe
      if (!collectionNames.includes("veterinaryservices")) {
        await mongoose.connection.db.createCollection("veterinaryservices")
      }

      // Insertar servicios por defecto
      await mongoose.connection.db.collection("veterinaryservices").insertMany(defaultServices)

      return NextResponse.json({
        success: true,
        message: "Servicios veterinarios por defecto creados correctamente",
        servicesCreated: defaultServices.length,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Ya existen servicios veterinarios",
      servicesCount,
    })
  } catch (error) {
    console.error("Error al crear servicios veterinarios por defecto:", error)
    return NextResponse.json(
      { success: false, message: "Error al crear servicios veterinarios por defecto" },
      { status: 500 },
    )
  }
}