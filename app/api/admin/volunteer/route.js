import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Volunteer from "@/lib/models/volunteer"

export async function GET(request) {
  try {
    // Verificar autenticación
    const authResponse = await fetch(new URL("/api/admin/auth/check", request.url).toString(), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    })

    const authData = await authResponse.json()

    if (!authResponse.ok || !authData.authenticated) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    if (!authData.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Acceso denegado: se requieren permisos de administrador" },
        { status: 403 },
      )
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const estado = searchParams.get("estado")
    const search = searchParams.get("search")

    // Construir la consulta
    const query = {}
    if (estado) query.estado = estado
    if (search) {
      query.$or = [{ nombre: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit

    // Obtener voluntarios con paginación
    const volunteers = await Volunteer.find(query).sort({ fecha_solicitud: -1 }).skip(skip).limit(limit)

    // Contar total para paginación
    const total = await Volunteer.countDocuments(query)

    return NextResponse.json({
      success: true,
      volunteers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error al obtener voluntarios: " + error.message },
      { status: 500 },
    )
  }
}