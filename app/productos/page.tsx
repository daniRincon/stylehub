import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import ProductList from "./product-list"
import { Button } from "@/components/ui/button"
import { Package, Plus, List } from "lucide-react"
import Link from "next/link"

export default function ProductosPage() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <div className="flex-1 ml-[60px]">
        <Header />

        <main className="p-6">
          <div className="flex items-center mb-6">
            <Package className="h-8 w-8 mr-2 text-gold" />
            <h1 className="text-2xl font-bold">Productos</h1>
          </div>

          <div className="flex justify-between mb-6">
            <Link href="/productos/nuevo">
              <Button className="bg-dark-green hover:bg-dark-green/90 text-white">
                <Plus className="mr-2 h-4 w-4" /> NUEVO PRODUCTO
              </Button>
            </Link>

            <Link href="/productos">
              <Button variant="outline" className="border-dark-gray text-dark-gray">
                <List className="mr-2 h-4 w-4" /> LISTA DE PRODUCTOS
              </Button>
            </Link>
          </div>

          <ProductList />
        </main>
      </div>
    </div>
  )
}
