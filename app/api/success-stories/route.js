import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Story from "@/lib/models/story"

export async function GET(request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const approvedOnly = searchParams.get("approved") === "true"
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "5")
    const skip = (page - 1) * limit

    const query = approvedOnly ? { approved: true } : {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    const total = await Story.countDocuments(query)
    const stories = await Story.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      stories,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error al obtener historias:", error)
    return NextResponse.json({ success: false, message: "Error al obtener historias" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await dbConnect()
    const data = await request.json()

    if (!data.titulo || !data.contenido || !data.nombre || !data.email) {
      return NextResponse.json({ success: false, message: "Faltan campos requeridos" }, { status: 400 })
    }

    const newStory = new Story({
      title: data.titulo,
      content: data.contenido,
      author: data.nombre,
      email: data.email,
      image: data.imagen || null,
      approved: false,
      date: new Date(),
    })

    await newStory.save()

    return NextResponse.json({ success: true, message: "Historia enviada correctamente" }, { status: 201 })
  } catch (error) {
    console.error("Error al guardar historia:", error)
    return NextResponse.json({ success: false, message: "Error al guardar la historia" }, { status: 500 })
  }
}