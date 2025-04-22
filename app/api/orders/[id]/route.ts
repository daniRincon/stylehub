// app/api/orders/[id]/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/orders/[id] - Obtener un pedido por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const orderId = params.id
    
    // Verificar si el usuario está autenticado
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    // Obtener el pedido
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        }
      }
    })
    
    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }
    
    // Verificar si el usuario tiene permiso para ver este pedido
    if (session.user.role !== 'ADMIN' && order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error al obtener pedido:', error)
    return NextResponse.json(
      { error: 'Error al obtener pedido' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - Actualizar un pedido (solo administradores pueden cambiar el estado)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const orderId = params.id
    
    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { status } = body
    
    // Validar datos requeridos
    if (!status) {
      return NextResponse.json(
        { error: 'Falta el estado del pedido' },
        { status: 400 }
      )
    }
    
    // Verificar si el pedido existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    })
    
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }
    
    // Actualizar el pedido
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error al actualizar pedido:', error)
    return NextResponse.json(
      { error: 'Error al actualizar pedido' },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] - Cancelar un pedido (solo administradores pueden eliminar)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const orderId = params.id
    
    // Verificar si el usuario está autenticado
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    // Verificar si el pedido existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    })
    
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }
    
    // Solo el propietario del pedido o un administrador pueden cancelar/eliminar
    if (existingOrder.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    // Si es un usuario normal, solo puede cancelar si el pedido está pendiente
    if (session.user.role !== 'ADMIN' && existingOrder.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Solo se pueden cancelar pedidos pendientes' },
        { status: 400 }
      )
    }
    
    // Si es un administrador, puede eliminar el pedido
    if (session.user.role === 'ADMIN') {
      // Restaurar el stock de los productos
      for (const item of existingOrder.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
      }
      
      // Eliminar el pedido
      await prisma.order.delete({
        where: { id: orderId }
      })
      
      return NextResponse.json(
        { message: 'Pedido eliminado correctamente' }
      )
    } else {
      // Si es un usuario normal, cambiar el estado a CANCELLED
      // Restaurar el stock de los productos
      for (const item of existingOrder.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
      }
      
      // Actualizar el estado del pedido
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      })
      
      return NextResponse.json(
        { message: 'Pedido cancelado correctamente' }
      )
    }
  } catch (error) {
    console.error('Error al cancelar/eliminar pedido:', error)
    return NextResponse.json(
      { error: 'Error al cancelar/eliminar pedido' },
      { status: 500 }
    )
  }
}