"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useCart } from "@/lib/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  id: string
  name: string
  price: number
  slug: string
  images: { url: string }[]
  stock: number
}

interface CategoryProductGridProps {
  categorySlug: string
}

export default function CategoryProductGrid({ categorySlug }: CategoryProductGridProps) {
  const searchParams = useSearchParams()
  const { addItem } = useCart()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortValue, setSortValue] = useState(searchParams.get("sort") || "featured")

  // Obtener productos de la categoría
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        // Construir la URL con los parámetros de consulta
        const url = `/api/categories/${categorySlug}/products?`

        // Añadir parámetros de filtro si existen
        const params = new URLSearchParams(searchParams.toString())

        const response = await fetch(url + params.toString())

        if (!response.ok) {
          throw new Error("Error al cargar productos")
        }

        const data = await response.json()
        setProducts(data.products)
      } catch (error) {
        console.error("Error al cargar productos:", error)
        toast.error("No se pudieron cargar los productos")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categorySlug, searchParams])

  // Manejar cambio de ordenación
  const handleSortChange = (value: string) => {
    setSortValue(value)

    // Actualizar la URL con el nuevo valor de ordenación
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", value)

    // Actualizar la URL sin recargar la página
    window.history.pushState({}, "", `?${params.toString()}`)
  }

  // Manejar añadir al carrito
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

  // Mostrar skeleton mientras carga
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <div className="h-64 w-full bg-gray-200 animate-pulse"></div>
            <div className="p-4 space-y-3">
              <div className="h-6 w-3/4 bg-gray-200 animate-pulse"></div>
              <div className="h-5 w-1/4 bg-gray-200 animate-pulse"></div>
              <div className="h-10 w-full bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">{products.length} productos encontrados</p>
        <Select value={sortValue} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Destacados</SelectItem>
            <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
            <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
            <SelectItem value="newest">Más Recientes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <Button variant="outline" size="icon" className="rounded-full bg-white h-8 w-8">
                    <Heart className="h-4 w-4" />
                    <span className="sr-only">Añadir a favoritos</span>
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <Link href={`/producto/${product.slug}`}>
                  <h3 className="font-medium mb-1 hover:text-gold transition-colors">{product.name}</h3>
                </Link>
                <p className="text-lg font-bold text-gold mb-3">{formatPrice(product.price)}</p>
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
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No se encontraron productos en esta categoría</p>
          <Button asChild className="mt-4 bg-gold hover:bg-gold/90 text-white">
            <Link href="/tienda">Ver todos los productos</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
