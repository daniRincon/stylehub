"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ShoppingCart, Trash2, ArrowLeft, Loader2, Plus, Minus, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useCart } from "@/lib/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"
import Image from "next/image"

interface SizeStock {
  size: string
  stock: number
}

interface ProductStockInfo {
  [productId: string]: {
    sizes: SizeStock[]
    hasSizes: boolean
    totalStock: number
  }
}

export default function CartPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { items, removeItem, updateItemQuantity, clearCart, getTotalPrice } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [productStocks, setProductStocks] = useState<ProductStockInfo>({})
  const [isValidatingStock, setIsValidatingStock] = useState(false)

  // Debug: Log del estado del carrito
  console.log("🛒 Cart page - All items:", items)
  console.log("🛒 Cart page - Items length:", items.length)

  // Limpiar items inválidos del carrito
  useEffect(() => {
    console.log("Checking for invalid items...")
    const invalidItems = items.filter((item) => !item.productId)
    console.log("Invalid items found:", invalidItems)

    if (invalidItems.length > 0) {
      console.warn("Found invalid items in cart, removing:", invalidItems)
      invalidItems.forEach((item) => removeItem(item.id))
      toast.warning("Se eliminaron productos inválidos del carrito")
    }
  }, [items, removeItem])

  // Validar stock de productos en el carrito
  useEffect(() => {
    const validateStock = async () => {
      const validItems = items.filter((item) => item.productId)
      console.log("Valid items for stock validation:", validItems)

      if (validItems.length === 0) {
        console.log("No valid items to validate stock")
        return
      }

      setIsValidatingStock(true)
      try {
        const productIds = [...new Set(validItems.map((item) => item.productId))]
        console.log("Product IDs to validate:", productIds)

        const stockPromises = productIds.map(async (productId) => {
          try {
            console.log("Fetching stock for productId:", productId)
            const response = await fetch(`/api/products/${productId}/stock`)
            if (response.ok) {
              const data = await response.json()
              console.log("Stock data received for", productId, ":", data)
              return {
                id: productId,
                sizes: data.sizes || [],
                hasSizes: data.hasSizes || false,
                totalStock: data.totalStock || 0,
              }
            } else {
              console.error(`Failed to fetch stock for product ${productId}:`, response.status)
              return { id: productId, sizes: [], hasSizes: false, totalStock: 0 }
            }
          } catch (error) {
            console.error(`Error fetching stock for product ${productId}:`, error)
            return { id: productId, sizes: [], hasSizes: false, totalStock: 0 }
          }
        })

        const stockResults = await Promise.all(stockPromises)
        console.log("All stock results:", stockResults)

        const stockMap: ProductStockInfo = {}

        stockResults.forEach((result) => {
          stockMap[result.id] = {
            sizes: result.sizes,
            hasSizes: result.hasSizes,
            totalStock: result.totalStock,
          }
        })

        console.log("Stock map created:", stockMap)
        setProductStocks(stockMap)

        // Actualizar stock en el carrito
        validItems.forEach((item) => {
          const productStock = stockMap[item.productId]
          if (!productStock) {
            console.log("No stock info found for product:", item.productId)
            return
          }

          let availableStock = 0

          if (productStock.hasSizes && item.size) {
            // Producto con tallas - buscar stock de la talla específica
            const sizeStock = productStock.sizes.find((s) => s.size === item.size)
            availableStock = sizeStock?.stock || 0
            console.log(`Stock for ${item.productId} size ${item.size}:`, availableStock)
          } else if (!productStock.hasSizes) {
            // Producto sin tallas - usar stock total
            availableStock = productStock.totalStock
            console.log(`Total stock for ${item.productId}:`, availableStock)
          }

          // Si la cantidad excede el stock disponible, ajustarla
          if (item.quantity > availableStock && availableStock > 0) {
            console.log(`Adjusting quantity for item ${item.id} from ${item.quantity} to ${availableStock}`)
            updateItemQuantity(item.id, availableStock)
            toast.warning(`Cantidad ajustada para ${item.name}${item.size ? ` (${item.size})` : ""}`)
          }
        })
      } catch (error) {
        console.error("Error validating stock:", error)
      } finally {
        setIsValidatingStock(false)
      }
    }

    validateStock()
  }, [items.length])

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return

    const item = items.find((i) => i.id === id)
    if (!item) return

    // Obtener stock actualizado
    let maxStock = item.stock

    // Si tenemos datos de stock más recientes, usarlos
    if (item.productId && productStocks[item.productId]) {
      const productStock = productStocks[item.productId]

      if (productStock.hasSizes && item.size) {
        const sizeStock = productStock.sizes.find((s) => s.size === item.size)
        maxStock = sizeStock?.stock || 0
      } else if (!productStock.hasSizes) {
        maxStock = productStock.totalStock
      }
    }

    if (quantity > maxStock) {
      toast.error(`Solo hay ${maxStock} unidades disponibles`)
      return
    }

    updateItemQuantity(id, quantity)
  }

  const isItemOutOfStock = (item: any) => {
    // Verificar si tenemos datos de stock actualizados
    if (item.productId && productStocks[item.productId]) {
      const productStock = productStocks[item.productId]

      if (productStock.hasSizes && item.size) {
        const sizeStock = productStock.sizes.find((s) => s.size === item.size)
        return (sizeStock?.stock || 0) === 0
      } else if (!productStock.hasSizes) {
        return productStock.totalStock === 0
      }
    }

    // Si no tenemos datos actualizados, usar el stock del item
    return item.stock === 0
  }

  const isQuantityExceedsStock = (item: any) => {
    // Verificar si tenemos datos de stock actualizados
    if (item.productId && productStocks[item.productId]) {
      const productStock = productStocks[item.productId]

      let availableStock = 0
      if (productStock.hasSizes && item.size) {
        const sizeStock = productStock.sizes.find((s) => s.size === item.size)
        availableStock = sizeStock?.stock || 0
      } else if (!productStock.hasSizes) {
        availableStock = productStock.totalStock
      }

      return item.quantity > availableStock && availableStock > 0
    }

    // Si no tenemos datos actualizados, usar el stock del item
    return item.quantity > item.stock && item.stock > 0
  }

  const handleRefreshStock = async () => {
    setIsValidatingStock(true)

    try {
      const validItems = items.filter((item) => item.productId)
      const productIds = [...new Set(validItems.map((item) => item.productId))]

      const stockPromises = productIds.map(async (productId) => {
        try {
          const response = await fetch(`/api/products/${productId}/stock`)
          if (response.ok) {
            const data = await response.json()
            return {
              id: productId,
              sizes: data.sizes || [],
              hasSizes: data.hasSizes || false,
              totalStock: data.totalStock || 0,
            }
          }
          return { id: productId, sizes: [], hasSizes: false, totalStock: 0 }
        } catch {
          return { id: productId, sizes: [], hasSizes: false, totalStock: 0 }
        }
      })

      const stockResults = await Promise.all(stockPromises)
      const stockMap: ProductStockInfo = {}

      stockResults.forEach((result) => {
        stockMap[result.id] = {
          sizes: result.sizes,
          hasSizes: result.hasSizes,
          totalStock: result.totalStock,
        }
      })

      setProductStocks(stockMap)

      // Actualizar cantidades en el carrito si exceden el stock
      validItems.forEach((item) => {
        const productStock = stockMap[item.productId]
        if (!productStock) return

        let availableStock = 0

        if (productStock.hasSizes && item.size) {
          const sizeStock = productStock.sizes.find((s) => s.size === item.size)
          availableStock = sizeStock?.stock || 0
        } else if (!productStock.hasSizes) {
          availableStock = productStock.totalStock
        }

        if (item.quantity > availableStock && availableStock > 0) {
          updateItemQuantity(item.id, availableStock)
          toast.warning(`Cantidad ajustada para ${item.name}${item.size ? ` (${item.size})` : ""}`)
        }
      })

      toast.success("Stock actualizado correctamente")
    } catch (error) {
      console.error("Error refreshing stock:", error)
      toast.error("Error al actualizar el stock")
    } finally {
      setIsValidatingStock(false)
    }
  }

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Tu carrito está vacío")
      return
    }

    const itemsWithStock = items.filter((item) => !isItemOutOfStock(item) && item.productId)
    if (itemsWithStock.length === 0) {
      toast.error("No hay productos disponibles en tu carrito")
      return
    }

    const invalidQuantities = items.filter((item) => isQuantityExceedsStock(item))
    if (invalidQuantities.length > 0) {
      toast.error("Algunas cantidades exceden el stock disponible. Por favor ajústalas.")
      return
    }

    setIsCheckingOut(true)

    try {
      if (status === "unauthenticated") {
        toast.error("Debes iniciar sesión para continuar")
        router.push("/login?callbackUrl=/checkout")
        return
      }

      if (status === "loading") {
        toast.error("Verificando sesión...")
        return
      }

      if (!items || items.length === 0) {
        toast.error("No hay productos en el carrito")
        return
      }

      const invalidItems = items.filter((item) => !item.price || item.price <= 0)
      if (invalidItems.length > 0) {
        toast.error("Algunos productos no tienen precio válido")
        return
      }

      router.push("/checkout")
    } catch (error) {
      console.error("Error en checkout:", error)
      toast.error("Error al procesar el checkout")
    } finally {
      setIsCheckingOut(false)
    }
  }

  const subtotal = getTotalPrice() || 0
  const shipping = 0
  const tax = subtotal * 0.19
  const total = subtotal + shipping + tax

  const hasOutOfStockItems = items.some((item) => isItemOutOfStock(item))
  const hasExcessQuantities = items.some((item) => isQuantityExceedsStock(item))

  // Filtrar solo items válidos con productId
  const validItems = items.filter((item) => item.productId)
  console.log("Valid items to display in cart:", validItems)

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Carrito de Compras</h1>
            <Button variant="outline" size="sm" onClick={handleRefreshStock} disabled={isValidatingStock}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isValidatingStock ? "animate-spin" : ""}`} />
              Actualizar Stock
            </Button>
          </div>

          {/* Debug info */}
          <div className="mb-4 p-3 bg-gray-50 border rounded-lg">
            <p className="text-sm">
              <strong>Debug:</strong> Total items: {items.length} | Items con productId:{" "}
              {items.filter((i) => i.productId).length} | Items sin productId:{" "}
              {items.filter((i) => !i.productId).length}
            </p>
            {items.length > 0 && (
              <details className="mt-2">
                <summary className="text-sm cursor-pointer">Ver items del carrito</summary>
                <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto">{JSON.stringify(items, null, 2)}</pre>
              </details>
            )}
          </div>

          {isValidatingStock && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-blue-800">Validando stock de productos...</span>
              </div>
            </div>
          )}

          {hasExcessQuantities && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Algunas cantidades exceden el stock disponible. Se ajustarán automáticamente al procesar la compra.
                </span>
              </div>
            </div>
          )}

          {hasOutOfStockItems && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                <span className="text-sm text-red-800">
                  Algunos productos en tu carrito están agotados y no podrán ser incluidos en la compra.
                </span>
              </div>
            </div>
          )}

          {validItems.length === 0 ? (
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
                    <h2 className="text-lg font-bold mb-4">Productos ({validItems.length})</h2>

                    <div className="space-y-6">
                      {validItems.map((item) => {
                        const isOutOfStock = isItemOutOfStock(item)
                        const quantityExceedsStock = isQuantityExceedsStock(item)

                        return (
                          <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                            <div className="w-full sm:w-24 h-24 relative">
                              <Image
                                src={item.image || "/placeholder.svg?height=96&width=96"}
                                alt={item.name}
                                fill
                                className="object-cover rounded-md"
                                sizes="(max-width: 768px) 100vw, 96px"
                                unoptimized={item.image?.includes("blob.vercel-storage.com")}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "/placeholder.svg?height=96&width=96&text=Error"
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-medium text-lg">{item.name}</h3>
                                  <p className="text-xs text-gray-500">ID: {item.productId || "Sin ID"}</p>
                                  {isOutOfStock && (
                                    <Badge variant="destructive" className="mt-1">
                                      Agotado
                                    </Badge>
                                  )}
                                  {quantityExceedsStock && (
                                    <Badge variant="secondary" className="mt-1">
                                      Cantidad ajustada
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-bold text-lg">{formatPrice((item.price || 0) * item.quantity)}</p>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {formatPrice(item.price || 0)} {item.size && `- Talla: ${item.size}`}
                              </p>

                              {/* Mostrar stock disponible */}
                              <p className="text-xs text-muted-foreground mb-2">
                                Stock disponible:{" "}
                                {item.productId && productStocks[item.productId]
                                  ? productStocks[item.productId].hasSizes && item.size
                                    ? productStocks[item.productId].sizes.find((s) => s.size === item.size)?.stock || 0
                                    : productStocks[item.productId].totalStock
                                  : item.stock}{" "}
                                unidades
                              </p>

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
                                    disabled={isOutOfStock || quantityExceedsStock}
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
                        Subtotal ({validItems.filter((item) => !isItemOutOfStock(item)).length}{" "}
                        {validItems.filter((item) => !isItemOutOfStock(item)).length === 1 ? "producto" : "productos"})
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

                  {hasOutOfStockItems && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">Los productos agotados no se incluirán en la compra</p>
                    </div>
                  )}

                  <Button
                    className="w-full bg-gold hover:bg-gold/90 text-white h-12 text-lg font-medium"
                    onClick={handleCheckout}
                    disabled={
                      isCheckingOut ||
                      status === "loading" ||
                      isValidatingStock ||
                      validItems.filter((item) => !isItemOutOfStock(item)).length === 0
                    }
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
                    ) : validItems.filter((item) => !isItemOutOfStock(item)).length === 0 ? (
                      "Sin productos disponibles"
                    ) : (
                      "Finalizar Compra"
                    )}
                  </Button>

                  <div className="mt-4 text-xs text-muted-foreground text-center">
                    <p>✓ Envío gratis en compras superiores a $100.000</p>
                    <p>✓ Garantía de satisfacción</p>
                    {hasExcessQuantities && (
                      <p className="text-yellow-600">⚠ Las cantidades se ajustarán al stock disponible</p>
                    )}
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
