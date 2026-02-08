import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config (no Node.js-only imports like bcrypt/prisma).
 * Used by middleware. The full config with credentials provider is in auth.ts.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/signin",
    newUser: "/signup",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const isOnDashboard =
        pathname.startsWith("/chat") ||
        pathname.startsWith("/conversations") ||
        pathname.startsWith("/resources") ||
        pathname.startsWith("/profile");
      const isOnAuth =
        pathname.startsWith("/signin") || pathname.startsWith("/signup");

      if (isOnDashboard) {
        return isLoggedIn;
      }

      if (isOnAuth && isLoggedIn) {
        return Response.redirect(new URL("/chat", request.nextUrl));
      }

      return true;
    },
  },
  providers: [], // Providers added in auth.ts (Node.js only)
};
