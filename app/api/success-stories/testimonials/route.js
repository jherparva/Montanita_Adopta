import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Story from "@/lib/models/story"

export async function GET(request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "3")
    
    const testimonials = await Story.find({ 
      approved: true,
      isTestimony: true 
    })
      .sort({ date: -1 })
      .limit(limit)
      .lean()
    
    return NextResponse.json({
      success: true,
      stories: testimonials
    })
  } catch (error) {
    console.error("Error al obtener testimonios:", error)
    return NextResponse.json(
      { success: false, message: "Error al obtener los testimonios" }, 
      { status: 500 }
    )
  }
}