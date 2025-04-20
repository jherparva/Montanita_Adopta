import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Appointment from "@/lib/models/appointment"
import { getUserFromCookies } from "@/lib/utils/getUserFromCookies"

export async function POST(request) {
  try {
    await dbConnect()

    // Verificar autenticación
    const user = await getUserFromCookies(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Debes iniciar sesión para reservar una cita" },
        { status: 401 },
      )
    }

    const data = await request.json()

    // Validar datos requeridos
    const requiredFields = ["petName", "petType", "service", "appointmentDate", "appointmentTime"]

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ success: false, message: `El campo ${field} es requerido` }, { status: 400 })
      }
    }

    // Validar que la fecha no sea en el pasado
    const appointmentDate = new Date(data.appointmentDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (appointmentDate < today) {
      return NextResponse.json(
        { success: false, message: "La fecha de la cita no puede ser en el pasado" },
        { status: 400 },
      )
    }

    // Asegurarnos de tener el nombre del propietario
    const petOwnerName = data.petOwnerName || user.nombre || user.name || "Usuario"

    // Crear nueva cita
    const appointment = new Appointment({
      petOwner: user.id,
      petOwnerName: petOwnerName,
      petName: data.petName,
      petType: data.petType,
      service: data.service,
      serviceId: data.serviceId || null,
      appointmentDate: appointmentDate,
      appointmentTime: data.appointmentTime,
      notes: data.notes || "",
      status: "pending",
    })

    await appointment.save()

    return NextResponse.json(
      {
        success: true,
        message: "Cita reservada correctamente",
        appointmentId: appointment._id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al procesar la reserva de cita:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al procesar la reserva: " + (error.message || "Error desconocido"),
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
      // Obtener una cita específica
      const appointment = await Appointment.findById(id)

      if (!appointment) {
        return NextResponse.json({ success: false, message: "Cita no encontrada" }, { status: 404 })
      }

      return NextResponse.json({ success: true, appointment })
    } else {
      // Obtener todas las citas (con paginación y filtros)
      const page = Number.parseInt(searchParams.get("page")) || 1
      const limit = Number.parseInt(searchParams.get("limit")) || 10
      const skip = (page - 1) * limit
      const status = searchParams.get("status")
      const date = searchParams.get("date")
      const userId = searchParams.get("userId")

      const query = {}

      // Filtrar por estado
      if (status && ["pending", "confirmed", "cancelled", "completed"].includes(status)) {
        query.status = status
      }

      // Filtrar por fecha
      if (date) {
        const startDate = new Date(date)
        startDate.setHours(0, 0, 0, 0)

        const endDate = new Date(date)
        endDate.setHours(23, 59, 59, 999)

        query.appointmentDate = {
          $gte: startDate,
          $lte: endDate,
        }
      }

      // Filtrar por usuario
      if (userId) {
        query.petOwner = userId
      }

      const appointments = await Appointment.find(query)
        .sort({ appointmentDate: 1, appointmentTime: 1 })
        .skip(skip)
        .limit(limit)

      const total = await Appointment.countDocuments(query)

      return NextResponse.json({
        success: true,
        appointments,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      })
    }
  } catch (error) {
    console.error("Error al obtener citas:", error)
    return NextResponse.json({ success: false, message: "Error al obtener las citas" }, { status: 500 })
  }
}