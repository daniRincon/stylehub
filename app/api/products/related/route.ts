import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/products/related - Obtener productos relacionados
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const excludeId = searchParams.get("excludeId")
    const limit = Number.parseInt(searchParams.get("limit") || "4")

    if (!categoryId) {
      return NextResponse.json({ error: "Se requiere categoryId" }, { status: 400 })
    }

    // Obtener productos de la misma categoría, excluyendo el producto actual
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      include: {
        images: true,
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error al obtener productos relacionados:", error)
    return NextResponse.json({ error: "Error al obtener productos relacionados" }, { status: 500 })
  }
}
