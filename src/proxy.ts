import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  // If the user is not logged in and trying to access a protected route
  if (!req.auth && req.nextUrl.pathname !== "/" && !req.nextUrl.pathname.startsWith("/api/auth")) {
    const newUrl = new URL("/api/auth/signin", req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
}
