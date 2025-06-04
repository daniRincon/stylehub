"use client"

import { useState } from "react"
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

export default function ProductDetails({ product, averageRating }: ProductDetailsProps) {
  // Función para obtener la URL de imagen optimizada
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "/placeholder.svg?height=400&width=400&text=Sin+imagen"

    // Si es una URL de Vercel Blob, la usamos directamente
    if (imageUrl.includes("blob.vercel-storage.com") || imageUrl.includes("vercel.app")) {
      return imageUrl
    }

    // Si es una URL relativa, la usamos tal como está
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

  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [mainImage, setMainImage] = useState(firstImage)

  const { addItem } = useCart()

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const handleAddToCart = () => {
    const categorySlug = typeof product.category === "string" ? product.category : product.category?.slug

    if (!selectedSize && categorySlug !== "gorras" && categorySlug !== "accesorios") {
      toast.error("Por favor selecciona una talla")
      return
    }

    // Obtener la primera imagen o usar placeholder
    const imageUrl =
      product.images && product.images.length > 0 ? getImageUrl(product.images[0].url) : "/placeholder.svg"

    const cartItem: CartItem = {
      id: selectedSize ? `${product.id}-${selectedSize}` : product.id,
      name: product.name,
      price: product.price,
      image: imageUrl,
      quantity,
      size: selectedSize,
      slug: product.slug,
    }

    addItem(cartItem)
    toast.success(`${product.name} añadido al carrito`)
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

        {/* Selector de tallas (solo para ciertas categorías) */}
        {categorySlug !== "gorras" && categorySlug !== "accesorios" && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">Talla:</h3>
            <div className="flex flex-wrap gap-2">
              {categorySlug === "zapatos"
                ? ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"].map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      className={selectedSize === size ? "bg-dark-green hover:bg-dark-green/90 text-white" : ""}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))
                : ["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      className={selectedSize === size ? "bg-dark-green hover:bg-dark-green/90 text-white" : ""}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
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
            <Button variant="outline" size="icon" onClick={increaseQuantity} disabled={quantity >= product.stock}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            onClick={handleAddToCart}
            className="flex-1 bg-dark-green hover:bg-dark-green/90 text-white"
            disabled={product.stock <= 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock > 0 ? "Añadir al carrito" : "Agotado"}
          </Button>
          <Button variant="outline" size="icon">
            <Heart className="h-4 w-4" />
            <span className="sr-only">Añadir a favoritos</span>
          </Button>
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          {product.stock > 0 ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-500" />
              <span>Disponible: {product.stock} en stock</span>
            </>
          ) : (
            <>
              <X className="h-4 w-4 mr-2 text-red-500" />
              <span>Agotado</span>
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
