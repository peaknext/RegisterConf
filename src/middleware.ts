import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Protected portal routes
  const isPortalRoute = nextUrl.pathname.startsWith("/portal");
  // Protected admin routes
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  // Auth routes (login)
  const isAuthRoute = nextUrl.pathname.startsWith("/login");

  // Redirect logged-in users away from login page
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/portal/dashboard", nextUrl));
  }

  // Protect portal routes
  if (isPortalRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes (require memberType === 99)
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user is admin
    const memberType = req.auth?.user?.memberType;
    if (memberType !== 99) {
      return NextResponse.redirect(new URL("/portal/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*", "/login"],
};
