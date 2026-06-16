import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from './lib/auth';

const adminAccessRoles = ['super_admin', 'admin', 'employee'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public assets and API routes
  if (path.startsWith('/_next') || path.startsWith('/api') || path.includes('.')) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('session')?.value;
  const session = sessionCookie ? await decrypt(sessionCookie) : null;

  const isAdminRoute = path.startsWith('/admin');
  const isCheckoutRoute = path.startsWith('/checkout');
  const isAuthRoute = path.startsWith('/auth') || path === '/login' || path === '/signup';

  // 1. Admin route protection
  if (isAdminRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login?callbackUrl=' + encodeURIComponent(path), request.url));
    }
    
    if (!adminAccessRoles.includes(session.role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // First login check
    if (session.isFirstLogin && path !== '/admin/change-password') {
      return NextResponse.redirect(new URL('/admin/change-password', request.url));
    }
    
    // Employee privilege checks can be done inside layouts or pages for fine-grained control
  }

  // 2. Checkout route protection (Customer)
  if (isCheckoutRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login?callbackUrl=' + encodeURIComponent(path), request.url));
    }
  }

  // 3. Auth routes (redirect to appropriate dashboard/home if already logged in)
  if (isAuthRoute) {
    if (session) {
      if (adminAccessRoles.includes(session.role)) {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
