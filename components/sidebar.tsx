"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, User, Package, FileText } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 h-full w-[60px] bg-dark-gray flex flex-col items-center py-4">
      <div className="mt-4 mb-8">
        <button className="sidebar-icon">
          <span className="sr-only">Menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-menu"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col space-y-4">
        <Link href="/dashboard" className={`sidebar-icon ${pathname === "/dashboard" ? "bg-light-gold/20" : ""}`}>
          <LayoutGrid size={24} />
          <span className="sr-only">Dashboard</span>
        </Link>

        <Link href="/productos" className={`sidebar-icon ${pathname.includes("/productos") ? "bg-light-gold/20" : ""}`}>
          <Package size={24} />
          <span className="sr-only">Productos</span>
        </Link>

        <Link href="/usuarios" className={`sidebar-icon ${pathname === "/usuarios" ? "bg-light-gold/20" : ""}`}>
          <User size={24} />
          <span className="sr-only">Usuarios</span>
        </Link>

        <Link href="/reportes" className={`sidebar-icon ${pathname === "/reportes" ? "bg-light-gold/20" : ""}`}>
          <FileText size={24} />
          <span className="sr-only">Reportes</span>
        </Link>
      </nav>
    </div>
  )
}
