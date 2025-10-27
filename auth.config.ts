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
        // Check if user has ADMIN role and redirect to admin panel
        // Role is available in JWT token (session.user.role)
        const userRole = (auth?.user as any)?.role;
        const redirectUrl = userRole === 'ADMIN' ? '/admin' : '/dashboard';
        return Response.redirect(new URL(redirectUrl, nextUrl));
      }

      // Protect dashboard, account, and sell pages
      if (isOnDashboard || isOnAccount || isOnSell) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      // Admin routes use two-layer security:
      // 1. Middleware: Check authentication only (edge-compatible)
      // 2. Page level: Check ADMIN role via requireAdmin() (uses database)
      // This allows middleware to be edge-compatible while role checks use database
      if (isOnAdmin) {
        if (!isLoggedIn) {
          // Redirect to login with callback URL
          const callbackUrl = encodeURIComponent(
            nextUrl.pathname + nextUrl.search
          );
          return Response.redirect(
            new URL(`/auth/login?callbackUrl=${callbackUrl}`, nextUrl)
          );
        }
        // Admin role check happens at page level via requireAdmin()
        return true;
      }

      return true;
    },
  },
  providers: [], // Add providers in auth.ts
} satisfies NextAuthConfig;
