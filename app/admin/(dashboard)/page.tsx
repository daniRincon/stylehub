"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Users, DollarSign, Package, TrendingUp, TrendingDown, Edit, Eye, Plus } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import DashboardClient from "./dashboard-client"

// Tipos para las estadísticas
interface DashboardStats {
  totalSales: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  recentOrders: any[]
  salesGrowth: number
  ordersGrowth: number
}

// Datos de respaldo en caso de error
const fallbackData: DashboardStats = {
  totalSales: 125000,
  totalOrders: 45,
  totalCustomers: 32,
  totalProducts: 18,
  recentOrders: [],
  salesGrowth: 12.5,
  ordersGrowth: 8.3,
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/dashboard-stats", {
          // Añadir credenciales para asegurar que se envíen las cookies
          credentials: "include",
          // Evitar caché
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          console.error("Error de API:", response.status, response.statusText)
          throw new Error(`Error al cargar estadísticas: ${response.status}`)
        }

        const data = await response.json()
        setStats(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
        setError("Error al cargar las estadísticas del dashboard. Usando datos de ejemplo.")
        // Mantener los datos de respaldo
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-5 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-10 w-40 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>

        {/* Stats Cards Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-40 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

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

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">{error}</p>
          <p className="text-sm text-yellow-600 mt-1">Mostrando datos de ejemplo</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalSales)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {stats.salesGrowth >= 0 ? (
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
              )}
              {stats.salesGrowth >= 0 ? "+" : ""}
              {stats.salesGrowth}% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {stats.ordersGrowth >= 0 ? (
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
              )}
              {stats.ordersGrowth >= 0 ? "+" : ""}
              {stats.ordersGrowth}% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
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
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
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
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
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
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium">{order.id.substring(0, 8)}...</td>
                        <td className="py-3 px-4">{order.customer?.name || "Cliente"}</td>
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
