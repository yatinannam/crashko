import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If authenticated user visits /login or /signup, redirect to dashboard
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/signup");

    if (req.nextauth.token && isAuthPage) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Let unauthenticated users through to /login and /signup
      authorized: ({ token, req }) => {
        const isAuthPage =
          req.nextUrl.pathname.startsWith("/login") ||
          req.nextUrl.pathname.startsWith("/signup");
        if (isAuthPage) return true;
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  },
);

// Protect app pages, allow auth pages and Next.js internals through
export const config = {
  matcher: [
    "/",
    "/trends",
    "/history",
    "/settings",
    "/login",
    "/signup",
  ],
};
