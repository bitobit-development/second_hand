'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { ImageUpload } from '@/components/listings/image-upload'
import { ListingPreview } from '@/components/listings/listing-preview'
import { AIImageEnhancer } from '@/components/listings/ai-image-enhancer'
import { AIDescriptionGenerator } from '@/components/listings/ai-description-generator'
import { AICategoryStep } from '@/components/listings/ai-category-step'
import { createListing } from './actions'
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

const STEPS = [
  { id: 1, name: 'Images', description: 'Add photos of your item' },
  { id: 2, name: 'Category', description: 'AI-powered categorization' },
  { id: 3, name: 'Details', description: 'Describe your item' },
  { id: 4, name: 'Pricing', description: 'Set your price' },
  { id: 5, name: 'Location', description: 'Where is it?' },
  { id: 6, name: 'Preview', description: 'Review and submit' },
]

export default function CreateListingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiEnhancedImages, setAiEnhancedImages] = useState(false)
  const [aiGeneratedDesc, setAiGeneratedDesc] = useState(false)
  const [originalImages, setOriginalImages] = useState<string[]>([])
  const [submittedListingId, setSubmittedListingId] = useState<string | null>(null)

  const form = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      category: '' as any,
      title: '',
      description: '',
      condition: '' as any,
      images: [],
      primaryImage: '',
      pricingType: '' as any,
      price: undefined,
      minOffer: undefined,
      city: '',
      province: '' as any,
    },
    mode: 'onChange',
  })

  const { watch, setValue, trigger } = form
  const watchAllFields = watch()
  const watchPricingType = watch('pricingType')

  const progress = (currentStep / STEPS.length) * 100

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 1:
        // Step 1: Images
        return await trigger(['images', 'primaryImage'])
      case 2:
        // Step 2: Category
        return await trigger('category')
      case 3:
        // Step 3: Details
        return await trigger(['title', 'description', 'condition'])
      case 4:
        // Step 4: Pricing
        return await trigger(['pricingType', 'price', 'minOffer'])
      case 5:
        // Step 5: Location
        return await trigger(['city', 'province'])
      default:
        return true
    }
  }

  const handleNext = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleEditSection = (section: string) => {
    const stepMap: Record<string, number> = {
      images: 1,
      category: 2,
      details: 3,
      pricing: 4,
      location: 5,
    }
    setCurrentStep(stepMap[section] || 1)
  }

  const onSubmit = async (data: CreateListingFormData) => {
    setIsSubmitting(true)

    try {
      // Include AI metadata in submission
      const result = await createListing({
        ...data,
        aiEnhancedImages,
        aiGeneratedDesc,
        originalImages,
      } as any)

      if (result.success && result.data) {
        toast.success('Listing created successfully!')
        // Store the listing ID but stay on preview page
        setSubmittedListingId(result.data.id)
      } else {
        toast.error(result.error || 'Failed to create listing')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinueToSuccess = () => {
    if (submittedListingId) {
      router.push(`/listings/success?id=${submittedListingId}`)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create a Listing</h1>
        <p className="text-muted-foreground">
          Sell your pre-owned items on our marketplace
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all',
                  currentStep > step.id
                    ? 'bg-primary border-primary text-primary-foreground'
                    : currentStep === step.id
                    ? 'border-primary text-primary'
                    : 'border-muted-foreground/25 text-muted-foreground'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'hidden sm:block w-12 md:w-20 h-0.5 mx-2',
                    currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/25'
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
        <div className="mt-2 text-center">
          <p className="text-sm font-medium">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
          </p>
          <p className="text-xs text-muted-foreground">
            {STEPS[currentStep - 1].description}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Images */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Add Images</CardTitle>
                <CardDescription>
                  Upload photos of your item (1-10 images)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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

                {/* AI Image Enhancer - shown after images uploaded */}
                {watchAllFields.images && watchAllFields.images.length > 0 && (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium mb-3">
                        Enhance Your Images with AI
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4">
                        Remove backgrounds and add professional white backgrounds to make your items stand out
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {watchAllFields.images.slice(0, 3).map((imageUrl, index) => (
                          <AIImageEnhancer
                            key={imageUrl}
                            imageUrl={imageUrl}
                            onEnhanced={(enhancedUrl, originalUrl) => {
                              const currentImages = watchAllFields.images || []
                              const imageIndex = currentImages.indexOf(originalUrl)

                              if (imageIndex !== -1) {
                                // Store original if not already stored
                                if (!originalImages.includes(originalUrl)) {
                                  setOriginalImages([...originalImages, originalUrl])
                                }

                                // Replace with enhanced version
                                const newImages = [...currentImages]
                                newImages[imageIndex] = enhancedUrl
                                setValue('images', newImages)

                                // Update primary image if needed
                                if (watchAllFields.primaryImage === originalUrl) {
                                  setValue('primaryImage', enhancedUrl)
                                }

                                setAiEnhancedImages(true)
                                toast.success(`Image ${index + 1} enhanced successfully!`)
                              }
                            }}
                            onError={(error) => {
                              toast.error(`Failed to enhance image ${index + 1}: ${error}`)
                            }}
                          />
                        ))}
                      </div>
                      {watchAllFields.images.length > 3 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Showing first 3 images. Enhance them individually after upload.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Category */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Category</CardTitle>
                <CardDescription>
                  We'll analyze your images to suggest the best category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AICategoryStep
                  imageUrls={watchAllFields.images || []}
                  selectedCategory={watchAllFields.category}
                  onCategorySelect={(category) => setValue('category', category)}
                  onError={(error) => {
                    console.error('AI Category Error:', error)
                    // Error is already toasted by component
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
                <CardDescription>
                  Provide details about your item
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AI Description Generator with Title - shown if images uploaded */}
                {watchAllFields.images && watchAllFields.images.length > 0 && watchAllFields.category && (
                  <AIDescriptionGenerator
                    imageUrls={watchAllFields.images}
                    category={watchAllFields.category}
                    onGenerated={(description) => {
                      setValue('description', description)
                      setAiGeneratedDesc(true)
                    }}
                    onTitleGenerated={(title) => {
                      setValue('title', title)
                    }}
                    onError={(error) => {
                      toast.error(error)
                    }}
                    currentDescription={watchAllFields.description}
                    currentTitle={watchAllFields.title}
                  />
                )}

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="E.g., iPhone 13 Pro Max 256GB"
                          maxLength={100}
                          {...field}
                        />
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
                          placeholder="Describe your item in detail. Include brand, model, features, and any defects..."
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
                          className="space-y-3"
                        >
                          {CONDITIONS.map((condition) => (
                            <div
                              key={condition.value}
                              className={cn(
                                'flex items-start space-x-3 p-4 rounded-lg border-2 transition-all',
                                field.value === condition.value
                                  ? 'border-primary bg-primary/5'
                                  : 'border-muted'
                              )}
                            >
                              <RadioGroupItem
                                value={condition.value}
                                id={condition.value}
                              />
                              <label
                                htmlFor={condition.value}
                                className="flex-1 cursor-pointer"
                              >
                                <p className="font-medium mb-1">{condition.label}</p>
                                <p className="text-sm text-muted-foreground">
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
          )}

          {/* Step 4: Pricing */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Set Your Price</CardTitle>
                <CardDescription>
                  Choose how you want to price your item
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                          className="space-y-3"
                        >
                          <div
                            className={cn(
                              'flex items-start space-x-3 p-4 rounded-lg border-2 transition-all',
                              field.value === 'FIXED'
                                ? 'border-primary bg-primary/5'
                                : 'border-muted'
                            )}
                          >
                            <RadioGroupItem value="FIXED" id="FIXED" />
                            <label htmlFor="FIXED" className="flex-1 cursor-pointer">
                              <p className="font-medium mb-1">Fixed Price</p>
                              <p className="text-sm text-muted-foreground">
                                Set a fixed price for your item
                              </p>
                            </label>
                          </div>
                          <div
                            className={cn(
                              'flex items-start space-x-3 p-4 rounded-lg border-2 transition-all',
                              field.value === 'OFFERS'
                                ? 'border-primary bg-primary/5'
                                : 'border-muted'
                            )}
                          >
                            <RadioGroupItem value="OFFERS" id="OFFERS" />
                            <label htmlFor="OFFERS" className="flex-1 cursor-pointer">
                              <p className="font-medium mb-1">Accept Offers</p>
                              <p className="text-sm text-muted-foreground">
                                Let buyers make offers on your item
                              </p>
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
                              placeholder="1500.00"
                              className="pl-7"
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const value = e.target.value ? parseFloat(e.target.value) : undefined
                                field.onChange(value)
                              }}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Platform fee: 20% (You'll receive 80% of the sale price)
                        </FormDescription>
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
                              placeholder="1000.00"
                              className="pl-7"
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const value = e.target.value ? parseFloat(e.target.value) : undefined
                                field.onChange(value)
                              }}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Set a minimum amount for buyer offers (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Location */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>
                  Where is this item located?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City / Town</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Johannesburg" {...field} />
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
                            <SelectValue placeholder="Select a province" />
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
          )}

          {/* Step 6: Preview */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preview Your Listing</CardTitle>
                  <CardDescription>
                    Review how your listing will appear to buyers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-900 dark:text-yellow-100">
                      Your listing will be submitted for admin approval before going live on the marketplace.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <ListingPreview
                data={{
                  title: watchAllFields.title || 'Untitled',
                  description: watchAllFields.description || 'No description',
                  category: watchAllFields.category!,
                  condition: watchAllFields.condition!,
                  images: watchAllFields.images || [],
                  primaryImage: watchAllFields.primaryImage || '',
                  pricingType: watchAllFields.pricingType!,
                  price: watchAllFields.price,
                  minOffer: watchAllFields.minOffer,
                  city: watchAllFields.city || '',
                  province: watchAllFields.province || '',
                  showCommissionInfo: true,
                }}
                onEdit={handleEditSection}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting || !!submittedListingId}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < STEPS.length ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : submittedListingId ? (
              <Button type="button" onClick={handleContinueToSuccess}>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Create Listing
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
