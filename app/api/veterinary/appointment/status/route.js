import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Appointment from "@/lib/models/appointment"
import { sendEmail } from "@/lib/utils/email"

export async function PUT(request) {
  try {
    await dbConnect()

    const data = await request.json()

    if (!data.appointmentId) {
      return NextResponse.json({ success: false, message: "ID de cita requerido" }, { status: 400 })
    }

    if (!data.status || !["pending", "confirmed", "cancelled", "completed"].includes(data.status)) {
      return NextResponse.json({ success: false, message: "Estado de cita inválido" }, { status: 400 })
    }

    const appointment = await Appointment.findById(data.appointmentId)

    if (!appointment) {
      return NextResponse.json({ success: false, message: "Cita no encontrada" }, { status: 404 })
    }

    // Si hay una nueva fecha o hora, actualizarlas
    if (data.appointmentDate) {
      appointment.appointmentDate = new Date(data.appointmentDate)
    }

    if (data.appointmentTime) {
      appointment.appointmentTime = data.appointmentTime
    }

    // Actualizar estado de la cita
    const previousStatus = appointment.status
    appointment.status = data.status

    // Si hay notas adicionales, actualizarlas
    if (data.notes) {
      appointment.notes = data.notes
    }

    await appointment.save()

    // Enviar correo electrónico de notificación
    try {
      // Obtener información del usuario desde la base de datos si es necesario
      const userEmail = appointment.userEmail || "cliente@example.com" // Reemplazar con el correo real del usuario

      // Formatear la fecha para mostrarla en el correo
      const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      let emailSubject = ""
      let emailContent = ""

      // Preparar el contenido del correo según el estado
      if (data.status === "confirmed") {
        emailSubject = "¡Tu cita veterinaria ha sido confirmada! - Montañita Adopta"
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://montanitaadopta.com/imagenes/logo.webp" alt="Montañita Adopta" style="max-width: 200px;">
            </div>
            <h2 style="color: #4caf50; text-align: center;">¡Tu cita ha sido confirmada!</h2>
            <p>Hola ${appointment.petOwnerName},</p>
            <p>Nos complace confirmar tu cita veterinaria para <strong>${appointment.petName}</strong> en Montañita Adopta.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Detalles de la cita:</h3>
              <p><strong>Servicio:</strong> ${appointment.service}</p>
              <p><strong>Fecha:</strong> ${formattedDate}</p>
              <p><strong>Hora:</strong> ${appointment.appointmentTime}</p>
              <p><strong>Mascota:</strong> ${appointment.petName} (${
                appointment.petType === "dog" ? "Perro" : appointment.petType === "cat" ? "Gato" : "Otro"
              })</p>
            </div>
            <p>Por favor, llega 10 minutos antes de tu cita. Si necesitas reprogramar, contáctanos al 3166532433.</p>
            <p>¡Esperamos verte pronto!</p>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="color: #666; font-size: 14px;">Montañita Adopta<br>carrera 5 calle 8a #04, barrio guillermo escobar<br>Tel: 3166532433</p>
            </div>
          </div>
        `
      } else if (data.status === "cancelled") {
        emailSubject = "Tu cita veterinaria ha sido cancelada - Montañita Adopta"
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://montanitaadopta.com/imagenes/logo.webp" alt="Montañita Adopta" style="max-width: 200px;">
            </div>
            <h2 style="color: #f44336; text-align: center;">Cita Cancelada</h2>
            <p>Hola ${appointment.petOwnerName},</p>
            <p>Lamentamos informarte que tu cita veterinaria para <strong>${appointment.petName}</strong> ha sido cancelada.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Detalles de la cita cancelada:</h3>
              <p><strong>Servicio:</strong> ${appointment.service}</p>
              <p><strong>Fecha:</strong> ${formattedDate}</p>
              <p><strong>Hora:</strong> ${appointment.appointmentTime}</p>
            </div>
            <p>Si deseas reprogramar tu cita, por favor contáctanos al 3166532433.</p>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="color: #666; font-size: 14px;">Montañita Adopta<br>carrera 5 calle 8a #04, barrio guillermo escobar<br>Tel: 3166532433</p>
            </div>
          </div>
        `
      } else if (previousStatus === "pending" && data.appointmentDate && data.appointmentTime) {
        // Si la cita fue reprogramada
        emailSubject = "Tu cita veterinaria ha sido reprogramada - Montañita Adopta"

        // Formatear la nueva fecha
        const newFormattedDate = new Date(data.appointmentDate).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })

        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://montanitaadopta.com/imagenes/logo.webp" alt="Montañita Adopta" style="max-width: 200px;">
            </div>
            <h2 style="color: #2196f3; text-align: center;">Cita Reprogramada</h2>
            <p>Hola ${appointment.petOwnerName},</p>
            <p>Te informamos que tu cita veterinaria para <strong>${appointment.petName}</strong> ha sido reprogramada.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Nuevos detalles de la cita:</h3>
              <p><strong>Servicio:</strong> ${appointment.service}</p>
              <p><strong>Nueva Fecha:</strong> ${newFormattedDate}</p>
              <p><strong>Nueva Hora:</strong> ${data.appointmentTime}</p>
              <p><strong>Mascota:</strong> ${appointment.petName} (${
                appointment.petType === "dog" ? "Perro" : appointment.petType === "cat" ? "Gato" : "Otro"
              })</p>
            </div>
            <p>Si esta nueva fecha y hora no te conviene, por favor contáctanos al 3166532433 para buscar otra alternativa.</p>
            <p>¡Esperamos verte pronto!</p>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="color: #666; font-size: 14px;">Montañita Adopta<br>carrera 5 calle 8a #04, barrio guillermo escobar<br>Tel: 3166532433</p>
            </div>
          </div>
        `
      }

      // Enviar el correo si hay contenido
      if (emailSubject && emailContent) {
        await sendEmail({
          to: userEmail,
          subject: emailSubject,
          html: emailContent,
        })
      }
    } catch (emailError) {
      console.error("Error al enviar correo de notificación:", emailError)
      // No interrumpimos el flujo si falla el envío de correo
    }

    return NextResponse.json({
      success: true,
      message: `Cita ${
        data.status === "confirmed"
          ? "confirmada"
          : data.status === "cancelled"
            ? "cancelada"
            : data.status === "completed"
              ? "completada"
              : "actualizada"
      } correctamente`,
      appointment,
    })
  } catch (error) {
    console.error("Error al actualizar estado de cita:", error)
    return NextResponse.json({ success: false, message: "Error al actualizar el estado" }, { status: 500 })
  }
}