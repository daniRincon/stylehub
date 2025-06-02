"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Users, DollarSign, Package, TrendingUp, TrendingDown, Edit, Eye, Plus } from "lucide-react"

// Importa los gráficos de forma dinámica con SSR desactivado
const DashboardCharts = dynamic(() => import("@/components/admin/dashboard-charts"), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg"></div>,
})

// Formateador para pesos colombianos
const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value)

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  const handleEditOrder = (orderId: string) => {
    setSelectedOrder(orderId)
    router.push(`/admin/pedidos/${orderId}/edit`)
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/pedidos/${orderId}`)
  }

  const recentOrders = [
    {
      id: "ORD-123456",
      customer: "Juan Pérez",
      date: "2023-04-15",
      status: "Entregado",
      total: 129999,
    },
    {
      id: "ORD-123455",
      customer: "María García",
      date: "2023-04-14",
      status: "Enviado",
      total: 89999,
    },
    {
      id: "ORD-123454",
      customer: "Carlos López",
      date: "2023-04-14",
      status: "Procesando",
      total: 199999,
    },
    {
      id: "ORD-123453",
      customer: "Ana Martínez",
      date: "2023-04-13",
      status: "Entregado",
      total: 59999,
    },
    {
      id: "ORD-123452",
      customer: "Pedro Rodríguez",
      date: "2023-04-12",
      status: "Cancelado",
      total: 149999,
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark-gray">Dashboard</h1>
            <p className="text-gray-600">Bienvenido, {session?.user?.name}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/admin/productos/nuevo")}
              className="bg-gold hover:bg-gold/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
            <Button onClick={() => router.push("/admin/pedidos")} variant="outline">
              Ver Todos los Pedidos
            </Button>
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
            <div className="text-2xl font-bold">{formatCOP(15231989)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              +20.1% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              +12.2% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+249</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
              -3.1% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+89</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              +8.4% desde el mes pasado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Recent Orders Table */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Últimos Pedidos</CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push("/admin/pedidos")}>
                Ver Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
                      <td className="py-3 px-4 font-medium">{order.id}</td>
                      <td className="py-3 px-4">{order.customer}</td>
                      <td className="py-3 px-4">{order.date}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "Entregado"
                              ? "bg-green-100 text-green-800"
                              : order.status === "Enviado"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "Procesando"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">{formatCOP(order.total)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewOrder(order.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditOrder(order.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
