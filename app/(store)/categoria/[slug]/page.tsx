import { Suspense } from "react"
import { notFound } from "next/navigation"
import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"
import CategoryProductGrid from "@/components/store/category-product-grid"
import CategoryFilters from "@/components/store/category-filters"
import prisma from "@/lib/prisma"

// Función para obtener datos de la categoría
async function getCategoryData(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      categoryImages: true,
    },
  })

  if (!category) {
    return null
  }

  return category
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  // Extraer el slug de los parámetros primero
  const { slug } = params

  // Ahora usar el slug extraído
  const category = await getCategoryData(slug)

  if (!category) {
    notFound()
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
                <CategoryFilters categorySlug={slug} />
              </Suspense>
            </div>

            {/* Grid de productos */}
            <div className="flex-1">
              <Suspense fallback={<ProductGridSkeleton />}>
                <CategoryProductGrid categorySlug={slug} />
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
        <div className="h-6 w-24 mb-3 bg-gray-200 animate-pulse"></div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-5 w-full bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      </div>
      <div>
        <div className="h-6 w-24 mb-3 bg-gray-200 animate-pulse"></div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 bg-gray-200 animate-pulse"></div>
          <div className="h-9 w-4 bg-gray-200 animate-pulse"></div>
          <div className="h-9 w-20 bg-gray-200 animate-pulse"></div>
          <div className="h-9 w-16 bg-gray-200 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="h-7 w-32 bg-gray-200 animate-pulse"></div>
        <div className="h-10 w-48 bg-gray-200 animate-pulse"></div>
      </div>
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
    </div>
  )
}
