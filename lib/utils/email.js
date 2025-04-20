import nodemailer from "nodemailer"

// Configuración del transporte de correo usando las variables de entorno existentes
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "montanitaadopta@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "phyu dvua vshk ipdq",
  },
})

/**
 * Envía un correo electrónico
 * @param {Object} options - Opciones del correo
 * @param {string} options.to - Destinatario
 * @param {string} options.subject - Asunto del correo
 * @param {string} options.text - Contenido en texto plano (opcional)
 * @param {string} options.html - Contenido en HTML (opcional)
 * @returns {Promise} - Promesa con el resultado del envío
 */
export async function sendEmail({ to, subject, text, html }) {
  try {
    // Validar que al menos hay texto o HTML
    if (!text && !html) {
      throw new Error("Se requiere contenido de texto o HTML para el correo")
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || "Montañita Adopta <montanitaadopta@gmail.com>",
      to,
      subject,
      text,
      html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Correo enviado:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error al enviar correo:", error)
    throw error
  }
}
