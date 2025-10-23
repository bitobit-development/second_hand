'use client'

import * as React from 'react'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ShareButtonClientProps = {
  title: string
  url: string
}

export const ShareButtonClient = ({ title, url }: ShareButtonClientProps) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false)

  const handleShare = async () => {
    // Build full URL for sharing
    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url

    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `Check out this listing: ${title}`,
          url: fullUrl,
        })
      } else {
        await navigator.clipboard.writeText(fullUrl)
        setIsShareDialogOpen(true)
        setTimeout(() => setIsShareDialogOpen(false), 2000)
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full"
      onClick={handleShare}
      aria-label="Share listing"
    >
      <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
      {isShareDialogOpen ? 'Link Copied!' : 'Share'}
    </Button>
  )
}
