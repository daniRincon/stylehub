// types/next-auth.d.ts
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "CUSTOMER"
    } & DefaultSession["user"]
    customer?: {
      id: string
    } | null
  }

  interface User {
    id: string
    role?: "ADMIN" | "CUSTOMER"
    customerId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "ADMIN" | "CUSTOMER"
    customerId?: string
  }
}
