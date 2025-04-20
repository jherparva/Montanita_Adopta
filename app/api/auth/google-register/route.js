import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/user"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { OAuth2Client } from "google-auth-library"

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })
}

export async function POST(request) {
  console.log("1. Iniciando proceso de registro con Google")
  
  // Set CORS headers for the actual request
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    console.log("2. Intentando conectar a la base de datos")
    console.log("GOOGLE_CLIENT_ID configurado:", !!process.env.GOOGLE_CLIENT_ID)
    console.log("JWT_SECRET configurado:", !!process.env.JWT_SECRET)
    
    await dbConnect()
    console.log("3. Conexión a la base de datos exitosa")

    console.log("4. Extrayendo datos de la solicitud")
    const data = await request.json()
    console.log("5. Datos recibidos:", { hasCredential: !!data.credential })

    if (!data.credential) {
      console.log("Error: Token de Google no proporcionado")
      return NextResponse.json({ success: false, message: "Token de Google requerido" }, { status: 400, headers })
    }

    console.log("6. Verificando el token de Google")
    try {
      const ticket = await client.verifyIdToken({
        idToken: data.credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      console.log("7. Verificación de token exitosa")

      const payload = ticket.getPayload()
      console.log("8. Payload obtenido:", { 
        hasEmail: !!payload?.email,
        hasName: !!payload?.name,
        hasSub: !!payload?.sub
      })

      if (!payload) {
        console.log("Error: Payload del token vacío")
        return NextResponse.json({ success: false, message: "Token de Google inválido" }, { status: 400, headers })
      }

      const { email, name, picture, sub } = payload
      console.log("9. Datos extraídos del payload:", { email, name, hasPicture: !!picture, hasSub: !!sub })

      console.log("10. Buscando usuario existente con email:", email)
      let user = await User.findOne({ email })
      console.log("11. Resultado de búsqueda:", { usuarioExistente: !!user })

      if (user) {
        console.log("12. Usuario encontrado, ID:", user._id.toString())
        // Si el usuario existe pero no tiene google_id, actualizarlo
        if (!user.google_id) {
          console.log("13. Actualizando google_id del usuario existente")
          user.google_id = sub
          await user.save()
          console.log("14. Usuario actualizado correctamente")
        }
      } else {
        console.log("12. Usuario no encontrado, creando nuevo usuario")
        // Crear nuevo usuario
        user = new User({
          nombre: name,
          name: name,
          correo_electronico: email,
          email: email,
          google_id: sub,
          profilePhoto: picture,
          profileImage: picture,
          // Generar una contraseña aleatoria que no se usará
          contrasena: Math.random().toString(36).slice(-10) + Math.random().toString(36).toUpperCase().slice(-2) + "1",
          password: Math.random().toString(36).slice(-10) + Math.random().toString(36).toUpperCase().slice(-2) + "1",
          fecha_registro: new Date(),
        })

        console.log("13. Intentando guardar nuevo usuario")
        await user.save()
        console.log("14. Nuevo usuario guardado correctamente con ID:", user._id.toString())
      }

      console.log("15. Generando token JWT")
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      )
      console.log("16. Token JWT generado correctamente")

      console.log("17. Estableciendo cookie de sesión")
      const cookieStore = cookies()
      cookieStore.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 días
        path: "/",
      })
      console.log("18. Cookie establecida correctamente")

      console.log("19. Retornando respuesta exitosa")
      return NextResponse.json(
        {
          success: true,
          message: "Registro con Google exitoso",
          userId: user._id,
          autoLogin: true,
        },
        { headers },
      )
    } catch (verifyError) {
      console.error("Error al verificar token:", verifyError)
      return NextResponse.json({ 
        success: false, 
        message: "Error al verificar token de Google", 
        error: verifyError.message 
      }, { status: 401, headers })
    }
  } catch (error) {
    console.error("Error completo en registro con Google:", error)
    console.error("Mensaje de error:", error.message)
    console.error("Stack trace:", error.stack)
    
    return NextResponse.json({ 
      success: false, 
      message: "Error al procesar la solicitud", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500, headers })
  }
}