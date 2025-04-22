import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Plus, List, Upload } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function NuevoProductoPage() {
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

          <Card>
            <CardHeader className="bg-[#4D4B5E] text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                NUEVO PRODUCTO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Producto</Label>
                    <Input id="nombre" placeholder="Nombre del producto" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="laptops">LAPTOPS</SelectItem>
                        <SelectItem value="smartphones">SMARTPHONES</SelectItem>
                        <SelectItem value="tablets">TABLETS</SelectItem>
                        <SelectItem value="accesorios">ACCESORIOS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precio">Precio</Label>
                    <Input id="precio" type="number" placeholder="0.00" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" type="number" placeholder="0" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea id="descripcion" placeholder="Descripción del producto" rows={4} />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Imagen del Producto</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Arrastra y suelta una imagen aquí o</p>
                      <Button variant="outline" className="mt-2">
                        Seleccionar Archivo
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" type="button">
                    Cancelar
                  </Button>
                  <Button className="bg-dark-green hover:bg-dark-green/90 text-white">Guardar Producto</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
