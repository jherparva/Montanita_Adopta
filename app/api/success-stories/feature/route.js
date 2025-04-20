import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Story from "@/lib/models/story"

export async function GET(request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "3")
    const type = searchParams.get("type")
    
    let query = { approved: true }
    
    if (type === "featured") {
      query.isFeatured = true
    } else if (type === "testimony") {
      query.isTestimony = true
    } else {
      query.$or = [{ isFeatured: true }, { isTestimony: true }]
    }
    
    const stories = await Story.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .lean()
    
    return NextResponse.json({
      success: true,
      stories
    })
  } catch (error) {
    console.error("Error al obtener historias destacadas:", error)
    return NextResponse.json(
      { success: false, message: "Error al obtener las historias destacadas" }, 
      { status: 500 }
    )
  }
}