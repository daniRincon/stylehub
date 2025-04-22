//app/api/products/[id]/images/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// PUT /api/products/[id]/images - Actualizar imágenes de un producto
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { images } = await request.json()

    // Validar que se proporcionaron imágenes
    if (!images || !Array.isArray(images)) {
      return NextResponse.json({ error: "Se requiere un array de URLs de imágenes" }, { status: 400 })
    }

    // Verificar si existe el producto
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Eliminar todas las imágenes existentes
    await prisma.productImage.deleteMany({
      where: { productId: params.id },
    })

    // Crear nuevas imágenes
    if (images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((url: string) => ({
          url,
          productId: params.id,
        })),
      })
    }

    // Obtener el producto actualizado con imágenes
    const updatedProduct = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        images: true,
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error al actualizar imágenes:", error)
    return NextResponse.json({ error: "Error al actualizar imágenes" }, { status: 500 })
  }
}
