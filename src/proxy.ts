import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

const PROTECTED = ['/dashboard']
const GUEST_ONLY = ['/login', '/register']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('horeka_session')?.value
  const session = token ? await decrypt(token) : null
  const isAuth = !!session

  if (PROTECTED.some(p => pathname.startsWith(p)) && !isAuth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (GUEST_ONLY.some(p => pathname.startsWith(p)) && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}
