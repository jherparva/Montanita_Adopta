import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Volunteer from "@/lib/models/volunteer"

export async function DELETE(request) {
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
    const { volunteerId } = data

    if (!volunteerId) {
      return NextResponse.json({ success: false, message: "ID de voluntario es requerido" }, { status: 400 })
    }

    // Buscar y eliminar el voluntario
    const result = await Volunteer.findByIdAndDelete(volunteerId)
    
    if (!result) {
      return NextResponse.json({ success: false, message: "Voluntario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Voluntario eliminado correctamente",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error al eliminar voluntario: " + error.message },
      { status: 500 },
    )
  }
}