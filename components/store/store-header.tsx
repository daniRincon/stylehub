"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart, Menu, X, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/hooks/use-cart"

export default function StoreHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { items } = useCart()

  useEffect(() => {
    setMounted(true)
  }, [])

  const itemCount = mounted ? items.reduce((total, item) => total + item.quantity, 0) : 0

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Tienda", href: "/tienda" },
    { name: "Camisas", href: "/categoria/camisas" },
    { name: "Pantalones", href: "/categoria/pantalones" },
    { name: "Shorts", href: "/categoria/shorts" },
    { name: "Zapatos", href: "/categoria/zapatos" },
    { name: "Gorras", href: "/categoria/gorras" },
    { name: "Contacto", href: "/contacto" },
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 text-sm border-b">
          <div className="hidden md:block text-muted-foreground">Envío gratis en compras superiores a $100.000</div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Iniciar Sesión
            </Link>
            <Link href="/registro" className="text-muted-foreground hover:text-foreground">
              Registrarse
            </Link>
            <Link href="/cuenta" className="text-muted-foreground hover:text-foreground">
              Mi Cuenta
            </Link>
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">SH</span>
            </div>
            <span className="text-xl font-bold text-dark-gray">StyleHub</span>
          </Link>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input type="search" placeholder="Buscar productos..." className="pl-10 pr-4" />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* User account - Desktop */}
            <Link
              href="/cuenta"
              className="hidden md:flex items-center space-x-1 text-muted-foreground hover:text-foreground"
            >
              <User className="h-5 w-5" />
              <span>Cuenta</span>
            </Link>

            {/* Cart */}
            <Link href="/carrito" className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:block border-t">
          <div className="flex items-center space-x-8 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile search */}
            <div className="mb-4">
              <div className="relative">
                <Input type="search" placeholder="Buscar productos..." className="pl-10 pr-4" />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Mobile navigation */}
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
