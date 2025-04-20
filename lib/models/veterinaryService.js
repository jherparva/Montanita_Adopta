import mongoose from "mongoose"

// Definir el esquema para servicios veterinarios
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre del servicio es requerido"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "La descripción del servicio es requerida"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "El precio del servicio es requerido"],
  },
  icon: {
    type: String,
    default: "fa-paw",
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Actualizar la fecha de modificación antes de guardar
serviceSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

// Crear o recuperar el modelo
const VeterinaryService = mongoose.models.VeterinaryService || mongoose.model("VeterinaryService", serviceSchema)

export default VeterinaryService
