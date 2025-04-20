import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Sponsor from "@/lib/models/sponsor"

export async function GET(request) {
  try {
    // Verificar autenticación usando la ruta existente
    const authResponse = await fetch(new URL("/api/admin/auth/check", request.url).toString(), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    })

    const authData = await authResponse.json()

    if (!authResponse.ok || !authData.authenticated) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    // Verificar si el usuario es administrador
    if (!authData.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Acceso denegado: se requieren permisos de administrador" },
        { status: 403 },
      )
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const sponsorshipType = searchParams.get("sponsorshipType")
    const search = searchParams.get("search")

    // Construir la consulta
    const query = {}
    if (status) query.status = status
    if (sponsorshipType) query.sponsorshipType = sponsorshipType
    if (search) {
      query.$or = [
        { sponsorName: { $regex: search, $options: "i" } },
        { sponsorEmail: { $regex: search, $options: "i" } },
      ]
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit

    // Obtener patrocinios con paginación
    const sponsors = await Sponsor.find(query)
      .populate("animalId", "name species breed")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Contar total para paginación
    const total = await Sponsor.countDocuments(query)

    return NextResponse.json({
      success: true,
      sponsors,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener patrocinios:", error)
    return NextResponse.json(
      { success: false, message: "Error al obtener patrocinios: " + error.message },
      { status: 500 },
    )
  }
}