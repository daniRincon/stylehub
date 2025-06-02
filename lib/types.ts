export type Category = {
  id: string
  name: string
  slug: string
  image?: string | null
  description?: string | null
}

export type Product = {
  id: string
  name: string
  price: number
  category: Category | string
  images: { url: string; id: string }[]
  image?: string // Para compatibilidad con código existente
  description: string
  stock: number
  slug: string
  reviews?: Review[]
  categoryId?: string
}

export type CartItem = {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  size?: string | null
}

export type Review = {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  customer: {
    id: string
    name: string
  }
}

export type Order = {
  id: string
  customer: {
    name: string
    email: string
    address: string
  }
  items: {
    product: Product
    quantity: number
  }[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: Date
}
