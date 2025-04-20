import mongoose from "mongoose"

// Definir el esquema para donaciones
const donationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["monetary", "food", "supplies"],
    required: [true, "El tipo de donación es requerido"],
  },
  amount: {
    type: Number,
    required: function () {
      return this.type === "monetary"
    },
  },
  paymentMethod: {
    type: String,
    enum: ["nequi", "banco-bogota", "paypal", "other"],
    required: function () {
      return this.type === "monetary"
    },
  },
  foodType: {
    type: String,
    enum: ["dog-food", "cat-food", "puppy-food", "kitten-food", "special-diet"],
    required: function () {
      return this.type === "food"
    },
  },
  quantity: {
    type: Number,
    required: function () {
      return this.type === "food" || this.type === "supplies"
    },
  },
  deliveryOption: {
    type: String,
    enum: ["self", "pickup"],
    default: "self",
  },
  pickupAddress: {
    type: String,
  },
  pickupCity: {
    type: String,
    default: "mismo-ciudad",
  },
  donorName: {
    type: String,
    required: [true, "El nombre del donante es requerido"],
  },
  donorEmail: {
    type: String,
    required: [true, "El correo electrónico del donante es requerido"],
  },
  donorPhone: {
    type: String,
    required: [true, "El teléfono del donante es requerido"],
  },
  notes: {
    type: String,
  },
  evidenceUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Crear o recuperar el modelo
const Donation = mongoose.models.Donation || mongoose.model("Donation", donationSchema)

export default Donation
