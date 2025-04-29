"use client";

import { Product } from "@/lib/types";
import Image from "next/image";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => {
        const mainImage = product.images[0]?.url; // <-- sacamos la imagen principal

        return (
          <div
            key={product.id}
            className="border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-zinc-900"
          >
            <div className="relative w-full h-48">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw,
                         (max-width: 1200px) 50vw,
                         25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-zinc-700 text-gray-400">
                  Sin imagen
                </div>
              )}
            </div>

            <div className="p-4">
              <h2 className="text-lg font-semibold">{product.name}</h2>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                {product.description}
              </p>

              <p className="text-base font-bold text-gold">
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                }).format(Number(product.price))}
              </p>

              <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                <p>
                  Categoría:{" "}
                  {product.category?.name ? product.category.name : "Sin categoría"}
                </p>
                <p>Stock: {product.stock}</p>
              </div>

              <button className="mt-3 w-full bg-gold hover:bg-gold/90 text-white py-1.5 rounded-md text-sm font-medium">
                Añadir al carrito
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
