import { NextResponse } from 'next/server';
import { auth } from './auth';

const adminAccessRoles = ['super_admin', 'admin', 'employee'];

export default auth(async function proxy(request) {
  const path = request.nextUrl.pathname;
  
  // Public assets and API routes
  if (path.startsWith('/_next') || path.startsWith('/api') || path.includes('.')) {
    return NextResponse.next();
  }

  const session = request.auth;

  const isAdminRoute = path.startsWith('/admin');
  const isCheckoutRoute = path.startsWith('/checkout');
  const isAuthRoute = path.startsWith('/auth') || path === '/login' || path === '/signup';

  // 1. Admin route protection
  if (isAdminRoute) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/login?callbackUrl=' + encodeURIComponent(path), request.url));
    }
    
    if (!adminAccessRoles.includes(session.user.role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // First login check
    if (session.user.isFirstLogin && path !== '/admin/change-password') {
      return NextResponse.redirect(new URL('/admin/change-password', request.url));
    }
  }

  // 2. Checkout route protection (Customer)
  if (isCheckoutRoute) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/login?callbackUrl=' + encodeURIComponent(path), request.url));
    }
  }

  // 3. Auth routes (redirect to appropriate dashboard/home if already logged in)
  if (isAuthRoute) {
    if (session?.user) {
      if (adminAccessRoles.includes(session.user.role)) {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
