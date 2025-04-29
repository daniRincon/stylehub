import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface ImageInput {
  url: string;
}

// GET /api/products/[id] - Obtener un producto por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        images: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json(
      { error: "Error al obtener producto" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Actualizar un producto
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar si el usuario está autenticado y es administrador
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, price, stock, categoryId, images, slug } = body as {
      name: string;
      description: string;
      price: number;
      stock: number;
      categoryId: string;
      images: ImageInput[];
      slug: string;
    };

    // Validar datos requeridos
    if (!name || !description || !price || !categoryId || !slug) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar si existe el producto
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el slug ya está en uso por otro producto
    const productWithSlug = await prisma.product.findUnique({
      where: { slug },
    });

    if (productWithSlug && productWithSlug.id !== params.id) {
      return NextResponse.json(
        { error: "Ya existe un producto con este slug" },
        { status: 400 }
      );
    }

    // Actualizar el producto
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price,
        stock: stock || 0,
        slug,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    // Actualizar imágenes si se proporcionan
    if (images && images.length > 0) {
      // Eliminar imágenes existentes
      await prisma.productImage.deleteMany({
        where: { productId: params.id },
      });

      // Crear nuevas imágenes
      await prisma.productImage.createMany({
        data: images.map((image: ImageInput) => ({
          url: image.url,
          productId: params.id,
        })),
      });
    }

    // Obtener el producto actualizado con imágenes
    const productWithImages = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        images: true,
      },
    });

    return NextResponse.json(productWithImages);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { error: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Eliminar un producto
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar si el usuario está autenticado y es administrador
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar si existe el producto
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar imágenes del producto
    await prisma.productImage.deleteMany({
      where: { productId: params.id },
    });

    // Eliminar el producto
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { error: "Error al eliminar producto" },
      { status: 500 }
    );
  }
}