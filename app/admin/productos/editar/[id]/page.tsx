"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"  // Importar de 'next/navigation'
import { useParams } from "next/navigation"  // Para obtener parámetros dinámicos
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit } from "lucide-react"

// Simular obtener productos desde un servidor o base de datos
const initialProducts = [
  {
    id: "1",
    name: "Camisa Casual",
    price: 29.99,
    category: "camisas",
    description: "Camisa casual de algodón para uso diario.",
    stock: 25,
  },
  {
    id: "2",
    name: "Pantalón Slim Fit",
    price: 49.99,
    category: "pantalones",
    description: "Pantalón slim fit de alta calidad.",
    stock: 15,
  },
  // Más productos...
]

export default function EditarProductoPage() {
  const router = useRouter()
  const { id } = useParams()  // Usar useParams para acceder al id dinámico

  const [product, setProduct] = useState<any>(null)
  const [name, setName] = useState("")
  const [price, setPrice] = useState(0)
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [stock, setStock] = useState(0)

  // Cargar los detalles del producto cuando el componente se monta
  useEffect(() => {
    if (id) {
      const productToEdit = initialProducts.find((p) => p.id === id)
      if (productToEdit) {
        setProduct(productToEdit)
        setName(productToEdit.name)
        setPrice(productToEdit.price)
        setCategory(productToEdit.category)
        setDescription(productToEdit.description)
        setStock(productToEdit.stock)
      }
    }
  }, [id])

  const handleSave = () => {
    // Aquí puedes agregar lógica para guardar los cambios (en un servidor o base de datos)
    alert("Producto actualizado con éxito!")
    router.push("/admin/productos") // Redirigir de vuelta a la lista de productos
  }

  if (!product) return <div>Cargando...</div>

  return (
    <div>
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Producto</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Producto</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="camisas">Camisas</SelectItem>
                  <SelectItem value="pantalones">Pantalones</SelectItem>
                  <SelectItem value="shorts">Shorts</SelectItem>
                  <SelectItem value="zapatos">Zapatos</SelectItem>
                  <SelectItem value="gorras">Gorras</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value, 10))}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => router.push("/admin/productos")}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSave}>
                <Edit className="mr-2 h-4 w-4" /> Guardar Cambios
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
