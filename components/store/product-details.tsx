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
  size: string | null
  stock: number
}

export default function ProductDetails({ product, averageRating }: ProductDetailsProps) {
  // Estados
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [mainImage, setMainImage] = useState("")
  const [sizeStocks, setSizeStocks] = useState<SizeStock[]>([])
  const [availableStock, setAvailableStock] = useState(0)

  const { addItem } = useCart()

  // Debug logs
  console.log("ProductDetails - Product:", product)
  console.log("ProductDetails - Product ID:", product.id)
  console.log("ProductDetails - Product stock:", product.stock)

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

  // Inicializar imagen principal
  useEffect(() => {
    const firstImage =
      product.images && product.images.length > 0
        ? getImageUrl(product.images[0].url)
        : "/placeholder.svg?height=400&width=400&text=Sin+imagen"
    setMainImage(firstImage)
  }, [product.images])

  // Obtener stock del producto
  useEffect(() => {
    const fetchStock = async () => {
      try {
        console.log("Fetching stock for product:", product.id)
        const response = await fetch(`/api/products/${product.id}/stock`)
        if (response.ok) {
          const stockData = await response.json()
          console.log("Stock data received:", stockData)
          setSizeStocks(stockData.sizes || [])

          // Si no hay tallas, usar el stock general
          if (!stockData.hasSizes) {
            const totalStock = stockData.totalStock || product.stock || 0
            console.log("Product without sizes, using total stock:", totalStock)
            setAvailableStock(totalStock)
          }
        } else {
          console.error("Failed to fetch stock, using fallback")
          // Fallback al stock del producto
          const fallbackStock = product.stock || 0
          setAvailableStock(fallbackStock)
          setSizeStocks([{ size: null, stock: fallbackStock }])
        }
      } catch (error) {
        console.error("Error fetching stock:", error)
        const fallbackStock = product.stock || 0
        setAvailableStock(fallbackStock)
        setSizeStocks([{ size: null, stock: fallbackStock }])
      }
    }

    if (product.id) {
      fetchStock()
    }
  }, [product.id, product.stock])

  // Actualizar stock disponible cuando cambie la talla seleccionada
  useEffect(() => {
    console.log("Size stocks:", sizeStocks)
    console.log("Selected size:", selectedSize)

    if (sizeStocks.length > 0) {
      if (selectedSize) {
        const sizeStock = sizeStocks.find((s) => s.size === selectedSize)
        const stock = sizeStock?.stock || 0
        console.log("Stock for selected size:", stock)
        setAvailableStock(stock)
      } else if (sizeStocks.length === 1 && sizeStocks[0].size === null) {
        // Producto sin tallas
        const stock = sizeStocks[0].stock
        console.log("Stock for product without sizes:", stock)
        setAvailableStock(stock)
      } else {
        // Si hay tallas pero no se ha seleccionado ninguna
        console.log("Has sizes but none selected, setting stock to 0")
        setAvailableStock(0)
      }
    }
  }, [selectedSize, sizeStocks])

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    if (quantity < availableStock) {
      setQuantity(quantity + 1)
    }
  }

  const handleAddToCart = () => {
    console.log("handleAddToCart called")
    console.log("Product ID:", product.id)
    console.log("Available stock:", availableStock)
    console.log("Selected size:", selectedSize)

    const categorySlug = typeof product.category === "string" ? product.category : product.category?.slug

    // Verificar si necesita talla
    const needsSize = categorySlug !== "gorras" && categorySlug !== "accesorios"
    const hasSizes = sizeStocks.some((s) => s.size !== null)

    console.log("Category slug:", categorySlug)
    console.log("Needs size:", needsSize)
    console.log("Has sizes:", hasSizes)

    if (needsSize && hasSizes && !selectedSize) {
      toast.error("Por favor selecciona una talla")
      return
    }

    if (availableStock <= 0) {
      toast.error("Producto sin stock disponible")
      return
    }

    if (!product.id) {
      toast.error("Error: ID del producto no válido")
      return
    }

    const imageUrl =
      product.images && product.images.length > 0 ? getImageUrl(product.images[0].url) : "/placeholder.svg"

    // Crear ID único para el carrito
    const cartItemId = selectedSize ? `${product.id}-${selectedSize}` : product.id

    const cartItem: CartItem = {
      id: cartItemId,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: imageUrl,
      quantity,
      size: selectedSize,
      stock: availableStock,
    }

    console.log("Cart item to add:", cartItem)

    addItem(cartItem)
    toast.success(`${product.name} añadido al carrito`)
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
  const hasSizes = sizeStocks.some((s) => s.size !== null)

  console.log("Available stock for display:", availableStock)

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

          {/* Placeholders para imágenes faltantes */}
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
        <div className="mb-4 p-2 bg-gray-50 border rounded text-xs">
          <p>
            <strong>Debug:</strong>
          </p>
          <p>Product ID: {product.id}</p>
          <p>Has sizes: {hasSizes ? "Sí" : "No"}</p>
          <p>Available stock: {availableStock}</p>
          <p>Selected size: {selectedSize || "Ninguna"}</p>
        </div>

        {/* Selector de tallas */}
        {hasSizes && categorySlug !== "gorras" && categorySlug !== "accesorios" && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">Talla:</h3>
            <div className="flex flex-wrap gap-2">
              {sizeStocks
                .filter((s) => s.size !== null)
                .map((sizeStock) => (
                  <Button
                    key={sizeStock.size}
                    variant={selectedSize === sizeStock.size ? "default" : "outline"}
                    className={selectedSize === sizeStock.size ? "bg-dark-green hover:bg-dark-green/90 text-white" : ""}
                    onClick={() => setSelectedSize(sizeStock.size)}
                    disabled={sizeStock.stock === 0}
                  >
                    {sizeStock.size} {sizeStock.stock === 0 && "(Agotado)"}
                  </Button>
                ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-medium mb-2">Cantidad:</h3>
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={decreaseQuantity} disabled={quantity <= 1}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="mx-4 w-8 text-center">{quantity}</span>
            <Button variant="outline" size="icon" onClick={increaseQuantity} disabled={quantity >= availableStock}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            onClick={handleAddToCart}
            className="flex-1 bg-dark-green hover:bg-dark-green/90 text-white"
            disabled={availableStock <= 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {availableStock > 0 ? "Añadir al carrito" : "Agotado"}
          </Button>
          <Button variant="outline" size="icon">
            <Heart className="h-4 w-4" />
            <span className="sr-only">Añadir a favoritos</span>
          </Button>
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          {availableStock > 0 ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-500" />
              <span>
                Disponible: {availableStock} en stock
                {selectedSize && ` (Talla ${selectedSize})`}
              </span>
            </>
          ) : (
            <>
              <X className="h-4 w-4 mr-2 text-red-500" />
              <span>Agotado{selectedSize && ` (Talla ${selectedSize})`}</span>
            </>
          )}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>Categoría: {getCategoryName()}</p>
        </div>
      </div>
    </div>
  )
}
