import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import mongoose from "mongoose"

// Definir el esquema para el uso de donaciones
const donationUsageSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, "La descripción es requerida"],
  },
  amount: {
    type: Number,
    required: [true, "El monto es requerido"],
  },
  category: {
    type: String,
    enum: ["medical", "food", "shelter", "other"],
    required: [true, "La categoría es requerida"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
})

// Crear o recuperar el modelo
const DonationUsage = mongoose.models.DonationUsage || mongoose.model("DonationUsage", donationUsageSchema)

export async function POST(request) {
  try {
    await dbConnect()
    const data = await request.json()

    // Validar datos requeridos
    if (!data.description) {
      return NextResponse.json({ success: false, message: "La descripción es requerida" }, { status: 400 })
    }

    // Crear nuevo registro de uso
    const usageRecord = new DonationUsage({
      description: data.description,
      amount: data.amount || 0,
      category: data.category || "other",
      date: data.date ? new Date(data.date) : new Date(),
      createdBy: data.userId,
    })

    await usageRecord.save()

    return NextResponse.json(
      {
        success: true,
        message: "Registro de uso de donaciones creado correctamente",
        usageId: usageRecord._id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al procesar el registro de uso:", error)
    return NextResponse.json({ success: false, message: "Error al procesar el registro de uso" }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      // Obtener un registro específico
      const usageRecord = await DonationUsage.findById(id)
      if (!usageRecord) {
        return NextResponse.json({ success: false, message: "Registro no encontrado" }, { status: 404 })
      }
      return NextResponse.json({ success: true, usageRecord })
    } else {
      // Obtener todos los registros (con paginación y filtros)
      const page = parseInt(searchParams.get("page")) || 1
      const limit = parseInt(searchParams.get("limit")) || 10
      const skip = (page - 1) * limit
      const category = searchParams.get("category")
      const startDate = searchParams.get("startDate")
      const endDate = searchParams.get("endDate")

      const query = {}
      if (category) query.category = category

      if (startDate || endDate) {
        query.date = {}
        if (startDate) query.date.$gte = new Date(startDate)
        if (endDate) query.date.$lte = new Date(endDate)
      }

      const usageRecords = await DonationUsage.find(query).sort({ date: -1 }).skip(skip).limit(limit)
      const total = await DonationUsage.countDocuments(query)

      return NextResponse.json({
        success: true,
        usageRecords,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      })
    }
  } catch (error) {
    console.error("Error al obtener registros de uso:", error)
    return NextResponse.json({ success: false, message: "Error al obtener los registros de uso" }, { status: 500 })
  }
}