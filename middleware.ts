import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Debug en producción
    console.log("Middleware - Pathname:", pathname)
    console.log("Middleware - Token exists:", !!token)
    console.log("Middleware - Token role:", token?.role)

    // Permitir acceso libre a páginas de autenticación de admin
    // Ya no redirigimos automáticamente si ya está autenticado
    if (pathname === "/admin/login" || pathname === "/admin/register") {
      return NextResponse.next()
    }

    // Permitir acceso libre a páginas de autenticación de cliente
    // Ya no redirigimos automáticamente si ya está autenticado
    if (
      pathname === "/login" ||
      pathname === "/registro" ||
      pathname === "/olvide-password" ||
      pathname.startsWith("/restablecer-password") ||
      pathname.startsWith("/confirmar-email")
    ) {
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

        // Debug en producción
        console.log("Authorized callback - Pathname:", pathname)
        console.log("Authorized callback - Token exists:", !!token)

        // SIEMPRE permitir acceso a estas rutas sin verificación
        const alwaysAllowedRoutes = [
          "/api/",
          "/_next",
          "/favicon.ico",
          "/admin/login",
          "/admin/register",
          "/login",
          "/registro",
          "/olvide-password",
          "/restablecer-password",
          "/confirmar-email",
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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
