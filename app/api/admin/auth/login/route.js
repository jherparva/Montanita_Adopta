import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"

export async function POST(req) {
  try {
    const client = await clientPromise
    const db = client.db("montanita_adopta")

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Please provide both email and password" }, { status: 400 })
    }

    const user = await db.collection("admins").findOne({ email })

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role || "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    )

    const response = NextResponse.json({ message: "Logged in successfully" }, { status: 200 })

    response.cookies.set("admin_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 horas
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "An error occurred while logging in" }, { status: 500 })
  }
}