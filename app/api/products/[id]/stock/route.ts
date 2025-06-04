import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Primero intentamos obtener las tallas específicas
    const productSizes = await prisma.productSize.findMany({
      where: { productId: params.id },
      select: {
        size: true,
        stock: true,
      },
    })

    // Si no hay tallas específicas, obtenemos el stock general del producto
    if (productSizes.length === 0) {
      const product = await prisma.product.findUnique({
        where: { id: params.id },
        select: { stock: true },
      })

      if (!product) {
        return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
      }

      // Devolvemos el stock general como una talla "default"
      return NextResponse.json({
        sizes: [{ size: "default", stock: product.stock || 0 }],
      })
    }

    return NextResponse.json({
      sizes: productSizes,
    })
  } catch (error) {
    console.error("Error al obtener stock:", error)
    return NextResponse.json({ error: "Error al obtener stock" }, { status: 500 })
  }
}
