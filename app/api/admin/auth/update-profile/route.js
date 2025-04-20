import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_auth_token")?.value

    if (!token) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      
      // Obtener datos del formulario
      const { nombre, email, telefono, password } = await req.json()

      // Conectar a la base de datos
      const client = await clientPromise
      const db = client.db("montanita_adopta")

      const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) })

      if (!user) {
        return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 })
      }

      // Preparar datos para actualizar
      const updateData = {
        nombre,
        name: nombre,
        correo_electronico: email,
        email,
        telefono,
        phone: telefono,
        updatedAt: new Date(),
      }

      // Si se proporciona una nueva contraseña, hashearla
      if (password) {
        const salt = await bcrypt.genSalt(10)
        updateData.password = await bcrypt.hash(password, salt)
      }

      const result = await db.collection("users").updateOne(
        { _id: new ObjectId(decoded.id) }, 
        { $set: updateData }
      )

      if (result.matchedCount === 0) {
        return NextResponse.json({ message: "No se pudo actualizar el perfil" }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: "Perfil actualizado correctamente",
      })
    } catch (error) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error al actualizar perfil:", error)
    return NextResponse.json({ message: "Error del servidor: " + error.message }, { status: 500 })
  }
}