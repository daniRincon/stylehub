import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET /api/products - Obtener todos los productos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured") === "true"
    const categoryId = searchParams.get("categoryId")
    const gender = searchParams.get("gender")
    const search = searchParams.get("search")
    const limit = Number(searchParams.get("limit") || "10")
    const page = Number(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Construir query
    const where: any = {}
    if (featured) where.featured = true
    if (categoryId) where.categoryId = categoryId
    if (gender && gender !== "all") where.gender = gender.toUpperCase()
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    // Obtener productos con paginación
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          productSizes: true,
          images: {
            orderBy: { order: "asc" },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ])

    // Adaptar productos para compatibilidad con frontend
    const adaptedProducts = products.map((product) => ({
      ...product,
      totalStock: product.productSizes.reduce((total, size) => total + size.stock, 0),
      sizes: product.productSizes,
      // Mantener compatibilidad con código existente
      image: product.images[0]?.url || "/placeholder.svg",
    }))

    return NextResponse.json({
      products: adaptedProducts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}

// POST /api/products - Crear un nuevo producto
export async function POST(request: Request) {
  try {
    console.log("=== INICIO CREACIÓN DE PRODUCTO ===")

    // Verificar autenticación
    const session = await auth()
    console.log("Sesión:", session?.user?.email, session?.user?.role)

    if (!session || session.user.role !== "ADMIN") {
      console.log("Error de autorización")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener datos del producto
    const data = await request.json()
    console.log("=== DATOS RECIBIDOS ===")
    console.log("Nombre:", data.name)
    console.log("Slug:", data.slug)
    console.log("Precio:", data.price, typeof data.price)
    console.log("Stock:", data.stock, typeof data.stock)
    console.log("Categoría ID:", data.categoryId)
    console.log("Imágenes:", data.images?.length || 0)
    console.log("Tallas:", data.sizes?.length || 0)

    // Validar campos requeridos
    const requiredFields = ["name", "description", "price", "categoryId"]
    const missingFields = requiredFields.filter((field) => {
      const value = data[field]
      return !value || (typeof value === "string" && !value.trim())
    })

    if (missingFields.length > 0) {
      console.log("Campos faltantes:", missingFields)
      return NextResponse.json(
        {
          error: `Faltan campos requeridos: ${missingFields.join(", ")}`,
          details: { missingFields, receivedData: data },
        },
        { status: 400 },
      )
    }

    // Validar imágenes
    if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
      console.log("Error: No hay imágenes")
      return NextResponse.json(
        {
          error: "Debe haber al menos una imagen",
          details: { images: data.images },
        },
        { status: 400 },
      )
    }

    // Validar que haya al menos una talla con stock
    if (!data.sizes || !Array.isArray(data.sizes) || data.sizes.length === 0) {
      console.log("Error: No hay tallas")
      return NextResponse.json(
        {
          error: "Debe haber al menos una talla con stock",
          details: { sizes: data.sizes },
        },
        { status: 400 },
      )
    }

    // Validar que al menos una talla tenga stock > 0
    const sizesWithStock = data.sizes.filter((size) => size.stock > 0)
    if (sizesWithStock.length === 0) {
      console.log("Error: Ninguna talla tiene stock")
      return NextResponse.json(
        {
          error: "Al menos una talla debe tener stock mayor a 0",
          details: { sizes: data.sizes },
        },
        { status: 400 },
      )
    }

    // Validar que la categoría existe
    console.log("=== VALIDANDO CATEGORÍA ===")
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
    })

    if (!categoryExists) {
      console.log("Error: Categoría no existe")
      return NextResponse.json(
        {
          error: "La categoría especificada no existe",
          details: { categoryId: data.categoryId },
        },
        { status: 400 },
      )
    }
    console.log("Categoría válida:", categoryExists.name)

    // Preparar datos del producto
    const productData = {
      name: data.name.trim(),
      slug:
        data.slug?.trim() ||
        data.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      description: data.description.trim(),
      price: Number(data.price),
      stock: Number(data.stock) || sizesWithStock.reduce((total, size) => total + Number(size.stock), 0),
      featured: Boolean(data.featured),
      gender: data.gender || "UNISEX",
      categoryId: data.categoryId,
    }

    console.log("=== DATOS PREPARADOS PARA CREAR ===")
    console.log("Producto:", productData)

    // Crear el producto
    console.log("=== CREANDO PRODUCTO ===")
    const product = await prisma.product.create({
      data: productData,
    })
    console.log("Producto creado con ID:", product.id)

    // Crear las imágenes del producto
    console.log("=== CREANDO IMÁGENES ===")
    const imagePromises = data.images.map((imageUrl: string, index: number) => {
      console.log(`Creando imagen ${index + 1}:`, imageUrl)
      return prisma.productImage.create({
        data: {
          url: imageUrl,
          alt: `${data.name} - Imagen ${index + 1}`,
          order: index,
          productId: product.id,
        },
      })
    })

    const createdImages = await Promise.all(imagePromises)
    console.log("Imágenes creadas:", createdImages.length)

    // Crear las tallas del producto
    console.log("=== CREANDO TALLAS ===")
    const sizePromises = sizesWithStock.map((sizeData: any) => {
      console.log(`Creando talla ${sizeData.size} con stock ${sizeData.stock}`)
      return prisma.productSize.create({
        data: {
          size: sizeData.size,
          stock: Number(sizeData.stock),
          productId: product.id,
        },
      })
    })

    const createdSizes = await Promise.all(sizePromises)
    console.log("Tallas creadas:", createdSizes.length)

    // Obtener el producto completo con las relaciones
    console.log("=== OBTENIENDO PRODUCTO COMPLETO ===")
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        productSizes: true,
        images: {
          orderBy: { order: "asc" },
        },
      },
    })

    console.log("=== PRODUCTO CREADO EXITOSAMENTE ===")
    console.log("ID:", completeProduct?.id)
    console.log("Nombre:", completeProduct?.name)
    console.log("Imágenes:", completeProduct?.images.length)
    console.log("Tallas:", completeProduct?.productSizes.length)

    return NextResponse.json(completeProduct, { status: 201 })
  } catch (error: any) {
    console.error("=== ERROR AL CREAR PRODUCTO ===")
    console.error("Tipo de error:", error.constructor.name)
    console.error("Mensaje:", error.message)
    console.error("Stack:", error.stack)

    // Errores específicos de Prisma
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Ya existe un producto con ese slug",
          details: { code: error.code, meta: error.meta },
        },
        { status: 400 },
      )
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error: "Error de referencia en la base de datos",
          details: { code: error.code, meta: error.meta },
        },
        { status: 400 },
      )
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          error: "Registro no encontrado",
          details: { code: error.code, meta: error.meta },
        },
        { status: 400 },
      )
    }

    // Error genérico
    return NextResponse.json(
      {
        error: "Error interno del servidor al crear producto",
        details: {
          message: error.message,
          code: error.code || "UNKNOWN",
          type: error.constructor.name,
        },
      },
      { status: 500 },
    )
  }
}
