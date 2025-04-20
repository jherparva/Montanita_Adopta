import mongoose from "mongoose"

const AdoptionSchema = new mongoose.Schema({
  animal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Animal",
    required: [true, "Por favor, proporciona un animal"],
  },
  adopter: {
    name: {
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
    phone: {
      type: String,
      required: [true, "Por favor, proporciona un número de teléfono"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Por favor, proporciona una dirección"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "Por favor, proporciona una ciudad"],
      trim: true,
    },
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    required: [true, "Por favor, selecciona un estado"],
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approvedDate: {
    type: Date,
  },
  rejectedDate: {
    type: Date,
  },
  rejectionReason: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
})

export default mongoose.models.Adoption || mongoose.model("Adoption", AdoptionSchema)

