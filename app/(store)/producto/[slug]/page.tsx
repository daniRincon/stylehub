// app/tienda/[slug]/page.tsx
"use client"

import { Suspense, useState } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"
import ProductReviews from "@/components/store/product-reviews"
import RelatedProducts from "@/components/store/related-products"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Plus, Minus, Check } from "lucide-react"
import { toast } from "sonner"
import prisma from "@/lib/prisma"
import { useCart } from "@/lib/hooks/use-cart"

// 🔁 Helper para formato de precio en COP
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(price)
}

// 🔁 Obtener datos del producto desde el servidor
async function getProductData(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: true,
      reviews: {
        include: {
          customer: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!product) return null

  return {
    ...product,
    price: Number(product.price),
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductData(params.slug)

  if (!product) return notFound()

  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
      : 0

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Producto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Imágenes */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg border">
                <Image
                  src={product.images[0]?.url || "/placeholder.svg"}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-lg border cursor-pointer">
                    <Image
                      src={img.url || "/placeholder.svg"}
                      alt={`${product.name} vista ${i + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <ClientSideActions product={product} />
          </div>

          {/* Tabs */}
          <div className="mt-12">
            <Tabs defaultValue="description">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Descripción</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="reviews">Reseñas ({product.reviews.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="p-4 whitespace-pre-line">
                {product.description}
              </TabsContent>
              <TabsContent value="details" className="p-4">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Categoría: {typeof product.category === "string" ? product.category : product.category.name}</li>
                  <li>Stock disponible: {product.stock} unidades</li>
                  <li>ID del producto: {product.id}</li>
                </ul>
              </TabsContent>
              <TabsContent value="reviews" className="p-4">
                <Suspense fallback={<ReviewsSkeleton />}>
                  <ProductReviews reviews={product.reviews} productId={product.id} />
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>

          {/* Relacionados */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
            <Suspense fallback={<RelatedProductsSkeleton />}>
              <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
            </Suspense>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}

// ✅ CLIENT SIDE para tallas, cantidad, carrito
function ClientSideActions({ product }: { product: any }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Selecciona una talla")
      return
    }

    addItem({
      ...product,
      id: `${product.id}-${selectedSize}`,
      size: selectedSize,
      quantity,
    })

    toast.success(`${product.name} (Talla: ${selectedSize}) añadido al carrito.`)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
      <p className="text-2xl font-bold text-gold mb-4">{formatPrice(product.price)}</p>

      {/* Tallas */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Talla:</h3>
        <div className="flex flex-wrap gap-2">
          {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
            <Button
              key={size}
              variant={selectedSize === size ? "default" : "outline"}
              className={selectedSize === size ? "bg-dark-green text-white" : ""}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Cantidad */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Cantidad:</h3>
        <div className="flex items-center">
          <Button onClick={() => setQuantity(Math.max(1, quantity - 1))} variant="outline" size="icon">
            <Minus className="h-4 w-4" />
          </Button>
          <span className="mx-4 w-8 text-center">{quantity}</span>
          <Button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4 mb-6">
        <Button onClick={handleAddToCart} className="flex-1 bg-dark-green text-white">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Añadir al carrito
        </Button>
        <Button variant="outline" size="icon">
          <Heart className="h-4 w-4" />
        </Button>
      </div>

      {/* Stock info */}
      <div className="flex items-center text-sm text-muted-foreground">
        <Check className="h-4 w-4 mr-2 text-green-500" />
        Disponible: {product.stock} en stock
      </div>
    </div>
  )
}

// 🌀 Loading components
function ReviewsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border-b pb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="h-6 w-32 bg-gray-200 animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-200 animate-pulse"></div>
          </div>
          <div className="h-4 w-24 mb-2 bg-gray-200 animate-pulse"></div>
          <div className="h-16 w-full bg-gray-200 animate-pulse"></div>
        </div>
      ))}
    </div>
  )
}

function RelatedProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <div className="h-48 w-full bg-gray-200 animate-pulse"></div>
          <div className="p-4 space-y-3">
            <div className="h-5 w-3/4 bg-gray-200 animate-pulse"></div>
            <div className="h-4 w-1/3 bg-gray-200 animate-pulse"></div>
            <div className="h-8 w-full bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
