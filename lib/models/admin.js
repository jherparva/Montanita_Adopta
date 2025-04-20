import mongoose from "mongoose"

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
})

// Verifica si ya está registrado el modelo para evitar error en desarrollo
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema)

export default Admin
