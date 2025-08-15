import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;
  
  // Define protected routes that require authentication
  const protectedRoutes = [
    '/profile',
    '/garage',
    '/marketplace/new',
    '/meets/new',
    '/forums/new'
  ];

  // Define auth pages that should not redirect if user is already authenticated
  const authPages = [
    '/login',
    '/forgot-password',
    '/reset-password'
  ];

  // Check if current path requires authentication
  const requiresAuth = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  console.log('Middleware:', { pathname, requiresAuth, hasSession: !!session });

  // Only redirect to login if accessing protected route without session
  if (requiresAuth && !session) {
    console.log('Middleware: Redirecting to login from', pathname, 'session:', !!session);
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next|api|static|favicon.ico).*)'],
}; 