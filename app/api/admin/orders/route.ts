import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { OrderStatus } from "@prisma/client"

// GET /api/admin/orders - Obtener todos los pedidos (solo para admins)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession({ req, ...authOptions })

    console.log("🎯 Sesión en GET /api/admin/orders:", session)

    // Verificar autenticación y rol de admin
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado - Se requiere rol de administrador" }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const search = searchParams.get("search")
    const status = searchParams.get("status") as OrderStatus | null
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Construir filtros de búsqueda
    const where: any = {}

    // Filtro por estado
    if (status && status !== "all" && Object.values(OrderStatus).includes(status)) {
      where.status = status
    }

    // Filtro de búsqueda por ID, nombre del cliente o email
    if (search) {
      where.OR = [
        {
          id: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          customer: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          customer: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ]
    }

    // Obtener pedidos con paginación
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, email: true },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: {
                    take: 1,
                    select: { url: true },
                  },
                },
              },
            },
          },
          payment: {
            select: {
              method: true,
              status: true,
              paidAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders: orders.map((order) => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      })),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("❌ Error al obtener pedidos del admin:", error)
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 })
  }
}

// PATCH /api/admin/orders - Actualizar estado de pedido (solo para admins)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession({ req, ...authOptions })

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado - Se requiere rol de administrador" }, { status: 401 })
    }

    const body = await req.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: "ID del pedido y estado son requeridos" }, { status: 400 })
    }

    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ error: "Estado de pedido inválido" }, { status: 400 })
    }

    // Verificar que el pedido existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    // Actualizar el estado del pedido
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: {
                  take: 1,
                  select: { url: true },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      order: {
        ...updatedOrder,
        createdAt: updatedOrder.createdAt.toISOString(),
        updatedAt: updatedOrder.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("❌ Error al actualizar pedido:", error)
    return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 })
  }
}
