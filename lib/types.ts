export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: {
    id: string;
    name: string;
    slug: string;
    [key: string]: any; // Otras propiedades opcionales
  };
  images?: { url: string }[];
}
  
  export type Category = {
    name: string
    slug: string
    image: string
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
  