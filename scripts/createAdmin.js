// scripts/createAdmin.js
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const uri = process.env.MONGODB_URI

async function createAdmin() {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db("montanita_adopta")
    const admins = db.collection("admins")

    const hashedPassword = await bcrypt.hash("admin123", 10)

    const existing = await admins.findOne({ email: "admin@admin.com" })
    if (existing) {
      console.log("⚠️ Ya existe un admin con ese correo")
      return
    }

    await admins.insertOne({
      name: "Admin",
      email: "admin@admin.com",
      password: hashedPassword,
      role: "admin",
    })

    console.log("✅ Admin creado exitosamente")
  } catch (err) {
    console.error("❌ Error creando admin:", err)
  } finally {
    await client.close()
  }
}

createAdmin()
