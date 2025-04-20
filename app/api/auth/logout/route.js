import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Sesión cerrada correctamente"
    });
    
    // Eliminar la cookie de autenticación
    response.cookies.delete("auth_token");
    
    return response;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return NextResponse.json({ success: false, message: "Error al procesar la solicitud" }, { status: 500 });
  }
}

// También puedes añadir un manejador GET si lo necesitas
export async function GET() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Sesión cerrada correctamente"
    });
    
    // Eliminar la cookie de autenticación
    response.cookies.delete("auth_token");
    
    return response;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return NextResponse.json({ success: false, message: "Error al procesar la solicitud" }, { status: 500 });
  }
}