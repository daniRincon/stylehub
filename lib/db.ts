import prisma from './prisma'
import { Product, Category, User, Order } from '@prisma/client'

// Productos
export async function getProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
      images: true,
    },
  })
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: true,
    },
  })
}

export async function getProductsByCategory(categorySlug: string) {
  return prisma.product.findMany({
    where: {
      category: {
        slug: categorySlug,
      },
    },
    include: {
      category: true,
      images: true,
    },
  })
}

// Categorías
export async function getCategories() {
  return prisma.category.findMany()
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
  })
}

// Pedidos
export async function createOrder(data: {
  userId: string
  items: { productId: string; quantity: number; price: number }[]
  total: number
  shippingAddress: string
  paymentMethod: string
}) {
  return prisma.order.create({
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
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })
}

export async function getOrdersByUser(userId: string) {
  return prisma.order.findMany({
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
  })
}

// Usuarios
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function createUser(data: {
  name: string
  email: string
  password: string
}) {
  return prisma.user.create({
    data,
  })
}