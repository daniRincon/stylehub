"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"
import type { Product } from "@/lib/types"
import type { CartItem } from "@/lib/hooks/use-cart"

interface RelatedProductsProps {
  categoryId: string
  productId: string
}

export default function RelatedProducts({ categoryId, productId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(`/api/products/related?categoryId=${categoryId}&excludeId=${productId}&limit=4`)
        if (!response.ok) throw new Error("Error al cargar productos relacionados")
        const data = await response.json()
        setProducts(data.products || [])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    if (categoryId && productId) {
      fetchRelatedProducts()
    }
  }, [categoryId, productId])

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

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">Productos Relacionados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 h-72 animate-pulse">
              <div className="bg-gray-200 h-40 rounded-md mb-4"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2 mb-4"></div>
              <div className="bg-gray-200 h-10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">Productos Relacionados</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => {
          // Obtener la primera imagen o usar placeholder
          const mainImage = product.images && product.images.length > 0 ? product.images[0].url : "/placeholder.svg"

          return (
            <div
              key={product.id}
              className="border rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <Link href={`/producto/${product.slug}`}>
                  <Image
                    src={mainImage || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=200&width=200&text=Sin+imagen"
                    }}
                  />
                </Link>
              </div>
              <div className="p-4">
                <Link href={`/producto/${product.slug}`}>
                  <h3 className="font-semibold text-lg mb-1 hover:text-gold transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-gold font-bold mb-3">{formatPrice(product.price)}</p>
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
    </div>
  )
}
