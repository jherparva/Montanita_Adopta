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

    const requiredFields = [
      "nombre",
      "correo_electronico",
      "contrasena",
      "confirmar_contrasena",
      "codigo_postal",
      "direccion",
      "telefono",
      "pais",
      "fecha_nacimiento",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ success: false, message: `El campo ${field} es requerido` }, { status: 400 });
      }
    }

    if (data.contrasena !== data.confirmar_contrasena) {
      return NextResponse.json({ success: false, message: "Las contraseñas no coinciden" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.correo_electronico)) {
      return NextResponse.json({ success: false, message: "Formato de correo electrónico inválido" }, { status: 400 });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(data.contrasena)) {
      return NextResponse.json(
        { success: false, message: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ correo_electronico: data.correo_electronico });

    if (existingUser) {
      return NextResponse.json({ success: false, message: "El correo electrónico ya está registrado" }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.contrasena, salt);

    const user = new User({
      nombre: data.nombre,
      correo_electronico: data.correo_electronico,
      contrasena: hashedPassword,
      codigo_postal: data.codigo_postal,
      direccion: data.direccion,
      telefono: data.telefono,
      pais: data.pais,
      prefijo: data.prefijo || "",
      fecha_nacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : null,
      fecha_registro: new Date(),
    });

    await user.save();

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
      tipo: "registro",
      descripcion: "Registro de nuevo usuario",
    });

    return NextResponse.json({
      success: true,
      message: "Usuario registrado correctamente",
      user: {
        id: user._id.toString(),
        nombre: user.nombre,
        email: user.correo_electronico,
      },
      autoLogin: true,
    }, { status: 201 });

  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({ success: false, message: "Error al procesar la solicitud" }, { status: 500 });
  }
}
