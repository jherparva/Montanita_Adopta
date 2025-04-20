import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import dbConnect from "@/lib/dbConnect"
import Story from "@/lib/models/story"
import clientPromise from "@/lib/mongodb"

// Función auxiliar para verificar autenticación de administrador
async function verifyAdmin(token) {
  if (!token) {
    return { success: false, message: "No autenticado", status: 401 };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    const client = await clientPromise;
    const db = client.db("montanita_adopta");
    
    // Buscar usuario en colecciones de usuarios y admins
    let user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) {
      user = await db.collection("admins").findOne({ _id: new ObjectId(userId) });
      if (!user) {
        return { success: false, message: "Usuario no encontrado", status: 401 };
      }
    }
    
    // Verificar si es administrador
    const isAdmin = user.isAdmin === true || 
                    user.role === "admin" || 
                    user.admin === true || 
                    user.es_admin === true || 
                    user.esAdmin === true;
    
    if (!isAdmin) {
      return { success: false, message: "Acceso denegado", status: 403 };
    }
    
    return { success: true, userId };
  } catch (error) {
    return { success: false, message: "Token inválido", status: 401 };
  }
}

// PUT - Aprobar una historia (solo para administradores)
export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_auth_token")?.value;
    
    const auth = await verifyAdmin(token);
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const body = await request.json();
    const { storyId, approved } = body;

    if (!storyId) {
      return NextResponse.json({ success: false, message: "ID de historia requerido" }, { status: 400 });
    }

    await dbConnect();

    // Actualizar el estado de la historia
    const updatedStory = await Story.findByIdAndUpdate(storyId, { approved }, { new: true });

    if (!updatedStory) {
      return NextResponse.json({ success: false, message: "Historia no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: approved ? "Historia aprobada correctamente" : "Historia rechazada correctamente",
      story: updatedStory,
    });
  } catch (error) {
    console.error("Error al actualizar historia:", error);
    return NextResponse.json({ success: false, message: "Error al actualizar la historia" }, { status: 500 });
  }
}