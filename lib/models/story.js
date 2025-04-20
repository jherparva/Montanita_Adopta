import mongoose from "mongoose"

const StorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Por favor, ingresa un título"],
    trim: true,
  },
  author: {
    type: String,
    required: [true, "Por favor, ingresa el nombre del autor"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Por favor, ingresa un email de contacto"],
    trim: true,
  },
  content: {
    type: String,
    required: [true, "Por favor, ingresa el contenido de la historia"],
  },
  image: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isTestimony: {
    type: Boolean,
    default: false,
  }
})

export default mongoose.models.Story || mongoose.model("Story", StorySchema)