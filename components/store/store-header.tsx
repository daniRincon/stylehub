"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, ShoppingCart, User, Menu, Heart, LogOut, Settings, Package, UserCircle } from "lucide-react"
import { useCart } from "@/lib/hooks/use-cart"
import { toast } from "sonner"

export default function StoreHeader() {
  const { data: session, status } = useSession()
  const { items } = useCart()
  const [searchQuery, setSearchQuery] = useState("")

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleLogout = async () => {
    try {
      await signOut({
        redirect: true,
        callbackUrl: "/",
      })
      toast.success("Sesión cerrada exitosamente")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast.error("Error al cerrar sesión")
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/tienda?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gold rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">SH</span>
            </div>
            <span className="font-bold text-xl text-dark-gray">StyleHub</span>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-dark-gray hover:text-gold transition-colors">
              Inicio
            </Link>
            <Link href="/tienda" className="text-dark-gray hover:text-gold transition-colors">
              Tienda
            </Link>
            <Link href="/categoria/ropa" className="text-dark-gray hover:text-gold transition-colors">
              Ropa
            </Link>
            <Link href="/categoria/accesorios" className="text-dark-gray hover:text-gold transition-colors">
              Accesorios
            </Link>
            <Link href="/contacto" className="text-dark-gray hover:text-gold transition-colors">
              Contacto
            </Link>
          </nav>

          {/* Barra de búsqueda */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full"
              />
            </form>
          </div>

          {/* Acciones del usuario */}
          <div className="flex items-center space-x-4">
            {/* Carrito */}
            <Link href="/carrito" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-gold text-white text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Usuario */}
            {status === "loading" ? (
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <UserCircle className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/cuenta" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Mi cuenta
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/cuenta/pedidos" className="flex items-center">
                      <Package className="mr-2 h-4 w-4" />
                      Mis pedidos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/cuenta/lista-deseos" className="flex items-center">
                      <Heart className="mr-2 h-4 w-4" />
                      Lista de deseos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/cuenta/seguridad" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild className="bg-gold hover:bg-gold/90">
                  <Link href="/registro">Registrarse</Link>
                </Button>
              </div>
            )}

            {/* Menú móvil */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4">
                  <Link href="/" className="text-lg font-medium">
                    Inicio
                  </Link>
                  <Link href="/tienda" className="text-lg font-medium">
                    Tienda
                  </Link>
                  <Link href="/categoria/ropa" className="text-lg font-medium">
                    Ropa
                  </Link>
                  <Link href="/categoria/accesorios" className="text-lg font-medium">
                    Accesorios
                  </Link>
                  <Link href="/contacto" className="text-lg font-medium">
                    Contacto
                  </Link>

                  {session?.user ? (
                    <>
                      <hr className="my-4" />
                      <Link href="/cuenta" className="text-lg font-medium">
                        Mi cuenta
                      </Link>
                      <Link href="/cuenta/pedidos" className="text-lg font-medium">
                        Mis pedidos
                      </Link>
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="justify-start text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesión
                      </Button>
                    </>
                  ) : (
                    <>
                      <hr className="my-4" />
                      <Button variant="outline" asChild>
                        <Link href="/login">Iniciar sesión</Link>
                      </Button>
                      <Button asChild className="bg-gold hover:bg-gold/90">
                        <Link href="/registro">Registrarse</Link>
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
