import prisma from './prisma';
import { Product, Category, User, Order } from '@prisma/client';
import bcrypt from 'bcryptjs';


// Define tipos de retorno
type ProductWithCategoryAndImages = Product & { category: Category; images: any[] }; // Ajusta 'any[]' al tipo de imagen correcto
type OrderWithItemsAndProduct = Order & { items: ({ product: Product } & { productId: string; quantity: number; price: number; })[] };

// Productos
export async function getProducts(): Promise<ProductWithCategoryAndImages[]> {
    try {
        return await prisma.product.findMany({
            include: {
                category: true,
                images: true,
            },
        });
    } catch (error) {
        console.error("Error getting products:", error);
        throw new Error("Failed to get products."); // Lanza el error para que lo maneje el llamador
    }
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategoryAndImages | null> {
    try {
        return await prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                images: true,
            },
        });
    } catch (error) {
        console.error("Error getting product by slug:", error);
        throw new Error("Failed to get product by slug.");
    }
}

export async function getProductsByCategory(categorySlug: string): Promise<ProductWithCategoryAndImages[]> {
    try {
        return await prisma.product.findMany({
            where: {
                category: {
                    slug: categorySlug,
                },
            },
            include: {
                category: true,
                images: true,
            },
        });
    } catch (error) {
        console.error("Error getting products by category:", error);
        throw new Error("Failed to get products by category.");
    }
}

// Categorías
export async function getCategories(): Promise<Category[]> {
    try {
        return await prisma.category.findMany();
    } catch (error) {
        console.error("Error getting categories:", error);
        throw new Error("Failed to get categories.");
    }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
        return await prisma.category.findUnique({
            where: { slug },
        });
    } catch (error) {
        console.error("Error getting category by slug:", error);
        throw new Error("Failed to get category by slug.");
    }
}

// Pedidos
export async function createOrder(data: {
    userId: string
    items: { productId: string; quantity: number; price: number }[]
    total: number
    shippingAddress: string
    paymentMethod: string
}): Promise<OrderWithItemsAndProduct> {
    try {
        return await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    userId: data.userId,
                    total: data.total,
                    shippingAddress: data.shippingAddress,
                    paymentMethod: data.paymentMethod,
                    items: {
                        create: data.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
            });

            return await tx.order.findUniqueOrThrow({
                where: {
                    id: order.id
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
        });
    } catch (error) {
        console.error("Error creating order:", error);
        throw new Error("Failed to create order.");
    }
}

export async function getOrdersByUser(userId: string): Promise<OrderWithItemsAndProduct[]> {
    try {
        return await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    } catch (error) {
        console.error("Error getting orders by user:", error);
        throw new Error("Failed to get orders by user.");
    }
}

// Usuarios
export async function getUserByEmail(email: string): Promise<User | null> {
    try {
        return await prisma.user.findUnique({
            where: { email },
        });
    } catch (error) {
        console.error("Error getting user by email:", error);
        throw new Error("Failed to get user by email.");
    }
}

export async function createUser(data: {
    name: string
    email: string
    password: string
}): Promise<User> {
    try {
        const hashedPassword = await bcrypt.hash(data.password, 10); // 10 es el número de rondas de hashing
        return await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });
    } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user.");
    }
}