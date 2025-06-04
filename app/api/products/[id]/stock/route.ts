import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    if (!productId) {
      return NextResponse.json({ error: "ID de producto requerido" }, { status: 400 })
    }

    // Obtener el producto con sus tallas
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productSizes: true,
        category: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Si el producto tiene tallas definidas, usar el stock por tallas
    if (product.productSizes && product.productSizes.length > 0) {
      const sizes = product.productSizes.map((size) => ({
        size: size.size,
        stock: size.stock,
      }))

      const totalStock = product.productSizes.reduce((total, size) => total + size.stock, 0)

      return NextResponse.json({
        productId: product.id,
        totalStock,
        sizes,
        hasSizes: true,
      })
    } else {
      // Si no tiene tallas, usar el stock general del producto
      return NextResponse.json({
        productId: product.id,
        totalStock: product.stock,
        sizes: [{ size: null, stock: product.stock }],
        hasSizes: false,
      })
    }
  } catch (error) {
    console.error("Error al obtener stock del producto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
