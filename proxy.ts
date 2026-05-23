import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export function proxy(request: Request) {
  const url = new URL(request.url)
  const isLoggedIn = request.headers.get("cookie")?.includes("next-auth.session-token")

  if (url.pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
