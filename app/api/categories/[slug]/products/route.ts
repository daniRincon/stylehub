import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/categories/[slug]/products - Obtener productos de una categoría
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(request.url)

    // Parámetros de paginación
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    // Parámetros de filtro
    const minPrice = searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice")!) : undefined
    const maxPrice = searchParams.get("maxPrice") ? Number.parseFloat(searchParams.get("maxPrice")!) : undefined
    const sort = searchParams.get("sort") || "featured"

    // Extraer el slug de los parámetros primero
    const { slug } = params

    // Obtener la categoría por slug
    const category = await prisma.category.findUnique({
      where: {
        slug,
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    }

    // Construir filtros
    const filters: any = {
      categoryId: category.id,
    }

    // Filtro de precio
    if (minPrice !== undefined || maxPrice !== undefined) {
      filters.price = {}

      if (minPrice !== undefined) {
        filters.price.gte = minPrice
      }

      if (maxPrice !== undefined) {
        filters.price.lte = maxPrice
      }
    }

    // Determinar ordenación
    let orderBy: any = {}

    switch (sort) {
      case "price-asc":
        orderBy = { price: "asc" }
        break
      case "price-desc":
        orderBy = { price: "desc" }
        break
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      default:
        orderBy = { featured: "desc" }
        break
    }

    // Obtener productos
    const products = await prisma.product.findMany({
      where: filters,
      include: {
        images: true,
      },
      skip,
      take: limit,
      orderBy,
    })

    // Obtener total de productos para paginación
    const total = await prisma.product.count({
      where: filters,
    })

    return NextResponse.json({
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error al obtener productos de la categoría:", error)
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}
