"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { User, Package, Heart, MapPin, Shield, Home, ShoppingBag, LogOut } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const menuItems = [
  {
    title: "Mi cuenta",
    href: "/cuenta",
    icon: User,
    description: "Información personal y configuración",
    name: "Mi cuenta",
  },
  {
    title: "Mis pedidos",
    href: "/cuenta/pedidos",
    icon: Package,
    description: "Historial de compras y seguimiento",
    name: "Mis pedidos",
  },
  {
    title: "Lista de deseos",
    href: "/cuenta/lista-deseos",
    icon: Heart,
    description: "Productos guardados para más tarde",
    name: "Lista de deseos",
  },
  {
    title: "Direcciones",
    href: "/cuenta/direcciones",
    icon: MapPin,
    description: "Direcciones de envío guardadas",
    name: "Direcciones",
  },
  {
    title: "Seguridad",
    href: "/cuenta/seguridad",
    icon: Shield,
    description: "Contraseña y configuración de seguridad",
    name: "Seguridad",
  },
]

function getInitials(name: string | null | undefined) {
  if (!name) return "US"
  const parts = name.split(" ")
  const initials = parts.map((part) => part.charAt(0).toUpperCase()).join("")
  return initials
}

export default function AccountSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleSignOut = () => {
    // TODO: Implementar la lógica de cierre de sesión
    console.log("Cerrando sesión...")
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarFallback>{getInitials(session?.user?.name)}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-lg">{session?.user?.name || "Usuario"}</h3>
          <p className="text-sm text-muted-foreground">{session?.user?.email || "Sin correo"}</p>
        </div>

        {/* Botón para volver a la tienda */}
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="outline"
              className="w-full justify-start bg-gold/10 border-gold text-gold hover:bg-gold hover:text-white transition-all duration-200"
            >
              <Home className="h-5 w-5 mr-3" />
              Volver a la Tienda
            </Button>
          </Link>
        </div>

        {/* Separador */}
        <div className="border-t mb-6"></div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? "bg-gold text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Botón adicional para ir al carrito */}
        <div className="mt-6 pt-6 border-t">
          <Link href="/carrito">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-700 hover:bg-gray-50 mb-2"
            >
              <ShoppingBag className="h-5 w-5 mr-3" />
              Ver Carrito
            </Button>
          </Link>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Cerrar Sesión
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
