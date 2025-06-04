"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ShoppingCart, Trash2, ArrowLeft, Loader2, Plus, Minus, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useCart } from "@/lib/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"

interface ProductStock {
  [key: string]: number
}

export default function CartPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { items, removeItem, updateItemQuantity, clearCart, getTotalPrice } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [productStocks, setProductStocks] = useState<ProductStock>({})
  const [isValidatingStock, setIsValidatingStock] = useState(false)

  // Validar stock de productos en el carrito
  useEffect(() => {
    const validateStock = async () => {
      if (items.length === 0) return

      setIsValidatingStock(true)
      try {
        const productIds = [...new Set(items.map((item) => item.id.split("-")[0]))]

        const stockPromises = productIds.map(async (productId) => {
          try {
            const response = await fetch(`/api/products/${productId}`)
            if (response.ok) {
              const product = await response.json()
              return { id: productId, stock: product.stock }
            }
            return { id: productId, stock: 0 }
          } catch {
            return { id: productId, stock: 0 }
          }
        })

        const stockResults = await Promise.all(stockPromises)
        const stockMap: ProductStock = {}

        stockResults.forEach((result) => {
          stockMap[result.id] = result.stock
        })

        setProductStocks(stockMap)

        // Verificar si algún producto excede el stock disponible
        const invalidItems = items.filter((item) => {
          const productId = item.id.split("-")[0]
          const availableStock = stockMap[productId] || 0
          return item.quantity > availableStock
        })

        if (invalidItems.length > 0) {
          toast.warning("Algunos productos en tu carrito exceden el stock disponible")
        }
      } catch (error) {
        console.error("Error validating stock:", error)
      } finally {
        setIsValidatingStock(false)
      }
    }

    validateStock()
  }, [items])

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return

    const productId = id.split("-")[0]
    const availableStock = productStocks[productId] || 0

    if (quantity > availableStock) {
      toast.error(`Solo hay ${availableStock} unidades disponibles`)
      return
    }

    updateItemQuantity(id, quantity)
  }

  const getMaxQuantity = (itemId: string) => {
    const productId = itemId.split("-")[0]
    return productStocks[productId] || 0
  }

  const isItemOutOfStock = (itemId: string) => {
    const productId = itemId.split("-")[0]
    const availableStock = productStocks[productId] || 0
    const item = items.find((i) => i.id === itemId)
    return item ? item.quantity > availableStock : false
  }

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Tu carrito está vacío")
      return
    }

    // Verificar stock antes del checkout
    const outOfStockItems = items.filter((item) => isItemOutOfStock(item.id))
    if (outOfStockItems.length > 0) {
      toast.error("Algunos productos en tu carrito no tienen stock suficiente. Por favor actualiza las cantidades.")
      return
    }

    setIsCheckingOut(true)

    try {
      // Verificar si el usuario está autenticado
      if (status === "unauthenticated") {
        toast.error("Debes iniciar sesión para continuar")
        router.push("/login?callbackUrl=/checkout")
        return
      }

      if (status === "loading") {
        toast.error("Verificando sesión...")
        return
      }

      // Verificar que hay productos en el carrito
      if (!items || items.length === 0) {
        toast.error("No hay productos en el carrito")
        return
      }

      // Verificar que todos los productos tienen precio
      const invalidItems = items.filter((item) => !item.price || item.price <= 0)
      if (invalidItems.length > 0) {
        toast.error("Algunos productos no tienen precio válido")
        return
      }

      console.log("Redirecting to checkout with items:", items)

      // Redirigir directamente usando router.push
      router.push("/checkout")
    } catch (error) {
      console.error("Error en checkout:", error)
      toast.error("Error al procesar el checkout")
    } finally {
      setIsCheckingOut(false)
    }
  }

  const subtotal = getTotalPrice() || 0
  const shipping = 0 // Envío gratis
  const tax = subtotal * 0.19 // IVA 19%
  const total = subtotal + shipping + tax

  const hasOutOfStockItems = items.some((item) => isItemOutOfStock(item.id))

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Carrito de Compras</h1>

          {isValidatingStock && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-blue-800">Validando stock de productos...</span>
              </div>
            </div>
          )}

          {hasOutOfStockItems && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                <span className="text-sm text-red-800">
                  Algunos productos en tu carrito exceden el stock disponible. Ajusta las cantidades antes de continuar.
                </span>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-medium mb-2">Tu carrito está vacío</h2>
              <p className="text-muted-foreground mb-6">Parece que aún no has añadido productos a tu carrito.</p>
              <Button asChild className="bg-gold hover:bg-gold/90 text-white">
                <Link href="/tienda">Continuar Comprando</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <h2 className="text-lg font-bold mb-4">Productos</h2>

                    <div className="space-y-6">
                      {items.map((item) => {
                        const maxQuantity = getMaxQuantity(item.id)
                        const isOutOfStock = isItemOutOfStock(item.id)

                        return (
                          <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                            <div className="w-full sm:w-24 h-24">
                              <img
                                src={item.image || "/placeholder.svg?height=96&width=96"}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-md"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-medium text-lg">{item.name}</h3>
                                  {isOutOfStock && (
                                    <Badge variant="destructive" className="mt-1">
                                      Stock insuficiente
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-bold text-lg">{formatPrice((item.price || 0) * item.quantity)}</p>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {formatPrice(item.price || 0)} {item.size && `- Talla: ${item.size}`}
                              </p>
                              {maxQuantity > 0 && (
                                <p className="text-xs text-muted-foreground mb-2">Stock disponible: {maxQuantity}</p>
                              )}
                              <div className="flex justify-between items-center">
                                <div className="flex items-center border rounded-lg">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="px-3 py-1 min-w-[3rem] text-center">{item.quantity}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                    disabled={item.quantity >= maxQuantity}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    removeItem(item.id)
                                    toast.success("Producto eliminado del carrito")
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Eliminar
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <Button variant="outline" asChild>
                    <Link href="/tienda">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Continuar Comprando
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      clearCart()
                      toast.success("Carrito vaciado")
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Vaciar Carrito
                  </Button>
                </div>
              </div>

              <div>
                <div className="bg-white rounded-lg shadow p-6 sticky top-20">
                  <h2 className="text-lg font-bold mb-4">Resumen del Pedido</h2>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>
                        Subtotal ({items.length} {items.length === 1 ? "producto" : "productos"})
                      </span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Envío</span>
                      <span className="text-green-600">Gratis</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>IVA (19%)</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between font-bold text-lg mb-6">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>

                  {/* Mostrar estado de autenticación */}
                  {status === "unauthenticated" && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Debes{" "}
                        <Link href="/login" className="underline font-medium">
                          iniciar sesión
                        </Link>{" "}
                        para continuar
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full bg-gold hover:bg-gold/90 text-white h-12 text-lg font-medium"
                    onClick={handleCheckout}
                    disabled={isCheckingOut || status === "loading" || hasOutOfStockItems || isValidatingStock}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : status === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : hasOutOfStockItems ? (
                      "Ajusta cantidades"
                    ) : (
                      "Finalizar Compra"
                    )}
                  </Button>

                  <div className="mt-4 text-xs text-muted-foreground text-center">
                    <p>✓ Envío gratis en compras superiores a $100.000</p>
                    <p>✓ Garantía de satisfacción</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
