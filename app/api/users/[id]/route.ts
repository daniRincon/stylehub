import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hash } from 'bcryptjs'

// GET /api/users/[id] - Obtener un usuario por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = params.id

    // Verificar si el usuario está autenticado y tiene permiso para ver este usuario
    if (!session || !session.user || (session.user.id !== userId && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
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
        orders: session.user.role === 'ADMIN' ? {
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        } : undefined
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    )
  }
}

interface UpdateData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'ADMIN' | 'USER';
}

// PUT /api/users/[id] - Actualizar un usuario
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = params.id

    // Verificar si el usuario está autenticado y tiene permiso para actualizar este usuario
    if (!session || !session.user || (session.user.id !== userId && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, password, role } = body

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Si se intenta cambiar el rol, verificar que el solicitante sea administrador
    if (role && role !== existingUser.role) {
      if (!session.user || session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'No autorizado para cambiar el rol' },
          { status: 401 }
        )
      }
    }

    // Si se proporciona un nuevo email, verificar que no exista otro usuario con ese email
    if (email && email !== existingUser.email) {
      const userWithNewEmail = await prisma.user.findUnique({
        where: { email }
      })

      if (userWithNewEmail) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con este email' },
          { status: 400 }
        )
      }
    }

    // Preparar los datos para actualizar
    const updateData: UpdateData = {}

    if (name) updateData.name = name
    if (email) updateData.email = email
    if (password) updateData.password = await hash(password, 10)
    if (role && session?.user?.role === 'ADMIN') updateData.role = role

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Eliminar un usuario
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = params.id

    // Verificar si el usuario está autenticado y tiene permiso para eliminar este usuario
    if (!session || !session.user || (session.user.id !== userId && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // No permitir eliminar el último administrador
    if (existingUser.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'No se puede eliminar el último administrador' },
          { status: 400 }
        )
      }
    }

    // Eliminar el usuario
    await prisma.user.delete({
      where: { id: userId }
    })

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}