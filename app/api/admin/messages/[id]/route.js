import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Función para manejo de solicitudes DELETE
export async function DELETE(req, { params }) {
  try {
    // Verificar autenticación de administrador
    const userId = await validateAdminAuth("admin_auth_token")
    if (typeof userId !== 'string') return userId // Retorna el error si no es admin

    const client = await clientPromise
    const db = client.db("montanita_adopta")

    // Obtener el ID del mensaje a eliminar
    const messageId = params.id

    // Validar que el ID del mensaje sea válido
    if (!ObjectId.isValid(messageId)) {
      return NextResponse.json({ message: "ID de mensaje inválido" }, { status: 400 })
    }

    // Eliminar el mensaje
    const deleteResult = await db.collection("messages").deleteOne({ 
      _id: new ObjectId(messageId) 
    })

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ message: "No se encontró el mensaje o ya fue eliminado" }, { status: 404 })
    }

    // Obtener información del usuario para el log
    const user = await getUserInfo(db, userId)

    // Registrar la acción de eliminación en logs
    await db.collection("admin_logs").insertOne({
      action: "delete_message",
      messageId: messageId,
      adminId: userId,
      date: new Date(),
      adminName: user.nombre || user.name || "Unknown"
    })

    return NextResponse.json({ 
      success: true, 
      message: "Mensaje eliminado correctamente" 
    })
  } catch (error) {
    console.error("Error al eliminar mensaje:", error)
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 })
  }
}

// Función auxiliar para validar autenticación de administrador
async function validateAdminAuth(tokenName = "auth_token") {
  // Verificar autenticación
  const cookieStore = await cookies()
  const token = cookieStore.get(tokenName)?.value

  if (!token) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 })
  }

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return NextResponse.json({ message: "Token inválido" }, { status: 401 })
  }

  const userId = decoded.id

  // Conectar a la base de datos
  const client = await clientPromise
  const db = client.db("montanita_adopta")

  // Verificar si el usuario existe
  let user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
  
  if (!user) {
    // Intentar buscar en la colección de admins
    user = await db.collection("admins").findOne({ _id: new ObjectId(userId) })
    
    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 401 })
    }
  }

  // Verificar si es administrador
  const isAdmin =
    user.isAdmin === true ||
    user.role === "admin" ||
    user.admin === true ||
    user.es_admin === true ||
    user.esAdmin === true

  if (!isAdmin) {
    return NextResponse.json({ message: "Acceso denegado" }, { status: 403 })
  }

  return userId
}

// Función auxiliar para obtener información de usuario para logs
async function getUserInfo(db, userId) {
  let user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
  
  if (!user) {
    user = await db.collection("admins").findOne({ _id: new ObjectId(userId) }) || {}
  }
  
  return user
}

// Método OPTIONS para CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        Allow: "DELETE, OPTIONS",
      },
    }
  )
}