"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { formatPrice } from "@/lib/utils"

interface CategoryFiltersProps {
  categorySlug: string
}

export default function CategoryFilters({ categorySlug }: CategoryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Obtener valores de los filtros de la URL
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 1000000
  const sort = searchParams.get("sort") || "featured"

  // Estados locales para los filtros
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice])
  const [selectedSort, setSelectedSort] = useState(sort)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])

  // Efecto para cargar los filtros de la URL
  useEffect(() => {
    const sizes = searchParams.get("sizes")
    if (sizes) {
      setSelectedSizes(sizes.split(","))
    }
  }, [searchParams])

  // Aplicar filtros
  const applyFilters = () => {
    const params = new URLSearchParams()

    // Añadir filtros de precio
    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString())
    }
    if (priceRange[1] < 1000000) {
      params.set("maxPrice", priceRange[1].toString())
    }

    // Añadir filtro de ordenación
    if (selectedSort !== "featured") {
      params.set("sort", selectedSort)
    }

    // Añadir filtro de tallas
    if (selectedSizes.length > 0) {
      params.set("sizes", selectedSizes.join(","))
    }

    // Navegar a la URL con los filtros
    router.push(`/categoria/${categorySlug}?${params.toString()}`)
  }

  // Limpiar filtros
  const clearFilters = () => {
    setPriceRange([0, 1000000])
    setSelectedSort("featured")
    setSelectedSizes([])
    router.push(`/categoria/${categorySlug}`)
  }

  // Manejar cambio de talla
  const handleSizeChange = (size: string) => {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]))
  }

  // Manejar cambio en el rango de precios
  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = Number.parseInt(event.target.value, 10) || 0
    const newRange = [...priceRange] as [number, number]
    newRange[index] = newValue

    // Asegurarse de que min <= max
    if (index === 0 && newRange[0] > newRange[1]) {
      newRange[0] = newRange[1]
    } else if (index === 1 && newRange[1] < newRange[0]) {
      newRange[1] = newRange[0]
    }

    setPriceRange(newRange)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3">Categorías</h3>
        <ul className="space-y-2">
          <li>
            <a
              href="/categoria/camisas"
              className={`text-sm hover:text-gold ${categorySlug === "camisas" ? "text-gold font-medium" : ""}`}
            >
              Camisas
            </a>
          </li>
          <li>
            <a
              href="/categoria/pantalones"
              className={`text-sm hover:text-gold ${categorySlug === "pantalones" ? "text-gold font-medium" : ""}`}
            >
              Pantalones
            </a>
          </li>
          <li>
            <a
              href="/categoria/shorts"
              className={`text-sm hover:text-gold ${categorySlug === "shorts" ? "text-gold font-medium" : ""}`}
            >
              Shorts
            </a>
          </li>
          <li>
            <a
              href="/categoria/zapatos"
              className={`text-sm hover:text-gold ${categorySlug === "zapatos" ? "text-gold font-medium" : ""}`}
            >
              Zapatos
            </a>
          </li>
          <li>
            <a
              href="/categoria/gorras"
              className={`text-sm hover:text-gold ${categorySlug === "gorras" ? "text-gold font-medium" : ""}`}
            >
              Gorras
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-medium mb-3">Precio</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="space-y-1 flex-1">
              <Label htmlFor="min-price">Mínimo</Label>
              <input
                id="min-price"
                type="number"
                min="0"
                max={priceRange[1]}
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(e, 0)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-1 flex-1">
              <Label htmlFor="max-price">Máximo</Label>
              <input
                id="max-price"
                type="number"
                min={priceRange[0]}
                max="1000000"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e, 1)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{formatPrice(priceRange[0])}</span>
            <span className="text-sm">{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Tallas</h3>
        <div className="grid grid-cols-2 gap-2">
          {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`size-${size}`}
                checked={selectedSizes.includes(size)}
                onChange={() => handleSizeChange(size)}
                className="rounded text-gold focus:ring-gold"
              />
              <Label htmlFor={`size-${size}`} className="text-sm">
                {size}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Ordenar por</h3>
        <div className="space-y-2">
          {[
            { value: "featured", label: "Destacados" },
            { value: "price-asc", label: "Precio: Menor a Mayor" },
            { value: "price-desc", label: "Precio: Mayor a Menor" },
            { value: "newest", label: "Más Recientes" },
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`sort-${option.value}`}
                name="sort"
                value={option.value}
                checked={selectedSort === option.value}
                onChange={() => setSelectedSort(option.value)}
                className="text-gold focus:ring-gold"
              />
              <Label htmlFor={`sort-${option.value}`} className="text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-4">
        <Button onClick={applyFilters} className="w-full bg-gold hover:bg-gold/90 text-white">
          Aplicar Filtros
        </Button>
        <Button onClick={clearFilters} variant="outline" className="w-full">
          Limpiar Filtros
        </Button>
      </div>
    </div>
  )
}
