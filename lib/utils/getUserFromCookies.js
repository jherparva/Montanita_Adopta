import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/user"

export async function getUserFromCookies() {
  try {
    const cookieStore = await cookies(); 
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return null

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await dbConnect()

    const user = await User.findById(decoded.userId)

    if (!user) return null

    return {
      id: user._id.toString(),
      nombre: user.nombre,
      email: user.correo_electronico,
      profilePhoto: user.profilePhoto || "/imagenes/perfil/default-profile.webp",
    }
  } catch (error) {
    console.error("Error al obtener usuario desde cookies:", error)
    return null
  }
}
