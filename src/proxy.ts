import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuthPage = req.nextUrl.pathname.startsWith("/signup");
    const isPublicLanding = req.nextUrl.pathname === "/";

    if (req.nextauth.token && (isAuthPage || isPublicLanding)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith("/signup");
        const isPublicLanding = req.nextUrl.pathname === "/";

        if (isAuthPage || isPublicLanding) return true;
        return !!token;
      },
    },
    pages: {
      signIn: "/signup",
    },
  },
);

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/trends",
    "/history",
    "/settings",
    "/signup",
  ],
};
