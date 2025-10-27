'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createCategory, updateCategory, type CategoryWithStats } from '@/app/admin/categories/actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { IconPicker } from './icon-picker'
import { ParentCategorySelect } from './parent-category-select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  icon: z.string().min(1, 'Icon is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  isActive: z.boolean(),
  parentId: z.string().nullable().optional(),
})

type FormData = z.infer<typeof formSchema>

type CategoryFormDialogProps = {
  mode: 'create' | 'edit'
  category?: CategoryWithStats
  open: boolean
  onOpenChange: (open: boolean) => void
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export const CategoryFormDialog = ({
  mode,
  category,
  open,
  onOpenChange,
}: CategoryFormDialogProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      icon: category?.icon || 'FolderOpen',
      description: category?.description || '',
      parentId: category?.parentId || null,
      isActive: category?.isActive ?? true,
    },
  })

  // Auto-generate slug from name
  const watchName = form.watch('name')
  useEffect(() => {
    if (mode === 'create' && watchName) {
      const slug = generateSlug(watchName)
      form.setValue('slug', slug)
    }
  }, [watchName, mode, form])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const result = mode === 'create'
        ? await createCategory(data)
        : category
        ? await updateCategory(category.id, data)
        : { success: false, error: 'Category not found' }

      if (result.success) {
        toast.success(`Category ${mode === 'create' ? 'created' : 'updated'} successfully`)
        onOpenChange(false)
        form.reset()
        router.refresh()
      } else {
        toast.error(result.error || 'Operation failed')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Category' : 'Edit Category'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new category to organize listings'
              : 'Update category details and settings'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Electronics" {...field} />
                  </FormControl>
                  <FormDescription>
                    The display name for this category
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="electronics" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL-friendly identifier (auto-generated from name)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Icon */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <IconPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>
                    Select an icon to represent this category
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Phones, computers, gaming consoles, and electronic accessories"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description of what belongs in this category
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parent Category */}
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category (Optional)</FormLabel>
                  <FormControl>
                    <ParentCategorySelect
                      value={field.value}
                      onChange={field.onChange}
                      excludeId={category?.id}
                    />
                  </FormControl>
                  <FormDescription>
                    Create a subcategory by selecting a parent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Only active categories are visible to users
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === 'create' ? 'Create' : 'Update'} Category
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
