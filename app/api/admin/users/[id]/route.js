import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

// Función auxiliar para verificar admin
async function verifyAdmin(token) {
  if (!token) {
    return { success: false, message: "No autorizado", status: 401 };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Conectar a la base de datos
    const client = await clientPromise;
    const db = client.db("montanita_adopta");
    
    // Intentar encontrar usuario en colección users
    const adminUser = await db.collection("users").findOne({
      _id: new ObjectId(decoded.id)
    });
    
    if (adminUser) {
      // Verificar si es admin en users
      const isAdmin =
        adminUser.isAdmin === true ||
        adminUser.role === "admin" ||
        adminUser.admin === true ||
        adminUser.es_admin === true ||
        adminUser.esAdmin === true;
        
      if (!isAdmin) {
        return { success: false, message: "Acceso denegado", status: 403 };
      }
    } else {
      // Intentar encontrar en colección admins
      const admin = await db.collection("admins").findOne({
        _id: new ObjectId(decoded.id)
      });
      
      if (!admin) {
        return { success: false, message: "No autorizado", status: 401 };
      }
    }
    
    return { success: true, decoded, db };
  } catch (error) {
    return { success: false, message: "Token inválido", status: 401 };
  }
}

// GET - Obtener un usuario específico
export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_auth_token")?.value;
    
    const auth = await verifyAdmin(token);
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }
    
    const { id } = params;
    
    // Buscar al usuario solicitado
    const targetUser = await auth.db.collection("users").findOne({ _id: new ObjectId(id) });
    
    if (!targetUser) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 });
    }

    // Retornar el usuario encontrado
    return NextResponse.json({ 
      success: true, 
      user: {
        id: targetUser._id.toString(),
        name: targetUser.nombre || targetUser.name,
        email: targetUser.correo_electronico || targetUser.email,
        role: targetUser.role || "user",
        // Puedes incluir más campos según lo necesites
      }
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener usuario" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un usuario específico
export async function PUT(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_auth_token")?.value;
    
    const auth = await verifyAdmin(token);
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }
    
    const { id } = params;
    const updateData = await request.json();
    
    // Actualizar el usuario
    const result = await auth.db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Usuario actualizado exitosamente" 
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { success: false, message: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un usuario específico
export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_auth_token")?.value;
    
    const auth = await verifyAdmin(token);
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }
    
    const { id } = params;
    
    // Eliminar el usuario
    const result = await auth.db.collection("users").deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Usuario eliminado exitosamente" 
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { success: false, message: "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}