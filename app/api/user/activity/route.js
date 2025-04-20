import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import UserActivity from "@/lib/models/userActivity"
import mongoose from "mongoose"

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "ID de usuario requerido" }, { status: 400 })
    }

    const actividades = await UserActivity.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ fecha: -1 })
      .limit(20)

    return NextResponse.json({
      success: true,
      actividades,
    })
  } catch (error) {
    console.error("Error al obtener actividades:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error del servidor: " + (error.message || "Error desconocido"),
      },
      { status: 500 },
    )
  }
}