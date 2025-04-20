import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import mongoose from "mongoose"

// Usar el modelo de Sponsor
const Sponsor = mongoose.models.Sponsor

export async function PUT(request) {
  try {
    await dbConnect()

    const data = await request.json()

    if (!data.sponsorId) {
      return NextResponse.json({ success: false, message: "ID de patrocinio requerido" }, { status: 400 })
    }

    if (!data.status || !["active", "paused", "ended"].includes(data.status)) {
      return NextResponse.json({ success: false, message: "Estado de patrocinio inválido" }, { status: 400 })
    }

    const sponsor = await Sponsor.findById(data.sponsorId)
    if (!sponsor) {
      return NextResponse.json({ success: false, message: "Patrocinio no encontrado" }, { status: 404 })
    }

    // Actualizar estado del patrocinio
    sponsor.status = data.status

    // Si el patrocinio termina, establecer la fecha de finalización
    if (data.status === "ended") {
      sponsor.endDate = new Date()
    }

    // Si hay notas adicionales, actualizarlas
    if (data.notes) {
      sponsor.notes = data.notes
    }

    await sponsor.save()

    const statusMessage = data.status === "active" 
      ? "activado" 
      : data.status === "paused" 
        ? "pausado" 
        : "finalizado";

    return NextResponse.json({
      success: true,
      message: `Patrocinio ${statusMessage} correctamente`,
      sponsor
    })
  } catch (error) {
    console.error("Error al actualizar estado de patrocinio:", error)
    return NextResponse.json({ success: false, message: "Error al actualizar el estado" }, { status: 500 })
  }
}