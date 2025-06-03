"use client"

import type React from "react"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Settings, User, LogOut, Shield, HelpCircle, Moon, Sun } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"

export default function AdminHeader() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut({
        redirect: true,
        callbackUrl: "/admin/login",
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
      // Implementar búsqueda en el admin
      console.log("Buscar:", searchQuery)
    }
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // Aquí puedes implementar la lógica para cambiar el tema
    toast.info(isDarkMode ? "Modo claro activado" : "Modo oscuro activado")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Título de la página */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-dark-gray">Panel de Administración</h1>
          <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        </div>

        {/* Barra de búsqueda */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Buscar productos, pedidos, usuarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 w-full"
            />
          </form>
        </div>

        {/* Acciones del header */}
        <div className="flex items-center space-x-4">
          {/* Botón de tema */}
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="relative">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Notificaciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start p-4">
                <div className="font-medium">Nuevo pedido recibido</div>
                <div className="text-sm text-muted-foreground">Pedido #1234 por $150.000</div>
                <div className="text-xs text-muted-foreground mt-1">Hace 5 minutos</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-4">
                <div className="font-medium">Stock bajo</div>
                <div className="text-sm text-muted-foreground">Camiseta Básica - Solo 2 unidades</div>
                <div className="text-xs text-muted-foreground mt-1">Hace 1 hora</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-4">
                <div className="font-medium">Nuevo usuario registrado</div>
                <div className="text-sm text-muted-foreground">María García se registró</div>
                <div className="text-xs text-muted-foreground mt-1">Hace 2 horas</div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-sm text-gold">
                Ver todas las notificaciones
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menú de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={session?.user?.name || "Admin"} />
                  <AvatarFallback className="bg-gold text-white">
                    {session?.user?.name ? getInitials(session.user.name) : "AD"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.name || "Administrador"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email || "admin@stylehub.com"}
                  </p>
                  <Badge variant="secondary" className="w-fit mt-1 bg-gold/10 text-gold border-gold/20">
                    Administrador
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/perfil" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Mi perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/configuracion" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/ayuda" className="flex items-center cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Ayuda y soporte
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center cursor-pointer text-blue-600">
                  <Shield className="mr-2 h-4 w-4" />
                  Ver tienda
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
