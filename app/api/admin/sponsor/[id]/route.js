import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Sponsor from "@/lib/models/sponsor"

export async function DELETE(request, { params }) {
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

    const { id } = params
    if (!id) {
      return NextResponse.json({ success: false, message: "ID de patrocinio requerido" }, { status: 400 })
    }

    // Buscar y eliminar el patrocinio
    const sponsor = await Sponsor.findByIdAndDelete(id)
    if (!sponsor) {
      return NextResponse.json({ success: false, message: "Patrocinio no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Patrocinio eliminado correctamente",
    })
  } catch (error) {
    console.error("Error al eliminar patrocinio:", error)
    return NextResponse.json(
      { success: false, message: "Error al eliminar patrocinio: " + error.message },
      { status: 500 },
    )
  }
}