'use client'

import * as React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type ImageGalleryClientProps = {
  images: string[]
  title: string
}

export const ImageGalleryClient = ({ images, title }: ImageGalleryClientProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0)

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevImage()
    } else if (e.key === 'ArrowRight') {
      handleNextImage()
    }
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Image gallery"
      >
        <Image
          src={images[selectedImageIndex]}
          alt={`${title} - Image ${selectedImageIndex + 1}`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
        />

        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-90 hover:opacity-100"
              onClick={handlePrevImage}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-90 hover:opacity-100"
              onClick={handleNextImage}
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </Button>

            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/70 text-white text-sm font-medium">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg border-2 transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                selectedImageIndex === index
                  ? 'border-primary scale-95'
                  : 'border-transparent hover:border-border hover:scale-95'
              )}
              aria-label={`View image ${index + 1}`}
              aria-current={selectedImageIndex === index}
            >
              <Image
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 25vw, 10vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
