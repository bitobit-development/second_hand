import { ListingCategory, ListingCondition } from '@/lib/generated/prisma'
import { LucideIcon } from 'lucide-react'

export type CategoryConfig = {
  value: ListingCategory
  label: string
  icon: LucideIcon
  description: string
}

export type ConditionConfig = {
  value: ListingCondition
  label: string
  description: string
}

import {
  Smartphone,
  Shirt,
  Home,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Car,
  Palette,
  Baby,
  PawPrint,
} from 'lucide-react'

export const CATEGORIES: CategoryConfig[] = [
  {
    value: 'ELECTRONICS',
    label: 'Electronics',
    icon: Smartphone,
    description: 'Phones, laptops, cameras, and gadgets',
  },
  {
    value: 'CLOTHING',
    label: 'Clothing & Fashion',
    icon: Shirt,
    description: 'Clothes, shoes, and accessories',
  },
  {
    value: 'HOME_GARDEN',
    label: 'Home & Garden',
    icon: Home,
    description: 'Furniture, appliances, and decor',
  },
  {
    value: 'SPORTS',
    label: 'Sports & Outdoors',
    icon: Dumbbell,
    description: 'Exercise equipment and outdoor gear',
  },
  {
    value: 'BOOKS',
    label: 'Books & Media',
    icon: BookOpen,
    description: 'Books, magazines, and media',
  },
  {
    value: 'TOYS',
    label: 'Toys & Games',
    icon: Gamepad2,
    description: 'Toys, games, and hobbies',
  },
  {
    value: 'VEHICLES',
    label: 'Vehicles',
    icon: Car,
    description: 'Cars, motorcycles, and parts',
  },
  {
    value: 'COLLECTIBLES',
    label: 'Collectibles & Art',
    icon: Palette,
    description: 'Antiques, art, and collectibles',
  },
  {
    value: 'BABY_KIDS',
    label: 'Baby & Kids',
    icon: Baby,
    description: 'Baby gear, toys, and clothing',
  },
  {
    value: 'PET_SUPPLIES',
    label: 'Pet Supplies',
    icon: PawPrint,
    description: 'Pet food, toys, and accessories',
  },
]

export const CONDITIONS: ConditionConfig[] = [
  {
    value: 'NEW',
    label: 'Brand New',
    description: 'Never used, in original packaging with tags',
  },
  {
    value: 'LIKE_NEW',
    label: 'Like New',
    description: 'Used once or twice, excellent condition',
  },
  {
    value: 'GOOD',
    label: 'Good',
    description: 'Used with minor signs of wear, fully functional',
  },
  {
    value: 'FAIR',
    label: 'Fair',
    description: 'Visible wear and tear, but still works well',
  },
  {
    value: 'POOR',
    label: 'Poor',
    description: 'Heavy wear, may need repairs or parts',
  },
]

export const SA_PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
] as const

export type SAProvince = (typeof SA_PROVINCES)[number]

// Helper function to get category config by value
export const getCategoryConfig = (value: ListingCategory): CategoryConfig | undefined => {
  return CATEGORIES.find((cat) => cat.value === value)
}

// Helper function to get condition config by value
export const getConditionConfig = (value: ListingCondition): ConditionConfig | undefined => {
  return CONDITIONS.find((cond) => cond.value === value)
}

// Helper function to format ZAR currency
export const formatZAR = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  // Manual formatting to ensure consistency between server and client
  const parts = numAmount.toFixed(2).split('.')
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const decimalPart = parts[1]

  // Only include decimals if they're not .00
  if (decimalPart === '00') {
    return `R ${integerPart}`
  }

  return `R ${integerPart}.${decimalPart}`
}

// Calculate 20% commission
export const calculateCommission = (price: number): number => {
  return price * 0.2
}

// Calculate net amount after commission
export const calculateNetAmount = (price: number): number => {
  return price - calculateCommission(price)
}
