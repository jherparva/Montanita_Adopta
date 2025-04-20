import mongoose from "mongoose"

const sponsorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  sponsorName: {
    type: String,
    required: [true, "El nombre del patrocinador es requerido"],
  },
  sponsorEmail: {
    type: String,
    required: [true, "El correo electrónico del patrocinador es requerido"],
  },
  sponsorPhone: {
    type: String,
    required: [true, "El teléfono del patrocinador es requerido"],
  },
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Animal",
    required: [true, "El animal a patrocinar es requerido"],
  },
  sponsorshipType: {
    type: String,
    enum: ["monthly", "one-time", "supplies"],
    required: [true, "El tipo de patrocinio es requerido"],
  },
  amount: {
    type: Number,
    required: function () {
      return this.sponsorshipType === "monthly" || this.sponsorshipType === "one-time"
    },
  },
  suppliesDescription: {
    type: String,
    required: function () {
      return this.sponsorshipType === "supplies"
    },
  },
  status: {
    type: String,
    enum: ["active", "paused", "ended"],
    default: "active",
  },
  notes: {
    type: String,
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
sponsorSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

const Sponsor = mongoose.models.Sponsor || mongoose.model("Sponsor", sponsorSchema)

export default Sponsor
