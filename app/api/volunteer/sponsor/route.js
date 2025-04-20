import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import mongoose from "mongoose"

// Definir el esquema para patrocinios
const sponsorSchema = new mongoose.Schema({
  sponsorName: {
    type: String,
    required: [true, "El nombre del patrocinador es requerido"],
    trim: true
  },
  sponsorEmail: {
    type: String,
    required: [true, "El correo electrónico del patrocinador es requerido"],
    trim: true
  },
  sponsorPhone: {
    type: String,
    required: [true, "El teléfono del patrocinador es requerido"],
    trim: true
  },
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Animal",
    required: [true, "El ID del animal es requerido"]
  },
  sponsorshipType: {
    type: String,
    enum: ["monthly", "one-time", "supplies"],
    required: [true, "El tipo de patrocinio es requerido"]
  },
  amount: {
    type: Number,
    required: function() {
      return this.sponsorshipType !== "supplies"
    }
  },
  suppliesDescription: {
    type: String,
    required: function() {
      return this.sponsorshipType === "supplies"
    }
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ["active", "paused", "ended"],
    default: "active"
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Actualizar la fecha de modificación antes de guardar
sponsorSchema.pre("save", function(next) {
  this.updatedAt = Date.now()
  next()
})

// Crear o recuperar el modelo
const Sponsor = mongoose.models.Sponsor || mongoose.model("Sponsor", sponsorSchema)

export async function POST(request) {
  try {
    await dbConnect()

    const data = await request.json()

    // Validar datos requeridos
    const requiredFields = ["sponsorName", "sponsorEmail", "sponsorPhone", "animalId", "sponsorshipType"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ success: false, message: `El campo ${field} es requerido` }, { status: 400 })
      }
    }

    // Validar campos específicos según el tipo de patrocinio
    if (data.sponsorshipType !== "supplies" && !data.amount) {
      return NextResponse.json(
        { success: false, message: "El monto es requerido para este tipo de patrocinio" },
        { status: 400 }
      )
    }

    if (data.sponsorshipType === "supplies" && !data.suppliesDescription) {
      return NextResponse.json(
        { success: false, message: "La descripción de suministros es requerida" },
        { status: 400 }
      )
    }

    // Verificar que el animal existe
    const Animal = mongoose.models.Animal
    const animal = await Animal.findById(data.animalId)
    if (!animal) {
      return NextResponse.json({ success: false, message: "El animal seleccionado no existe" }, { status: 404 })
    }

    // Crear nuevo patrocinio
    const sponsor = new Sponsor(data)
    await sponsor.save()

    return NextResponse.json(
      {
        success: true,
        message: "Patrocinio registrado correctamente",
        sponsorId: sponsor._id
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error al procesar el patrocinio:", error)
    return NextResponse.json({ success: false, message: "Error al procesar el patrocinio" }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const animalId = searchParams.get("animalId")

    if (id) {
      // Obtener un patrocinio específico
      const sponsor = await Sponsor.findById(id).populate("animalId")
      if (!sponsor) {
        return NextResponse.json({ success: false, message: "Patrocinio no encontrado" }, { status: 404 })
      }
      return NextResponse.json({ success: true, sponsor })
    } 
    
    if (animalId) {
      // Obtener patrocinios para un animal específico
      const sponsors = await Sponsor.find({ animalId, status: "active" })
      return NextResponse.json({
        success: true,
        sponsors,
        totalSponsors: sponsors.length
      })
    } 
    
    // Obtener todos los patrocinios (con paginación)
    const page = parseInt(searchParams.get("page")) || 1
    const limit = parseInt(searchParams.get("limit")) || 10
    const skip = (page - 1) * limit
    const status = searchParams.get("status")

    const query = status ? { status } : {}

    const sponsors = await Sponsor.find(query)
      .populate("animalId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Sponsor.countDocuments(query)

    return NextResponse.json({
      success: true,
      sponsors,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error al obtener patrocinios:", error)
    return NextResponse.json({ success: false, message: "Error al obtener los patrocinios" }, { status: 500 })
  }
}