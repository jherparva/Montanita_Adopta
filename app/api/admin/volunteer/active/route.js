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
    const area = searchParams.get("area")
    const desde = searchParams.get("desde")
    const hasta = searchParams.get("hasta")

    // Construir la consulta básica para voluntarios activos
    const query = { 
      es_voluntario: true,
      estado: "aprobado"
    }
    
    // Añadir filtro por área de interés si se especifica
    if (area) {
      query.areas_interes = area
    }
    
    // Añadir filtros de fecha
    if (desde || hasta) {
      query.fecha_actualizacion = {}
      
      if (desde) {
        query.fecha_actualizacion.$gte = new Date(desde)
      }
      
      if (hasta) {
        query.fecha_actualizacion.$lte = new Date(hasta + 'T23:59:59.999Z')
      }
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit

    // Obtener voluntarios activos con paginación
    const volunteers = await Volunteer.find(query)
      .sort({ fecha_actualizacion: -1 })
      .skip(skip)
      .limit(limit)

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
      { success: false, message: "Error al obtener voluntarios activos: " + error.message },
      { status: 500 },
    )
  }
}