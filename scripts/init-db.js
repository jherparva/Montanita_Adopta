const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")
const { ObjectId } = mongoose.Types

// URL de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/montanita_adopta"

// Función para inicializar la base de datos
async function initializeDatabase() {
  console.log("Iniciando la configuración de la base de datos...")

  let client

  try {
    // Conectar a MongoDB
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log("Conexión a MongoDB establecida correctamente")

    // Obtener referencia a la base de datos
    const db = client.db()

    // Crear colecciones (si no existen)
    const collections = [
      "animals",
      "adoptions",
      "messages",
      "stories",
      "users",
      "volunteers",
      "veterinaryservices",
      "appointments",
    ]

    for (const collectionName of collections) {
      const collectionExists = await db.listCollections({ name: collectionName }).hasNext()

      if (!collectionExists) {
        await db.createCollection(collectionName)
        console.log(`Colección '${collectionName}' creada correctamente`)
      } else {
        console.log(`Colección '${collectionName}' ya existe`)
      }
    }

    // Crear índices
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    console.log("Índices creados correctamente")

    // Verificar si ya existe un usuario administrador
    const adminExists = await db.collection("users").findOne({ role: "admin" })

    if (!adminExists) {
      // Crear usuario administrador
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash("admin123", salt)

      await db.collection("users").insertOne({
        name: "Administrador",
        email: "admin@montanitaadopta.com",
        password: hashedPassword,
        role: "admin",
        profileImage: "/imagenes/default-profile.webp",
        createdAt: new Date(),
      })

      console.log("Usuario administrador creado correctamente")
      console.log("Email: admin@montanitaadopta.com")
      console.log("Contraseña: admin123")
    } else {
      console.log("Ya existe un usuario administrador")
    }

    // Insertar datos de ejemplo
    await insertSampleData(db)

    // Insertar servicios veterinarios de ejemplo
    await insertVeterinaryServices(db)

    console.log("Base de datos inicializada correctamente")
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
  } finally {
    if (client) {
      await client.close()
      console.log("Conexión a MongoDB cerrada")
    }
  }
}

