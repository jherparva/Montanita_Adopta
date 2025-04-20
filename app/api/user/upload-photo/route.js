import { NextResponse } from "next/server"
import { writeFile, mkdir, unlink } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/user"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import fs from "fs"

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("photo")
    const userId = formData.get("userId")

    if (!file) {
      return NextResponse.json({ success: false, message: "No se ha proporcionado ninguna imagen" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ success: false, message: "ID de usuario requerido" }, { status: 400 })
    }

    if (decoded.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "No autorizado para actualizar este usuario" },
        { status: 403 },
      )
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "El archivo debe ser una imagen (JPEG, PNG, GIF o WEBP)" },
        { status: 400 },
      )
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, message: "La imagen no debe superar los 5MB" }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 })
    }

    const oldPhotoPath = user.profilePhoto
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const extension = path.extname(file.name)
    const fileName = `${uuidv4()}${extension}`

    const publicDir = path.join(process.cwd(), "public")
    const uploadsDir = path.join(publicDir, "uploads")
    const uploadDir = path.join(uploadsDir, "profiles")

    try {
      if (!fs.existsSync(publicDir)) {
        await mkdir(publicDir, { recursive: true })
      }
      
      if (!fs.existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }
      
      if (!fs.existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      await writeFile(path.join(uploadDir, fileName), buffer)
    } catch (error) {
      console.error("Error al guardar la imagen:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error al guardar la imagen",
          error: error.message,
        },
        { status: 500 },
      )
    }

    const imageUrl = `/uploads/profiles/${fileName}`
    user.profilePhoto = imageUrl
    user.profileImage = imageUrl

    await user.save()

    if (oldPhotoPath && 
        oldPhotoPath !== "/imagenes/perfil/default-profile.webp" && 
        !oldPhotoPath.includes("default-profile")) {
      try {
        const oldFilePath = path.join(process.cwd(), "public", oldPhotoPath)
        if (fs.existsSync(oldFilePath)) {
          await unlink(oldFilePath)
        }
      } catch (error) {
        console.error("Error al eliminar la foto anterior:", error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Foto de perfil actualizada correctamente",
      imageUrl,
    })
  } catch (error) {
    console.error("Error al subir foto de perfil:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al procesar la solicitud",
        error: error.message,
      },
      { status: 500 },
    )
  }
}