// app/api/users/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hash } from 'bcrypt'

// GET /api/users - Obtener todos los usuarios (solo para administradores)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { orders: true }
        }
      }
    })
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}

// POST /api/users - Crear un nuevo usuario (registro)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body
    
    // Validar datos requeridos
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }
    
    // Verificar si ya existe un usuario con el mismo email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 400 }
      )
    }
    
    // Si se intenta crear un usuario con rol de administrador, verificar que el solicitante sea administrador
    if (role === 'ADMIN') {
      const session = await getServerSession(authOptions)
      
      if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'No autorizado para crear usuarios administradores' },
          { status: 401 }
        )
      }
    }
    
    // Hashear la contraseña
    const hashedPassword = await hash(password, 10)
    
    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'CUSTOMER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    )
  }
}