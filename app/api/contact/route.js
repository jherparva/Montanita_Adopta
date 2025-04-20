import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import dbConnect from "@/lib/dbConnect"
import Message from "@/lib/models/message"
import User from "@/lib/models/user"

export async function POST(request) {
  try {
    // Verificar autenticación usando JWT
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: "Debes iniciar sesión para enviar mensajes" 
      }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    await dbConnect()
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "Usuario no encontrado" 
      }, { status: 404 })
    }

    const data = await request.json()

    // Validar datos requeridos
    const requiredFields = ["name", "email", "subject", "message"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ success: false, message: `El campo ${field} es requerido` }, { status: 400 })
      }
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ success: false, message: "Formato de email inválido" }, { status: 400 })
    }

    // Crear nuevo mensaje
    const message = new Message({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      date: new Date(),
      read: false,
      replied: false,
      userId: user._id
    })

    await message.save()

    return NextResponse.json(
      {
        success: true,
        message: "Mensaje enviado correctamente",
        messageId: message._id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al procesar el mensaje de contacto:", error)
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ 
        success: false, 
        message: "Sesión inválida. Por favor inicia sesión nuevamente" 
      }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: "Error al procesar el mensaje" }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    // Verificar autenticación y permisos de administrador
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: "No tienes permiso para acceder a estos datos" 
      }, { status: 403 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    await dbConnect()
    const user = await User.findById(decoded.userId)
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: "No tienes permisos de administrador para acceder a estos datos" 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      // Obtener un mensaje específico
      const message = await Message.findById(id)

      if (!message) {
        return NextResponse.json({ success: false, message: "Mensaje no encontrado" }, { status: 404 })
      }

      // Marcar como leído si no lo está
      if (!message.read) {
        message.read = true
        message.readDate = new Date()
        await message.save()
      }

      return NextResponse.json({ success: true, message })
    } else {
      // Obtener todos los mensajes (con paginación)
      const page = parseInt(searchParams.get("page")) || 1
      const limit = parseInt(searchParams.get("limit")) || 10
      const skip = (page - 1) * limit
      const unreadOnly = searchParams.get("unread") === "true"

      const query = unreadOnly ? { read: false } : {}

      const messages = await Message.find(query).sort({ date: -1 }).skip(skip).limit(limit)
      const total = await Message.countDocuments(query)

      return NextResponse.json({
        success: true,
        messages,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      })
    }
  } catch (error) {
    console.error("Error al obtener mensajes de contacto:", error)
    return NextResponse.json({ success: false, message: "Error al obtener los mensajes" }, { status: 500 })
  }
}