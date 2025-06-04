"use client"

import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/hooks/use-cart"
import type { CartItem } from "@/lib/hooks/use-cart"
import { toast } from "sonner"

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { addItem } = useCart()

  const handleAddToCart = (product: Product) => {
    // Obtener la primera imagen o usar placeholder
    const imageUrl = product.images && product.images.length > 0 ? product.images[0].url : "/placeholder.svg"

    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: imageUrl,
      quantity: 1,
      slug: product.slug,
    }

    addItem(cartItem)
    toast.success(`${product.name} añadido al carrito`)
  }

  // Función para obtener la URL de imagen optimizada
  const getImageUrl = (product: Product) => {
    if (product.images && product.images.length > 0) {
      const imageUrl = product.images[0].url
      // Si es una URL de Vercel Blob, la usamos directamente
      if (imageUrl.includes("blob.vercel-storage.com") || imageUrl.includes("vercel.app")) {
        return imageUrl
      }
      // Si es una URL relativa, la convertimos a absoluta
      if (imageUrl.startsWith("/")) {
        return imageUrl
      }
      return imageUrl
    }
    return "/placeholder.svg?height=200&width=200&text=Sin+imagen"
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => {
        const mainImage = getImageUrl(product)

        return (
          <div
            key={product.id}
            className="border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow"
          >
            <div className="relative w-full h-48">
              <Link href={`/producto/${product.slug}`}>
                <Image
                  src={mainImage || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  unoptimized={mainImage.includes("blob.vercel-storage.com")}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=200&width=200&text=Error+cargando+imagen"
                  }}
                />
              </Link>
            </div>

            <div className="p-4">
              <Link href={`/producto/${product.slug}`}>
                <h2 className="text-lg font-semibold hover:text-gold transition-colors">{product.name}</h2>
              </Link>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2 line-clamp-2">{product.description}</p>

              <p className="text-base font-bold text-gold mb-2">{formatPrice(product.price)}</p>

              <div className="text-sm text-zinc-600 dark:text-zinc-300 mb-3">
                <p>
                  Categoría:{" "}
                  {typeof product.category === "string" ? product.category : product.category?.name || "Sin categoría"}
                </p>
                <p>Stock: {product.stock}</p>
              </div>

              <Button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-dark-green hover:bg-dark-green/90 text-white"
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.stock > 0 ? "Añadir al carrito" : "Agotado"}
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
