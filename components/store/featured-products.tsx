"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/hooks/use-cart";
import type { Product } from "@/lib/types";

export default function FeaturedProducts() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products?limit=4&sort=createdAt&order=desc");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setProducts(data.products);
      } catch (error: any) {
        console.error("Error cargando productos:", error);
        setError("Hubo un error al cargar los productos. Intenta nuevamente más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem(product);
    setAddedProductId(product.id);

    setTimeout(() => {
      setAddedProductId(null);
    }, 3000);
  };

  if (loading) {
    return <p className="text-center">Cargando productos...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="product-card group">
          <div className="relative overflow-hidden">
            <Link href={`/producto/${product.slug}`} aria-label={`Ver detalles de ${product.name}`}>
              <Image
                src={product.images?.[0]?.url || "/placeholder.svg"}
                alt={product.name}
                width={400}
                height={400}
                className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                loader={({ src }) => src}
              />
            </Link>
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              <Button variant="outline" size="icon" className="rounded-full bg-white h-8 w-8" aria-label="Añadir a favoritos">
                <Heart className="h-4 w-4" />
                <span className="sr-only">Añadir a favoritos</span>
              </Button>
            </div>
          </div>

          <div className="p-4">
            <Link href={`/producto/${product.slug}`} aria-label={`Ver detalles de ${product.name}`}>
              <h3 className="font-medium mb-1 hover:text-gold transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="text-lg font-bold text-gold mb-3">
              ${(typeof product.price === 'number' ? product.price : Number(product.price)).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
            </p>
            <Button
              onClick={() => handleAddToCart(product)}
              className="w-full bg-dark-green hover:bg-dark-green/90 text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Añadir al carrito
            </Button>
            {addedProductId === product.id && (
              <p className="mt-2 text-sm text-dark-green font-medium">
                Producto añadido al carrito
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}