import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Permitir acceso libre a páginas de autenticación
    if (pathname === "/admin/login" || pathname === "/admin/register") {
      // Si ya está autenticado como admin, redirigir al dashboard
      if (token?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url))
      }
      // Si no está autenticado o no es admin, permitir acceso
      return NextResponse.next()
    }

    // Proteger otras rutas de admin
    if (pathname.startsWith("/admin")) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/login", req.url))
      }
      return NextResponse.next()
    }

    // Proteger rutas de cuenta de usuario
    if (pathname.startsWith("/cuenta")) {
      if (!token || token.role !== "CUSTOMER") {
        return NextResponse.redirect(new URL("/login", req.url))
      }
      return NextResponse.next()
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // SIEMPRE permitir acceso a estas rutas sin verificación
        const alwaysAllowedRoutes = [
          "/api/",
          "/_next",
          "/favicon.ico",
          "/admin/login",
          "/admin/register",
          "/login",
          "/registro",
        ]

        if (alwaysAllowedRoutes.some((route) => pathname.startsWith(route))) {
          return true
        }

        // Permitir rutas públicas de la tienda
        const publicStoreRoutes = ["/", "/categoria", "/producto", "/tienda", "/contacto", "/carrito", "/checkout"]

        if (publicStoreRoutes.some((route) => pathname === "/" || pathname.startsWith(route))) {
          return true
        }

        // Para rutas protegidas (/admin, /cuenta), requerir token
        if (pathname.startsWith("/admin") || pathname.startsWith("/cuenta")) {
          return !!token
        }

        // Por defecto, permitir acceso
        return true
      },
    },
  },
)

export const config = {
  matcher: [
    // Solo aplicar middleware a rutas que realmente necesitan protección
    // Excluir explícitamente las rutas API
    "/admin/:path*",
    "/cuenta/:path*",
  ],
}
