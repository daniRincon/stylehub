"use client"

import Link from "next/link"
import { useState } from "react"
import { ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/hooks/use-cart"
import type { Product } from "@/lib/types"

// Productos destacados de ejemplo
const featuredProducts: Product[] = [
  {
    id: "1",
    name: "Camisa Casual",
    price: 29.99,
    category: "camisas",
    image: "/placeholder.svg?height=400&width=300",
    description: "Camisa casual de algodón para uso diario.",
    stock: 25,
    slug: "camisa-casual",
  },
  {
    id: "2",
    name: "Pantalón Slim Fit",
    price: 49.99,
    category: "pantalones",
    image: "/placeholder.svg?height=400&width=300",
    description: "Pantalón slim fit de alta calidad.",
    stock: 15,
    slug: "pantalon-slim-fit",
  },
  {
    id: "3",
    name: "Short Deportivo",
    price: 24.99,
    category: "shorts",
    image: "/placeholder.svg?height=400&width=300",
    description: "Short deportivo cómodo y ligero.",
    stock: 30,
    slug: "short-deportivo",
  },
  {
    id: "4",
    name: "Zapatos Casuales",
    price: 59.99,
    category: "zapatos",
    image: "/placeholder.svg?height=400&width=300",
    description: "Zapatos casuales para uso diario.",
    stock: 10,
    slug: "zapatos-casuales",
  },
]

export default function FeaturedProducts() {
  const { addItem } = useCart()
  const [addedProductId, setAddedProductId] = useState<string | null>(null)

  const handleAddToCart = (product: Product) => {
    addItem(product)
    setAddedProductId(product.id)

    // Borra el mensaje después de 3 segundos
    setTimeout(() => {
      setAddedProductId(null)
    }, 3000)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {featuredProducts.map((product) => (
        <div key={product.id} className="product-card group">
          <div className="relative overflow-hidden">
            <Link href={`/producto/${product.slug}`}>
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              <Button variant="outline" size="icon" className="rounded-full bg-white h-8 w-8">
                <Heart className="h-4 w-4" />
                <span className="sr-only">Añadir a favoritos</span>
              </Button>
            </div>
          </div>

          <div className="p-4">
            <Link href={`/producto/${product.slug}`}>
              <h3 className="font-medium mb-1 hover:text-gold transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="text-lg font-bold text-gold mb-3">${product.price.toFixed(2)}</p>
            <Button
              onClick={() => handleAddToCart(product)}
              className="w-full bg-dark-green hover:bg-dark-green/90 text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Añadir al carrito
            </Button>
            {addedProductId === product.id && (
              <p className="mt-2 text-sm text-dark-green font-medium">
                Producto añadido al carrito
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
