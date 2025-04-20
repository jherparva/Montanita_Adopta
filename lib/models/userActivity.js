import mongoose from "mongoose"

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tipo: { type: String, required: true }, // login, update, adopt, etc.
  descripcion: { type: String },
  fecha: { type: Date, default: Date.now },
})

export default mongoose.models.UserActivity || mongoose.model("UserActivity", activitySchema)
