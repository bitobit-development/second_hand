'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserRole } from '@prisma/client'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: CreateUserFormData) => Promise<void>
}

export interface CreateUserFormData {
  email: string
  name: string
  password: string
  role: UserRole
  phone?: string
  city?: string
  province?: string
}

const initialFormState: CreateUserFormData = {
  email: '',
  name: '',
  password: '',
  role: 'BUYER',
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onConfirm,
}: CreateUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateUserFormData>(initialFormState)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.role) {
      newErrors.role = 'Role is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleConfirm = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onConfirm(formData)
      toast.success('User created successfully')
      onOpenChange(false)
      setFormData(initialFormState)
      setErrors({})
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create user'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !loading) {
      setFormData(initialFormState)
      setErrors({})
    }
    onOpenChange(open)
  }

  const updateField = (field: keyof CreateUserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="size-5 text-primary" aria-hidden="true" />
            </div>
            <DialogTitle>Create New User</DialogTitle>
          </div>
          <DialogDescription>
            Add a new user to the platform. Admin-created users are automatically verified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              disabled={loading}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="text-xs text-destructive" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              disabled={loading}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <span id="name-error" className="text-xs text-destructive" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              disabled={loading}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <span id="password-error" className="text-xs text-destructive" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => updateField('role', value as UserRole)}
              disabled={loading}
            >
              <SelectTrigger id="role" aria-invalid={!!errors.role}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUYER">Buyer</SelectItem>
                <SelectItem value="SELLER">Seller</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <span id="role-error" className="text-xs text-destructive" role="alert">
                {errors.role}
              </span>
            )}
          </div>

          {/* Optional: Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+27 XX XXX XXXX"
              value={formData.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
