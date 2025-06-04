"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Heart, Minus, Plus, Check, Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useCart } from "@/lib/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/lib/types"
import type { CartItem } from "@/lib/hooks/use-cart"
import Image from "next/image"

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
  const [sizeStocks, setSizeStocks] = useState<SizeStock[]>([])
  const [loadingStock, setLoadingStock] = useState(false)

  const { addItem, items } = useCart()

  // Debug logs
  console.log("🔍 ProductDetails - Product:", product)
  console.log("🔍 ProductDetails - Product ID:", product.id)

  // Función para obtener la URL de imagen optimizada
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "/placeholder.svg?height=400&width=400&text=Sin+imagen"

    if (imageUrl.includes("blob.vercel-storage.com") || imageUrl.includes("vercel.app")) {
      return imageUrl
    }

    if (imageUrl.startsWith("/")) {
      return imageUrl
    }

    return imageUrl
  }

  // Obtener la primera imagen o usar placeholder
  const firstImage =
    product.images && product.images.length > 0
      ? getImageUrl(product.images[0].url)
      : "/placeholder.svg?height=400&width=400&text=Sin+imagen"

  const [mainImage, setMainImage] = useState(firstImage)

  // Cargar stock por tallas
  useEffect(() => {
    const fetchSizeStocks = async () => {
      setLoadingStock(true)
      try {
        const response = await fetch(`/api/products/${product.id}/stock`)
        if (response.ok) {
          const data = await response.json()
          console.log("📦 Stock data received:", data)
          setSizeStocks(data.sizes || [])
        }
      } catch (error) {
        console.error("Error fetching size stocks:", error)
      } finally {
        setLoadingStock(false)
      }
    }

    if (product.id) {
      fetchSizeStocks()
    }
  }, [product.id])

  // Obtener stock disponible para la talla seleccionada
  const getAvailableStock = () => {
    if (!selectedSize) {
      // Si no hay talla seleccionada, usar stock general del producto
      return product.stock || 0
    }

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
    console.log("🚨 === HANDLE ADD TO CART START ===")
    console.log("🚨 Product:", product)
    console.log("🚨 Product ID:", product.id)
    console.log("🚨 Selected size:", selectedSize)
    console.log("🚨 Max quantity:", maxQuantity)

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

    // Obtener la primera imagen o usar placeholder
    const imageUrl =
      product.images && product.images.length > 0 ? getImageUrl(product.images[0].url) : "/placeholder.svg"

    const cartItem: CartItem = {
      id: selectedSize ? `${product.id}-${selectedSize}` : product.id,
      productId: product.id, // ¡ESTA ES LA CLAVE!
      name: product.name,
      price: product.price,
      image: imageUrl,
      quantity,
      size: selectedSize || undefined,
      stock: maxQuantity, // Usar el stock disponible calculado
    }

    console.log("🚨 === CART ITEM TO ADD ===")
    console.log("🚨 Cart item:", cartItem)
    console.log("🚨 Cart item productId:", cartItem.productId)
    console.log("🚨 Cart item keys:", Object.keys(cartItem))

    // Verificar que el objeto tiene productId antes de enviarlo
    if (!cartItem.productId) {
      console.error("💥 CRITICAL ERROR: cartItem.productId is missing!")
      toast.error("Error crítico: No se puede añadir el producto")
      return
    }

    addItem(cartItem)
    toast.success(`${product.name} añadido al carrito`)

    // Resetear cantidad después de agregar
    setQuantity(1)
    console.log("🚨 === HANDLE ADD TO CART END ===")
  }

  // Renderizar estrellas para la calificación
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? "text-gold fill-gold" : "text-gray-300"}`} />
    ))
  }

  // Obtener información de la categoría
  const getCategorySlug = () => {
    if (typeof product.category === "string") {
      return product.category
    }
    return product.category?.slug || ""
  }

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
    if (sizeStocks.length === 0) {
      return product.stock || 0
    }
    return sizeStocks.reduce((total, sizeStock) => total + sizeStock.stock, 0)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Imágenes del producto */}
      <div className="space-y-4">
        <div className="aspect-square overflow-hidden rounded-lg border relative">
          <Image
            src={mainImage || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={mainImage.includes("blob.vercel-storage.com")}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=400&width=400&text=Error+cargando+imagen"
            }}
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {product.images &&
            product.images.map((image, index) => {
              const imageUrl = getImageUrl(image.url)
              return (
                <div
                  key={image.id || index}
                  className={`aspect-square overflow-hidden rounded-lg border cursor-pointer relative ${
                    mainImage === imageUrl ? "ring-2 ring-gold" : ""
                  }`}
                  onClick={() => setMainImage(imageUrl)}
                >
                  <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt={`${product.name} - Vista ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 12.5vw"
                    unoptimized={imageUrl.includes("blob.vercel-storage.com")}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=100&width=100&text=Error"
                    }}
                  />
                </div>
              )
            })}

          {/* Mostrar placeholders si hay menos de 4 imágenes */}
          {(!product.images || product.images.length < 4) &&
            Array.from({ length: 4 - (product.images?.length || 0) }).map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className="aspect-square overflow-hidden rounded-lg border bg-muted flex items-center justify-center"
              >
                <span className="text-xs text-muted-foreground">Sin imagen</span>
              </div>
            ))}
        </div>
      </div>

      {/* Información del producto */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

        <div className="flex items-center mb-4">
          <div className="flex mr-2">{renderStars(averageRating)}</div>
          <span className="text-sm text-muted-foreground">
            {averageRating.toFixed(1)} ({product.reviews?.length || 0} reseñas)
          </span>
        </div>

        <p className="text-2xl font-bold text-gold mb-4">{formatPrice(product.price)}</p>

        <div className="mb-6">
          <h3 className="font-medium mb-2">Descripción:</h3>
          <p className="text-muted-foreground">{product.description}</p>
        </div>

        {/* Debug info */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <p className="font-bold text-blue-800">🔍 DEBUG INFO:</p>
          <p>
            <strong>Product ID:</strong> {product.id || "❌ UNDEFINED"}
          </p>
          <p>
            <strong>Max quantity:</strong> {maxQuantity}
          </p>
          <p>
            <strong>Selected size:</strong> {selectedSize || "Ninguna"}
          </p>
          <p>
            <strong>Total stock:</strong> {getTotalStock()}
          </p>
          <p>
            <strong>Cart quantity:</strong> {getCartQuantity()}
          </p>
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
                  ? ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"].map((size) => {
                      const sizeStock = sizeStocks.find((s) => s.size === size)
                      const stock = sizeStock?.stock || 0
                      const isSelected = selectedSize === size
                      const isOutOfStock = stock === 0

                      return (
                        <Button
                          key={size}
                          variant={isSelected ? "default" : "outline"}
                          className={`${
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
                        </Button>
                      )
                    })
                  : ["XS", "S", "M", "L", "XL", "XXL"].map((size) => {
                      const sizeStock = sizeStocks.find((s) => s.size === size)
                      const stock = sizeStock?.stock || 0
                      const isSelected = selectedSize === size
                      const isOutOfStock = stock === 0

                      return (
                        <Button
                          key={size}
                          variant={isSelected ? "default" : "outline"}
                          className={`${
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
              (!selectedSize && categorySlug !== "gorras" && categorySlug !== "accesorios") ||
              !product.id
            }
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {!product.id
              ? "Error: Sin ID"
              : getTotalStock() <= 0
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