// Función para insertar datos de ejemplo
async function insertSampleData(db) {
  // Verificar si ya hay animales
  const animalsCount = await db.collection("animals").countDocuments()

  if (animalsCount === 0) {
    // Insertar animales de ejemplo
    const animals = [
      {
        name: "Max",
        species: "dog",
        breed: "Labrador",
        age: "adult",
        size: "large",
        sex: "male",
        description: "Max es un labrador amigable y juguetón que adora a los niños y otros perros.",
        image: "/imagenes/mascotas/perro1.webp",
        status: "available",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Luna",
        species: "dog",
        breed: "Pastor Alemán",
        age: "puppy",
        size: "medium",
        sex: "female",
        description: "Luna es una cachorra muy activa y cariñosa que busca una familia que le dé mucho amor.",
        image: "/imagenes/mascotas/perro2.webp",
        status: "available",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Michi",
        species: "cat",
        breed: "Siamés",
        age: "adult",
        size: "small",
        sex: "male",
        description: "Michi es un gato tranquilo y cariñoso que adora dormir en el regazo de su dueño.",
        image: "/imagenes/mascotas/gato1.webp",
        status: "available",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Simba",
        species: "cat",
        breed: "Persa",
        age: "kitten",
        size: "small",
        sex: "male",
        description: "Simba es un gatito juguetón y curioso que se lleva bien con otros gatos.",
        image: "/imagenes/mascotas/gato2.webp",
        status: "available",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Rocky",
        species: "dog",
        breed: "Bulldog",
        age: "senior",
        size: "medium",
        sex: "male",
        description: "Rocky es un perro mayor muy tranquilo que busca un hogar donde pasar sus años dorados.",
        image: "/imagenes/mascotas/perro3.webp",
        status: "adopted",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const result = await db.collection("animals").insertMany(animals)
    console.log(`${result.insertedCount} animales de ejemplo insertados correctamente`)

    // Insertar adopciones de ejemplo
    const rocky = await db.collection("animals").findOne({ name: "Rocky" })

    if (rocky) {
      const adoptions = [
        {
          animal: rocky._id,
          adopter: {
            name: "María Rodríguez",
            email: "maria@example.com",
            phone: "3123456789",
            address: "Calle 123 #45-67",
            city: "La Montañita",
          },
          requestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
          status: "approved",
          approvedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 días atrás
          notes: "Adopción exitosa. Seguimiento realizado.",
        },
      ]

      await db.collection("adoptions").insertMany(adoptions)
      console.log(`Adopciones de ejemplo insertadas correctamente`)
    }
  } else {
    console.log("Ya existen animales en la base de datos")
  }

  // Verificar si ya hay mensajes
  const messagesCount = await db.collection("messages").countDocuments()

  if (messagesCount === 0) {
    // Insertar mensajes de ejemplo
    const messages = [
      {
        name: "Carlos Gómez",
        email: "carlos@example.com",
        subject: "Consulta sobre adopción",
        message: "Hola, estoy interesado en adoptar un perro. ¿Cuáles son los requisitos para hacerlo? Gracias.",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
        read: false,
        replied: false,
      },
      {
        name: "Ana Martínez",
        email: "ana@example.com",
        subject: "Voluntariado",
        message:
          "Me gustaría ser voluntaria en su organización. ¿Cómo puedo aplicar? Tengo experiencia con animales y disponibilidad los fines de semana.",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
        read: true,
        replied: true,
      },
      {
        name: "Juan Pérez",
        email: "juan@example.com",
        subject: "Donación de alimentos",
        message:
          "Quisiera hacer una donación de alimentos para perros. ¿Cuál es el procedimiento para entregarlos? Tengo aproximadamente 20kg de comida.",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
        read: false,
        replied: false,
      },
    ]

    await db.collection("messages").insertMany(messages)
    console.log(`${messages.length} mensajes de ejemplo insertados correctamente`)
  } else {
    console.log("Ya existen mensajes en la base de datos")
  }

  // Verificar si ya hay historias
  const storiesCount = await db.collection("stories").countDocuments()

  if (storiesCount === 0) {
    // Insertar historias de ejemplo
    const stories = [
      {
        title: "Mi vida con Max",
        author: "María Rodríguez",
        email: "maria@example.com",
        content:
          "Adoptar a Max fue la mejor decisión que tomamos como familia. Ha traído tanta alegría a nuestro hogar. El proceso de adopción fue sencillo y el equipo de Montañita Adopta nos apoyó en todo momento.",
        image: "/static/imagenes/testimonios/testimonio1.webp",
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 días atrás
        approved: true,
        featured: true,
      },
      {
        title: "Michi, mi compañero fiel",
        author: "Carlos Gómez",
        email: "carlos@example.com",
        content:
          "Siempre quise tener un gato y cuando vi a Michi en la página de Montañita Adopta, supe que era para mí. El proceso fue muy profesional y ahora tengo un compañero maravilloso que llena mi hogar de alegría.",
        image: "/static/imagenes/testimonios/testimonio2.webp",
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 días atrás
        approved: true,
        featured: false,
      },
      {
        title: "Luna cambió mi vida",
        author: "Ana Martínez",
        email: "ana@example.com",
        content:
          "Desde que Luna llegó a mi vida, todo ha cambiado para mejor. Es una compañera increíble y me ha enseñado mucho sobre responsabilidad y amor incondicional.",
        image: "/static/imagenes/testimonios/testimonio3.webp",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 días atrás
        approved: false,
        featured: false,
      },
    ]

    await db.collection("stories").insertMany(stories)
    console.log(`${stories.length} historias de ejemplo insertadas correctamente`)
  } else {
    console.log("Ya existen historias en la base de datos")
  }

  // Verificar si ya hay voluntarios
  const volunteersCount = await db.collection("volunteers").countDocuments()

  if (volunteersCount === 0) {
    // Insertar voluntarios de ejemplo
    const volunteers = [
      {
        name: "Laura González",
        email: "laura@example.com",
        phone: "3123456789",
        address: "Calle 123 #45-67",
        city: "La Montañita",
        availability: "Fines de semana",
        skills: "Cuidado de animales, fotografía",
        experience: "He trabajado como voluntaria en refugios de animales durante 2 años.",
        status: "approved",
        registrationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 días atrás
      },
      {
        name: "Pedro Sánchez",
        email: "pedro@example.com",
        phone: "3123456789",
        address: "Calle 456 #78-90",
        city: "La Montañita",
        availability: "Tardes entre semana",
        skills: "Veterinaria, primeros auxilios",
        experience: "Soy estudiante de veterinaria en último año.",
        status: "pending",
        registrationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
      },
    ]

    await db.collection("volunteers").insertMany(volunteers)
    console.log(`${volunteers.length} voluntarios de ejemplo insertados correctamente`)
  } else {
    console.log("Ya existen voluntarios en la base de datos")
  }
}

// Función para insertar servicios veterinarios de ejemplo
async function insertVeterinaryServices(db) {
  // Verificar si ya hay servicios veterinarios
  const servicesCount = await db.collection("veterinaryservices").countDocuments()

  if (servicesCount === 0) {
    // Insertar servicios veterinarios de ejemplo
    const services = [
      {
        name: "Vacunación",
        description: "Protege la salud de tu nueva mascota con nuestras vacunas completas.",
        price: 50000,
        icon: "fa-syringe",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Consulta General",
        description: "Revisión completa de salud para garantizar el bienestar de tu mascota.",
        price: 40000,
        icon: "fa-stethoscope",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Esterilización",
        description: "Servicios de esterilización seguros y profesionales.",
        price: 120000,
        icon: "fa-cut",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Primeros Auxilios",
        description: "Atención inmediata y cuidados de emergencia para tu mascota.",
        price: 60000,
        icon: "fa-first-aid",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const result = await db.collection("veterinaryservices").insertMany(services)
    console.log(`${result.insertedCount} servicios veterinarios de ejemplo insertados correctamente`)
  } else {
    console.log("Ya existen servicios veterinarios en la base de datos")
  }
}

// Ejecutar la función de inicialización
initializeDatabase()
  .then(() => {
    console.log("Proceso de inicialización completado")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Error en el proceso de inicialización:", error)
    process.exit(1)
  })
