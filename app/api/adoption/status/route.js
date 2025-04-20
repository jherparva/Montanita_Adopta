import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Adoption from "@/lib/models/adoption"
import Animal from "@/lib/models/animal"

export async function PUT(request) {
  try {
    await dbConnect()

    const data = await request.json()

    if (!data.adoptionId) {
      return NextResponse.json({ success: false, message: "ID de adopción requerido" }, { status: 400 })
    }

    if (!data.status || !["aprobada", "rechazada", "pendiente", "completada"].includes(data.status)) {
      return NextResponse.json({ success: false, message: "Estado de adopción inválido" }, { status: 400 })
    }

    const adoption = await Adoption.findById(data.adoptionId)

    if (!adoption) {
      return NextResponse.json({ success: false, message: "Solicitud de adopción no encontrada" }, { status: 404 })
    }

    // Actualizar estado de la adopción
    adoption.estado = data.status

    if (data.status === "aprobada") {
      adoption.fecha_aprobacion = new Date()
    } else if (data.status === "completada") {
      adoption.fecha_completada = new Date()

      // Si la adopción se completa, actualizar el estado del animal
      if (adoption.mascota_id) {
        await Animal.findByIdAndUpdate(adoption.mascota_id, { estado: "adoptado" })
      }
    }

    // Agregar comentarios si existen
    if (data.comentarios) {
      adoption.comentarios = data.comentarios
    }

    await adoption.save()

    return NextResponse.json({
      success: true,
      message: `Solicitud de adopción ${data.status} correctamente`,
      adoption,
    })
  } catch (error) {
    console.error("Error al actualizar estado de adopción:", error)
    return NextResponse.json({ success: false, message: "Error al actualizar el estado" }, { status: 500 })
  }
}