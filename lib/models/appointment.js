import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema({
  petOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "El propietario de la mascota es requerido"],
  },
  petOwnerName: {
    type: String,
    required: [true, "El nombre del propietario es requerido"],
  },
  petName: {
    type: String,
    required: [true, "El nombre de la mascota es requerido"],
    trim: true,
  },
  petType: {
    type: String,
    required: [true, "El tipo de mascota es requerido"],
    enum: ["dog", "cat", "other"],
  },
  service: {
    type: String,
    required: [true, "El servicio es requerido"],
    trim: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VeterinaryService",
  },
  appointmentDate: {
    type: Date,
    required: [true, "La fecha de la cita es requerida"],
  },
  appointmentTime: {
    type: String,
    required: [true, "La hora de la cita es requerida"],
  },
  notes: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
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
appointmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema)

export default Appointment
