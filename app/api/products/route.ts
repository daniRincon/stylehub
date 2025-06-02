import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import slugify from 'slugify';

interface ProductWhereInput {
  category?: {
    slug: string;
  };
  OR?: Array<{ name?: { contains: string; mode: 'insensitive' } } | { description?: { contains: string; mode: 'insensitive' } }>;
}

type SortOrder = 'asc' | 'desc';

interface ProductOrderByInput {
  [key: string]: SortOrder;
}

// GET /api/products - Obtener todos los productos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'name';
    const order = searchParams.get('order') || 'asc';
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Construir el objeto de filtro
    const where: ProductWhereInput = {};

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Construir el objeto de ordenamiento
    const orderBy: ProductOrderByInput = {};
    orderBy[sort] = order as SortOrder;

    // Obtener productos con paginación
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    // Obtener el total de productos para la paginación
    const total = await prisma.product.count({ where });

    return NextResponse.json({
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

// POST /api/products - Crear un nuevo producto
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, price, stock, category } = body;

    // Validar datos requeridos
    if (!name || !description || !price || !category || stock === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un producto con el mismo slug
    const slug = slugify(name, { lower: true });
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Ya existe un producto con este slug' },
        { status: 400 }
      );
    }

    // Buscar o crear la categoría
    const categoryRecord = await prisma.category.upsert({
      where: { slug: slugify(category, { lower: true }) },
      update: {},
      create: {
        name: category,
        slug: slugify(category, { lower: true }),
      },
    });

    // Crear el producto
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        stock,
        categoryId: categoryRecord.id,
      },
      include: {
        category: true,
        images: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear producto' },
      { status: 500 }
    );
  }
}