"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"
import { formatPrice } from "@/lib/utils"
import { useCart } from "@/lib/hooks/use-cart"

interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  slug: string
  category: string
  inStock: boolean
}

export default function ListaDeseosPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const { addItem } = useCart()

  useEffect(() => {
    // Cargar lista de deseos desde localStorage
    const savedWishlist = localStorage.getItem("userWishlist")
    if (savedWishlist) {
      setWishlistItems(JSON.parse(savedWishlist))
    }
  }, [])

  const removeFromWishlist = (id: string) => {
    const updatedWishlist = wishlistItems.filter((item) => item.id !== id)
    setWishlistItems(updatedWishlist)
    localStorage.setItem("userWishlist", JSON.stringify(updatedWishlist))
    toast.success("Producto eliminado de la lista de deseos")
  }

  const addToCart = (item: WishlistItem) => {
    if (!item.inStock) {
      toast.error("Producto agotado")
      return
    }

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    })
    toast.success("Producto agregado al carrito")
  }

  const clearWishlist = () => {
    setWishlistItems([])
    localStorage.removeItem("userWishlist")
    toast.success("Lista de deseos vaciada")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mi Lista de Deseos</h1>
        {wishlistItems.length > 0 && (
          <Button variant="outline" onClick={clearWishlist} className="text-red-500 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Vaciar Lista
          </Button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Tu lista de deseos está vacía</h3>
            <p className="text-muted-foreground mb-4">Guarda tus productos favoritos para comprarlos más tarde</p>
            <Button asChild className="bg-gold hover:bg-gold/90">
              <Link href="/tienda">Explorar Productos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <img
                    src={item.image || "/placeholder.svg?height=200&width=200"}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <span className="text-white font-medium">Agotado</span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium line-clamp-2">{item.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                  <p className="font-bold text-lg">{formatPrice(item.price)}</p>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1 bg-gold hover:bg-gold/90"
                    onClick={() => addToCart(item)}
                    disabled={!item.inStock}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {item.inStock ? "Agregar al Carrito" : "Agotado"}
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/producto/${item.slug}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {wishlistItems.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {wishlistItems.length} {wishlistItems.length === 1 ? "producto" : "productos"} en tu lista de deseos
          </p>
        </div>
      )}
    </div>
  )
}
