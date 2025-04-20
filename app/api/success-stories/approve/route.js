import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Story from "@/lib/models/story"

export async function PUT(request) {
  try {
    await dbConnect()
    const data = await request.json()

    if (!data.storyId) {
      return NextResponse.json({ success: false, message: "ID de historia requerido" }, { status: 400 })
    }

    const story = await Story.findById(data.storyId)
    if (!story) {
      return NextResponse.json({ success: false, message: "Historia no encontrada" }, { status: 404 })
    }

    story.approved = data.approved === true

    if (data.approved === false && data.reason) {
      story.rejectionReason = data.reason
    }

    if (data.approved === true) {
      story.approvedAt = new Date()
    }

    await story.save()

    return NextResponse.json({
      success: true,
      message: data.approved ? "Historia aprobada correctamente" : "Historia rechazada correctamente",
      story,
    })
  } catch (error) {
    console.error("Error al aprobar/rechazar historia:", error)
    return NextResponse.json({ success: false, message: "Error al procesar la solicitud" }, { status: 500 })
  }
}