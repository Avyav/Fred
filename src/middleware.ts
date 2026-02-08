import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    "/chat/:path*",
    "/conversations/:path*",
    "/resources/:path*",
    "/profile/:path*",
    "/signin",
    "/signup",
  ],
};
