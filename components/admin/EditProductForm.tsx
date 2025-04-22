"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { Product } from "@/lib/types"
import { updateProduct } from "@/lib/api"  // Función para actualizar el producto en la base de datos

interface EditProductFormProps {
  product: Product
}

const EditProductForm = ({ product }: EditProductFormProps) => {
  const { register, handleSubmit, setValue } = useForm<Product>({
    defaultValues: product,
  })

  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: Product) => {
    setLoading(true)
    try {
      await updateProduct(data)
      toast({
        title: "Producto actualizado",
        description: "El producto se ha actualizado con éxito.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el producto.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block font-medium">Nombre del producto</label>
        <input
          type="text"
          className="mt-1 p-2 border rounded w-full"
          {...register("name")}
        />
      </div>

      <div>
        <label className="block font-medium">Precio</label>
        <input
          type="number"
          className="mt-1 p-2 border rounded w-full"
          {...register("price")}
        />
      </div>

      <div>
        <label className="block font-medium">Descripción</label>
        <textarea
          className="mt-1 p-2 border rounded w-full"
          rows={4}
          {...register("description")}
        />
      </div>

      <div>
        <label className="block font-medium">Stock</label>
        <input
          type="number"
          className="mt-1 p-2 border rounded w-full"
          {...register("stock")}
        />
      </div>

      <div>
        <label className="block font-medium">Categoría</label>
        <select className="mt-1 p-2 border rounded w-full" {...register("category")}>
          <option value="camisas">Camisas</option>
          <option value="pantalones">Pantalones</option>
          <option value="zapatos">Zapatos</option>
          {/* Agregar más categorías si es necesario */}
        </select>
      </div>

      <div>
        <label className="block font-medium">Imagen del producto</label>
        <input
          type="file"
          className="mt-1 p-2 border rounded w-full"
          {...register("image")}
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          className="bg-dark-green text-white w-full"
          disabled={loading}
        >
          {loading ? "Actualizando..." : "Actualizar Producto"}
        </Button>
      </div>
    </form>
  )
}

const EditProductPage = () => {
  const { slug } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Función para obtener el producto desde la base de datos
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${slug}`)
        const data = await response.json()
        setProduct(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Hubo un problema al cargar los detalles del producto.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Producto no encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Editar Producto</h1>
        <EditProductForm product={product} />
      </div>
    </div>
  )
}

export default EditProductPage
