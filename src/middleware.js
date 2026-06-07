import { NextResponse } from 'next/server';

export function middleware(request) {
  // Ambil token dari cookie
  const token = request.cookies.get('token')?.value;

  const { pathname } = request.nextUrl;

  // Daftar rute yang perlu proteksi
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isUsersRoute = pathname.startsWith('/users');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth/register');
  const isLandingRoute = pathname === '/';

  // Jika user belum login tapi mencoba akses rute terproteksi
  if (!token && (isDashboardRoute || isUsersRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika user sudah login
  if (token) {
    try {
      // Decode payload JWT secara manual (karena jsonwebtoken tidak didukung di Edge runtime Next.js)
      const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const role = decodedPayload.role;

      // Jika user sudah login dan mencoba akses halaman login/register atau landing page
      if (isAuthRoute || isLandingRoute) {
        if (role === 'admin' || role === 'petugas') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
          return NextResponse.redirect(new URL('/users', request.url));
        }
      }

      // Proteksi Role untuk rute /dashboard
      if (isDashboardRoute) {
        if (role !== 'admin' && role !== 'petugas') {
          return NextResponse.redirect(new URL('/users', request.url));
        }

        // Rute /dashboard/petugas sekarang adalah rute "Kelola Data Petugas", bukan dashboard utama.
        // Oleh karena itu, hanya Admin yang boleh mengaksesnya.
        if (pathname.startsWith('/dashboard/petugas') && role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      // Proteksi Role untuk rute /users (hanya masyarakat)
      if (isUsersRoute && (role === 'admin' || role === 'petugas')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // Jika token tidak valid/bisa didecode, hapus cookie dan arahkan ke login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*', 
    '/users/:path*', 
    '/login', 
    '/register'
  ],
};