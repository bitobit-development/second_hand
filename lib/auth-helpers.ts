import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Get current session or redirect to login
 */
export async function requireAuth() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }
  return session;
}

/**
 * Require admin role or redirect
 */
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session;
}

/**
 * Get current user ID or null
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}
