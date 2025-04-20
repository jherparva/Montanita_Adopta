import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/lib/models/donation"
import { writeFile } from "fs/promises"
import path from "path"
import mongoose from "mongoose"
import fs from "fs/promises"

export async function POST(request) {
  try {
    await dbConnect()

    const formData = await request.formData()
    const file = formData.get("file")
    const donationId = formData.get("donationId")

    if (!file) {
      return NextResponse.json({ success: false, message: "No se ha proporcionado ningún archivo" }, { status: 400 })
    }

    // Verificar que la donación existe si se proporciona un ID
    if (donationId) {
      if (!mongoose.Types.ObjectId.isValid(donationId)) {
        return NextResponse.json(
          { success: false, message: "ID de donación inválido. Debe ser un ID de MongoDB válido" },
          { status: 400 },
        )
      }

      const donation = await Donation.findById(donationId)
      if (!donation) {
        return NextResponse.json({ success: false, message: "Donación no encontrada" }, { status: 404 })
      }
    }

    // Convertir el archivo a un buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generar un nombre de archivo único
    const fileName = `evidence_${Date.now()}_${file.name.replace(/\s+/g, "_")}`

    // Definir la ruta donde se guardará el archivo
    const publicDir = path.join(process.cwd(), "public")
    const uploadsDir = path.join(publicDir, "uploads")
    const evidenceDir = path.join(uploadsDir, "evidence")

    // Crear directorios si no existen
    try {
      await fs.mkdir(uploadsDir, { recursive: true })
      await fs.mkdir(evidenceDir, { recursive: true })
      
      // Guardar el archivo
      await writeFile(path.join(evidenceDir, fileName), buffer)
    } catch (error) {
      console.error("Error al guardar el archivo:", error)
      return NextResponse.json({ success: false, message: "Error al guardar el archivo" }, { status: 500 })
    }

    // Actualizar la donación con la URL de la evidencia
    const evidenceUrl = `/uploads/evidence/${fileName}`

    if (donationId) {
      await Donation.findByIdAndUpdate(donationId, { evidenceUrl })
    }

    return NextResponse.json({
      success: true,
      message: "Evidencia subida correctamente",
      evidenceUrl,
    })
  } catch (error) {
    console.error("Error al procesar la evidencia:", error)
    return NextResponse.json({ success: false, message: "Error al procesar la evidencia" }, { status: 500 })
  }
}