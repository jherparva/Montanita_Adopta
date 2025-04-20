import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { logActivity } from "@/lib/utils";

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();

    if (!data.email || !data.password) {
      return NextResponse.json({ success: false, message: "Correo y contraseña son requeridos" }, { status: 400 });
    }

    const user = await User.findOne({ correo_electronico: data.email });

    if (!user) {
      return NextResponse.json({ success: false, message: "Credenciales inválidas" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.contrasena);

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "Credenciales inválidas" }, { status: 401 });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.correo_electronico,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const cookieStore = await cookies();
    await cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    await logActivity({
      userId: user._id.toString(),
      tipo: "login",
      descripcion: "Inicio de sesión exitoso",
    });

    return NextResponse.json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: {
        id: user._id.toString(),
        nombre: user.nombre,
        email: user.correo_electronico,
      },
    });

  } catch (error) {
    console.error("Error en inicio de sesión:", error);
    return NextResponse.json({ success: false, message: "Error al procesar la solicitud" }, { status: 500 });
  }
}
