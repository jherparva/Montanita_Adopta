import dbConnect from "@/lib/dbConnect";
import UserActivity from "@/lib/models/userActivity";

/**
 * Registra actividad del usuario
 */
export async function logActivity({
  userId,
  tipo,
  descripcion,
}: {
  userId: string;
  tipo: string;
  descripcion: string;
}): Promise<void> {
  try {
    await dbConnect();

    await UserActivity.create({
      userId,
      tipo,
      descripcion,
    });
  } catch (err) {
    console.error("Error registrando actividad:", err);
  }
}
