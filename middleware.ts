// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Rutas que requieren autenticación de administrador
  const adminRoutes = [
    '/api/products',
    '/api/categories',
    '/api/users',
    '/api/orders',
  ]
  
  // Verificar si la ruta actual requiere autenticación de administrador
  const requiresAdminAuth = adminRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route) && 
    (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH' || request.method === 'DELETE')
  )
  
  if (requiresAdminAuth) {
    const token = await getToken({ req: request })
    
    // Verificar si el usuario está autenticado y es administrador
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
  }
  
  return NextResponse.next()
}

// Configurar las rutas a las que se aplica el middleware
export const config = {
  matcher: [
    '/api/products/:path*',
    '/api/categories/:path*',
    '/api/users/:path*',
    '/api/orders/:path*',
  ],
}