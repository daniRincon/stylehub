import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Crear un usuario administrador
  const adminPassword = await hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stylehub.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@stylehub.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Crear categorías
  const categories = [
    {
      name: 'Camisas',
      slug: 'camisas',
      image: '/placeholder.svg?height=400&width=300',
      description: 'Camisas para todas las ocasiones',
    },
    {
      name: 'Pantalones',
      slug: 'pantalones',
      image: '/placeholder.svg?height=400&width=300',
      description: 'Pantalones de alta calidad',
    },
    {
      name: 'Shorts',
      slug: 'shorts',
      image: '/placeholder.svg?height=400&width=300',
      description: 'Shorts cómodos y ligeros',
    },
    {
      name: 'Zapatos',
      slug: 'zapatos',
      image: '/placeholder.svg?height=400&width=300',
      description: 'Zapatos para todo tipo de ocasiones',
    },
    {
      name: 'Gorras',
      slug: 'gorras',
      image: '/placeholder.svg?height=400&width=300',
      description: 'Gorras deportivas y casuales',
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }

// Crear productos
const products = [
    {
      name: 'Camisa Casual',
      slug: 'camisa-casual',
      description: 'Camisa casual de algodón para uso diario.',
      price: 120000, // 120.000 COP
      stock: 25,
      categorySlug: 'camisas',
      imageUrl: '/placeholder.svg?height=400&width=300',
    },
    {
      name: 'Pantalón Slim Fit',
      slug: 'pantalon-slim-fit',
      description: 'Pantalón slim fit de alta calidad.',
      price: 180000, // 180.000 COP
      stock: 15,
      categorySlug: 'pantalones',
      imageUrl: '/placeholder.svg?height=400&width=300',
    },
    {
      name: 'Short Deportivo',
      slug: 'short-deportivo',
      description: 'Short deportivo cómodo y ligero.',
      price: 90000, // 90.000 COP
      stock: 30,
      categorySlug: 'shorts',
      imageUrl: '/placeholder.svg?height=400&width=300',
    },
    {
      name: 'Zapatos Casuales',
      slug: 'zapatos-casuales',
      description: 'Zapatos casuales para uso diario.',
      price: 250000, // 250.000 COP
      stock: 10,
      categorySlug: 'zapatos',
      imageUrl: '/placeholder.svg?height=400&width=300',
    },
    {
      name: 'Gorra Deportiva',
      slug: 'gorra-deportiva',
      description: 'Gorra deportiva ajustable.',
      price: 70000, // 70.000 COP
      stock: 40,
      categorySlug: 'gorras',
      imageUrl: '/placeholder.svg?height=400&width=300',
    },
  ]

  for (const product of products) {
    const category = await prisma.category.findUnique({
      where: { slug: product.categorySlug },
    })

    if (category) {
      const createdProduct = await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: category.id,
        },
      })

      await prisma.productImage.create({
        data: {
          url: product.imageUrl,
          productId: createdProduct.id,
        },
      })
    }
  }

  console.log('Base de datos sembrada correctamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })