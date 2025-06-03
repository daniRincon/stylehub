import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Users, DollarSign, Package, TrendingUp, TrendingDown, Edit, Eye, Plus } from "lucide-react"
import prisma from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import DashboardClient from "./dashboard-client"

// Función para obtener estadísticas del dashboard
async function getDashboardStats() {
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

    // Calcular porcentajes de crecimiento (simulado)
    const salesGrowth = lastMonthSales._sum.total
      ? ((Number(totalSalesResult._sum.total || 0) - Number(lastMonthSales._sum.total)) /
          Number(lastMonthSales._sum.total)) *
        100
      : 0

    const ordersGrowth = lastMonthOrders ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0

    return {
      totalSales: Number(totalSalesResult._sum.total || 0),
      totalOrders,
      totalCustomers,
      totalProducts,
      recentOrders,
      salesGrowth: Math.round(salesGrowth * 10) / 10,
      ordersGrowth: Math.round(ordersGrowth * 10) / 10,
    }
  } catch (error) {
    console.error("Error obteniendo estadísticas del dashboard:", error)
    return {
      totalSales: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      recentOrders: [],
      salesGrowth: 0,
      ordersGrowth: 0,
    }
  }
}

// Función para mapear estados de la base de datos a español
function getStatusInSpanish(status: string) {
  const statusMap: { [key: string]: string } = {
    PENDING: "Pendiente",
    PROCESSING: "Procesando",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    PAID: "Pagado",
  }
  return statusMap[status] || status
}

export default async function AdminDashboard() {
  const { totalSales, totalOrders, totalCustomers, totalProducts, recentOrders, salesGrowth, ordersGrowth } =
    await getDashboardStats()

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark-gray">Dashboard</h1>
            <p className="text-gray-600">Panel de administración</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/productos/nuevo">
              <Button className="bg-gold hover:bg-gold/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </Link>
            <Link href="/admin/pedidos">
              <Button variant="outline">Ver Todos los Pedidos</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalSales)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {salesGrowth >= 0 ? (
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
              )}
              {salesGrowth >= 0 ? "+" : ""}
              {salesGrowth}% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {ordersGrowth >= 0 ? (
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
              )}
              {ordersGrowth >= 0 ? "+" : ""}
              {ordersGrowth}% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              Clientes registrados
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              En catálogo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Componente Cliente */}
      <DashboardClient />

      {/* Recent Orders Table */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Últimos Pedidos</CardTitle>
              <Link href="/admin/pedidos">
                <Button variant="outline" size="sm">
                  Ver Todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Cliente</th>
                      <th className="text-left py-3 px-4">Fecha</th>
                      <th className="text-left py-3 px-4">Estado</th>
                      <th className="text-right py-3 px-4">Total</th>
                      <th className="text-center py-3 px-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium">{order.id.substring(0, 8)}...</td>
                        <td className="py-3 px-4">{order.customer.name}</td>
                        <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString("es-ES")}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === "DELIVERED"
                                ? "bg-green-100 text-green-800"
                                : order.status === "SHIPPED"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "PROCESSING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : order.status === "CANCELLED"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {getStatusInSpanish(order.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{formatPrice(Number(order.total))}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/admin/pedidos/${order.id}`}>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/pedidos/${order.id}/edit`}>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No hay pedidos recientes</p>
                <p className="text-sm">Los pedidos aparecerán aquí cuando los clientes realicen compras</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
