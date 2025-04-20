import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
  // Campos originales (en inglés para compatibilidad interna)
  name: {
    type: String,
    required: [true, "Por favor, proporciona un nombre"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Por favor, proporciona un correo electrónico"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Por favor, proporciona una contraseña"],
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
  },

  // Roles extendidos
  role: {
    type: String,
    enum: ["user", "moderador", "admin"],
    default: "user",
  },

  // Bloqueo de cuenta
  bloqueado: {
    type: Boolean,
    default: false,
  },

  // Imagen de perfil
  profileImage: {
    type: String,
    default: "/imagenes/perfil/default-profile.webp",
  },

  // Fechas importantes
  createdAt: {
    type: Date,
    default: Date.now,
  },
  fecha_nacimiento: {
    type: Date,
    default: null,
  },
  fecha_registro: {
    type: Date,
    default: Date.now,
  },

  // Campos adicionales en español (mapeados a los campos en inglés)
  nombre: {
    type: String,
    trim: true,
    get: function () {
      return this.name
    },
    set: function (val) {
      this.name = val
      return val
    },
  },
  correo_electronico: {
    type: String,
    trim: true,
    lowercase: true,
    get: function () {
      return this.email
    },
    set: function (val) {
      this.email = val
      return val
    },
  },
  contrasena: {
    type: String,
    get: function () {
      return this.password
    },
    set: function (val) {
      this.password = val
      return val
    },
  },

  // Información adicional del usuario
  codigo_postal: {
    type: String,
    trim: true,
  },
  direccion: {
    type: String,
    trim: true,
  },
  telefono: {
    type: String,
    trim: true,
  },
  pais: {
    type: String,
    trim: true,
  },
  prefijo: {
    type: String,
    trim: true,
  },

  // Foto de perfil (alias de profileImage)
  profilePhoto: {
    type: String,
    default: "/imagenes/perfil/default-profile.webp",
    get: function () {
      return this.profileImage
    },
    set: function (val) {
      this.profileImage = val
      return val
    },
  },

  // Recuperación de contraseña
  reset_code: {
    type: String,
  },
  reset_code_expires: {
    type: Date,
  },

  // Autenticación social
  google_id: {
    type: String,
  },
  facebook_id: {
    type: String,
  },
})

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model("User", userSchema)
