import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Testimonial from "@/lib/models/testimony"

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

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const estado = searchParams.get("estado")

    // Construir la consulta
    const query = {}
    if (estado) query.estado = estado

    // Calcular skip para paginación
    const skip = (page - 1) * limit

    // Obtener testimonios con paginación
    const testimonials = await Testimonial.find(query)
      .sort({ fecha_creacion: -1 })
      .skip(skip)
      .limit(limit)

    // Contar total para paginación
    const total = await Testimonial.countDocuments(query)

    return NextResponse.json({
      success: true,
      testimonials,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error al obtener testimonios: " + error.message },
      { status: 500 },
    )
  }
}

export async function POST(request) {
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

    const data = await request.json()
    
    // Validar datos requeridos
    if (!data.nombre || !data.contenido) {
      return NextResponse.json(
        { success: false, message: "Nombre y contenido son campos requeridos" },
        { status: 400 },
      )
    }

    // Crear nuevo testimonio
    const nuevoTestimonio = new Testimonial({
      nombre: data.nombre,
      imagen: data.imagen || "",
      contenido: data.contenido,
      rol: data.rol || "",
      anioInicio: data.anioInicio || "",
      mostrarEnHome: data.mostrarEnHome || false,
      estado: data.estado || "activo",
      voluntarioId: data.voluntarioId || null,
    })

    await nuevoTestimonio.save()

    return NextResponse.json({
      success: true,
      message: "Testimonio creado correctamente",
      testimonial: nuevoTestimonio,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error al crear testimonio: " + error.message },
      { status: 500 },
    )
  }
}