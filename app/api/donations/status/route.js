import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/lib/models/donation"
import { sendEmail } from "@/lib/utils/email"

export async function PUT(request) {
  try {
    await dbConnect()
    const data = await request.json()

    if (!data.donationId) {
      return NextResponse.json({ success: false, message: "ID de donación requerido" }, { status: 400 })
    }

    if (!data.status || !["pending", "confirmed", "completed"].includes(data.status)) {
      return NextResponse.json({ success: false, message: "Estado de donación inválido" }, { status: 400 })
    }

    const donation = await Donation.findById(data.donationId)
    if (!donation) {
      return NextResponse.json({ success: false, message: "Donación no encontrada" }, { status: 404 })
    }

    // Actualizar estado de la donación
    donation.status = data.status
    if (data.notes) {
      donation.notes = data.notes
    }

    await donation.save()

    // Enviar correo electrónico de notificación
    try {
      const donorEmail = donation.donorEmail
      let emailSubject = ""
      let emailContent = ""

      if (data.status === "confirmed") {
        emailSubject = "¡Tu donación ha sido confirmada! - Montañita Adopta"
        emailContent = createConfirmationEmail(donation)
      } else if (data.status === "completed") {
        emailSubject = "¡Tu donación ha sido utilizada! - Montañita Adopta"
        emailContent = createCompletionEmail(donation)
      }

      // Enviar el correo si hay contenido
      if (emailSubject && emailContent) {
        await sendEmail({
          to: donorEmail,
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
      message: `Donación ${
        data.status === "confirmed" ? "confirmada" : data.status === "completed" ? "completada" : "actualizada"
      } correctamente`,
      donation,
    })
  } catch (error) {
    console.error("Error al actualizar estado de donación:", error)
    return NextResponse.json({ success: false, message: "Error al actualizar el estado" }, { status: 500 })
  }
}

// Función auxiliar para crear el email de confirmación
function createConfirmationEmail(donation) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://montanitaadopta.com/imagenes/logo.webp" alt="Montañita Adopta" style="max-width: 200px;">
      </div>
      <h2 style="color: #4caf50; text-align: center;">¡Tu donación ha sido confirmada!</h2>
      <p>Hola ${donation.donorName},</p>
      <p>Queremos agradecerte sinceramente por tu generosa donación a Montañita Adopta.</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Detalles de la donación:</h3>
        ${
          donation.type === "monetary"
            ? `
          <p><strong>Tipo:</strong> Donación Monetaria</p>
          <p><strong>Monto:</strong> $${donation.amount.toLocaleString("es-CO")}</p>
          <p><strong>Método de Pago:</strong> ${
            donation.paymentMethod === "nequi"
              ? "Nequi"
              : donation.paymentMethod === "banco-bogota"
                ? "Banco de Bogotá"
                : donation.paymentMethod === "paypal"
                  ? "PayPal"
                  : "Otro"
          }</p>
        `
            : `
          <p><strong>Tipo:</strong> Donación de Alimentos</p>
          <p><strong>Tipo de Alimento:</strong> ${
            donation.foodType === "dog-food"
              ? "Comida para Perros"
              : donation.foodType === "cat-food"
                ? "Comida para Gatos"
                : donation.foodType === "puppy-food"
                  ? "Comida para Cachorros"
                  : donation.foodType === "kitten-food"
                    ? "Comida para Gatitos"
                    : "Dieta Especial/Medicada"
          }</p>
          <p><strong>Cantidad:</strong> ${donation.quantity} kg</p>
        `
        }
      </div>
      <p>Tu contribución nos ayudará a seguir rescatando y cuidando a animales necesitados. Gracias por ser parte de nuestra misión.</p>
      <p>Si tienes alguna pregunta, no dudes en contactarnos al 3166532433.</p>
      <p>¡Gracias por tu apoyo!</p>
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <p style="color: #666; font-size: 14px;">Montañita Adopta<br>carrera 5 calle 8a #04, barrio guillermo escobar<br>Tel: 3166532433</p>
      </div>
    </div>
  `
}

// Función auxiliar para crear el email de finalización
function createCompletionEmail(donation) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://montanitaadopta.com/imagenes/logo.webp" alt="Montañita Adopta" style="max-width: 200px;">
      </div>
      <h2 style="color: #4caf50; text-align: center;">¡Tu donación ha sido utilizada!</h2>
      <p>Hola ${donation.donorName},</p>
      <p>Queremos informarte que tu generosa donación a Montañita Adopta ha sido utilizada para ayudar a nuestros animales rescatados.</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Detalles de la donación:</h3>
        ${
          donation.type === "monetary"
            ? `
          <p><strong>Tipo:</strong> Donación Monetaria</p>
          <p><strong>Monto:</strong> $${donation.amount.toLocaleString("es-CO")}</p>
        `
            : `
          <p><strong>Tipo:</strong> Donación de Alimentos</p>
          <p><strong>Cantidad:</strong> ${donation.quantity} kg</p>
        `
        }
      </div>
      <p>Gracias a personas como tú, podemos continuar nuestra labor de rescate y cuidado de animales necesitados. Tu contribución ha marcado una diferencia real en sus vidas.</p>
      <p>Si deseas conocer más sobre cómo utilizamos las donaciones, visita nuestra página web o contáctanos al 3166532433.</p>
      <p>¡Gracias por tu apoyo continuo!</p>
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <p style="color: #666; font-size: 14px;">Montañita Adopta<br>carrera 5 calle 8a #04, barrio guillermo escobar<br>Tel: 3166532433</p>
      </div>
    </div>
  `
}