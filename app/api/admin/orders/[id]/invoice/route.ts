import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// POST /api/admin/orders/[id]/invoice - Generar factura para un pedido
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  try {
    const session = await getServerSession({ req, ...authOptions })

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado - Se requiere rol de administrador" }, { status: 401 })
    }

    const { id } = params

    // Verificar que el pedido existe
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
                price: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    // Por ahora, retornamos un JSON con los datos de la factura
    // En una implementación real, aquí generarías un PDF
    const invoiceData = {
      invoiceNumber: order.id,
      invoiceDate: new Date().toISOString(),
      order: {
        id: order.id,
        date: order.createdAt.toISOString(),
        status: order.status,
      },
      customer: order.customer,
      items: order.items.map((item) => ({
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: Number(item.price),
        total: Number(item.price) * item.quantity,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    }

    // Simular descarga de PDF (en una implementación real usarías una librería como puppeteer o jsPDF)
    return NextResponse.json(
      {
        message: "Factura generada exitosamente",
        invoice: invoiceData,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("❌ Error al generar factura:", error)
    return NextResponse.json({ error: "Error al generar factura" }, { status: 500 })
  }
}
