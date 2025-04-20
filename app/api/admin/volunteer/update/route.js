import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Volunteer from "@/lib/models/volunteer"

export async function PUT(request) {
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
    const { _id, ...updateData } = data

    if (!_id) {
      return NextResponse.json({ success: false, message: "ID de voluntario es requerido" }, { status: 400 })
    }

    // Lista de campos permitidos para actualizar
    const camposPermitidos = [
      'nombre', 'email', 'telefono', 'direccion', 'ciudad',
      'disponibilidad', 'experiencia', 'habilidades', 'motivacion',
      'areas_interes', 'fecha_inicio', 'notas_admin', 'capacitaciones',
      'horas_acumuladas', 'rol_especifico'
    ]

    // Filtrar solo los campos permitidos
    const datosActualizados = {}
    for (const campo of camposPermitidos) {
      if (updateData[campo] !== undefined) {
        datosActualizados[campo] = updateData[campo]
      }
    }

    // Añadir fecha de actualización
    datosActualizados.fecha_actualizacion = new Date()

    // Convertir fecha_inicio a objeto Date si existe
    if (datosActualizados.fecha_inicio) {
      datosActualizados.fecha_inicio = new Date(datosActualizados.fecha_inicio)
    }

    // Actualizar voluntario
    const voluntarioActualizado = await Volunteer.findByIdAndUpdate(
      _id,
      { $set: datosActualizados },
      { new: true, runValidators: true }
    )

    if (!voluntarioActualizado) {
      return NextResponse.json({ success: false, message: "Voluntario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Información del voluntario actualizada correctamente",
      volunteer: voluntarioActualizado
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error al actualizar voluntario: " + error.message },
      { status: 500 },
    )
  }
}