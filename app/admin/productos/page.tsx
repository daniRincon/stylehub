"use client"

import type React from "react"
import { formatPrice } from '@/lib/utils' // Ajusta según la ruta real
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Package, Plus, Search, Edit, Trash2, MoreHorizontal, Loader2, Upload, X, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent,DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter, SheetClose,} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,} from "@/components/ui/pagination"

// Tipos para los productos y la respuesta de la API
interface ProductImage {
  id: string
  url: string
  productId: string
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  slug: string
  categoryId: string
  category: Category
  images: ProductImage[]
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  products: Product[]
  pagination: {
    total: number
    pages: number
    page: number
    limit: number
  }
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isImageSheetOpen, setIsImageSheetOpen] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit, setLimit] = useState(10)

  // Cargar productos
  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Construir la URL con los parámetros de consulta
      let url = `/api/products?page=${currentPage}&limit=${limit}`

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`
      }

      if (categoryFilter && categoryFilter !== "all") {
        url += `&category=${encodeURIComponent(categoryFilter)}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Error al cargar productos")
      }

      const data: ApiResponse = await response.json()
      setProducts(data.products)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      toast.error("No se pudieron cargar los productos")
    } finally {
      setLoading(false)
    }
  }

  // Cargar categorías
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")

      if (!response.ok) {
        throw new Error("Error al cargar categorías")
      }

      const data = await response.json()
      setCategories(data.categories)
    } catch (error) {
      console.error("Error al cargar categorías:", error)
      toast.error("No se pudieron cargar las categorías")
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    fetchCategories()
  }, [])

  // Cargar productos cuando cambien los filtros o la paginación
  useEffect(() => {
    fetchProducts()
  }, [currentPage, limit, categoryFilter])

  // Manejar la búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1) // Resetear a la primera página al buscar
      fetchProducts()
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Eliminar producto
  const handleDeleteProduct = async () => {
    if (!deleteProductId) return

    try {
      const response = await fetch(`/api/products/${deleteProductId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el producto")
      }

      // Actualizar la lista de productos
      setProducts(products.filter((product) => product.id !== deleteProductId))

      toast.success("El producto ha sido eliminado correctamente")
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      toast.error("No se pudo eliminar el producto")
    } finally {
      setDeleteProductId(null)
      setIsDeleteDialogOpen(false)
    }
  }

// Obtener la imagen principal del producto o una imagen por defecto
const getProductImage = (product: Product) => {
  if (product.images && product.images.length > 0) {
    return product.images[0].url
  }
  return "/placeholder.svg?height=400&width=300"
}

// Manejar la selección de archivos
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files
  if (!files || !selectedProduct) return

  setIsUploading(true)

  try {
    // 1) Subir cada archivo y recolectar URLs
    const uploadedUrls: string[] = []
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("productId", selectedProduct.id)

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error(`Error al subir ${file.name}`)
      const { url } = await res.json()
      uploadedUrls.push(url)
    }

    // 2) Combinar URLs antiguas + nuevas
    const allUrls = [
      ...(selectedProduct.images?.map((img) => img.url) ?? []),
      ...uploadedUrls,
    ]

    // 3) Llamar a la API que actualiza sólo con array de strings
    const updatedProduct: Product = await updateProductImages(
      selectedProduct.id,
      allUrls
    )

    // 4) Actualizar estado
    setSelectedProduct(updatedProduct)
    toast.success("Imágenes subidas correctamente")
    fetchProducts()
  } catch (err) {
    console.error(err)
    toast.error("Error al subir las imágenes")
  } finally {
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }
}

// Actualizar las imágenes del producto en la BD
const updateProductImages = async (
  productId: string,
  imageUrls: string[]
): Promise<Product> => {
  const res = await fetch(`/api/products/${productId}/images`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images: imageUrls }),
  })
  let data: any
  try {
    data = await res.json()
  } catch (e) {
    console.error("No JSON en respuesta de /images:", await res.text())
    throw new Error("Respuesta inesperada del servidor")
  }
  if (!res.ok) {
    console.error("Error al actualizar imágenes:", res.status, data)
    throw new Error(data.error || "Error al actualizar imágenes")
  }
  return data as Product
}

// Eliminar una imagen existente
const handleDeleteImage = async (productId: string, imageUrl: string) => {
  if (!selectedProduct) return

  try {
    const remainingUrls = (selectedProduct.images ?? [])
      .filter((img) => img.url !== imageUrl)
      .map((img) => img.url)

    const updatedProduct = await updateProductImages(productId, remainingUrls)

    setSelectedProduct(updatedProduct)
    toast.success("Imagen eliminada correctamente")
    fetchProducts()
  } catch (err: any) {
    console.error(err)
    toast.error(err.message ?? "Error al eliminar la imagen")
  }
}

// Abrir el panel lateral para gestionar imágenes
const openImageSheet = (product: Product) => {
  setSelectedProduct({
    ...product,
    images: product.images ?? [],
  })
  setUploadedImages([])
  setIsImageSheetOpen(true)
}




  return (
    <div>
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Package className="h-8 w-8 mr-2 text-gold" />
        <h1 className="text-2xl font-bold">Productos</h1>
      </div>

      <Link href="/admin/productos/nuevo">
        <Button className="bg-dark-green hover:bg-dark-green/90 text-white">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
        </Button>
      </Link>
    </div>

    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

{/* Select de categorías */}
<Select value={categoryFilter} onValueChange={setCategoryFilter}>
  <SelectTrigger>
    <SelectValue placeholder="Todas las categorías" />
  </SelectTrigger>
  <SelectContent>
  <SelectItem value="all">Todas las categorías</SelectItem>

  {Array.isArray(categories) &&
    categories.map((cat) => (
      <SelectItem key={cat.slug} value={cat.slug}>
        {cat.name}
      </SelectItem>
    ))}
</SelectContent>
</Select>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setCategoryFilter("")
                setCurrentPage(1)
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Cargando productos...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.id.substring(0, 8)}…</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={getProductImage(product) || "/placeholder.svg"}
                        alt={product.name}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {product.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-medium ${
                        product.stock > 20
                          ? "text-dark-green"
                          : product.stock > 5
                          ? "text-light-gold"
                          : "text-red-600"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openImageSheet(product)}>
                          <ImageIcon className="mr-2 h-4 w-4" /> Gestionar imágenes
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/productos/editar/${product.id}`}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            setDeleteProductId(product.id)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="py-4 px-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {/* Primera página */}
                  {currentPage > 2 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Elipsis si estamos lejos del inicio */}
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {/* Página anterior si no estamos en la primera */}
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => setCurrentPage(currentPage - 1)}>{currentPage - 1}</PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Página actual */}
                  <PaginationItem>
                    <PaginationLink isActive>{currentPage}</PaginationLink>
                  </PaginationItem>

                  {/* Página siguiente si no estamos en la última */}
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationLink onClick={() => setCurrentPage(currentPage + 1)}>{currentPage + 1}</PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Elipsis si estamos lejos del final */}
                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {/* Última página */}
                  {currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => setCurrentPage(totalPages)}>{totalPages}</PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para eliminar producto */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el producto.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Panel lateral para gestionar imágenes */}
      <Sheet open={isImageSheetOpen} onOpenChange={setIsImageSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Imágenes del producto</SheetTitle>
            <SheetDescription>{selectedProduct?.name} - Gestiona las imágenes del producto</SheetDescription>
          </SheetHeader>

          <div className="py-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {selectedProduct?.images && selectedProduct.images.length > 0 ? (
                  selectedProduct.images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt="Imagen del producto"
                        className="w-full aspect-square object-cover rounded-md"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteImage(selectedProduct.id, image.url)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground col-span-2">
                    No hay imágenes para este producto
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Label htmlFor="product-images">Subir nuevas imágenes</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    id="product-images"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                      <p className="mt-2 text-sm text-muted-foreground">Subiendo imágenes...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Arrastra y suelta imágenes aquí o</p>
                      <Button variant="outline" className="mt-2" onClick={() => fileInputRef.current?.click()}>
                        Seleccionar archivos
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button>Cerrar</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
