import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Authentication - Second-Hand Marketplace",
  description: "Sign in or create an account for Second-Hand Marketplace",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900 dark:text-white"
          >
            <span className="text-blue-600 dark:text-blue-400">Second-Hand</span>
            <span>Marketplace</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          &copy; {new Date().getFullYear()} Second-Hand Marketplace. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
