'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload, Loader2, MoveVertical, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

type ImageFile = {
  url: string
  file?: File
  uploading?: boolean
  progress?: number
  error?: string
}

type ImageUploadProps = {
  images: string[]
  primaryImage: string
  onChange: (images: string[], primaryImage: string) => void
  maxImages?: number
  maxSizeInMB?: number
}

export const ImageUpload = ({
  images,
  primaryImage,
  onChange,
  maxImages = 10,
  maxSizeInMB = 5,
}: ImageUploadProps) => {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>(
    images.map((url) => ({ url }))
  )
  const [isDragging, setIsDragging] = useState(false)

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    const data = await response.json()
    return data.url
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const maxSizeBytes = maxSizeInMB * 1024 * 1024
      const remainingSlots = maxImages - imageFiles.length

      if (acceptedFiles.length > remainingSlots) {
        alert(`You can only upload ${remainingSlots} more image(s)`)
        acceptedFiles = acceptedFiles.slice(0, remainingSlots)
      }

      // Validate file sizes
      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > maxSizeBytes) {
          alert(`${file.name} is too large. Max size is ${maxSizeInMB}MB`)
          return false
        }
        return true
      })

      if (validFiles.length === 0) return

      // Add files with loading state
      const newImageFiles: ImageFile[] = validFiles.map((file) => ({
        url: URL.createObjectURL(file),
        file,
        uploading: true,
        progress: 0,
      }))

      setImageFiles((prev) => [...prev, ...newImageFiles])

      // Upload files one by one
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        const currentIndex = imageFiles.length + i

        try {
          const uploadedUrl = await uploadToCloudinary(file)

          setImageFiles((prev) => {
            const updated = [...prev]
            updated[currentIndex] = {
              url: uploadedUrl,
              uploading: false,
            }
            return updated
          })
        } catch (error) {
          console.error('Upload error:', error)
          setImageFiles((prev) => {
            const updated = [...prev]
            updated[currentIndex] = {
              ...updated[currentIndex],
              uploading: false,
              error: error instanceof Error ? error.message : 'Upload failed',
            }
            return updated
          })
        }
      }

      // Update parent component
      const uploadedUrls = imageFiles
        .filter((img) => !img.uploading && !img.error)
        .map((img) => img.url)

      onChange(
        uploadedUrls,
        primaryImage || uploadedUrls[0] || ''
      )
    },
    [imageFiles, maxImages, maxSizeInMB, onChange, primaryImage]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: maxSizeInMB * 1024 * 1024,
    disabled: imageFiles.length >= maxImages,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  })

  const removeImage = (index: number) => {
    const removed = imageFiles[index]
    const newImageFiles = imageFiles.filter((_, i) => i !== index)
    setImageFiles(newImageFiles)

    // Revoke object URL if it's a local file
    if (removed.file) {
      URL.revokeObjectURL(removed.url)
    }

    const newUrls = newImageFiles
      .filter((img) => !img.uploading && !img.error)
      .map((img) => img.url)

    // Update primary image if it was removed
    const newPrimaryImage =
      primaryImage === removed.url
        ? newUrls[0] || ''
        : primaryImage

    onChange(newUrls, newPrimaryImage)
  }

  const setPrimaryImage = (url: string) => {
    const validUrls = imageFiles
      .filter((img) => !img.uploading && !img.error)
      .map((img) => img.url)

    onChange(validUrls, url)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImageFiles = [...imageFiles]
    const [movedItem] = newImageFiles.splice(fromIndex, 1)
    newImageFiles.splice(toIndex, 0, movedItem)
    setImageFiles(newImageFiles)

    const validUrls = newImageFiles
      .filter((img) => !img.uploading && !img.error)
      .map((img) => img.url)

    onChange(validUrls, primaryImage)
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {imageFiles.length < maxImages && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive || isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            imageFiles.length >= maxImages && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">
            {isDragActive || isDragging
              ? 'Drop images here'
              : 'Drag and drop images here'}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WebP • Max {maxSizeInMB}MB per file • Up to {maxImages} images
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {imageFiles.length} / {maxImages} uploaded
          </p>
        </div>
      )}

      {/* Image Grid */}
      {imageFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {imageFiles.map((imageFile, index) => (
            <div
              key={imageFile.url}
              className={cn(
                'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                primaryImage === imageFile.url
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-muted-foreground/25'
              )}
            >
              <img
                src={imageFile.url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Loading Overlay */}
              {imageFile.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}

              {/* Error Overlay */}
              {imageFile.error && (
                <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center p-2">
                  <p className="text-xs text-white text-center">
                    {imageFile.error}
                  </p>
                </div>
              )}

              {/* Actions */}
              {!imageFile.uploading && !imageFile.error && (
                <>
                  {/* Primary Badge */}
                  {primaryImage === imageFile.url && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Primary
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {primaryImage !== imageFile.url && (
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={() => setPrimaryImage(imageFile.url)}
                        title="Set as primary image"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={() => removeImage(index)}
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Reorder Buttons */}
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    {index > 0 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-6 w-6"
                        onClick={() => moveImage(index, index - 1)}
                        title="Move left"
                      >
                        <MoveVertical className="w-3 h-3 rotate-90" />
                      </Button>
                    )}
                    {index < imageFiles.length - 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-6 w-6"
                        onClick={() => moveImage(index, index + 1)}
                        title="Move right"
                      >
                        <MoveVertical className="w-3 h-3 -rotate-90" />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      {imageFiles.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Click the star icon to set a primary image. The primary image will be shown first in search results.
        </p>
      )}
    </div>
  )
}
