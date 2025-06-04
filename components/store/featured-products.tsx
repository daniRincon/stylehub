"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/lib/types"
import type { CartItem } from "@/lib/hooks/use-cart"
import { toast } from "sonner"

export default function FeaturedProducts() {
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addedProductId, setAddedProductId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products?limit=4&sort=createdAt&order=desc")
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()

        // Manejar tanto la estructura nueva como la anterior
        const productsArray = data.products || data.data || []
        setProducts(productsArray)

        console.log("Productos cargados:", productsArray)
      } catch (error: any) {
        console.error("Error cargando productos:", error)
        setError("Hubo un error al cargar los productos. Intenta nuevamente más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Función para obtener la primera imagen del producto
  const getProductImage = (product: Product) => {
    // Nuevo formato: array de strings
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Si es un array de strings
      if (typeof product.images[0] === "string") {
        return product.images[0]
      }
      // Si es un array de objetos (formato anterior)
      if (typeof product.images[0] === "object" && product.images[0]?.url) {
        return product.images[0].url
      }
    }
    return "/placeholder.svg?height=400&width=400"
  }

  const handleAddToCart = (product: Product) => {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: getProductImage(product),
      quantity: 1,
    }

    addItem(cartItem)
    setAddedProductId(product.id)

    toast.success(`${product.name} añadido al carrito`)

    setTimeout(() => {
      setAddedProductId(null)
    }, 3000)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reintentar
        </Button>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay productos destacados disponibles</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="product-card group">
          <div className="relative overflow-hidden rounded-lg">
            <Link href={`/producto/${product.slug}`} aria-label={`Ver detalles de ${product.name}`}>
              <Image
                src={getProductImage(product) || "/placeholder.svg"}
                alt={product.name}
                width={400}
                height={400}
                className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=400&width=400"
                }}
              />
            </Link>
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white h-8 w-8 shadow-md hover:shadow-lg transition-shadow"
                aria-label="Añadir a favoritos"
              >
                <Heart className="h-4 w-4" />
                <span className="sr-only">Añadir a favoritos</span>
              </Button>
            </div>

            {/* Badge de género si está disponible */}
            {product.gender && (
              <div className="absolute top-2 left-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    product.gender === "MALE"
                      ? "bg-blue-100 text-blue-800"
                      : product.gender === "FEMALE"
                        ? "bg-pink-100 text-pink-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {product.gender === "MALE" ? "Hombre" : product.gender === "FEMALE" ? "Mujer" : "Unisex"}
                </span>
              </div>
            )}
          </div>

          <div className="p-4">
            <Link href={`/producto/${product.slug}`} aria-label={`Ver detalles de ${product.name}`}>
              <h3 className="font-medium mb-1 hover:text-gold transition-colors line-clamp-2">{product.name}</h3>
            </Link>

            {/* Categoría */}
            {product.category && <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>}

            <p className="text-lg font-bold text-gold mb-3">{formatPrice(product.price)}</p>

            {/* Stock disponible */}
            {product.stock !== undefined && (
              <p
                className={`text-sm mb-3 ${
                  product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-yellow-600" : "text-red-600"
                }`}
              >
                {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
              </p>
            )}

            <Button
              onClick={() => handleAddToCart(product)}
              className="w-full bg-dark-green hover:bg-dark-green/90 text-white disabled:opacity-50"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.stock === 0 ? "Agotado" : "Añadir al carrito"}
            </Button>

            {addedProductId === product.id && (
              <p className="mt-2 text-sm text-dark-green font-medium text-center">✓ Producto añadido al carrito</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
