// app/api/categories/[slug]/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/categories/[slug] - Obtener una categoría por slug
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            images: true
          }
        }
      }
    })
    
    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error al obtener categoría:', error)
    return NextResponse.json(
      { error: 'Error al obtener categoría' },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[slug] - Actualizar una categoría
export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const slug = params.slug
    const body = await request.json()
    const { name, newSlug, image, description } = body
    
    // Verificar si la categoría existe
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    })
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }
    
    // Si se proporciona un nuevo slug, verificar que no exista otra categoría con ese slug
    if (newSlug && newSlug !== slug) {
      const categoryWithNewSlug = await prisma.category.findUnique({
        where: { slug: newSlug }
      })
      
      if (categoryWithNewSlug) {
        return NextResponse.json(
          { error: 'Ya existe una categoría con este slug' },
          { status: 400 }
        )
      }
    }
    
    // Actualizar la categoría
    const updatedCategory = await prisma.category.update({
      where: { slug },
      data: {
        name: name || undefined,
        slug: newSlug || undefined,
        image: image || undefined,
        description: description || undefined
      }
    })
    
    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error al actualizar categoría:', error)
    return NextResponse.json(
      { error: 'Error al actualizar categoría' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[slug] - Eliminar una categoría
export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const slug = params.slug
    
    // Verificar si la categoría existe
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }
    
    // Verificar si la categoría tiene productos asociados
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una categoría con productos asociados' },
        { status: 400 }
      )
    }
    
    // Eliminar la categoría
    await prisma.category.delete({
      where: { slug }
    })
    
    return NextResponse.json(
      { message: 'Categoría eliminada correctamente' }
    )
  } catch (error) {
    console.error('Error al eliminar categoría:', error)
    return NextResponse.json(
      { error: 'Error al eliminar categoría' },
      { status: 500 }
    )
  }
}