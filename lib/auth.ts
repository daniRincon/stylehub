import type { NextAuthOptions, Session as NextAuthSession, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";

// Interfaz de sesión extendida
export interface Session extends NextAuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
    role: "ADMIN" | "CUSTOMER";
  } & DefaultSession["user"];
  customer?: {
    id: string;
  } | null;
}

async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  try {
    if (hashed.startsWith("$2")) return await compare(plain, hashed);
    return plain === hashed;
  } catch (error) {
    console.error("Error verificando contraseña:", error);
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" },
      },
      async authorize(credentials) {
        const { email, password, userType = "customer" } = credentials ?? {};
        if (!email || !password) return null;

        const lowerEmail = email.toLowerCase();

        try {
          if (userType === "admin") {
            const user = await prisma.user.findUnique({ where: { email: lowerEmail } });
            if (!user || !user.password) return null;

            const valid = await verifyPassword(password, user.password);
            if (!valid) return null;

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: "ADMIN",
            };
          } else {
            const customer = await prisma.customer.findUnique({ where: { email: lowerEmail } });
            if (!customer || !customer.password) return null;

            const valid = await verifyPassword(password, customer.password);
            if (!valid) return null;

            return {
              id: customer.id,
              name: customer.name,
              email: customer.email,
              role: "CUSTOMER",
              customerId: customer.id,
            };
          }
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
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
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "CUSTOMER";
        session.customer = token.customerId
          ? { id: token.customerId as string }
          : null;

        if (session.user.role === "CUSTOMER" && session.customer?.id) {
          const customer = await prisma.customer.findUnique({
            where: { id: session.customer.id },
          });
          if (customer) {
            session.user.name = customer.name || session.user.name;
            session.user.email = customer.email;
          } else {
            console.warn("⚠️ Cliente no encontrado.");
            session.customer = null;
          }
        }
      }
      return session as Session;
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

// Helper para obtener sesión tipada
export async function auth(): Promise<Session | null> {
  const { getServerSession } = await import("next-auth/next");
  return (await getServerSession(authOptions)) as Session | null;
}
