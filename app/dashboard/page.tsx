import { requireAuth } from "@/lib/auth-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ShoppingBag, Package, Star, Settings, LogOut } from "lucide-react";
import { signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await requireAuth();
  const user = session.user;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {user.name}
              </p>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Welcome to Second-Hand Marketplace</CardTitle>
            <CardDescription>
              Your account is verified and ready to use. Start buying or selling
              pre-owned items today!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <Link href="/listings">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Browse Listings
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/listings/create">
                  <Package className="mr-2 h-4 w-4" />
                  Create Listing
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{user.role.toLowerCase()}</p>
              </div>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/account/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats - Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Purchases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Total purchases
                </p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/account/purchases">View Purchases</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Listings - Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                My Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Active listings
                </p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/listings">View Listings</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Rating - Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5" />
                Your Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-3xl font-bold">0.0</p>
                <p className="text-sm text-muted-foreground mt-2">
                  No reviews yet
                </p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/account/reviews">View Reviews</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Admin Panel - Only for Admins */}
          {user.role === "ADMIN" && (
            <Card className="border-blue-500">
              <CardHeader>
                <CardTitle className="text-lg">Admin Panel</CardTitle>
                <CardDescription>Manage the marketplace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/listings">Moderate Listings</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/users">Manage Users</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/analytics">View Analytics</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
