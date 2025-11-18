import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login']

// Rotas que requerem autenticação
const protectedRoutes = [
  '/admin',
  '/dashboard',
  '/selecionar-empresa',
  '/portal-investidor',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Verificar se há token nos cookies ou header
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  // Se não tem token e está tentando acessar rota protegida
  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url)
    // Adicionar redirect para voltar após login
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Se tem token e está tentando acessar /login, redirecionar para dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Se está na raiz e tem token, redirecionar para dashboard
  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Se está na raiz e não tem token, redirecionar para login
  if (!token && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif).*)',
  ],
}
