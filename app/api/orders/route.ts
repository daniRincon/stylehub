import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface OrderWhereInput {
  userId?: string;
  status?: string;
}

interface OrderItemInput {
  productId: string;
  quantity: number;
  price: number;
}

// GET /api/orders - Obtener todos los pedidos (filtrados por usuario o todos para administradores)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    // Construir el objeto de filtro
    const where: OrderWhereInput = {}

    // Si no es administrador, solo mostrar los pedidos del usuario
    if (session?.user?.role !== 'ADMIN') {
      where.userId = session?.user?.id
    } else {
      // Si es administrador y se proporciona un userId, filtrar por ese usuario
      const userId = searchParams.get('userId')
      if (userId) {
        where.userId = userId
      }
    }

    // Filtrar por estado si se proporciona
    if (status) {
      where.status = status
    }

    // Obtener pedidos con paginación
    const orders = await prisma.order.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Obtener el total de pedidos para la paginación
    const total = await prisma.order.count({ where })

    return NextResponse.json({
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    })
  } catch (error) {
    console.error('Error al obtener pedidos:', error)
    return NextResponse.json(
      { error: 'Error al obtener pedidos' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Crear un nuevo pedido
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, total, shippingAddress, paymentMethod } = body

    // Validar datos requeridos
    if (!items || !items.length || !total || !shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Verificar que los productos existan y tengan stock suficiente
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        return NextResponse.json(
          { error: `Producto con ID ${item.productId} no encontrado` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.name}` },
          { status: 400 }
        )
      }
    }

    // Crear el pedido
    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id,
        total,
        shippingAddress,
        paymentMethod,
        items: {
          create: (items as any[]).map((item: OrderItemInput) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
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

    // Actualizar el stock de los productos
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error al crear pedido:', error)
    return NextResponse.json(
      { error: 'Error al crear pedido' },
      { status: 500 }
    )
  }
}