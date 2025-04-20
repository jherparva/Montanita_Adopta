import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import fs from "fs"

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("image")

    if (!file) {
      return NextResponse.json({ success: false, message: "No se proporcionó ninguna imagen" }, { status: 400 })
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: "Formato de imagen inválido" }, { status: 400 })
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, message: "La imagen supera el tamaño permitido (5MB)" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const extension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${extension}`

    const uploadDir = path.join(process.cwd(), "public", "uploads", "animals")
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    const imageUrl = `/uploads/animals/${fileName}`

    return NextResponse.json({ success: true, imageUrl }, { status: 201 })
  } catch (error) {
    console.error("Error al subir imagen del animal:", error)
    return NextResponse.json({ success: false, message: "Error al subir imagen" }, { status: 500 })
  }
}