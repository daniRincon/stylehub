"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useCart } from "@/lib/hooks/use-cart"
import { formatPrice } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  slug: string
  images: { url: string }[]
}

interface RelatedProductsProps {
  categoryId: string
  currentProductId: string
}

export default function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(
          `/api/products/related?categoryId=${categoryId}&excludeId=${currentProductId}&limit=4`,
        )

        if (!response.ok) {
          throw new Error("Error al cargar productos relacionados")
        }

        const data = await response.json()
        setProducts(data.products)
      } catch (error) {
        console.error("Error al cargar productos relacionados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [categoryId, currentProductId])

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || "/placeholder.svg",
      quantity: 1,
    })

    toast.success(`${product.name} añadido al carrito`)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <div className="h-48 w-full bg-gray-200 animate-pulse"></div>
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-gray-200 animate-pulse"></div>
              <div className="h-4 w-1/3 bg-gray-200 animate-pulse"></div>
              <div className="h-8 w-full bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return <p className="text-center text-muted-foreground">No hay productos relacionados disponibles.</p>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="product-card group">
          <div className="relative overflow-hidden">
            <Link href={`/producto/${product.slug}`}>
              <img
                src={product.images[0]?.url || "/placeholder.svg"}
                alt={product.name}
                className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          <div className="p-4">
            <Link href={`/producto/${product.slug}`}>
              <h3 className="font-medium mb-1 hover:text-gold transition-colors line-clamp-1">{product.name}</h3>
            </Link>
            <p className="text-lg font-bold text-gold mb-3">{formatPrice(product.price)}</p>
            <Button
              onClick={() => handleAddToCart(product)}
              className="w-full bg-dark-green hover:bg-dark-green/90 text-white"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Añadir
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
