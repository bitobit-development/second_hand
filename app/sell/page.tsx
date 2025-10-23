import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sell Your Item',
  description: 'List your items for sale on our marketplace',
}

export default async function SellPage() {
  const session = await auth()

  // If user is authenticated, redirect to listing creation
  if (session?.user) {
    redirect('/listings/create')
  }

  // If user is not authenticated, redirect to login with callback URL
  redirect('/auth/login?callbackUrl=/listings/create')
}
