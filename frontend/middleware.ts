// Next.js middleware for route-level access control
// Public routes: /, /auth (landing page and authentication)
// Protected routes: /wardrobe, /recommend, /evaluate (require auth)
//
// NOTE: JWT is stored in localStorage (client-side), so this middleware
// cannot read the token. Client-side useAuth() hooks remain the primary
// auth guard. This middleware exists for route documentation, static
// asset exclusion, and future cookie-based auth migration.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all public routes without any checks
  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // For protected routes, allow the request through — actual auth
  // enforcement happens client-side via useAuth() hook redirects.
  // If migrating to cookie-based auth in the future, add token
  // validation here and redirect to /auth if missing.
  return NextResponse.next();
}

export const config = {
  // Only run middleware on app routes, exclude static assets and API
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
