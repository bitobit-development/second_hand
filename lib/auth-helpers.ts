import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { User } from "@prisma/client";

/**
 * Type for admin user with ADMIN role
 */
export type AdminUser = User & { role: 'ADMIN' };

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
 * Checks if a user has ADMIN role (synchronous)
 * @param user - User object or null/undefined
 * @returns true if user has ADMIN role, false otherwise
 */
export function isAdminUser(user: User | null | undefined): boolean {
  return user?.role === 'ADMIN';
}

/**
 * Checks if current session user has ADMIN role (async)
 * @returns Promise<boolean> - true if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return isAdminUser(session?.user as User | undefined);
}

/**
 * Requires admin authentication for server components/actions
 * Redirects to login if not authenticated
 * Redirects to home if not admin
 * @returns User object if admin
 * @throws Redirects if not authenticated or not admin
 */
export async function requireAdmin() {
  const session = await auth();

  // Check if authenticated
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/admin');
  }

  // Check if user has ADMIN role
  if (!isAdminUser(session.user as User)) {
    redirect('/');
  }

  return session.user;
}

/**
 * Gets current session and validates admin role
 * Returns null if not authenticated or not admin
 * @returns User object if admin, null otherwise
 */
export async function getAdminSession() {
  const session = await auth();

  if (!session?.user || !isAdminUser(session.user as User)) {
    return null;
  }

  return session.user;
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
