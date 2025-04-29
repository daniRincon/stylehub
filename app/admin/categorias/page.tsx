'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function CategoriasPage() {
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  // Carga inicial de categorías
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data } = await axios.get('/api/categories')
        setCategories(data)
      } catch {
        toast.error('Error cargando categorías')
      }
    }
    fetchCategories()
  }, [])

  // Actualizar vista previa cuando cambie selección
  useEffect(() => {
    if (selectedCategory) {
      const cat = categories.find(c => c.slug === selectedCategory)
      setImagePreview(cat?.image || '')
      setNewCategoryName('')
    } else {
      setImagePreview('')
    }
  }, [selectedCategory, categories])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleUpload = async () => {
    // Validar selección o nuevo nombre
    if (!imageFile || (!selectedCategory && !newCategoryName)) {
      toast.warning('Selecciona o crea una categoría y sube una imagen.')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', imageFile)
      formData.append('type', 'category')
      formData.append('id', selectedCategory)

      const { data: uploadData } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const imageUrl = uploadData.url

      if (newCategoryName) {
        // Crear nueva categoría con imagen
        await axios.post('/api/categories', {
          name: newCategoryName,
          slug: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
          image: imageUrl,
        })
        toast.success('Categoría creada con éxito.')
      } else {
        // Actualizar imagen de categoría existente
        await axios.put(`/api/categories/${selectedCategory}`, {
          image: imageUrl,
        })
        toast.success('Imagen de categoría actualizada.')
      }

      // Reset formulario y recargar lista
      setImageFile(null)
      setImagePreview('')
      setSelectedCategory('')
      setNewCategoryName('')
      const res = await axios.get('/api/categories')
      setCategories(res.data)
    } catch (error) {
      console.error(error)
      toast.error('Error al guardar la categoría.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-xl rounded-2xl border border-border/40">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Gestión de Categorías</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector de categorías existentes */}
          <div className="space-y-2">
            <Label>Categoría existente</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Crear nueva categoría */}
          <div className="space-y-2">
            <Label>Nombre nueva categoría</Label>
            <Input
              type="text"
              placeholder="Ingresa el nombre"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
            />
          </div>

          {/* Subir imagen */}
          <div className="space-y-2">
            <Label>Imagen de categoría</Label>
            <Input type="file" accept="image/*" onChange={handleImageChange} />

            {imagePreview && (
              <div className="mt-2 w-60 h-40 relative">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="rounded-lg shadow-md object-cover"
                />
              </div>
            )}
          </div>

          <Separator />
          <CardFooter>
          <Button
            className="bg-dark-green hover:bg-dark-green/90 text-white w-full"
            onClick={handleUpload}
          >
            {newCategoryName ? 'Crear Categoría' : 'Actualizar Imagen'}
          </Button>
        </CardFooter>
          {/* Lista visual de categorías */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Categorías existentes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className="border rounded-lg p-3 shadow hover:shadow-md transition"
                >
                  <p className="font-medium mb-2 text-center truncate">{cat.name}</p>
                  {cat.image ? (
                    <div className="w-full h-24 relative">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">Sin imagen</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>

      </Card>
    </div>
  )
}
