"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Suspense } from "react"
import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"
import CategoryProductGrid from "@/components/store/category-product-grid"
import CategoryFilters from "@/components/store/category-filters"
import type { Category } from "@/lib/types"

export default function CategoryPage() {
  const params = useParams()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/categories/${params.slug}`)

        if (!response.ok) {
          throw new Error("Categoría no encontrada")
        }

        const data = await response.json()
        setCategory(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar la categoría")
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchCategory()
    }
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando categoría...</p>
          </div>
        </main>
        <StoreFooter />
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Categoría no encontrada</h1>
            <p className="text-gray-600 mb-8">{error || "La categoría que buscas no existe."}</p>
            <a href="/tienda" className="bg-gold hover:bg-gold/90 text-white px-6 py-3 rounded-lg transition-colors">
              Volver a la tienda
            </a>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
            <p className="text-muted-foreground">
              {category.description || `Explora nuestra colección de ${category.name.toLowerCase()}`}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar con filtros */}
            <div className="w-full md:w-64">
              <Suspense fallback={<FiltersSkeleton />}>
                <CategoryFilters categorySlug={params.slug as string} />
              </Suspense>
            </div>

            {/* Grid de productos */}
            <div className="flex-1">
              <Suspense fallback={<ProductGridSkeleton />}>
                <CategoryProductGrid categorySlug={params.slug as string} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}

function FiltersSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-6 w-24 mb-3 bg-gray-200 animate-pulse rounded"></div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-5 w-full bg-gray-200 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
      <div>
        <div className="h-6 w-24 mb-3 bg-gray-200 animate-pulse rounded"></div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-9 w-4 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-9 w-20 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-9 w-16 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="h-7 w-32 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <div className="h-64 w-full bg-gray-200 animate-pulse"></div>
            <div className="p-4 space-y-3">
              <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-5 w-1/4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
