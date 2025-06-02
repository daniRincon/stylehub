import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hash } from "bcryptjs"

// GET /api/user - Obtener todos los usuarios (solo para administradores)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
  }
}

// POST /api/user - Crear un nuevo usuario (registro)
export async function POST(request: Request) {
  try {
    console.log("=== INICIO REGISTRO USUARIO ===")

    const body = await request.json()
    const { name, email, password, role } = body

    console.log("Datos recibidos:", {
      name,
      email,
      password: password ? "***" : "NO_PASSWORD",
      role,
    })

    // Validar datos requeridos
    if (!name || !email || !password) {
      console.log("❌ Faltan campos requeridos")
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ Formato de email inválido")
      return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 })
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      console.log("❌ Contraseña muy corta")
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Verificar si ya existe un usuario con el mismo email
    console.log("🔍 Verificando usuario existente...")
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      console.log("❌ Usuario ya existe")
      return NextResponse.json({ error: "Ya existe un usuario con este email" }, { status: 400 })
    }

    // Para el primer admin, permitir creación sin autenticación
    const userCount = await prisma.user.count()
    const isFirstAdmin = userCount === 0 && role === "ADMIN"

    // Si se intenta crear un usuario con rol de administrador y no es el primero
    if (role === "ADMIN" && !isFirstAdmin) {
      const session = await getServerSession(authOptions)

      if (!session || session.user.role !== "ADMIN") {
        console.log("❌ No autorizado para crear admin")
        return NextResponse.json({ error: "No autorizado para crear usuarios administradores" }, { status: 401 })
      }
    }

    // Hashear la contraseña
    console.log("🔐 Hasheando contraseña...")
    const hashedPassword = await hash(password, 12)
    console.log("✅ Contraseña hasheada correctamente")

    // Crear el usuario
    console.log("📝 Creando usuario en base de datos...")
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role || "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    console.log("✅ Usuario creado exitosamente:", {
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json(
      {
        message: "Usuario creado exitosamente",
        user,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("💥 Error al crear usuario:", error)
    return NextResponse.json(
      {
        error: "Error al crear usuario",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// PUT /api/user - Actualizar usuario
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, email, role } = body

    if (!id) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
  }
}

// DELETE /api/user - Eliminar usuario
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 })
    }

    // No permitir que un admin se elimine a sí mismo
    if (id === session.user.id) {
      return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Usuario eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
  }
}
