import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Testimonial from "@/lib/models/testimony"

// Función para obtener un testimonio por ID
export async function GET(request, { params }) {
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

    const testimonialId = params.id
    const testimonial = await Testimonial.findById(testimonialId)

    if (!testimonial) {
      return NextResponse.json(
        { success: false, message: "Testimonio no encontrado" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      testimonial,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error al obtener testimonio: " + error.message },
      { status: 500 },
    )
  }
}

// Función para actualizar un testimonio
export async function PUT(request, { params }) {
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

    const testimonialId = params.id
    const data = await request.json()

    // Validar datos requeridos
    if (!data.nombre || !data.contenido) {
      return NextResponse.json(
        { success: false, message: "Nombre y contenido son campos requeridos" },
        { status: 400 },
      )
    }

    // Actualizar los campos permitidos
    const updateData = {
      nombre: data.nombre,
      contenido: data.contenido,
      rol: data.rol || "",
      anioInicio: data.anioInicio || "",
      mostrarEnHome: data.mostrarEnHome || false,
      estado: data.estado || "activo",
      fecha_actualizacion: new Date(),
    }

    // Actualizar imagen solo si se proporciona
    if (data.imagen) {
      updateData.imagen = data.imagen
    }

    // Actualizar id de voluntario si se proporciona
    if (data.voluntarioId) {
      updateData.voluntarioId = data.voluntarioId
    }

    const testimonialActualizado = await Testimonial.findByIdAndUpdate(
      testimonialId,
      { $set: updateData },
      { new: true, runValidators: true }
    )

    if (!testimonialActualizado) {
      return NextResponse.json(
        { success: false, message: "Testimonio no encontrado" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Testimonio actualizado correctamente",
      testimonial: testimonialActualizado,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error al actualizar testimonio: " + error.message },
      { status: 500 },
    )
  }
}

// Función para eliminar un testimonio
export async function DELETE(request, { params }) {
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

    const testimonialId = params.id
    const resultado = await Testimonial.findByIdAndDelete(testimonialId)

    if (!resultado) {
      return NextResponse.json(
        { success: false, message: "Testimonio no encontrado" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Testimonio eliminado correctamente",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error al eliminar testimonio: " + error.message },
      { status: 500 },
    )
  }
}