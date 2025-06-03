"use client"

import { useState, useEffect } from "react"
import { ShoppingBag, Search, Eye, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils"

// Tipos TypeScript
interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    name: string
    images: { url: string }[]
  }
}

interface Customer {
  id: string
  name: string
  email: string
}

interface Order {
  id: string
  total: number
  status: string
  createdAt: string
  customer: Customer
  items: OrderItem[]
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        if (status === "loading") return

        if (!session || !session.user) {
          router.push("/admin/login")
          return
        }

        const params = new URLSearchParams()
        if (searchTerm) {
          params.append("search", searchTerm)
        }
        if (statusFilter && statusFilter !== "all") {
          params.append("status", statusFilter)
        }
        params.append("page", page.toString())
        params.append("limit", "10")

        const response = await fetch(`/api/admin/orders?${params.toString()}`, {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Error al obtener los pedidos")
        }

        const data = await response.json()
        setOrders(data.orders)
        setPagination(data.pagination)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [searchTerm, statusFilter, page, session, status, router])

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: "Pendiente", className: "bg-orange-500" },
      PROCESSING: { label: "Procesando", className: "bg-yellow-500" },
      SHIPPED: { label: "Enviado", className: "bg-blue-500" },
      DELIVERED: { label: "Entregado", className: "bg-green-500" },
      CANCELLED: { label: "Cancelado", className: "bg-red-500" },
      PAID: { label: "Pagado", className: "bg-purple-500" },
    }

    const statusInfo = statusMap[status] || { label: status, className: "bg-gray-500" }

    return <Badge className={`${statusInfo.className} text-white`}>{statusInfo.label}</Badge>
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPage(newPage)
    }
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/pedidos/${orderId}`)
  }

  const handleGenerateInvoice = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/invoice`, {
        method: "POST",
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `factura-${orderId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error al generar factura:", error)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  if (!session || !session.user) {
    return null // Redirigido a /admin/login en useEffect
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <ShoppingBag className="h-8 w-8 mr-2 text-gold" />
        <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por ID, cliente o email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="processing">Procesando</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setPage(1)
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold"></div>
                      <span className="ml-2">Cargando pedidos...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {order.items.length} producto{order.items.length !== 1 ? "s" : ""}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatPrice(Number(order.total))}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewOrder(order.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerateInvoice(order.id)}>
                            <span className="mr-2">📄</span>
                            Generar factura
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <ShoppingBag className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-lg font-medium text-gray-600">No se encontraron pedidos</p>
                      <p className="text-sm text-gray-500">
                        {searchTerm || statusFilter !== "all"
                          ? "Intenta ajustar los filtros de búsqueda"
                          : "Los pedidos aparecerán aquí cuando los clientes realicen compras"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} pedidos
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {pagination.page} de {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
