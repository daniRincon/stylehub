"use client"

import { useParams } from "next/navigation"
import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"
import ProductGrid from "@/components/store/product-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const currencyCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
})

const categories = {
  camisas: {
    name: "Camisas",
    description: "Encuentra las mejores camisas para cualquier ocasión.",
  },
  pantalones: {
    name: "Pantalones",
    description: "Descubre nuestra colección de pantalones de alta calidad.",
  },
  shorts: {
    name: "Shorts",
    description: "Shorts cómodos y modernos para tu día a día.",
  },
  zapatos: {
    name: "Zapatos",
    description: "Calzado de calidad para complementar tu estilo.",
  },
  gorras: {
    name: "Gorras",
    description: "Gorras deportivas y casuales para cualquier ocasión.",
  },
}

export default function CategoryPage() {
  const params = useParams()
  const { slug } = params

  const category = categories[slug as keyof typeof categories] || {
    name: "Categoría",
    description: "Productos de esta categoría.",
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar filters */}
            <div className="w-full md:w-64 space-y-6">
              <div>
                <h3 className="font-medium mb-3">Categorías</h3>
                <ul className="space-y-2">
                  {Object.entries(categories).map(([key, value]) => (
                    <li key={key}>
                      <a href={`/categoria/${key}`} className="text-sm hover:text-gold">
                        {value.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-3">Precio (COP)</h3>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder={currencyCOP.format(0)} className="w-24" />
                  <span>-</span>
                  <Input type="number" placeholder={currencyCOP.format(100000)} className="w-24" />
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
                <h2 className="text-xl font-medium">Productos</h2>
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

              <ProductGrid />
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
