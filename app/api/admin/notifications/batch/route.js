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

// Eliminar múltiples notificaciones
export async function DELETE(request) {
  try {
    const admin = await verifyAdminAuth();
    
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const data = await request.json();
    const { ids } = data;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs de notificaciones no proporcionados correctamente" }, { status: 400 });
    }
    
    // Convertir string IDs a ObjectIds
    const objectIds = ids
      .map(id => {
        try {
          return new ObjectId(id);
        } catch (error) {
          console.error(`ID inválido: ${id}`);
          return null;
        }
      })
      .filter(Boolean);
    
    if (objectIds.length === 0) {
      return NextResponse.json({ error: "No se proporcionaron IDs válidos" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("montanita_adopta");
    
    // Eliminar las notificaciones
    const result = await db.collection("notifications").deleteMany({
      _id: { $in: objectIds }
    });
    
    return NextResponse.json({ 
      success: true,
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} notificaciones eliminadas correctamente`
    });
  } catch (error) {
    console.error("Error al eliminar notificaciones:", error);
    return NextResponse.json({ error: "Error al eliminar notificaciones" }, { status: 500 });
  }
}