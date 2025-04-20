// middleware.js 
import { NextResponse } from "next/server"

export function middleware(request) {
  const pathname = request.nextUrl.pathname
  
  // ✅ EXCLUIR exactamente /admin (la página de login)
  const isAdminLoginPage = pathname === "/admin"
  const isAdminPanel = pathname.startsWith("/admin") && !isAdminLoginPage && !pathname.startsWith("/api")
  
  // Modificamos esta línea para excluir correctamente todas las rutas de autenticación
  const isAdminAPI = pathname.startsWith("/api/admin") && 
                    !pathname.startsWith("/api/admin/auth/")
  
  // Cambio clave: Usamos admin_auth_token en lugar de auth_token
  const token = request.cookies.get("admin_auth_token")?.value
  
  if (isAdminPanel && !token) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }
  
  if (isAdminAPI && !token) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }
  
  return NextResponse.next()
}

// Update the matcher to be more specific
export const config = {
  matcher: [
    "/admin/:path*", 
    "/api/admin/:path*",
    // Exclude specific paths that don't need authentication
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
}