// app/api/products/[slug]/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/products/[slug] - Obtener un producto por slug
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true
      }
    })
    
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error al obtener producto:', error)
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[slug] - Actualizar un producto
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
    const { name, description, price, stock, categoryId, images, newSlug } = body
    
    // Verificar si el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
      include: { images: true }
    })
    
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }
    
    // Si se proporciona un nuevo slug, verificar que no exista otro producto con ese slug
    if (newSlug && newSlug !== slug) {
      const productWithNewSlug = await prisma.product.findUnique({
        where: { slug: newSlug }
      })
      
      if (productWithNewSlug) {
        return NextResponse.json(
          { error: 'Ya existe un producto con este slug' },
          { status: 400 }
        )
      }
    }
    
    // Actualizar el producto
    const updatedProduct = await prisma.product.update({
      where: { slug },
      data: {
        name: name || undefined,
        description: description || undefined,
        price: price !== undefined ? price : undefined,
        stock: stock !== undefined ? stock : undefined,
        categoryId: categoryId || undefined,
        slug: newSlug || undefined
      },
      include: {
        category: true,
        images: true
      }
    })
    
    // Actualizar imágenes si se proporcionan
    if (images && images.length > 0) {
      // Eliminar imágenes existentes
      await prisma.productImage.deleteMany({
        where: { productId: existingProduct.id }
      })
      
      // Crear nuevas imágenes
      await Promise.all(
        images.map((url: string) =>
          prisma.productImage.create({
            data: {
              url,
              productId: existingProduct.id
            }
          })
        )
      )
      
      // Obtener el producto actualizado con las nuevas imágenes
      const productWithImages = await prisma.product.findUnique({
        where: { id: existingProduct.id },
        include: {
          category: true,
          images: true
        }
      })
      
      return NextResponse.json(productWithImages)
    }
    
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[slug] - Eliminar un producto
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
    
    // Verificar si el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    })
    
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }
    
    // Eliminar el producto (las imágenes se eliminarán automáticamente por la relación onDelete: Cascade)
    await prisma.product.delete({
      where: { slug }
    })
    
    return NextResponse.json(
      { message: 'Producto eliminado correctamente' }
    )
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    )
  }
}