import type { NextAuthConfig } from "next-auth";

// Edge-compatible configuration (no database access)
export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAccount = nextUrl.pathname.startsWith("/account");
      const isOnSell = nextUrl.pathname.startsWith("/sell");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnAuthPage =
        nextUrl.pathname.startsWith("/auth/login") ||
        nextUrl.pathname.startsWith("/auth/register");

      // Redirect logged-in users away from auth pages
      if (isLoggedIn && isOnAuthPage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // Protect dashboard, account, and sell pages
      if (isOnDashboard || isOnAccount || isOnSell) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      // Protect admin pages
      if (isOnAdmin) {
        if (isLoggedIn && auth.user.role === "ADMIN") return true;
        return false;
      }

      return true;
    },
  },
  providers: [], // Add providers in auth.ts
} satisfies NextAuthConfig;
