"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"
import ProductGrid from "@/components/store/product-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, X } from "lucide-react"
import type { Product, Category } from "@/lib/types"

interface ProductFilters {
  search?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  sizes?: string[]
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export default function TiendaPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalProducts, setTotalProducts] = useState(0)

  // Filtros
  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get("search") || "",
    categoryId: "",
    minPrice: undefined,
    maxPrice: undefined,
    sizes: [],
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  const [tempFilters, setTempFilters] = useState({
    minPrice: "",
    maxPrice: "",
    search: filters.search || "",
  })

  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"]

  const fetchData = async (currentFilters: ProductFilters) => {
    try {
      setLoading(true)

      // Construir query params
      const params = new URLSearchParams()
      if (currentFilters.search) params.append("search", currentFilters.search)
      if (currentFilters.categoryId) params.append("categoryId", currentFilters.categoryId)
      if (currentFilters.minPrice) params.append("minPrice", currentFilters.minPrice.toString())
      if (currentFilters.maxPrice) params.append("maxPrice", currentFilters.maxPrice.toString())
      if (currentFilters.sortBy) params.append("sortBy", currentFilters.sortBy)
      if (currentFilters.sortOrder) params.append("sortOrder", currentFilters.sortOrder)
      params.append("limit", "20")

      // Fetch products and categories in parallel
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/products?${params.toString()}`),
        fetch("/api/categories"),
      ])

      if (!productsResponse.ok || !categoriesResponse.ok) {
        throw new Error("Error al cargar los datos")
      }

      const [productsData, categoriesData] = await Promise.all([productsResponse.json(), categoriesResponse.json()])

      // Adaptar estructura de productos
      const adaptedProducts = (productsData.products || productsData).map((product: any) => ({
        ...product,
        price: Number(product.price) || 0,
        stock: product.totalStock || product.stock || 0,
        images: product.images || [],
      }))

      setProducts(adaptedProducts)
      setCategories(categoriesData.categories || categoriesData)
      setTotalProducts(productsData.pagination?.total || adaptedProducts.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(filters)
  }, [])

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    fetchData(updatedFilters)
  }

  const handlePriceFilter = () => {
    const minPrice = tempFilters.minPrice ? Number(tempFilters.minPrice) : undefined
    const maxPrice = tempFilters.maxPrice ? Number(tempFilters.maxPrice) : undefined

    handleFilterChange({ minPrice, maxPrice })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleFilterChange({ search: tempFilters.search })
  }

  const handleSizeToggle = (size: string) => {
    const currentSizes = filters.sizes || []
    const newSizes = currentSizes.includes(size) ? currentSizes.filter((s) => s !== size) : [...currentSizes, size]

    handleFilterChange({ sizes: newSizes })
  }

  const clearFilters = () => {
    const clearedFilters: ProductFilters = {
      search: "",
      categoryId: "",
      minPrice: undefined,
      maxPrice: undefined,
      sizes: [],
      sortBy: "createdAt",
      sortOrder: "desc",
    }
    setFilters(clearedFilters)
    setTempFilters({ minPrice: "", maxPrice: "", search: "" })
    fetchData(clearedFilters)
  }

  const hasActiveFilters =
    filters.search ||
    filters.categoryId ||
    filters.minPrice ||
    filters.maxPrice ||
    (filters.sizes && filters.sizes.length > 0)

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
            <Button onClick={() => fetchData(filters)} className="bg-gold hover:bg-gold/90 text-white">
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
          {/* Búsqueda móvil */}
          <div className="lg:hidden mb-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                value={tempFilters.search}
                onChange={(e) => setTempFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="pl-10 pr-4 w-full"
              />
            </form>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar filters */}
            <div className="w-full md:w-64 space-y-6">
              {/* Filtros activos */}
              {hasActiveFilters && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">Filtros activos</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Limpiar
                    </Button>
                  </div>
                  <div className="text-xs text-gray-600">
                    {totalProducts} producto{totalProducts !== 1 ? "s" : ""} encontrado{totalProducts !== 1 ? "s" : ""}
                  </div>
                </div>
              )}

              {/* Categorías */}
              <div>
                <h3 className="font-medium mb-3">Categorías</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => handleFilterChange({ categoryId: "" })}
                      className={`text-sm transition-colors w-full text-left ${
                        !filters.categoryId ? "text-gold font-medium" : "hover:text-gold"
                      }`}
                    >
                      Todas las categorías
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => handleFilterChange({ categoryId: cat.id })}
                        className={`text-sm transition-colors w-full text-left capitalize ${
                          filters.categoryId === cat.id ? "text-gold font-medium" : "hover:text-gold"
                        }`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Precio */}
              <div>
                <h3 className="font-medium mb-3">Precio</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={tempFilters.minPrice}
                      onChange={(e) => setTempFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
                      className="w-20 text-sm"
                    />
                    <span className="text-sm">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={tempFilters.maxPrice}
                      onChange={(e) => setTempFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
                      className="w-20 text-sm"
                    />
                  </div>
                  <Button size="sm" onClick={handlePriceFilter} className="w-full bg-gold hover:bg-gold/90 text-white">
                    Aplicar
                  </Button>
                </div>
              </div>

              {/* Tallas */}
              <div>
                <h3 className="font-medium mb-3">Tallas</h3>
                <div className="grid grid-cols-3 gap-2">
                  {availableSizes.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={`size-${size}`}
                        checked={filters.sizes?.includes(size) || false}
                        onCheckedChange={() => handleSizeToggle(size)}
                      />
                      <label
                        htmlFor={`size-${size}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {size}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product grid */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-bold">
                    {filters.categoryId
                      ? categories.find((c) => c.id === filters.categoryId)?.name || "Productos"
                      : "Todos los Productos"}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {totalProducts} producto{totalProducts !== 1 ? "s" : ""} disponible{totalProducts !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm">Ordenar por:</span>
                  <Select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onValueChange={(value) => {
                      const [sortBy, sortOrder] = value.split("-") as [string, "asc" | "desc"]
                      handleFilterChange({ sortBy, sortOrder })
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt-desc">Más Recientes</SelectItem>
                      <SelectItem value="createdAt-asc">Más Antiguos</SelectItem>
                      <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                      <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                      <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
                      <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {products.length > 0 ? (
                <ProductGrid products={products} />
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Filter className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
                  <p className="text-gray-600 mb-4">Intenta ajustar los filtros o buscar algo diferente</p>
                  {hasActiveFilters && (
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="border-gold text-gold hover:bg-gold hover:text-white"
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
