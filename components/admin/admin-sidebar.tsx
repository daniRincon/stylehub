"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingBag, Package, Users, Settings, BarChart3, LogOut } from "lucide-react"

export default function AdminSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Productos",
      path: "/admin/productos",
      icon: Package,
    },
    {
      name: "Pedidos",
      path: "/admin/pedidos",
      icon: ShoppingBag,
    },
    {
      name: "Clientes",
      path: "/admin/clientes",
      icon: Users,
    },
    {
      name: "Categorías",
      path: "/admin/categorias",
      icon: BarChart3,
    },
    {
      name: "Configuración",
      path: "/admin/configuracion",
      icon: Settings,
    },
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-[240px] bg-dark-gray text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <Link href="/admin" className="flex items-center">
          <Image src="/logoAMRILLO.png" alt="StyleHub" width={120} height={40} className="" />
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {routes.map((route) => {
            const isActive = pathname === route.path

            return (
              <li key={route.path}>
                <Link
                  href={route.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive ? "bg-light-gold text-white" : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  <route.icon className="h-5 w-5" />
                  <span>{route.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <Link
          href="/admin/login"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Salir</span>
        </Link>
      </div>
    </div>
  )
}
