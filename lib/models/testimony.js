import mongoose from "mongoose"

const TestimonialSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "Por favor, proporciona un nombre"],
    trim: true,
  },
  imagen: {
    type: String,
    trim: true,
  },
  contenido: {
    type: String,
    required: [true, "Por favor, proporciona el contenido del testimonio"],
    trim: true,
  },
  rol: {
    type: String,
    trim: true,
  },
  anioInicio: {
    type: String,
    trim: true,
  },
  mostrarEnHome: {
    type: Boolean,
    default: false,
  },
  estado: {
    type: String,
    enum: ["activo", "inactivo"],
    default: "activo",
  },
  fecha_creacion: {
    type: Date,
    default: Date.now,
  },
  fecha_actualizacion: {
    type: Date,
    default: Date.now,
  },
  // Referencia opcional al voluntario si existe en el sistema
  voluntarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Volunteer",
  },
})

export default mongoose.models.Testimonial || mongoose.model("Testimonial", TestimonialSchema)