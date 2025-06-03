"use client"

import { useEffect, useState } from "react"
import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"
import ProductGrid from "@/components/store/product-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import type { Product, Category } from "@/lib/types"

export default function TiendaPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch products and categories in parallel
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ])

        if (!productsResponse.ok || !categoriesResponse.ok) {
          throw new Error("Error al cargar los datos")
        }

        const [productsData, categoriesData] = await Promise.all([productsResponse.json(), categoriesResponse.json()])

        // Convert price to number and ensure image compatibility
        const adaptedProducts = productsData.map((product: any) => ({
          ...product,
          price: Number(product.price) || 0,
          image: product.images?.[0]?.url || product.image || "/placeholder.svg",
        }))

        setProducts(adaptedProducts)
        setCategories(categoriesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        </main>
        <StoreFooter />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar la tienda</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-gold hover:bg-gold/90 text-white">
              Reintentar
            </Button>
          </div>
        </main>
        <StoreFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar filters */}
            <div className="w-full md:w-64 space-y-6">
              <div>
                <h3 className="font-medium mb-3">Categorías</h3>
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/categoria/${cat.slug}`}
                        className="text-sm hover:text-gold capitalize transition-colors"
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-3">Precio</h3>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="Min" className="w-20" />
                  <span>-</span>
                  <Input type="number" placeholder="Max" className="w-20" />
                  <Button size="sm" className="bg-gold hover:bg-gold/90 text-white">
                    Filtrar
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Tallas</h3>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                    <div key={size} className="flex items-center">
                      <input type="checkbox" id={`size-${size}`} className="mr-2" />
                      <label htmlFor={`size-${size}`} className="text-sm">
                        {size}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Colores</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Negro", color: "bg-black" },
                    { name: "Blanco", color: "bg-white border" },
                    { name: "Rojo", color: "bg-red-500" },
                    { name: "Azul", color: "bg-blue-500" },
                    { name: "Verde", color: "bg-green-500" },
                  ].map((colorOption) => (
                    <div key={colorOption.name} className="flex items-center">
                      <input type="checkbox" id={`color-${colorOption.name}`} className="mr-2" />
                      <label htmlFor={`color-${colorOption.name}`} className="flex items-center">
                        <span className={`inline-block w-4 h-4 rounded-full ${colorOption.color} mr-1`}></span>
                        <span className="text-sm">{colorOption.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Todos los Productos</h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Ordenar por:</span>
                  <Select defaultValue="featured">
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
              </div>

              <ProductGrid products={products} />
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
