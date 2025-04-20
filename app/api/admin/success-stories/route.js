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

// GET - Obtener todas las historias (para administradores)
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_auth_token")?.value;
    
    const auth = await verifyAdmin(token);
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    await dbConnect();

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const approved = searchParams.get("approved");
    const featured = searchParams.get("featured");

    const skip = (page - 1) * limit;

    // Construir la consulta de búsqueda
    let query = {};
    
    // Añadir búsqueda por texto si existe
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    
    // Filtrar por estado de aprobación
    if (approved === "true") {
      query.approved = true;
    } else if (approved === "false") {
      query.approved = false;
    }
    
    // Filtrar por destacado
    if (featured === "featured") {
      query.isFeatured = true;
    } else if (featured === "not-featured") {
      query.isFeatured = false;
    }

    // Obtener historias con paginación
    const stories = await Story.find(query)
                               .sort({ date: -1 })
                               .skip(skip)
                               .limit(limit)
                               .lean();

    // Obtener el total de historias para la paginación
    const total = await Story.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      stories,
      page,
      totalPages,
      total,
    });
  } catch (error) {
    console.error("Error al obtener historias:", error);
    return NextResponse.json({ success: false, message: "Error al obtener las historias" }, { status: 500 });
  }
}

// PUT - Actualizar el estado de una historia (aprobar/rechazar)
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

// POST - Crear una nueva historia (para administradores)
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_auth_token")?.value;
    
    const auth = await verifyAdmin(token);
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const body = await request.json();
    
    // Validar datos requeridos
    if (!body.title || !body.author || !body.content) {
      return NextResponse.json({ 
        success: false, 
        message: "Faltan campos requeridos" 
      }, { status: 400 });
    }

    await dbConnect();
    
    // Crear la nueva historia
    const newStory = await Story.create(body);

    return NextResponse.json({
      success: true,
      message: "Historia creada correctamente",
      story: newStory,
    });
  } catch (error) {
    console.error("Error al crear historia:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error al crear la historia" 
    }, { status: 500 });
  }
}