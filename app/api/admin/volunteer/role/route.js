import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Volunteer from "@/lib/models/volunteer"
import User from "@/lib/models/user"

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
    const { volunteerId, asignarRol } = data

    if (!volunteerId) {
      return NextResponse.json({ success: false, message: "ID de voluntario es requerido" }, { status: 400 })
    }

    // Buscar el voluntario
    const volunteer = await Volunteer.findById(volunteerId)
    if (!volunteer) {
      return NextResponse.json({ success: false, message: "Voluntario no encontrado" }, { status: 404 })
    }

    // Verificar que el voluntario esté aprobado para asignar rol
    if (asignarRol && volunteer.estado !== "aprobado") {
      return NextResponse.json(
        { success: false, message: "Solo se puede asignar rol a voluntarios aprobados" },
        { status: 400 }
      )
    }

    // Actualizar el estado de voluntario
    volunteer.es_voluntario = asignarRol
    volunteer.fecha_actualizacion = new Date()
    await volunteer.save()

    // Actualizar el rol en el sistema de usuarios si existe
    try {
      const user = await User.findOne({ email: volunteer.email })
      
      if (user) {
        if (asignarRol) {
          // Agregar rol de voluntario si no lo tiene
          if (!user.roles || !user.roles.includes('voluntario')) {
            user.roles = [...(user.roles || []), 'voluntario']
          }
        } else {
          // Quitar rol de voluntario si lo tiene
          if (user.roles && user.roles.includes('voluntario')) {
            user.roles = user.roles.filter(rol => rol !== 'voluntario')
          }
        }
        await user.save()
      }
    } catch (userError) {
      // No interrumpimos el flujo si falla la actualización del usuario
    }

    return NextResponse.json({
      success: true,
      message: asignarRol 
        ? "Rol de voluntario asignado correctamente" 
        : "Rol de voluntario eliminado correctamente",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error al actualizar rol de voluntario: " + error.message },
      { status: 500 },
    )
  }
}