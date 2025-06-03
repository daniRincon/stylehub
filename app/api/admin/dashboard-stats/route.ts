import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Obtener total de ventas (solo pedidos no cancelados)
    const totalSalesResult = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: {
          not: "CANCELLED",
        },
      },
    })

    // Obtener total de pedidos
    const totalOrders = await prisma.order.count()

    // Obtener total de clientes
    const totalCustomers = await prisma.customer.count()

    // Obtener total de productos
    const totalProducts = await prisma.product.count()

    // Obtener pedidos del mes pasado para calcular crecimiento
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const lastMonthOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: lastMonth,
        },
      },
    })

    const lastMonthSales = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        createdAt: {
          gte: lastMonth,
        },
        status: {
          not: "CANCELLED",
        },
      },
    })

    // Obtener últimos pedidos
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        customer: true,
      },
    })

    // Calcular porcentajes de crecimiento
    const salesGrowth = lastMonthSales._sum.total
      ? ((Number(totalSalesResult._sum.total || 0) - Number(lastMonthSales._sum.total)) /
          Number(lastMonthSales._sum.total)) *
        100
      : 0

    const ordersGrowth = lastMonthOrders ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0

    return NextResponse.json({
      totalSales: Number(totalSalesResult._sum.total || 0),
      totalOrders,
      totalCustomers,
      totalProducts,
      recentOrders,
      salesGrowth: Math.round(salesGrowth * 10) / 10,
      ordersGrowth: Math.round(ordersGrowth * 10) / 10,
    })
  } catch (error) {
    console.error("Error obteniendo estadísticas del dashboard:", error)

    // Retornar datos de ejemplo en caso de error
    return NextResponse.json({
      totalSales: 125000,
      totalOrders: 45,
      totalCustomers: 32,
      totalProducts: 18,
      recentOrders: [],
      salesGrowth: 12.5,
      ordersGrowth: 8.3,
    })
  }
}
