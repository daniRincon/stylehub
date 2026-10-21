// types/next-auth.d.ts
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "CUSTOMER"
      // true si la sesión inició como admin (puede cambiar entre modo admin y cliente)
      isAdmin?: boolean
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
    adminId?: string
  }
}
