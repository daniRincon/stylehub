"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { ShoppingCart, Heart, Minus, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useCart } from "@/lib/hooks/use-cart"
import type { Product } from "@/lib/types"
import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Aquí se asume que ya tienes una función para obtener productos desde la base de datos
import { getProductBySlug } from "@/lib/api/products" // Función que deberías crear en tu API

// Función para formatear precios en COP
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
  }).format(price);
};

export default function ProductPage() {
  const params = useParams()
  const { slug } = params

  // Aquí cargamos el producto desde la base de datos
  const [product, setProduct] = useState<Product | null>(null)

  // Simulando una carga de datos (deberías hacerlo con una llamada real)
  useEffect(() => {
    const loadProduct = async () => {
      const data = await getProductBySlug(slug) // Obtener el producto por slug
      setProduct(data)
    }

    loadProduct()
  }, [slug])

  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const { addItem } = useCart()

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
            <p>Lo sentimos, el producto que estás buscando no existe.</p>
            <Button className="mt-4 bg-gold hover:bg-gold/90 text-white" asChild>
              <a href="/tienda">Volver a la tienda</a>
            </Button>
          </div>
        </main>
        <StoreFooter />
      </div>
    )
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Selecciona una talla",
        description: "Por favor selecciona una talla antes de añadir al carrito.",
        variant: "destructive",
      })
      return
    }

    addItem({ ...product, id: `${product.id}-${selectedSize}` })

    toast({
      title: "Producto añadido",
      description: `${product.name} (Talla: ${selectedSize}) ha sido añadido al carrito.`,
    })
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg border">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-lg border cursor-pointer">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={`${product.name} - Vista ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-2xl font-bold text-gold mb-4">{formatPrice(product.price)}</p>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Descripción:</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Talla:</h3>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      className={selectedSize === size ? "bg-dark-green hover:bg-dark-green/90 text-white" : ""}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Cantidad:</h3>
                <div className="flex items-center">
                  <Button variant="outline" size="icon" onClick={decreaseQuantity} disabled={quantity <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-4 w-8 text-center">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={increaseQuantity} disabled={quantity >= product.stock}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                <Button onClick={handleAddToCart} className="flex-1 bg-dark-green hover:bg-dark-green/90 text-white">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Añadir al carrito
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                  <span className="sr-only">Añadir a favoritos</span>
                </Button>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span>Disponible: {product.stock} en stock</span>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <Tabs defaultValue="description">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Descripción</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="reviews">Reseñas</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="p-4">
                <p>{product.description}</p>
              </TabsContent>
              <TabsContent value="details" className="p-4">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Material: Algodón 100%</li>
                  <li>Ajuste: Regular</li>
                  <li>Cuidado: Lavado a máquina</li>
                  <li>Origen: Importado</li>
                  <li>Modelo: 183cm, usa talla M</li>
                </ul>
              </TabsContent>
              <TabsContent value="reviews" className="p-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center mb-1">
                      <div className="font-medium">Juan Pérez</div>
                      <div className="ml-auto text-sm text-muted-foreground">Hace 2 días</div>
                    </div>
                    <div className="flex text-gold mb-1">{"★".repeat(5)}</div>
                    <p>Excelente producto, muy buena calidad y el envío fue rápido.</p>
                  </div>

                  <div>
                    <div className="flex items-center mb-1">
                      <div className="font-medium">María García</div>
                      <div className="ml-auto text-sm text-muted-foreground">Hace 1 semana</div>
                    </div>
                    <div className="flex text-gold mb-1">{"★".repeat(4)}</div>
                    <p>Me encantó el producto, pero la talla me quedó un poco grande.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
