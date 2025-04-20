//C:\Users\jhon\Downloads\montanita-adopta\lib\auth.js

import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import dbConnect from "./dbConnect"
import User from "./models/user"

// Middleware para verificar autenticación
export async function authMiddleware(request) {
  try {
    const cookieStore = await cookies() // ✅ Usar await aquí
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    await dbConnect()
    const user = await User.findById(decoded.userId)

    if (!user) {
      return null
    }

    return {
      id: user._id.toString(),
      nombre: user.nombre,
      email: user.email || user.correo_electronico,
      role: user.role,
      isAdmin: user.isAdmin || false,
      profilePhoto: user.profilePhoto,
    }
  } catch (error) {
    console.error("Error al verificar autenticación:", error)
    return null
  }
}

// Función para obtener el usuario actual
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies() // ✅ Usar await aquí
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    await dbConnect()
    const user = await User.findById(decoded.userId)

    if (!user) {
      return null
    }

    return {
      id: user._id.toString(),
      nombre: user.nombre,
      email: user.email || user.correo_electronico,
      role: user.role,
      isAdmin: user.isAdmin || false,
      profilePhoto: user.profilePhoto,
    }
  } catch (error) {
    console.error("Error al obtener usuario actual:", error)
    return null
  }
}

// Verificar si el usuario es administrador
export async function verifyAdminToken(request) {
  const user = await authMiddleware(request)

  if (!user) {
    return false
  }

  // Verificar si el usuario es administrador
  return user.isAdmin === true || user.role === "admin"
}

// Verificar autenticación general (para API routes)
export async function verifyToken(request) {
  const user = await authMiddleware(request)

  return {
    authenticated: !!user,
    user,
  }
}
