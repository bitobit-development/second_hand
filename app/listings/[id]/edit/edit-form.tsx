'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/listings/image-upload'
import { updateListing } from '@/app/listings/create/actions'
import {
  createListingSchema,
  type CreateListingFormData,
} from '@/lib/validations/listing'
import {
  CATEGORIES,
  CONDITIONS,
  SA_PROVINCES,
} from '@/lib/constants/categories'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type EditListingFormProps = {
  listing: CreateListingFormData & { id: string }
}

export const EditListingForm = ({ listing }: EditListingFormProps) => {
  const router = useRouter()

  const form = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      category: listing.category,
      title: listing.title,
      description: listing.description,
      condition: listing.condition,
      images: listing.images,
      primaryImage: listing.primaryImage,
      pricingType: listing.pricingType,
      price: listing.price,
      minOffer: listing.minOffer,
      city: listing.city,
      province: listing.province,
    },
  })

  const { watch, setValue } = form
  const watchAllFields = watch()
  const watchPricingType = watch('pricingType')

  const onSubmit = async (data: CreateListingFormData) => {
    try {
      const result = await updateListing(listing.id, data)

      if (result.success) {
        toast.success('Listing updated successfully!')
        router.push('/dashboard/listings')
      } else {
        toast.error(result.error || 'Failed to update listing')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('An unexpected error occurred')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Category */}
        <Card>
          <CardHeader>
            <CardTitle>Category</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => field.onChange(category.value)}
                          className={cn(
                            'p-3 rounded-lg border-2 transition-all text-left hover:border-primary',
                            field.value === category.value
                              ? 'border-primary bg-primary/5'
                              : 'border-muted'
                          )}
                        >
                          <div className="text-2xl mb-1">{category.icon}</div>
                          <p className="text-xs font-medium">{category.label}</p>
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input maxLength={100} {...field} />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/100 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-32"
                      maxLength={2000}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/2000 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-2"
                    >
                      {CONDITIONS.map((condition) => (
                        <div
                          key={condition.value}
                          className={cn(
                            'flex items-start space-x-3 p-3 rounded-lg border-2 transition-all',
                            field.value === condition.value
                              ? 'border-primary bg-primary/5'
                              : 'border-muted'
                          )}
                        >
                          <RadioGroupItem
                            value={condition.value}
                            id={`edit-${condition.value}`}
                          />
                          <label
                            htmlFor={`edit-${condition.value}`}
                            className="flex-1 cursor-pointer"
                          >
                            <p className="font-medium text-sm mb-0.5">{condition.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {condition.description}
                            </p>
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload
                      images={field.value || []}
                      primaryImage={watchAllFields.primaryImage || ''}
                      onChange={(images, primaryImage) => {
                        setValue('images', images)
                        setValue('primaryImage', primaryImage)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="pricingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pricing Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-2"
                    >
                      <div
                        className={cn(
                          'flex items-start space-x-3 p-3 rounded-lg border-2 transition-all',
                          field.value === 'FIXED'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted'
                        )}
                      >
                        <RadioGroupItem value="FIXED" id="edit-FIXED" />
                        <label htmlFor="edit-FIXED" className="flex-1 cursor-pointer">
                          <p className="font-medium text-sm">Fixed Price</p>
                        </label>
                      </div>
                      <div
                        className={cn(
                          'flex items-start space-x-3 p-3 rounded-lg border-2 transition-all',
                          field.value === 'OFFERS'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted'
                        )}
                      >
                        <RadioGroupItem value="OFFERS" id="edit-OFFERS" />
                        <label htmlFor="edit-OFFERS" className="flex-1 cursor-pointer">
                          <p className="font-medium text-sm">Accept Offers</p>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchPricingType === 'FIXED' && (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (ZAR)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          R
                        </span>
                        <Input
                          type="number"
                          className="pl-7"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value ? parseFloat(e.target.value) : undefined
                            field.onChange(value)
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchPricingType === 'OFFERS' && (
              <FormField
                control={form.control}
                name="minOffer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Offer (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          R
                        </span>
                        <Input
                          type="number"
                          className="pl-7"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value ? parseFloat(e.target.value) : undefined
                            field.onChange(value)
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City / Town</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Province</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SA_PROVINCES.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
