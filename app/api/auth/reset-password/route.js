import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/user"
import crypto from "crypto"
import nodemailer from "nodemailer"

export async function POST(request) {
  try {
    await dbConnect()

    const data = await request.json()

    if (!data.email) {
      return NextResponse.json({ success: false, message: "Correo electrónico requerido" }, { status: 400 })
    }

    // Buscar usuario por correo electrónico
    const user = await User.findOne({ correo_electronico: data.email })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "No existe una cuenta con ese correo electrónico" },
        { status: 404 },
      )
    }

    // Generar código de recuperación
    const resetCode = crypto.randomBytes(3).toString("hex").toUpperCase()

    // Guardar código y fecha de expiración (1 hora)
    user.reset_code = resetCode
    user.reset_code_expires = new Date(Date.now() + 3600000) // 1 hora

    await user.save()

    // Configurar transporte de correo
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Enviar correo con código de recuperación
    await transporter.sendMail({
      from: `"Montañita Adopta" <${process.env.EMAIL_USER}>`,
      to: user.correo_electronico,
      subject: "Recuperación de Contraseña",
      text: `Tu código de recuperación es: ${resetCode}. Este código expirará en 1 hora.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Recuperación de Contraseña</h2>
          <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p>Tu código de recuperación es:</p>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
            <strong>${resetCode}</strong>
          </div>
          <p>Este código expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p>Saludos,<br>El equipo de Montañita Adopta</p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Se ha enviado un código de recuperación a tu correo electrónico",
    })
  } catch (error) {
    console.error("Error al solicitar recuperación de contraseña:", error)
    return NextResponse.json({ success: false, message: "Error al procesar la solicitud" }, { status: 500 })
  }
}

