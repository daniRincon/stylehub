// app/api/categories/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/categories - Obtener todas las categorías
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    })
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error al obtener categorías:', error)
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Crear una nueva categoría
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { name, slug, image, description } = body
    
    // Validar datos requeridos
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }
    
    // Verificar si ya existe una categoría con el mismo slug
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    })
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con este slug' },
        { status: 400 }
      )
    }
    
    // Crear la categoría
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        image,
        description
      }
    })
    
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error al crear categoría:', error)
    return NextResponse.json(
      { error: 'Error al crear categoría' },
      { status: 500 }
    )
  }
}