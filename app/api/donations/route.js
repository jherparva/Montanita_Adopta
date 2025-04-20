import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/lib/models/donation"

export async function POST(request) {
  try {
    await dbConnect()

    const data = await request.json()
    console.log("Datos recibidos para donación:", data)

    // Validar datos básicos requeridos
    const requiredFields = ["type", "donorName", "donorEmail", "donorPhone"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ success: false, message: `El campo ${field} es requerido` }, { status: 400 })
      }
    }

    // Validar campos específicos según el tipo de donación
    if (data.type === "monetary") {
      if (!data.amount || !data.paymentMethod) {
        return NextResponse.json(
          { success: false, message: "Para donaciones monetarias, se requiere monto y método de pago" },
          { status: 400 },
        )
      }
    } else if (data.type === "food") {
      if (!data.foodType || !data.quantity) {
        return NextResponse.json(
          { success: false, message: "Para donaciones de alimentos, se requiere tipo y cantidad" },
          { status: 400 },
        )
      }

      // Hacer opcional la validación de pickupAddress
      if (data.deliveryOption === "pickup" && !data.pickupAddress && data.pickupCity === "mismo-ciudad") {
        data.pickupAddress = "Pendiente de confirmar"
      }
    }

    // Crear nueva donación
    const donation = new Donation(data)
    const savedDonation = await donation.save()
    
    return NextResponse.json(
      {
        success: true,
        message: "Donación registrada correctamente",
        donationId: donation._id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al procesar la donación:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al procesar la donación: " + error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      // Obtener una donación específica
      const donation = await Donation.findById(id)
      if (!donation) {
        return NextResponse.json({ success: false, message: "Donación no encontrada" }, { status: 404 })
      }
      return NextResponse.json({ success: true, donation })
    } else {
      // Obtener todas las donaciones (con paginación y filtros)
      const page = parseInt(searchParams.get("page")) || 1
      const limit = parseInt(searchParams.get("limit")) || 10
      const skip = (page - 1) * limit
      const type = searchParams.get("type")
      const status = searchParams.get("status")

      const query = {}
      if (type) query.type = type
      if (status) query.status = status

      const donations = await Donation.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
      const total = await Donation.countDocuments(query)

      return NextResponse.json({
        success: true,
        donations,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      })
    }
  } catch (error) {
    console.error("Error al obtener donaciones:", error)
    return NextResponse.json({ success: false, message: "Error al obtener las donaciones" }, { status: 500 })
  }
}