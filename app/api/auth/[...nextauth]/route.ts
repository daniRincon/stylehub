import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";

// Tipado extendido para incluir `role`, `id` y `customerId` en `token` y `session`
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CUSTOMER";
      name?: string | null;
      email?: string | null;
    };
    customer?: {
      id: string;
    } | null;
  }

  interface User {
    id: string;
    role: "ADMIN" | "CUSTOMER";
    customerId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "CUSTOMER";
    customerId?: string;
  }
}

// Verificación de contraseña
async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  if (!plain || !hashed) return false;
  try {
    if (hashed.startsWith("$2")) {
      return await compare(plain, hashed);
    }
    return plain === hashed;
  } catch (error) {
    console.error("🔒 Error verificando contraseña:", error);
    return false;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" }, // "admin" o "customer"
      },
      async authorize(credentials) {
        const { email, password, userType = "customer" } = credentials || {};
        if (!email || !password) return null;

        const lowerEmail = email.toLowerCase();

        try {
          if (userType === "admin") {
            const user = await prisma.user.findUnique({ where: { email: lowerEmail } });
            if (!user || !user.password) return null;

            const isValid = await verifyPassword(password, user.password);
            if (!isValid) return null;

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: "ADMIN",
            };
          } else {
            const customer = await prisma.customer.findUnique({ where: { email: lowerEmail } });
            if (!customer || !customer.password) return null;

            const isValid = await verifyPassword(password, customer.password);
            if (!isValid) return null;

            return {
              id: customer.id,
              name: customer.name,
              email: customer.email,
              role: "CUSTOMER",
              customerId: customer.id,
            } as any; // 🔧 asegura compatibilidad con el tipo User
          }
        } catch (error) {
          console.error("💥 Error en authorize:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        if ("customerId" in user) {
          token.customerId = user.customerId;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
        if (token.customerId) {
          session.customer = { id: token.customerId };
        } else {
          session.customer = null;
        }

        if (session.user.role === "CUSTOMER" && session.customer?.id) {
          const customer = await prisma.customer.findUnique({ where: { id: session.customer.id } });
          if (customer) {
            session.user.name = customer.name || session.user.name;
            session.user.email = customer.email;
          } else {
            console.warn("⚠️ Cliente no encontrado.");
            session.customer = null;
          }
        }
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
