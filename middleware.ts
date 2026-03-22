import { NextResponse, type NextRequest } from "next/server";

function hasAdminToken(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get("admin_token")?.value ||
      request.cookies.get("token")?.value ||
      request.cookies.get("auth_token")?.value,
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/account")) {
    const hasAuthSession = Boolean(request.cookies.get("authjs.session-token")?.value || request.cookies.get("__Secure-authjs.session-token")?.value);
    if (!hasAuthSession) {
      const url = new URL("/", request.url);
      url.searchParams.set("auth", "required");
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!hasAdminToken(request)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/api/admin")) {
    if (!hasAdminToken(request)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/account/:path*"],
};
