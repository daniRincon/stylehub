"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Package } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Order {
  id: string
  total: number
  status: string
  createdAt: string
  items: {
    quantity: number
    product: {
      name: string
      price: number
    }
  }[]
}

interface OrdersListProps {
  userId?: string
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusLabels = {
  pending: "Pendiente",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
}

export default function OrdersList({ userId }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/user/orders")
        if (response.ok) {
          const data = await response.json()
          setOrders(data)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes pedidos aún</h3>
        <p className="text-gray-500 mb-6">Cuando realices tu primer pedido, aparecerá aquí</p>
        <Link href="/tienda">
          <Button className="bg-gold hover:bg-gold/90">Explorar productos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Pedido #{order.id.slice(-8)}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.createdAt), "d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
              <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                {statusLabels[order.status as keyof typeof statusLabels]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">Productos:</h4>
                <div className="space-y-1">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.product.name} x{item.quantity}
                      </span>
                      <span>{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <div className="font-semibold">Total: {formatPrice(order.total)}</div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/cuenta/pedidos/${order.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalles
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
