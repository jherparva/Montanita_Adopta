import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("image")

    if (!file) {
      return NextResponse.json({ success: false, message: "No se ha proporcionado ninguna imagen" }, { status: 400 })
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: "Formato de archivo no válido" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "La imagen es demasiado grande. El tamaño máximo es 5MB" },
        { status: 400 },
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileName = `${uuidv4()}.${file.type.split("/")[1]}`
    const uploadDir = path.join(process.cwd(), "public/uploads/stories")
    const filePath = path.join(uploadDir, fileName)

    await writeFile(filePath, buffer)
    const imageUrl = `/uploads/stories/${fileName}`

    return NextResponse.json({ success: true, imageUrl }, { status: 201 })
  } catch (error) {
    console.error("Error al subir imagen:", error)
    return NextResponse.json({ success: false, message: "Error al procesar la imagen" }, { status: 500 })
  }
}