import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/jwt'

const PROTECTED = ['/dashboard']
const ADMIN_ONLY = ['/admin']
const GUEST_ONLY = ['/login', '/register']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('horeka_session')?.value
  const session = token ? await decrypt(token) : null
  const isAuth = !!session

  // /blocked is always accessible — no redirect
  if (pathname === '/blocked') return NextResponse.next()

  if (PROTECTED.some(p => pathname.startsWith(p)) && !isAuth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (ADMIN_ONLY.some(p => pathname.startsWith(p))) {
    if (!isAuth) return NextResponse.redirect(new URL('/login', request.url))
    if (session?.role !== 'ADMIN') return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (GUEST_ONLY.some(p => pathname.startsWith(p)) && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register', '/blocked'],
}
