export interface ProductImage {
  id: string;
  url: string;
  alt?: string; // Descripción alternativa de la imagen
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  images?: ProductImage[];
}

export interface Customer {
  name: string;
  email: string;
  address: string;
}

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
}