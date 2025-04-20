import mongoose from "mongoose"

const MessageSchema = new mongoose.Schema({
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
  subject: {
    type: String,
    required: [true, "Por favor, proporciona un asunto"],
    trim: true,
  },
  message: {
    type: String,
    required: [true, "Por favor, proporciona un mensaje"],
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
  readDate: {
    type: Date,
    default: null,
  },
  replied: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
})

export default mongoose.models.Message || mongoose.model("Message", MessageSchema)