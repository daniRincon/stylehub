import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hash } from "bcryptjs"

// GET /api/user/[id] - Obtener un usuario por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const userId = params.id

    // Verificar si el usuario está autenticado
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Los usuarios pueden ver su propio perfil, los admins pueden ver cualquier usuario
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado para ver este usuario" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Solo incluir órdenes si es admin quien consulta
        ...(session.user.role === "ADMIN" && {
          _count: {
            select: {
              orders: true,
            },
          },
        }),
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT /api/user/[id] - Actualizar un usuario
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const userId = params.id

    // Verificar autenticación
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Los usuarios pueden editar su propio perfil, los admins pueden editar cualquier usuario
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado para editar este usuario" }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, password, role } = body

    // Validaciones básicas
    if (!name && !email && !password && !role) {
      return NextResponse.json({ error: "Debe proporcionar al menos un campo para actualizar" }, { status: 400 })
    }

    // Validar formato de email si se proporciona
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 })
    }

    // Validar contraseña si se proporciona
    if (password && password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Solo admins pueden cambiar roles
    if (role && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado para cambiar el rol" }, { status: 403 })
    }

    // Verificar email único si se cambia
    if (email && email !== existingUser.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (userWithEmail) {
        return NextResponse.json({ error: "Ya existe un usuario con este email" }, { status: 400 })
      }
    }

    // Preparar datos para actualizar
    const updateData: any = {}

    if (name) updateData.name = name
    if (email) updateData.email = email
    if (password) updateData.password = await hash(password, 12)
    if (role && session.user.role === "ADMIN") updateData.role = role

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE /api/user/[id] - Eliminar un usuario
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const userId = params.id

    // Solo admins pueden eliminar usuarios
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado para eliminar usuarios" }, { status: 403 })
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // No permitir auto-eliminación
    if (session.user.id === userId) {
      return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 400 })
    }

    // No permitir eliminar el último administrador
    if (existingUser.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      })

      if (adminCount <= 1) {
        return NextResponse.json({ error: "No se puede eliminar el último administrador" }, { status: 400 })
      }
    }

    // Eliminar usuario
    await prisma.user.delete({
      where: { id: userId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
