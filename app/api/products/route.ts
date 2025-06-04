import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET /api/products - Obtener todos los productos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured") === "true"
    const categoryId = searchParams.get("categoryId")
    const limit = Number(searchParams.get("limit") || "10")
    const page = Number(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Construir query
    const where: any = {}
    if (featured) where.featured = true
    if (categoryId) where.categoryId = categoryId

    // Obtener productos con paginación
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          sizes: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
    // Verificar autenticación
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener datos del producto
    const data = await request.json()
    console.log("Datos recibidos:", data)

    // Validar campos requeridos
    const requiredFields = ["name", "description", "price", "categoryId", "images"]
    const missingFields = requiredFields.filter((field) => !data[field])

    if (missingFields.length > 0) {
      console.log("Campos faltantes:", missingFields)
      return NextResponse.json({ error: `Faltan campos requeridos: ${missingFields.join(", ")}` }, { status: 400 })
    }

    // Validar que haya al menos una talla con stock
    if (!data.sizes || !Array.isArray(data.sizes) || data.sizes.length === 0) {
      return NextResponse.json({ error: "Debe haber al menos una talla con stock" }, { status: 400 })
    }

    // Crear el producto
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock) || 0,
        featured: Boolean(data.featured),
        gender: data.gender || "UNISEX",
        images: data.images,
        category: {
          connect: { id: data.categoryId },
        },
        // No creamos las tallas aquí, las crearemos después
      },
    })

    // Crear las tallas del producto
    if (data.sizes && Array.isArray(data.sizes)) {
      for (const sizeData of data.sizes) {
        if (sizeData.stock > 0) {
          await prisma.productSize.create({
            data: {
              size: sizeData.size,
              stock: Number(sizeData.stock),
              product: {
                connect: { id: product.id },
              },
            },
          })
        }
      }
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error al crear producto:", error)
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
