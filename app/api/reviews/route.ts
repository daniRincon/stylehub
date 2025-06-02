import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

// POST /api/reviews - Crear una nueva reseña
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { productId, rating, comment } = body

    // Validar datos requeridos
    if (!productId || !rating) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Validar que el rating esté entre 1 y 5
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "La calificación debe estar entre 1 y 5" }, { status: 400 })
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Verificar si el usuario ya ha dejado una reseña para este producto
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        customerId: session.user.id,
      },
    })

    if (existingReview) {
      return NextResponse.json({ error: "Ya has dejado una reseña para este producto" }, { status: 400 })
    }

    // Crear la reseña
    const review = await prisma.review.create({
      data: {
        productId,
        customerId: session.user.id,
        rating,
        comment,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Error al crear reseña:", error)
    return NextResponse.json({ error: "Error al crear reseña" }, { status: 500 })
  }
}

// GET /api/reviews - Obtener reseñas de un producto
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "Se requiere productId" }, { status: 400 })
    }

    // Obtener reseñas del producto
    const reviews = await prisma.review.findMany({
      where: {
        productId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("Error al obtener reseñas:", error)
    return NextResponse.json({ error: "Error al obtener reseñas" }, { status: 500 })
  }
}
