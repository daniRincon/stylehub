"use client";
import StoreHeader from "@/components/store/store-header";
import StoreFooter from "@/components/store/store-footer";
import ProductGrid from "@/components/store/product-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProducts, getCategories } from "@/lib/db";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default async function TiendaPage() {
  const rawProducts = await getProducts();
  const categories = await getCategories();

  // Convertimos price a número seguro y pasamos imagen
  const products = rawProducts.map((product) => ({
    ...product,
    price: Number(product.price) || 0,
    image: product.image, // aseguramos traer la imagen
  }));

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
                      <a
                        href={`/categoria/${cat.slug}`}
                        className="text-sm hover:text-gold capitalize"
                      >
                        {cat.name}
                      </a>
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
                      <input
                        type="checkbox"
                        id={`color-${colorOption.name}`}
                        className="mr-2"
                      />
                      <label
                        htmlFor={`color-${colorOption.name}`}
                        className="flex items-center"
                      >
                        <span
                          className={`inline-block w-4 h-4 rounded-full ${colorOption.color} mr-1`}
                        ></span>
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
  );
}
