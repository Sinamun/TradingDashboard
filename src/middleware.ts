import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/handler",
  "/forgot-password",
  "/reset-password",
  "/verify",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths and Next.js internals
  if (isPublicPath(pathname) || pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // Check for Stack Auth refresh token cookie (named stack-refresh-<projectId>)
  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
  const hasRefreshToken = projectId
    ? request.cookies.has(`stack-refresh-${projectId}--default`) ||
      request.cookies.has(`__Host-stack-refresh-${projectId}--default`) ||
      // Fallback: check any cookie starting with stack-refresh-
      [...request.cookies.getAll()].some((c) => c.name.startsWith("stack-refresh-"))
    : false;

  if (!hasRefreshToken) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("after_auth_return_to", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
