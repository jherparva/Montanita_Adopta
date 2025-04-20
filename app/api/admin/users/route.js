import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/user"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function GET(request) {
  try {
    // Verificar autenticación con admin token
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    // Verificar que sea admin
    if (decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Acceso denegado" }, { status: 403 })
    }

    await dbConnect()

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    // Construir filtro
    const filter = {}

    if (role && role !== "all") {
      filter.role = role
    }

    if (status && status !== "all") {
      filter.bloqueado = status === "blocked"
    }

    if (search) {
      filter.$or = [
        { nombre: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { correo_electronico: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit

    // Obtener usuarios
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-password -contrasena")  // Excluir campos sensibles

    // Obtener total de usuarios para paginación
    const total = await User.countDocuments(filter)

    return NextResponse.json({
      success: true,
      users,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error del servidor: " + (error.message || "Error desconocido"),
      },
      { status: 500 },
    )
  }
}