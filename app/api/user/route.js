import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/user"

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit
    const search = searchParams.get("search") || ""

    const query = search
      ? {
          $or: [
            { nombre: { $regex: search, $options: "i" } },
            { correo_electronico: { $regex: search, $options: "i" } },
          ],
        }
      : {}

    const total = await User.countDocuments(query)
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("nombre correo_electronico telefono profilePhoto createdAt")

    return NextResponse.json({
      success: true,
      users,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error al listar usuarios:", error)
    return NextResponse.json({ success: false, message: "Error al obtener usuarios" }, { status: 500 })
  }
}