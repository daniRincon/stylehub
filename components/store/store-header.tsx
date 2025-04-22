"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ShoppingCart, User, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/hooks/use-cart"

export default function StoreHeader() {
  const pathname = usePathname()
  const { items } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const routes = [
    { name: "Inicio", path: "/" },
    { name: "Tienda", path: "/tienda" },
    { name: "Camisas", path: "/categoria/camisas" },
    { name: "Pantalones", path: "/categoria/pantalones" },
    { name: "Shorts", path: "/categoria/shorts" },
    { name: "Zapatos", path: "/categoria/zapatos" },
    { name: "Gorras", path: "/categoria/gorras" },
    { name: "Contacto", path: "/contacto" },
  ]

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image src="/logoAMRILLO.png" alt="StyleHub" width={70} height={70} />
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`text-sm font-medium transition-colors hover:text-gold ${
                  pathname === route.path ? "text-gold" : "text-dark-gray"
                }`}
              >
                {route.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex relative">
              <Input type="search" placeholder="Buscar productos..." className="w-[200px] pr-8" />
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>

            <Link href="/cuenta">
              <Button variant="ghost" size="icon" className="relative">
                <User className="h-5 w-5" />
                <span className="sr-only">Mi cuenta</span>
              </Button>
            </Link>

            <Link href="/carrito">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Carrito</span>
                {items.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-gold text-white">
                    {items.length}
                  </Badge>
                )}
              </Button>
            </Link>

            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between py-4 border-b">
                    <Link href="/" className="flex items-center">
                      <Image src="/logoAMRILLO.png" alt="StyleHub" width={100} height={32} />
                    </Link>
                  </div>
                  <nav className="flex flex-col space-y-4 py-6">
                    {routes.map((route) => (
                      <Link
                        key={route.path}
                        href={route.path}
                        className={`text-base font-medium transition-colors hover:text-gold ${
                          pathname === route.path ? "text-gold" : "text-dark-gray"
                        }`}
                      >
                        {route.name}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto py-6 border-t">
                    <div className="flex relative mb-4">
                      <Input type="search" placeholder="Buscar productos..." className="w-full pr-8" />
                      <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex space-x-2">
                      <Link href="/cuenta" className="flex-1">
                        <Button variant="outline" className="w-full">
                          <User className="h-4 w-4 mr-2" />
                          Mi cuenta
                        </Button>
                      </Link>
                      <Link href="/carrito" className="flex-1">
                        <Button className="w-full bg-gold hover:bg-gold/90 text-white">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Carrito
                          {items.length > 0 && <Badge className="ml-2 bg-white text-gold">{items.length}</Badge>}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
