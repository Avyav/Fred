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
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        // onboardingComplete is set from the user object passed by authorize()
        token.onboardingComplete = (user as Record<string, unknown>).onboardingComplete ?? false;
      }
      // Allow updating token on session refresh (after onboarding)
      if (trigger === "update") {
        token.onboardingComplete = true;
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
        pathname.startsWith("/profile") ||
        pathname.startsWith("/onboarding") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/handoff") ||
        pathname.startsWith("/settings");
      const isOnAuth =
        pathname.startsWith("/signin") || pathname.startsWith("/signup");

      if (isOnDashboard) {
        if (!isLoggedIn) return false;

        // Redirect to onboarding if not completed (skip for onboarding page itself and admin routes)
        const token = auth as unknown as { onboardingComplete?: boolean };
        if (
          token?.onboardingComplete === false &&
          !pathname.startsWith("/onboarding") &&
          !pathname.startsWith("/admin") &&
          pathname.startsWith("/chat")
        ) {
          return Response.redirect(new URL("/onboarding", request.nextUrl));
        }

        return true;
      }

      if (isOnAuth && isLoggedIn) {
        return Response.redirect(new URL("/chat", request.nextUrl));
      }

      return true;
    },
  },
  providers: [], // Providers added in auth.ts (Node.js only)
};
