import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Animal from "@/lib/models/animal"
import Adoption from "@/lib/models/adoption"
import Message from "@/lib/models/message"
import User from "@/lib/models/user"
import Donation from "@/lib/models/donation"
import Sponsor from "@/lib/models/sponsor"
import Story from "@/lib/models/story"
import Volunteer from "@/lib/models/volunteer"
import VeterinaryService from "@/lib/models/veterinaryService"
import UserActivity from "@/lib/models/userActivity"
import Appointment from "@/lib/models/appointment" 

export async function GET() {
  try {
    await dbConnect()

    // Consultas en paralelo para mejorar rendimiento
    const [
      totalAnimals,
      adoptedAnimals,
      availableAnimals,
      pendingAdoptions,
      completedAdoptions,
      pendingMessages,
      totalMessages,
      totalUsers,
      adminUsers,
      totalVolunteers,
      activeVolunteers,
      totalDonations,
      totalStories,
      pendingVetServices,
      completedVetServices,
      recentActivities,
      totalSponsors,
      activeSponsors,
      totalDonationAmountResult
    ] = await Promise.all([
      // Estadísticas de animales
      Animal.countDocuments(),
      Animal.countDocuments({ status: "adopted" }),
      Animal.countDocuments({ status: "available" }),
      
      // Estadísticas de adopciones
      Adoption.countDocuments({ status: "pending" }),
      Adoption.countDocuments({ status: "approved" }),
      
      // Estadísticas de mensajes
      Message.countDocuments({ read: false }),
      Message.countDocuments(),
      
      // Estadísticas de usuarios
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      
      // Estadísticas de voluntarios
      Volunteer.countDocuments(),
      Volunteer.countDocuments({ status: "active" }),
      
      // Estadísticas de donaciones
      Donation.countDocuments(),
      
      // Estadísticas de historias de éxito
      Story.countDocuments(),
      
      // Estadísticas de servicios veterinarios
      VeterinaryService.countDocuments({ status: "pending" }),
      VeterinaryService.countDocuments({ status: "completed" }),
      
      // Estadísticas de actividad de usuarios
      UserActivity.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // última semana
      }),
      
      // Consultas para patrocinios
      Sponsor.countDocuments(),
      Sponsor.countDocuments({ status: "active" }),
      
      // Calcular monto total de donaciones
      Donation.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ])
    
    // Estadísticas de citas - MANEJO DEL ERROR
    let pendingAppointments = 0
    let completedAppointments = 0
    
    try {
      // Consultas en paralelo para citas
      [pendingAppointments, completedAppointments] = await Promise.all([
        Appointment.countDocuments({ status: "pending" }),
        Appointment.countDocuments({ status: "completed" })
      ])
    } catch (appointmentError) {
      console.error("Error al obtener estadísticas de citas:", appointmentError)
    }

    return NextResponse.json({
      stats: {
        // Animales
        totalAnimals,
        adoptedAnimals,
        availableAnimals,
        
        // Adopciones
        pendingAdoptions,
        completedAdoptions,
        
        // Mensajes
        pendingMessages,
        totalMessages,
        
        // Usuarios
        totalUsers,
        adminUsers,
        
        // Voluntarios
        totalVolunteers,
        activeVolunteers,
        
        // Donaciones
        totalDonations,
        totalDonationAmount: totalDonationAmountResult[0]?.total || 0,
        
        // Patrocinios
        totalSponsors,
        activeSponsors,
        
        // Historias
        totalStories,
        
        // Servicios Veterinarios
        pendingVetServices,
        completedVetServices,
        
        // Citas
        pendingAppointments,
        completedAppointments,
        
        // Actividad de usuarios
        recentActivities
      },
    })
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error)
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 })
  }
}