import { NextResponse } from 'next/server';
import { verifyToken } from './src/lib/auth';

/**
 * Middleware for handling authentication and route protection
 * 
 * This middleware:
 * 1. Protects routes that require authentication
 * 2. Restricts admin routes to users with admin role
 * 3. Redirects authenticated users from auth pages to appropriate dashboards
 * 4. Logs detailed information for debugging
 */

// Debug function to log middleware activity
function logMiddleware(message, data = {}) {
  console.log(`[Middleware] ${message}`, data);
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Decode the token
  const decoded = token ? verifyToken(token) : null;
  const isAuthenticated = !!decoded;
  const userRole = decoded?.role || 'none';
  
  logMiddleware('Processing request', {
    pathname,
    hasToken: !!token,
    isAuthenticated,
    userRole,
    method: request.method,
  });

  // Define route groups
  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isStudentRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const isProtectedRoute = isAdminRoute || isStudentRoute;
  
  // Handle authentication for protected routes
  if (isProtectedRoute && !isAuthenticated) {
    logMiddleware('Redirecting to login - Not authenticated');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Handle role-based access for admin routes
  if (isAdminRoute && isAuthenticated && userRole !== 'admin') {
    logMiddleware('Redirecting to dashboard - Not admin');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirect authenticated users from auth pages to appropriate dashboard
  if (isAuthRoute && isAuthenticated) {
    if (userRole === 'admin') {
      logMiddleware('Redirecting to admin dashboard - Already authenticated');
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      logMiddleware('Redirecting to student dashboard - Already authenticated');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // Allow all other requests to proceed
  logMiddleware('Allowing request to proceed');
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Auth routes
    '/login',
    '/register',
    
    // Protected student routes
    '/dashboard',
    '/dashboard/:path*',
    
    // Protected admin routes
    '/admin',
    '/admin/:path*',
  ],
};
