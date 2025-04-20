import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Función reutilizable para verificar autenticación de admin
async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const client = await clientPromise;
    const db = client.db("montanita_adopta");
    
    // Buscar primero en la colección de admins
    let admin = await db.collection("admins").findOne({
      _id: new ObjectId(decoded.id)
    });
    
    // Si no se encuentra, verificar en la colección de usuarios
    if (!admin) {
      const user = await db.collection("users").findOne({
        _id: new ObjectId(decoded.id)
      });
      
      if (!user || !(user.isAdmin === true || user.role === "admin" || user.admin === true)) {
        return null;
      }
      
      admin = user;
    }
    
    return {
      id: admin._id.toString(),
      name: admin.name || admin.nombre || admin.email,
      email: admin.email || admin.correo_electronico,
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

export async function POST(request, { params }) {
  try {
    const admin = await verifyAdminAuth();
    
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const notificationId = params.id;
    
    if (!notificationId) {
      return NextResponse.json({ error: "ID de notificación no proporcionado" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("montanita_adopta");
    
    // Marcar la notificación como leída
    const result = await db.collection("notifications").updateOne(
      { _id: new ObjectId(notificationId) },
      { $set: { read: true } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Notificación no encontrada" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json({ error: "Error al marcar notificación como leída" }, { status: 500 });
  }
}