import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/lib/models/donation"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import fs from "fs/promises"
import path from "path"

// Función para verificar si el usuario es administrador
async function isAdmin() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return false
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Por simplicidad, asumimos que si hay token válido, es admin
    return true
  } catch (error) {
    console.error("Error verificando admin:", error)
    return false
  }
}

// GET para obtener una donación específica
export async function GET(req, { params }) {
  try {
    await dbConnect()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "ID de donación inválido" }, { status: 400 })
    }

    const donation = await Donation.findById(id)
    if (!donation) {
      return NextResponse.json({ success: false, message: "Donación no encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      donation,
    })
  } catch (error) {
    console.error("Error al obtener donación:", error)
    return NextResponse.json({ success: false, message: "Error al obtener la donación" }, { status: 500 })
  }
}

// DELETE para eliminar una donación
export async function DELETE(req, { params }) {
  try {
    // Verificar si el usuario es administrador
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    await dbConnect()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "ID de donación inválido" }, { status: 400 })
    }

    // Obtener la donación para verificar si tiene evidencia
    const donation = await Donation.findById(id)
    if (!donation) {
      return NextResponse.json({ success: false, message: "Donación no encontrada" }, { status: 404 })
    }

    // Si hay una URL de evidencia, intentar eliminar el archivo
    if (donation.evidenceUrl) {
      try {
        const filePath = path.join(process.cwd(), "public", donation.evidenceUrl)
        await fs.unlink(filePath)
      } catch (fileError) {
        console.error("Error al eliminar archivo de evidencia:", fileError)
        // Continuamos con la eliminación de la donación aunque falle la eliminación del archivo
      }
    }

    // Eliminar la donación
    await Donation.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "Donación eliminada correctamente",
    })
  } catch (error) {
    console.error("Error al eliminar donación:", error)
    return NextResponse.json({ success: false, message: "Error al eliminar la donación" }, { status: 500 })
  }
}