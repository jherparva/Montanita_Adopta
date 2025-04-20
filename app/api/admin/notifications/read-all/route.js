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

export async function POST() {
  try {
    const admin = await verifyAdminAuth();
    
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const client = await clientPromise;
    const db = client.db("montanita_adopta");
    
    // Marcar todas las notificaciones de este admin como leídas
    const result = await db.collection("notifications").updateMany(
      { 
        $or: [
          { adminId: admin.id },
          { adminEmail: admin.email },
          { recipientType: "admin" }
        ],
        read: false
      },
      { $set: { read: true } }
    );
    
    return NextResponse.json({ 
      success: true,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json({ error: "Error al marcar todas las notificaciones como leídas" }, { status: 500 });
  }
}