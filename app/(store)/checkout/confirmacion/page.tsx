"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle, ShoppingBag, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"

interface Order {
  id: string
  total: number
  status: string
  createdAt: string
  paymentMethod: string
  shippingAddress: string
  items: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
    }
  }[]
}

export default function ConfirmacionPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("No se proporcionó un ID de pedido")
        setLoading(false)
        return
      }

      try {
        console.log("Fetching order:", orderId)

        const response = await fetch(`/api/orders/${orderId}`)
        console.log("Response status:", response.status)

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error response:", errorData)
          throw new Error(errorData.error || "Error al cargar el pedido")
        }

        const data = await response.json()
        console.log("Order data:", data)
        setOrder(data)
      } catch (error) {
        console.error("Error al cargar el pedido:", error)
        setError("No se pudo cargar la información del pedido")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gold" />
            <p>Cargando información del pedido...</p>
          </div>
        </main>
        <StoreFooter />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h1 className="text-2xl font-bold mb-4">Error</h1>
              <p className="mb-6">{error || "No se pudo cargar la información del pedido"}</p>
              <div className="space-y-4">
                <Button asChild className="bg-gold hover:bg-gold/90 text-white">
                  <Link href="/tienda">Volver a la tienda</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/cuenta/pedidos">Ver mis pedidos</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <StoreFooter />
      </div>
    )
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "credit-card":
        return "Tarjeta de Crédito"
      case "paypal":
        return "PayPal"
      case "bank-transfer":
        return "Transferencia Bancaria"
      case "cash-on-delivery":
        return "Pago Contra Entrega"
      default:
        return method
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Pendiente"
      case "confirmed":
        return "Confirmado"
      case "shipped":
        return "Enviado"
      case "delivered":
        return "Entregado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h1 className="text-3xl font-bold mb-4">¡Gracias por tu compra!</h1>
              <p className="text-gray-600">
                Tu pedido ha sido recibido y está siendo procesado. Te enviaremos actualizaciones por correo
                electrónico.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-6">Detalles del Pedido</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Número de Pedido</p>
                  <p className="font-semibold">#{order.id.slice(-8).toUpperCase()}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Fecha del Pedido</p>
                  <p className="font-semibold">
                    {new Date(order.createdAt).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Estado</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Método de Pago</p>
                  <p className="font-semibold">{getPaymentMethodText(order.paymentMethod)}</p>
                </div>
              </div>

              {order.shippingAddress && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Dirección de Envío</p>
                  <p className="font-semibold">{order.shippingAddress}</p>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Productos Ordenados</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={item.id || index} className="flex justify-between items-center py-2">
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                        <p className="text-sm text-gray-500">Precio unitario: {formatPrice(item.price)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-gold hover:bg-gold/90 text-white">
                <Link href="/tienda">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Continuar comprando
                </Link>
              </Button>

              <Button asChild variant="outline">
                <Link href="/cuenta/pedidos">Ver mis pedidos</Link>
              </Button>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">¿Qué sigue?</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Recibirás un correo de confirmación en los próximos minutos</li>
                <li>• Te notificaremos cuando tu pedido sea enviado</li>
                <li>• Puedes rastrear tu pedido en la sección "Mis Pedidos"</li>
                <li>• El tiempo de entrega estimado es de 3-5 días hábiles</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
