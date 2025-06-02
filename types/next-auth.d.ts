// types/next-auth.d.ts
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}

declare module "next-auth" {
  /**
   * Extender la interfaz Session
   */
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string | null
    }
  }

  /**
   * Extender la interfaz User
   */
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
  }
}
