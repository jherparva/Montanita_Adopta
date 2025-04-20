import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Message from "@/lib/models/message"

export async function PUT(request) {
  try {
    await dbConnect()

    const data = await request.json()

    if (!data.messageId) {
      return NextResponse.json({ success: false, message: "ID de mensaje requerido" }, { status: 400 })
    }

    const message = await Message.findById(data.messageId)

    if (!message) {
      return NextResponse.json({ success: false, message: "Mensaje no encontrado" }, { status: 404 })
    }

    // Marcar como leído/no leído
    message.read = data.read !== false

    if (message.read && !message.readDate) {
      message.readDate = new Date()
    }

    await message.save()

    return NextResponse.json({
      success: true,
      message: message.read ? "Mensaje marcado como leído" : "Mensaje marcado como no leído",
      messageData: message,
    })
  } catch (error) {
    console.error("Error al marcar mensaje:", error)
    return NextResponse.json({ success: false, message: "Error al procesar la solicitud" }, { status: 500 })
  }
}