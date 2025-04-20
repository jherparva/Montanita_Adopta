import mongoose from "mongoose"

// Verificar si el modelo ya existe para evitar sobreescribirlo
const AnimalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Por favor, proporciona un nombre"],
    trim: true,
  },
  species: {
    type: String,
    required: [true, "Por favor, selecciona una especie"],
    enum: ["dog", "cat"],
    default: "dog",
  },
  breed: {
    type: String,
    required: [true, "Por favor, proporciona una raza"],
    trim: true,
  },
  age: {
    type: String,
    required: [true, "Por favor, selecciona una edad"],
    enum: ["puppy", "kitten", "adult", "senior"],
    default: "adult",
  },
  size: {
    type: String,
    required: [true, "Por favor, selecciona un tamaño"],
    enum: ["small", "medium", "large"],
    default: "medium",
  },
  sex: {
    type: String,
    required: [true, "Por favor, selecciona un sexo"],
    enum: ["male", "female"],
    default: "male",
  },
  description: {
    type: String,
    required: [true, "Por favor, proporciona una descripción"],
    trim: true,
  },
  image: {
    type: String,
    default: "/imagenes/default-pet.webp",
  },
  status: {
    type: String,
    required: [true, "Por favor, selecciona un estado"],
    enum: ["available", "adopted", "pending", "foster"],
    default: "available",
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

// Middleware para actualizar la fecha de actualización
AnimalSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

export default mongoose.models.Animal || mongoose.model("Animal", AnimalSchema)

