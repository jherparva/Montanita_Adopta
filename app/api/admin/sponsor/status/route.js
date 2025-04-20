import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Sponsor from "@/lib/models/sponsor"
import { sendEmail } from "@/lib/utils/email"

export async function PUT(request) {
  try {
    // Verificar autenticación usando la ruta existente
    const authResponse = await fetch(new URL("/api/admin/auth/check", request.url).toString(), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    })

    const authData = await authResponse.json()

    if (!authResponse.ok || !authData.authenticated) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    // Verificar si el usuario es administrador
    if (!authData.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Acceso denegado: se requieren permisos de administrador" },
        { status: 403 },
      )
    }

    await dbConnect()

    const data = await request.json()
    const { sponsorId, status, notes } = data

    if (!sponsorId || !status) {
      return NextResponse.json({ success: false, message: "ID de patrocinio y estado son requeridos" }, { status: 400 })
    }

    // Verificar que el estado sea válido
    if (!["active", "paused", "ended"].includes(status)) {
      return NextResponse.json({ success: false, message: "Estado no válido" }, { status: 400 })
    }

    // Buscar el patrocinio
    const sponsor = await Sponsor.findById(sponsorId).populate("animalId", "name")
    if (!sponsor) {
      return NextResponse.json({ success: false, message: "Patrocinio no encontrado" }, { status: 404 })
    }

    // Actualizar estado y notas
    sponsor.status = status
    if (notes) sponsor.notes = notes
    sponsor.updatedAt = new Date()

    await sponsor.save()

    // Enviar correo de notificación al patrocinador
    try {
      const statusText = status === "active" ? "activado" : status === "paused" ? "pausado" : "finalizado"
      const emailSubject = `Tu patrocinio ha sido ${statusText} - Montañita Adopta`

      const emailContent = `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
         <div style="text-align: center; margin-bottom: 20px;">
           <img src="https://montanitaadopta.com/imagenes/logo.webp" alt="Montañita Adopta" style="max-width: 200px;">
         </div>
         <h2 style="color: ${status === "active" ? "#4caf50" : status === "paused" ? "#ffc107" : "#f44336"}; text-align: center;">Actualización de tu patrocinio</h2>
         <p>Hola ${sponsor.sponsorName},</p>
         <p>Te informamos que el estado de tu patrocinio ${sponsor.animalId ? `para ${sponsor.animalId.name}` : ""} ha sido actualizado a: <strong>${statusText}</strong>.</p>
         ${notes ? `<p><strong>Notas adicionales:</strong> ${notes}</p>` : ""}
         <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
         <p>Gracias por tu apoyo a nuestra causa.</p>
         <p>Saludos cordiales,<br>El equipo de Montañita Adopta</p>
       </div>
      `

      await sendEmail({
        to: sponsor.sponsorEmail,
        subject: emailSubject,
        html: emailContent,
      })
    } catch (emailError) {
      console.error("Error al enviar correo de notificación:", emailError)
      // No interrumpimos el flujo si falla el envío de correo
    }

    return NextResponse.json({
      success: true,
      message: `Estado del patrocinio actualizado a "${status}" correctamente`,
    })
  } catch (error) {
    console.error("Error al actualizar estado de patrocinio:", error)
    return NextResponse.json(
      { success: false, message: "Error al actualizar estado de patrocinio: " + error.message },
      { status: 500 },
    )
  }
}