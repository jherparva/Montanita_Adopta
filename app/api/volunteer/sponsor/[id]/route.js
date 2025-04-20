import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import mongoose from "mongoose"

const Sponsor = mongoose.models.Sponsor

export async function DELETE(_, { params }) {
  try {
    await dbConnect()

    const { id } = await params
    const result = await Sponsor.findByIdAndDelete(id)

    if (!result) {
      return NextResponse.json({ success: false, message: "Patrocinio no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Patrocinio eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar patrocinio:", error)
    return NextResponse.json({ success: false, message: "Error al eliminar patrocinio" }, { status: 500 })
  }
}