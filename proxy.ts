import { NextResponse } from "next/server"

export function proxy(request: Request) {
  const url = new URL(request.url)
  const cookie = request.headers.get("cookie") || ""
  const hasSession = /next-auth\.session-token|authjs\.session-token/.test(cookie)

  if (url.pathname.startsWith("/dashboard") && !hasSession) {
    return NextResponse.redirect(new URL("/auth?mode=login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
