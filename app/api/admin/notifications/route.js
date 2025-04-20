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

// Función para mapear tipos de notificación a iconos
function getNotificationIcon(type) {
  const icons = {
    info: "fas fa-info-circle",
    success: "fas fa-check-circle",
    warning: "fas fa-exclamation-triangle",
    error: "fas fa-times-circle",
    adoption: "fas fa-paw",
    message: "fas fa-envelope",
    user: "fas fa-user",
    animal: "fas fa-paw",
    donation: "fas fa-hand-holding-heart",
    volunteer: "fas fa-users"
  };
  
  return icons[type] || icons.info;
}

export async function GET(request) {
  try {
    const admin = await verifyAdminAuth();
    
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const fullMode = searchParams.get('full') === 'true';
    const limit = fullMode ? 100 : 20;
    
    const client = await clientPromise;
    const db = client.db("montanita_adopta");
    
    // Obtener notificaciones para este administrador
    const notifications = await db.collection("notifications")
      .find({ 
        $or: [
          { adminId: admin.id },
          { adminEmail: admin.email },
          { recipientType: "admin" }
        ]
      })
      .sort({ date: -1 })
      .limit(limit)
      .toArray();
      
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const formattedNotifications = notifications.map(notification => ({
      id: notification._id.toString(),
      message: notification.message,
      read: notification.read || false,
      date: notification.date || new Date(),
      link: notification.link || null,
      icon: getNotificationIcon(notification.type || "info"),
      type: notification.type || "info",
      ...(fullMode && {
        subject: notification.subject || "",
        details: notification.details || "",
        sourceId: notification.sourceId || null,
        sourceType: notification.sourceType || null
      })
    }));
    
    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Error al cargar notificaciones" }, { status: 500 });
  }
}

// Función para crear notificaciones de prueba (solo si no existen)
export async function POST() {
  try {
    const admin = await verifyAdminAuth();
    
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const client = await clientPromise;
    const db = client.db("montanita_adopta");
    
    const count = await db.collection("notifications").countDocuments();
    
    if (count === 0) {
      const now = new Date();
      
      const sampleNotifications = [
        {
          adminId: admin.id,
          message: "Bienvenido al panel de administración",
          type: "info",
          date: now,
          read: false,
          link: "/admin/dashboard"
        },
        {
          adminId: admin.id,
          message: "Nueva solicitud de adopción para Luna",
          type: "adoption",
          date: new Date(now.getTime() - 1000 * 60 * 60),
          read: false,
          link: "/admin/solicitudes"
        },
        {
          adminId: admin.id,
          message: "Donación recibida de $50",
          type: "donation",
          date: new Date(now.getTime() - 1000 * 60 * 60 * 3),
          read: false,
          link: "/admin/donaciones"
        },
        {
          adminId: admin.id,
          message: "Nuevo mensaje de contacto de María López",
          type: "message",
          date: new Date(now.getTime() - 1000 * 60 * 60 * 5),
          read: true,
          link: "/admin/mensajes"
        },
        {
          adminId: admin.id,
          message: "Recordatorio: Cita veterinaria para Max mañana",
          type: "animal",
          date: new Date(now.getTime() - 1000 * 60 * 60 * 24),
          read: true,
          link: "/admin/veterinario"
        }
      ];
      
      await db.collection("notifications").insertMany(sampleNotifications);
      
      return NextResponse.json({ 
        message: "Notificaciones de prueba creadas",
        count: sampleNotifications.length
      });
    }
    
    return NextResponse.json({ message: "Las notificaciones ya existen" });
  } catch (error) {
    console.error("Error seeding notifications:", error);
    return NextResponse.json({ error: "Error al crear notificaciones de prueba" }, { status: 500 });
  }
}