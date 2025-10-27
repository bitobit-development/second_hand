import { requireAdmin } from '@/lib/auth-helpers'
import { AdminNav } from '@/components/admin/admin-nav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminNav />
      <main className="flex-1 overflow-y-auto bg-muted/10 md:mt-0 mt-16">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
