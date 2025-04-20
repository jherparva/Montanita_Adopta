import mongoose from "mongoose"

const VolunteerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  nombre: {
    type: String,
    required: [true, "Por favor, proporciona un nombre"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Por favor, proporciona un correo electrónico"],
    trim: true,
    lowercase: true,
  },
  telefono: {
    type: String,
    required: [true, "Por favor, proporciona un número de teléfono"],
    trim: true,
  },
  direccion: {
    type: String,
    trim: true,
  },
  ciudad: {
    type: String,
    trim: true,
  },
  disponibilidad: {
    type: String,
    required: [true, "Por favor, indica tu disponibilidad"],
    trim: true,
  },
  experiencia: {
    type: String,
    trim: true,
  },
  habilidades: {
    type: String,
    trim: true,
  },
  motivacion: {
    type: String,
    required: [true, "Por favor, indica tu motivación para ser voluntario"],
    trim: true,
  },
  estado: {
    type: String,
    enum: ["pendiente", "aprobado", "rechazado"],
    default: "pendiente",
  },
  fecha_solicitud: {
    type: Date,
    default: Date.now,
  },
  fecha_aprobacion: {
    type: Date,
  },
  comentarios: {
    type: String,
    trim: true,
  },
  areas_interes: {
    type: [String],
    default: [],
  },
  documentos: {
    type: [String],
    default: [],
  },
})

export default mongoose.models.Volunteer || mongoose.model("Volunteer", VolunteerSchema)
