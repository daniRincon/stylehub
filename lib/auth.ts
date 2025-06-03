import type { NextAuthOptions, Session as NextAuthSession, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcryptjs"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Interfaz de sesión extendida
export interface Session extends NextAuthSession {
  user: {
    id: string
    email: string
    name?: string
    role: "ADMIN" | "CUSTOMER"
    image?: string
  } & DefaultSession["user"]
  customer?: {
    id: string
  } | null
}

async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  try {
    if (hashed.startsWith("$2")) return await compare(plain, hashed)
    return plain === hashed
  } catch (error) {
    console.error("Error verificando contraseña:", error)
    return false
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" },
      },
      async authorize(credentials) {
        const { email, password, userType = "customer" } = credentials ?? {}
        if (!email || !password) return null

        const lowerEmail = email.toLowerCase()

        try {
          if (userType === "admin") {
            const users = await sql`
              SELECT * FROM users WHERE email = ${lowerEmail} LIMIT 1
            `
            const user = users[0]

            if (!user || !user.password) return null

            const valid = await verifyPassword(password, user.password)
            if (!valid) return null

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: "ADMIN",
            }
          } else {
            const customers = await sql`
              SELECT * FROM customers WHERE email = ${lowerEmail} LIMIT 1
            `
            const customer = customers[0]

            if (!customer || !customer.password) return null

            // Verificar si el email está confirmado
            if (!customer.emailVerified) {
              throw new Error("Por favor confirma tu correo electrónico antes de iniciar sesión")
            }

            const valid = await verifyPassword(password, customer.password)
            if (!valid) return null

            return {
              id: customer.id,
              name: customer.name,
              email: customer.email,
              role: "CUSTOMER",
              customerId: customer.id,
            }
          }
        } catch (error) {
          console.error("Error en authorize:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Verificar si el customer ya existe
          const existingCustomers = await sql`
            SELECT * FROM customers WHERE email = ${user.email} LIMIT 1
          `

          let customerId = existingCustomers[0]?.id

          if (!customerId) {
            // Crear nuevo customer
            const newCustomers = await sql`
              INSERT INTO customers (id, email, name, password, "emailVerified", "createdAt", "updatedAt")
              VALUES (gen_random_uuid()::text, ${user.email}, ${user.name}, '', NOW(), NOW(), NOW())
              RETURNING id
            `
            customerId = newCustomers[0].id
          }

          // Verificar si ya existe la cuenta OAuth
          const existingAccounts = await sql`
            SELECT * FROM customer_accounts 
            WHERE provider = ${account.provider} AND "providerAccountId" = ${account.providerAccountId}
            LIMIT 1
          `

          if (existingAccounts.length === 0) {
            // Crear nueva cuenta OAuth
            await sql`
              INSERT INTO customer_accounts (
                "customerId", type, provider, "providerAccountId", 
                access_token, expires_at, token_type, scope, id_token
              )
              VALUES (
                ${customerId}, ${account.type}, ${account.provider}, ${account.providerAccountId},
                ${account.access_token}, ${account.expires_at}, ${account.token_type}, 
                ${account.scope}, ${account.id_token}
              )
            `
          }

          // Actualizar información del usuario
          user.id = customerId
          user.role = "CUSTOMER"

          return true
        } catch (error) {
          console.error("Error en signIn callback:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        if ("customerId" in user) {
          token.customerId = user.customerId
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "ADMIN" | "CUSTOMER"
        session.customer = token.customerId ? { id: token.customerId as string } : null

        if (session.user.role === "CUSTOMER") {
          const customers = await sql`
            SELECT * FROM customers WHERE id = ${session.user.id} LIMIT 1
          `
          const customer = customers[0]

          if (customer) {
            session.user.name = customer.name || session.user.name
            session.user.email = customer.email
            session.customer = { id: customer.id }
          }
        }
      }
      return session as Session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

// Helper para obtener sesión tipada
export async function auth(): Promise<Session | null> {
  const { getServerSession } = await import("next-auth/next")
  return (await getServerSession(authOptions)) as Session | null
}
