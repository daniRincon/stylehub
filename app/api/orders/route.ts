import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";

interface OrderWhereInput {
  customerId?: string;
  status?: OrderStatus;
}

interface OrderItemInput {
  productId: string;
  quantity: number;
  price: number;
  size?: string;
}

// GET /api/orders
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession({ req, ...authOptions });

    console.log("🎯 Sesión en GET /api/orders:", session);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (session.user.role === "CUSTOMER" && !session.customer?.id) {
      return NextResponse.json({ error: "Cliente no asociado" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status") as OrderStatus | null;
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const where: OrderWhereInput = {};

    if (session.user.role === "CUSTOMER") {
      where.customerId = session.customer!.id;
    } else {
      const customerId = searchParams.get("customerId");
      if (customerId) {
        where.customerId = customerId;
      }
    }

    if (status && !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ error: "Estado de pedido inválido" }, { status: 400 });
    }

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.order.count({ where });

    return NextResponse.json({
      orders: orders.map(order => ({
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
    });
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error);
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 });
  }
}

// POST /api/orders
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession({ req, ...authOptions });

    console.log("🧑‍💼 Sesión en POST /api/orders:", session);

    if (!session || !session.user || !session.customer?.id) {
      return NextResponse.json({ error: "No autorizado: Sesión no encontrada o cliente no asociado" }, { status: 401 });
    }

    const body = await req.json();
    const { items, total, shippingAddress, paymentMethod, paymentIntentId } = body;

    if (!items || !Array.isArray(items) || !items.length || !total || !shippingAddress || !paymentMethod) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price) {
        return NextResponse.json({ error: "Datos inválidos en los ítems" }, { status: 400 });
      }

      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json({ error: `Producto con ID ${item.productId} no encontrado` }, { status: 400 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuficiente para ${product.name}` }, { status: 400 });
      }
    }

    const order = await prisma.order.create({
      data: {
        customerId: session.customer.id,
        total,
        shippingAddress,
        paymentMethod,
        paymentIntentId,
        status: paymentMethod === "stripe" ? OrderStatus.PAID : OrderStatus.PENDING,
        items: {
          create: items.map((item: OrderItemInput) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
          })),
        },
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: paymentMethod,
        status: paymentMethod === "stripe" ? "COMPLETED" : "PENDING",
        paidAt: paymentMethod === "stripe" ? new Date() : null,
      },
    });

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error("❌ Error al crear pedido:", error);
    return NextResponse.json({ error: "Error al crear pedido" }, { status: 500 });
  }
}
