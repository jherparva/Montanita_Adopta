import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()
    await cookieStore.delete("admin_auth_token")

    return NextResponse.json({
      message: "Sesión de administrador cerrada exitosamente",
    })
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const response = NextResponse.json({
      message: "Sesión de administrador cerrada exitosamente"
    })
    
    response.cookies.delete("admin_auth_token")
    
    return response
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 })
  }
}