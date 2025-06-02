import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const orderId = params.id;

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el pedido con datos relacionados
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { include: { images: true } }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // Validar permisos: ADMIN puede todo, CUSTOMER solo su pedido
    if (session.user.role !== "ADMIN") {
      if (!session.customer?.id || order.customerId !== session.customer.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
    }

    return NextResponse.json({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    return NextResponse.json({ error: "Error al obtener pedido" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const orderId = params.id;

    // Solo ADMIN puede actualizar el estado
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Falta el estado del pedido" }, { status: 400 });
    }

    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      return NextResponse.json({ error: "Estado de pedido inválido" }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });

    if (!existingOrder) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: { include: { product: { include: { images: true } } } }
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const orderId = params.id;

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // Validar permiso para eliminar o cancelar
    if (
      session.user.role !== "ADMIN" &&
      (!session.customer?.id || existingOrder.customerId !== session.customer.id)
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Clientes sólo pueden cancelar pedidos pendientes
    if (
      session.user.role !== "ADMIN" &&
      existingOrder.status !== "PENDING"
    ) {
      return NextResponse.json(
        { error: "Solo se pueden cancelar pedidos pendientes" },
        { status: 400 }
      );
    }

    // Restaurar stock de productos
    for (const item of existingOrder.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } }
      });
    }

    if (session.user.role === "ADMIN") {
      // Eliminar pedido completamente
      await prisma.order.delete({ where: { id: orderId } });
      return NextResponse.json({ message: "Pedido eliminado correctamente" });
    } else {
      // Actualizar estado a CANCELLED para clientes
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" }
      });
      return NextResponse.json({ message: "Pedido cancelado correctamente" });
    }
  } catch (error) {
    console.error("Error al cancelar/eliminar pedido:", error);
    return NextResponse.json({ error: "Error al cancelar/eliminar pedido" }, { status: 500 });
  }
}
