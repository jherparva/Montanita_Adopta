import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Volunteer from "@/lib/models/volunteer"
import { sendEmail } from "@/lib/utils/email"

export async function PUT(request) {
  try {
    // Verificar autenticación
    const authResponse = await fetch(new URL("/api/admin/auth/check", request.url).toString(), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    })

    const authData = await authResponse.json()

    if (!authResponse.ok || !authData.authenticated) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    if (!authData.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Acceso denegado: se requieren permisos de administrador" },
        { status: 403 },
      )
    }

    await dbConnect()

    const data = await request.json()
    const { volunteerId, status, comentarios } = data

    if (!volunteerId || !status) {
      return NextResponse.json({ success: false, message: "ID de voluntario y estado son requeridos" }, { status: 400 })
    }

    // Verificar que el estado sea válido
    if (!["pendiente", "aprobado", "rechazado"].includes(status)) {
      return NextResponse.json({ success: false, message: "Estado no válido" }, { status: 400 })
    }

    // Buscar el voluntario
    const volunteer = await Volunteer.findById(volunteerId)
    if (!volunteer) {
      return NextResponse.json({ success: false, message: "Voluntario no encontrado" }, { status: 404 })
    }

    // Actualizar estado y comentarios
    volunteer.estado = status
    if (comentarios) volunteer.comentarios = comentarios
    volunteer.fecha_actualizacion = new Date()

    await volunteer.save()

    // Enviar correo de notificación al voluntario
    try {
      const emailSubject =
        status === "aprobado"
          ? "¡Tu solicitud de voluntariado ha sido aprobada!"
          : "Actualización sobre tu solicitud de voluntariado"

      const emailContent =
        status === "aprobado"
          ? `
         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
           <div style="text-align: center; margin-bottom: 20px;">
             <img src="https://montanitaadopta.com/imagenes/logo.webp" alt="Montañita Adopta" style="max-width: 200px;">
           </div>
           <h2 style="color: #4caf50; text-align: center;">¡Tu solicitud ha sido aprobada!</h2>
           <p>Hola ${volunteer.nombre},</p>
           <p>Nos complace informarte que tu solicitud para ser voluntario/a en Montañita Adopta ha sido <strong>aprobada</strong>.</p>
           <p>Nos pondremos en contacto contigo pronto para coordinar tu incorporación al equipo y brindarte más detalles sobre las actividades en las que podrás participar.</p>
           ${comentarios ? `<p><strong>Comentarios adicionales:</strong> ${comentarios}</p>` : ""}
           <p>¡Gracias por tu interés en ayudar a nuestros animales!</p>
           <p>Saludos cordiales,<br>El equipo de Montañita Adopta</p>
         </div>
       `
          : `
         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
           <div style="text-align: center; margin-bottom: 20px;">
             <img src="https://montanitaadopta.com/imagenes/logo.webp" alt="Montañita Adopta" style="max-width: 200px;">
           </div>
           <h2 style="color: #e01e1e; text-align: center;">Actualización de tu solicitud</h2>
           <p>Hola ${volunteer.nombre},</p>
           <p>Te informamos que el estado de tu solicitud para ser voluntario/a en Montañita Adopta ha sido actualizado a: <strong>${status}</strong>.</p>
           ${comentarios ? `<p><strong>Comentarios adicionales:</strong> ${comentarios}</p>` : ""}
           <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
           <p>Saludos cordiales,<br>El equipo de Montañita Adopta</p>
         </div>
       `

      await sendEmail({
        to: volunteer.email,
        subject: emailSubject,
        html: emailContent,
      })
    } catch (emailError) {
      // No interrumpimos el flujo si falla el envío de correo
    }

    return NextResponse.json({
      success: true,
      message: `Estado del voluntario actualizado a "${status}" correctamente`,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error al actualizar estado de voluntario: " + error.message },
      { status: 500 },
    )
  }
}