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
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || "/placeholder.svg",
      quantity: 1,
    }

    addItem(cartItem)
    toast.success(`${product.name} añadido al carrito`)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => {
        const mainImage = product.images?.[0]?.url

        return (
          <div
            key={product.id}
            className="border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow"
          >
            <div className="relative w-full h-48">
              {mainImage ? (
                <Link href={`/producto/${product.slug}`}>
                  <Image
                    src={mainImage || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    loader={({ src }) => src}
                  />
                </Link>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-zinc-700 text-gray-400">
                  Sin imagen
                </div>
              )}
            </div>

            <div className="p-4">
              <Link href={`/producto/${product.slug}`}>
                <h2 className="text-lg font-semibold hover:text-gold transition-colors">{product.name}</h2>
              </Link>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2 line-clamp-2">{product.description}</p>

              <p className="text-base font-bold text-gold mb-2">{formatPrice(product.price)}</p>

              <div className="text-sm text-zinc-600 dark:text-zinc-300 mb-3">
                <p>Categoría: {product.category?.name ? product.category.name : "Sin categoría"}</p>
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
