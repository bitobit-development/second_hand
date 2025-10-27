import { Suspense } from 'react'
import { requireAdmin } from '@/lib/auth-helpers'
import { getCategories, getCategoryAnalytics } from './actions'
import { CategoryList } from '@/components/admin/category-list'
import { CategoryAnalytics } from '@/components/admin/category-analytics'
import { CategoryFilters } from '@/components/admin/category-filters'
import { CreateCategoryButton } from '@/components/admin/create-category-button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Category Management | Admin',
  description: 'Manage product categories and hierarchy',
}

const CategoriesPageContent = async ({
  searchParams,
}: {
  searchParams?: { search?: string; isActive?: string; aiGenerated?: string; parentId?: string }
}) => {
  await requireAdmin()

  const filters = {
    search: searchParams?.search,
    isActive: searchParams?.isActive === 'true' ? true : searchParams?.isActive === 'false' ? false : undefined,
    aiGenerated: searchParams?.aiGenerated === 'true' ? true : searchParams?.aiGenerated === 'false' ? false : undefined,
    parentId: searchParams?.parentId === 'null' ? null : searchParams?.parentId,
  }

  const [categoriesResult, analyticsResult] = await Promise.all([
    getCategories(filters),
    getCategoryAnalytics(),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage product categories, hierarchy, and AI-generated suggestions
          </p>
        </div>
        <CreateCategoryButton />
      </div>

      {/* Analytics Dashboard */}
      {analyticsResult.success && analyticsResult.data && (
        <CategoryAnalytics analytics={analyticsResult.data} />
      )}

      {/* Filters */}
      <CategoryFilters />

      {/* Category List */}
      <Card className="p-6">
        {categoriesResult.success && categoriesResult.data ? (
          <CategoryList categories={categoriesResult.data} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {categoriesResult.error || 'No categories found'}
          </div>
        )}
      </Card>
    </div>
  )
}

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-96" />
      </div>
      <Skeleton className="h-10 w-40" />
    </div>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>

    <Card className="p-6">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </Card>
  </div>
)

export default function CategoriesPage({
  searchParams,
}: {
  searchParams?: { search?: string; isActive?: string; aiGenerated?: string; parentId?: string }
}) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CategoriesPageContent searchParams={searchParams} />
    </Suspense>
  )
}
