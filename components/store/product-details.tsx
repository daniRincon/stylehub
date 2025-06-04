"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Heart, Minus, Plus, Check, Star, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useCart } from "@/lib/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/lib/types"
import type { CartItem } from "@/lib/hooks/use-cart"

interface ProductDetailsProps {
  product: Product
  averageRating: number
}

interface SizeStock {
  size: string
  stock: number
}

export default function ProductDetails({ product, averageRating }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [mainImage, setMainImage] = useState(product.images[0]?.url || "/placeholder.svg")
  const [sizeStocks, setSizeStocks] = useState<SizeStock[]>([])
  const [loadingStock, setLoadingStock] = useState(false)

  const { addItem, items } = useCart()

  // Cargar stock por tallas
  useEffect(() => {
    const fetchSizeStocks = async () => {
      setLoadingStock(true)
      try {
        const response = await fetch(`/api/products/${product.id}/stock`)
        if (response.ok) {
          const data = await response.json()
          setSizeStocks(data.sizes || [])
        }
      } catch (error) {
        console.error("Error fetching size stocks:", error)
      } finally {
        setLoadingStock(false)
      }
    }

    fetchSizeStocks()
  }, [product.id])

  // Obtener stock disponible para la talla seleccionada
  const getAvailableStock = () => {
    if (!selectedSize) return 0

    const sizeStock = sizeStocks.find((s) => s.size === selectedSize)
    if (!sizeStock) return 0

    // Restar lo que ya está en el carrito
    const cartItemId = `${product.id}-${selectedSize}`
    const itemInCart = items.find((item) => item.id === cartItemId)
    const quantityInCart = itemInCart?.quantity || 0

    return Math.max(0, sizeStock.stock - quantityInCart)
  }

  const maxQuantity = getAvailableStock()

  // Ajustar cantidad cuando cambie la talla o el stock
  useEffect(() => {
    if (quantity > maxQuantity && maxQuantity > 0) {
      setQuantity(Math.min(quantity, maxQuantity))
    } else if (maxQuantity > 0 && quantity === 0) {
      setQuantity(1)
    }
  }, [selectedSize, maxQuantity, quantity])

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1)
    }
  }

  const handleAddToCart = () => {
    const categorySlug = typeof product.category === "string" ? product.category : product.category?.slug

    // Verificar si se requiere talla
    if (!selectedSize && categorySlug !== "gorras" && categorySlug !== "accesorios") {
      toast.error("Por favor selecciona una talla")
      return
    }

    // Verificar stock disponible
    if (maxQuantity <= 0) {
      toast.error("No hay stock disponible para esta talla")
      return
    }

    if (quantity > maxQuantity) {
      toast.error(`Solo puedes agregar ${maxQuantity} unidades más`)
      return
    }

    const cartItem: CartItem = {
      id: selectedSize ? `${product.id}-${selectedSize}` : product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || "/placeholder.svg",
      quantity,
      size: selectedSize || undefined,
      maxStock: maxQuantity,
    }

    addItem(cartItem)
    toast.success(`${product.name} añadido al carrito`)

    // Resetear cantidad después de agregar
    setQuantity(1)
  }

  // Renderizar estrellas para la calificación
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? "text-gold fill-gold" : "text-gray-300"}`} />
    ))
  }

  // Obtener el slug de la categoría
  const getCategorySlug = () => {
    if (typeof product.category === "string") {
      return product.category
    }
    return product.category?.slug || ""
  }

  // Obtener el nombre de la categoría
  const getCategoryName = () => {
    if (typeof product.category === "string") {
      return product.category
    }
    return product.category?.name || "Sin categoría"
  }

  const categorySlug = getCategorySlug()

  // Verificar si hay stock en el carrito para este producto
  const getCartQuantity = () => {
    if (!selectedSize) return 0
    const cartItemId = `${product.id}-${selectedSize}`
    const itemInCart = items.find((item) => item.id === cartItemId)
    return itemInCart?.quantity || 0
  }

  // Obtener stock total del producto
  const getTotalStock = () => {
    return sizeStocks.reduce((total, sizeStock) => total + sizeStock.stock, 0)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Imágenes del producto */}
      <div className="space-y-4">
        <div className="aspect-square overflow-hidden rounded-lg border">
          <img src={mainImage || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {product.images?.map((image) => (
            <div
              key={image.id}
              className={`aspect-square overflow-hidden rounded-lg border cursor-pointer ${
                mainImage === image.url ? "ring-2 ring-gold" : ""
              }`}
              onClick={() => setMainImage(image.url)}
            >
              <img
                src={image.url || "/placeholder.svg"}
                alt={`${product.name} - Vista`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Mostrar placeholders si hay menos de 4 imágenes */}
          {(product.images?.length || 0) < 4 &&
            Array.from({ length: 4 - (product.images?.length || 0) }).map((_, i) => (
              <div key={`placeholder-${i}`} className="aspect-square overflow-hidden rounded-lg border bg-muted"></div>
            ))}
        </div>
      </div>

      {/* Información del producto */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {getTotalStock() <= 5 && getTotalStock() > 0 && (
            <Badge variant="destructive" className="ml-2">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Últimas {getTotalStock()} unidades
            </Badge>
          )}
        </div>

        <div className="flex items-center mb-4">
          <div className="flex mr-2">{renderStars(averageRating)}</div>
          <span className="text-sm text-muted-foreground">
            {averageRating.toFixed(1)} ({product.reviews?.length || 0} reseñas)
          </span>
        </div>

        <p className="text-2xl font-bold text-gold mb-4">{formatPrice(product.price)}</p>

        <div className="mb-6">
          <h3 className="font-medium mb-2">Descripción:</h3>
          <p className="text-muted-foreground line-clamp-3">{product.description}</p>
        </div>

        {/* Selector de tallas (solo para ciertas categorías) */}
        {categorySlug !== "gorras" && categorySlug !== "accesorios" && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">Talla:</h3>
            {loadingStock ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold"></div>
                <span className="text-sm text-muted-foreground">Cargando tallas...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categorySlug === "zapatos"
                  ? // Tallas para zapatos
                    ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"].map((size) => {
                      const sizeStock = sizeStocks.find((s) => s.size === size)
                      const stock = sizeStock?.stock || 0
                      const isSelected = selectedSize === size
                      const isOutOfStock = stock === 0

                      return (
                        <Button
                          key={size}
                          variant={isSelected ? "default" : "outline"}
                          className={`relative ${
                            isSelected
                              ? "bg-dark-green hover:bg-dark-green/90 text-white"
                              : isOutOfStock
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                          }`}
                          onClick={() => !isOutOfStock && setSelectedSize(size)}
                          disabled={isOutOfStock}
                        >
                          {size}
                          {stock <= 3 && stock > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              {stock}
                            </span>
                          )}
                        </Button>
                      )
                    })
                  : // Tallas para ropa
                    ["XS", "S", "M", "L", "XL", "XXL"].map((size) => {
                      const sizeStock = sizeStocks.find((s) => s.size === size)
                      const stock = sizeStock?.stock || 0
                      const isSelected = selectedSize === size
                      const isOutOfStock = stock === 0

                      return (
                        <Button
                          key={size}
                          variant={isSelected ? "default" : "outline"}
                          className={`relative ${
                            isSelected
                              ? "bg-dark-green hover:bg-dark-green/90 text-white"
                              : isOutOfStock
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                          }`}
                          onClick={() => !isOutOfStock && setSelectedSize(size)}
                          disabled={isOutOfStock}
                        >
                          {size}
                          {stock <= 3 && stock > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              {stock}
                            </span>
                          )}
                        </Button>
                      )
                    })}
              </div>
            )}
          </div>
        )}

        {/* Mostrar información de stock en carrito */}
        {getCartQuantity() > 0 && selectedSize && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Ya tienes {getCartQuantity()} {getCartQuantity() === 1 ? "unidad" : "unidades"} de este producto en tu
              carrito (Talla: {selectedSize})
            </p>
          </div>
        )}

        {selectedSize && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700">
              Stock disponible para talla {selectedSize}: <span className="font-medium">{maxQuantity} unidades</span>
            </p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-medium mb-2">Cantidad:</h3>
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={decreaseQuantity} disabled={quantity <= 1}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="mx-4 w-8 text-center">{quantity}</span>
            <Button variant="outline" size="icon" onClick={increaseQuantity} disabled={quantity >= maxQuantity}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {selectedSize && maxQuantity < (sizeStocks.find((s) => s.size === selectedSize)?.stock || 0) && (
            <p className="text-xs text-muted-foreground mt-1">
              Máximo disponible: {maxQuantity} (ya tienes {getCartQuantity()} en el carrito)
            </p>
          )}
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            onClick={handleAddToCart}
            className="flex-1 bg-dark-green hover:bg-dark-green/90 text-white"
            disabled={
              getTotalStock() <= 0 ||
              (selectedSize && maxQuantity <= 0) ||
              (!selectedSize && categorySlug !== "gorras" && categorySlug !== "accesorios")
            }
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {getTotalStock() <= 0
              ? "Agotado"
              : selectedSize && maxQuantity <= 0
                ? "Sin stock en esta talla"
                : !selectedSize && categorySlug !== "gorras" && categorySlug !== "accesorios"
                  ? "Selecciona una talla"
                  : "Añadir al carrito"}
          </Button>
          <Button variant="outline" size="icon">
            <Heart className="h-4 w-4" />
            <span className="sr-only">Añadir a favoritos</span>
          </Button>
        </div>

        <div className="flex items-center text-sm text-muted-foreground mb-4">
          {getTotalStock() > 0 ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-500" />
              <span>Stock total disponible: {getTotalStock()} unidades</span>
            </>
          ) : (
            <>
              <X className="h-4 w-4 mr-2 text-red-500" />
              <span>Agotado</span>
            </>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Categoría: {getCategoryName()}</p>
        </div>
      </div>
    </div>
  )
}
