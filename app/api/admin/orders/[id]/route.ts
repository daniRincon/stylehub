import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/admin/orders/[id] - Obtener detalles de un pedido específico
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession({ req, ...authOptions })

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado - Se requiere rol de administrador" }, { status: 401 })
    }

    const { id } = params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            postalCode: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
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
            id: true,
            method: true,
            status: true,
            paidAt: true,
            createdAt: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceDate: true,
            totalAmount: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      order: {
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("❌ Error al obtener detalles del pedido:", error)
    return NextResponse.json({ error: "Error al obtener detalles del pedido" }, { status: 500 })
  }
}
