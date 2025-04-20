import { NextResponse } from "next/server"
import { unlink } from "fs/promises"
import path from "path"
import dbConnect from "@/lib/dbConnect"
import Story from "@/lib/models/story"

const isLocalImage = (imageUrl) => {
  return imageUrl && imageUrl.startsWith("/uploads/")
}

const deleteImageFile = async (imageUrl) => {
  if (!isLocalImage(imageUrl)) return

  try {
    const filePath = path.join(process.cwd(), "public", imageUrl)
    await unlink(filePath)
    console.log(`Imagen eliminada: ${filePath}`)
  } catch (error) {
    console.error(`Error al eliminar imagen: ${error.message}`)
  }
}

export async function GET(request, { params }) {
  try {
    await dbConnect()
    const story = await Story.findById(params.id)

    if (!story) {
      return NextResponse.json({ success: false, message: "Historia no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true, story })
  } catch (error) {
    console.error("Error al obtener historia:", error)
    return NextResponse.json({ success: false, message: "Error al obtener la historia" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect()
    const story = await Story.findById(params.id)

    if (!story) {
      return NextResponse.json({ success: false, message: "Historia no encontrada" }, { status: 404 })
    }

    if (story.image) {
      await deleteImageFile(story.image)
    }

    await Story.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: "Historia eliminada correctamente",
    })
  } catch (error) {
    console.error("Error al eliminar historia:", error)
    return NextResponse.json({ success: false, message: "Error al eliminar la historia" }, { status: 500 })
  }
}