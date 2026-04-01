import { NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value

  const isAuthPage =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/signup"
  const isLanding = request.nextUrl.pathname === "/"
  const isApi = request.nextUrl.pathname.startsWith("/api")

  if (isApi || isLanding || isAuthPage) {
    return NextResponse.next()
  }

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/).*)"],
}
