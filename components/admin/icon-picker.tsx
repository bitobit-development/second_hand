'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import * as LucideIcons from 'lucide-react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type IconPickerProps = {
  value: string
  onChange: (value: string) => void
}

// Popular icons for categories
const popularIcons = [
  'Smartphone', 'Laptop', 'Tv', 'Camera', 'Headphones',
  'Shirt', 'ShoppingBag', 'Watch', 'Glasses',
  'Home', 'Sofa', 'Coffee', 'Utensils', 'Flower',
  'Dumbbell', 'Bike', 'Trophy', 'Tent',
  'Book', 'BookOpen', 'GraduationCap',
  'Gamepad2', 'Puzzle', 'Blocks',
  'Car', 'Truck', 'Bike',
  'Gem', 'Frame', 'Music',
  'Baby', 'Stroller', 'Milk',
  'Dog', 'Cat', 'PawPrint',
  'FolderOpen', 'Package', 'Box', 'Tag'
]

export const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredIcons = search
    ? popularIcons.filter(icon =>
        icon.toLowerCase().includes(search.toLowerCase())
      )
    : popularIcons

  const IconComponent = (LucideIcons as any)[value] as React.ComponentType<{ className?: string }>

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-start gap-3"
        >
          {IconComponent && <IconComponent className="w-5 h-5" />}
          <span>{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-3 border-b">
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>
        <ScrollArea className="h-[300px]">
          <div className="grid grid-cols-6 gap-2 p-3">
            {filteredIcons.map((iconName) => {
              const Icon = (LucideIcons as any)[iconName] as React.ComponentType<{ className?: string }>
              const isSelected = value === iconName

              return (
                <Button
                  key={iconName}
                  variant={isSelected ? 'default' : 'ghost'}
                  size="icon"
                  className={cn(
                    'w-12 h-12 relative',
                    isSelected && 'ring-2 ring-primary'
                  )}
                  onClick={() => {
                    onChange(iconName)
                    setIsOpen(false)
                  }}
                  title={iconName}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {isSelected && (
                    <Check className="w-3 h-3 absolute top-1 right-1" />
                  )}
                </Button>
              )
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
