import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { unlink } from "fs/promises"
import path from "path"
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

// Función para verificar si una URL es una ruta local
const isLocalImage = (imageUrl) => imageUrl && imageUrl.startsWith("/uploads/");

// Función para eliminar un archivo de imagen
const deleteImageFile = async (imageUrl) => {
  if (!isLocalImage(imageUrl)) return;

  try {
    const filePath = path.join(process.cwd(), "public", imageUrl);
    await unlink(filePath);
  } catch (error) {
    console.error(`Error al eliminar imagen: ${error.message}`);
    // No lanzamos error para continuar con el proceso aunque falle la eliminación del archivo
  }
};

// GET - Obtener una historia específica (para administradores)
export async function GET(request, context) {
  try {
    const { params } = context;
    const id = params.id;

    const cookieStore = await cookies();
    const token = cookieStore.get("admin_auth_token")?.value;
    
    const auth = await verifyAdmin(token);
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    await dbConnect();
    const story = await Story.findById(id);

    if (!story) {
      return NextResponse.json({ success: false, message: "Historia no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true, story });
  } catch (error) {
    console.error("Error al obtener historia:", error);
    return NextResponse.json({ success: false, message: "Error al obtener la historia" }, { status: 500 });
  }
}

// PUT - Actualizar una historia específica
export async function PUT(request, context) {
  try {
    const { params } = context;
    const id = params.id;

    const cookieStore = await cookies();
    const token = cookieStore.get("admin_auth_token")?.value;
    
    const auth = await verifyAdmin(token);
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const body = await request.json();
    
    await dbConnect();
    const updatedStory = await Story.findByIdAndUpdate(id, body, { new: true });

    if (!updatedStory) {
      return NextResponse.json({ success: false, message: "Historia no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Historia actualizada correctamente",
      story: updatedStory,
    });
  } catch (error) {
    console.error("Error al actualizar historia:", error);
    return NextResponse.json({ success: false, message: "Error al actualizar la historia" }, { status: 500 });
  }
}

// DELETE - Eliminar una historia (para administradores)
export async function DELETE(request, context) {
  try {
    const { params } = context;
    const id = params.id;

    const cookieStore = await cookies();
    const token = cookieStore.get("admin_auth_token")?.value;
    
    const auth = await verifyAdmin(token);
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    await dbConnect();
    const story = await Story.findById(id);

    if (!story) {
      return NextResponse.json({ success: false, message: "Historia no encontrada" }, { status: 404 });
    }

    // Si la historia tiene una imagen, eliminarla
    if (story.image) {
      await deleteImageFile(story.image);
    }

    // Eliminar la historia de la base de datos
    await Story.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Historia eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar historia:", error);
    return NextResponse.json({ success: false, message: "Error al eliminar la historia" }, { status: 500 });
  }
}