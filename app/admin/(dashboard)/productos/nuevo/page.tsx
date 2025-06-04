"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Loader2, X, Plus, Minus } from "lucide-react"
import { getSizesForCategory } from "@/lib/sizes"

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductSize {
  size: string
  stock: number
}

export default function NuevoProductoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [productSizes, setProductSizes] = useState<ProductSize[]>([])
  const [availableSizes, setAvailableSizes] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    categoryId: "",
    gender: "UNISEX" as "HOMBRE" | "MUJER" | "UNISEX",
    featured: false,
  })

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error)
      }
    }
    fetchCategories()
  }, [])

  // Actualizar tallas disponibles cuando cambie la categoría o género
  useEffect(() => {
    if (formData.categoryId) {
      const category = categories.find((c) => c.id === formData.categoryId)
      if (category) {
        const sizes = getSizesForCategory(category.slug, formData.gender)
        setAvailableSizes(sizes)
        // Inicializar tallas con stock 0
        setProductSizes(sizes.map((size) => ({ size, stock: 0 })))
      }
    }
  }, [formData.categoryId, formData.gender, categories])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-generar slug desde el nombre
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + selectedImages.length > 4) {
      toast.error("Máximo 4 imágenes permitidas")
      return
    }

    setIsUploadingImages(true)

    try {
      // Subir cada imagen inmediatamente
      const newImageUrls: string[] = []
      const newPreviews: string[] = []

      for (const file of files) {
        // Crear preview
        const reader = new FileReader()
        const previewPromise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
        const preview = await previewPromise
        newPreviews.push(preview)

        // Subir archivo
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || "Error al subir imagen")
        }

        const uploadData = await uploadResponse.json()
        newImageUrls.push(uploadData.url)
      }

      setSelectedImages((prev) => [...prev, ...files])
      setImagePreviews((prev) => [...prev, ...newPreviews])
      setUploadedImageUrls((prev) => [...prev, ...newImageUrls])

      toast.success(`${files.length} imagen(es) subida(s) exitosamente`)
    } catch (error: any) {
      console.error("Error al subir imágenes:", error)
      toast.error(error.message || "Error al subir imágenes")
    } finally {
      setIsUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSizeStock = (size: string, stock: number) => {
    setProductSizes((prev) => prev.map((ps) => (ps.size === size ? { ...ps, stock } : ps)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Debug: Mostrar datos del formulario
      console.log("Datos del formulario:", formData)
      console.log("URLs de imágenes:", uploadedImageUrls)
      console.log("Tallas del producto:", productSizes)

      // Validaciones detalladas
      const missingFields = []

      if (!formData.name.trim()) missingFields.push("Nombre")
      if (!formData.description.trim()) missingFields.push("Descripción")
      if (!formData.price || Number.parseFloat(formData.price) <= 0) missingFields.push("Precio válido")
      if (!formData.categoryId) missingFields.push("Categoría")

      if (missingFields.length > 0) {
        toast.error(`Campos faltantes: ${missingFields.join(", ")}`)
        return
      }

      if (uploadedImageUrls.length === 0) {
        toast.error("Debes subir al menos una imagen")
        return
      }

      // Calcular stock total
      const totalStock = productSizes.reduce((sum, ps) => sum + ps.stock, 0)

      if (totalStock === 0) {
        toast.error("Debes configurar stock para al menos una talla")
        return
      }

      // Crear producto
      const productData = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, "-"),
        description: formData.description.trim(),
        price: Number.parseFloat(formData.price),
        stock: totalStock,
        categoryId: formData.categoryId,
        gender: formData.gender,
        featured: formData.featured,
        images: uploadedImageUrls,
        sizes: productSizes.filter((ps) => ps.stock > 0), // Solo tallas con stock
      }

      console.log("Datos a enviar:", productData)

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      const responseData = await response.json()
      console.log("Respuesta del servidor:", responseData)

      if (!response.ok) {
        throw new Error(responseData.error || `Error ${response.status}: ${response.statusText}`)
      }

      toast.success("Producto creado exitosamente")
      router.push("/admin/productos")
    } catch (error: any) {
      console.error("Error completo:", error)
      toast.error(error.message || "Error al crear producto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nuevo Producto</h1>
        <p className="text-muted-foreground">Crea un nuevo producto para tu tienda</p>
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === "development" && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <p>
              <strong>Nombre:</strong> {formData.name || "Vacío"}
            </p>
            <p>
              <strong>Descripción:</strong> {formData.description || "Vacío"}
            </p>
            <p>
              <strong>Precio:</strong> {formData.price || "Vacío"}
            </p>
            <p>
              <strong>Categoría:</strong> {formData.categoryId || "No seleccionada"}
            </p>
            <p>
              <strong>Imágenes subidas:</strong> {uploadedImageUrls.length}
            </p>
            <p>
              <strong>Stock total:</strong> {productSizes.reduce((sum, ps) => sum + ps.stock, 0)}
            </p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del producto *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Camiseta básica algodón"
                  required
                  className={!formData.name.trim() ? "border-red-300" : ""}
                />
                {!formData.name.trim() && <p className="text-sm text-red-500 mt-1">Este campo es obligatorio</p>}
              </div>

              <div>
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="camiseta-basica-algodon"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe las características del producto..."
                  rows={4}
                  required
                  className={!formData.description.trim() ? "border-red-300" : ""}
                />
                {!formData.description.trim() && <p className="text-sm text-red-500 mt-1">Este campo es obligatorio</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Precio *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                    className={!formData.price || Number.parseFloat(formData.price) <= 0 ? "border-red-300" : ""}
                  />
                  {(!formData.price || Number.parseFloat(formData.price) <= 0) && (
                    <p className="text-sm text-red-500 mt-1">Precio debe ser mayor a 0</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="categoryId">Categoría *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger className={!formData.categoryId ? "border-red-300" : ""}>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!formData.categoryId && <p className="text-sm text-red-500 mt-1">Selecciona una categoría</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="gender">Género</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: "HOMBRE" | "MUJER" | "UNISEX") =>
                    setFormData((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOMBRE">Hombre</SelectItem>
                    <SelectItem value="MUJER">Mujer</SelectItem>
                    <SelectItem value="UNISEX">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: !!checked }))}
                />
                <Label htmlFor="featured">Producto destacado</Label>
              </div>
            </CardContent>
          </Card>

          {/* Tallas y Stock */}
          <Card>
            <CardHeader>
              <CardTitle>Tallas y Stock</CardTitle>
            </CardHeader>
            <CardContent>
              {availableSizes.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Configura el stock para cada talla disponible</p>
                  <div className="grid grid-cols-2 gap-3">
                    {availableSizes.map((size) => {
                      const sizeData = productSizes.find((ps) => ps.size === size)
                      return (
                        <div key={size} className="flex items-center space-x-2">
                          <Badge variant="outline" className="min-w-[60px] justify-center">
                            {size}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateSizeStock(size, Math.max(0, (sizeData?.stock || 0) - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              value={sizeData?.stock || 0}
                              onChange={(e) => updateSizeStock(size, Number.parseInt(e.target.value) || 0)}
                              className="w-16 text-center"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateSizeStock(size, (sizeData?.stock || 0) + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">
                      Stock total: {productSizes.reduce((sum, ps) => sum + ps.stock, 0)} unidades
                    </p>
                    {productSizes.reduce((sum, ps) => sum + ps.stock, 0) === 0 && (
                      <p className="text-sm text-red-500 mt-1">Debes configurar stock para al menos una talla</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Selecciona una categoría y género para configurar las tallas</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Imágenes */}
        <Card>
          <CardHeader>
            <CardTitle>Imágenes del Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="images">Subir imágenes (máximo 4) *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={selectedImages.length >= 4 || isUploadingImages}
                    className={`flex-1 ${uploadedImageUrls.length === 0 ? "border-red-300" : ""}`}
                  />
                  {isUploadingImages && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subiendo...
                    </div>
                  )}
                </div>
                {uploadedImageUrls.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">Debes subir al menos una imagen</p>
                )}
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                          ✓ Subida
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/productos")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading || isUploadingImages}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Producto"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
