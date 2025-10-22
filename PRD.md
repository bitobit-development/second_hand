# Product Requirements Document (PRD)
## Second-Hand Marketplace Platform

### Document Information
- **Version**: 1.0
- **Date**: October 2025
- **Status**: Draft
- **Market**: South Africa
- **Tech Stack**: Next.js 16.0.0, React 19.2.0, TypeScript, Tailwind CSS v4, shadcn/ui

---

## 1. Project Overview

### 1.1 Executive Summary
The Second-Hand Marketplace Platform is a web-based application designed to facilitate the buying and selling of pre-owned items in the South African market. The platform connects sellers looking to declutter with buyers seeking affordable second-hand goods, while providing a secure, moderated environment with administrative oversight.

### 1.2 Problem Statement
South African consumers need a trusted, local platform to buy and sell second-hand items with:
- Secure transactions in ZAR
- Quality control through admin moderation
- Flexible pricing options (fixed or negotiable)
- Protection against fraudulent listings

### 1.3 Solution
A Next.js-powered marketplace that provides:
- User-friendly interface for listing and browsing items
- Admin approval workflow for quality control
- Dual pricing model (fixed price or offer-based)
- Automated commission handling (20% platform fee)
- Secure authentication and payment processing
- Modern, accessible UI built with shadcn/ui and Tailwind CSS v4

### 1.4 Key Objectives
- Create a trusted marketplace for second-hand goods in South Africa
- Generate revenue through 20% commission on successful transactions
- Build a scalable platform using modern web technologies
- Ensure user safety through moderated listings
- Deliver exceptional UX with responsive, accessible design

---

## 2. User Roles & Personas

### 2.1 Seller (Primary User)
**Profile**: Individual looking to sell unwanted items
- **Age**: 25-55
- **Tech Savvy**: Moderate
- **Goals**: Quick, hassle-free selling of items at fair prices
- **Pain Points**: Complex listing processes, uncertain pricing, slow buyer responses
- **Needs**: Simple upload process, pricing guidance, transaction security

### 2.2 Buyer (Primary User)
**Profile**: Bargain hunter seeking quality second-hand items
- **Age**: 20-60
- **Tech Savvy**: Moderate to High
- **Goals**: Find affordable, quality items locally
- **Pain Points**: Item quality concerns, seller trustworthiness, limited selection
- **Needs**: Clear item descriptions, quality photos, secure payments

### 2.3 Administrator (Internal User)
**Profile**: Platform moderator ensuring quality and compliance
- **Role**: Content moderator and platform manager
- **Goals**: Maintain platform quality, prevent fraud, drive revenue
- **Responsibilities**: Review listings, manage disputes, monitor transactions
- **Needs**: Efficient moderation tools, clear dashboards, bulk actions

---

## 3. Functional Requirements

### 3.1 Authentication & User Management

#### 3.1.1 User Registration
- **Email-based registration** with verification
- **Required fields**: Full name, email, phone number, location (city/province)
- **Optional fields**: Profile photo, bio
- **Password requirements**: Minimum 8 characters, 1 uppercase, 1 number
- **Terms acceptance**: Mandatory before account creation

#### 3.1.2 User Login
- **Email and password authentication**
- **Session management** with JWT tokens
- **Remember me** option (30-day persistent session)
- **Password reset** via email link
- **Account lockout** after 5 failed attempts

### 3.2 Seller Features

#### 3.2.1 Item Listing Creation
- **Multi-step form**:
  1. Category selection (predefined categories)
  2. Item details (title, description, condition)
  3. Image upload (minimum 1, maximum 10 images)
  4. Pricing strategy selection
  5. Location setting
  6. Preview and submission

- **Item Details**:
  - Title (max 100 characters)
  - Description (max 2000 characters)
  - Category (from predefined list)
  - Condition (New, Like New, Good, Fair, Poor)
  - Brand (optional)
  - Size/Dimensions (optional)

- **Image Requirements**:
  - Supported formats: JPEG, PNG, WebP
  - Max file size: 5MB per image
  - Automatic compression and optimization
  - Primary image selection

#### 3.2.2 Pricing Options
- **Fixed Price**:
  - Set price in ZAR
  - Minimum: R10
  - Maximum: R1,000,000
  - Optional "negotiable" flag

- **Open to Offers**:
  - Set minimum acceptable offer (optional)
  - Auto-reject offers below minimum
  - Offer expiry time (24-72 hours)

#### 3.2.3 Seller Dashboard
- **Active Listings**: Edit, pause, delete capabilities
- **Pending Approval**: Status tracking
- **Sold Items**: Transaction history
- **Offers Received**: Accept, reject, counter-offer
- **Performance Metrics**: Views, inquiries, conversion rate
- **Earnings Summary**: Gross sales, commission, net earnings

### 3.3 Buyer Features

#### 3.3.1 Browse & Discovery
- **Homepage**: Featured items, categories, trending
- **Search**:
  - Text search with autocomplete
  - Advanced filters (category, price range, condition, location)
  - Sort options (newest, price low-high, price high-low, distance)
- **Category Browse**: Hierarchical navigation
- **Saved Searches**: Alert notifications for new matches

#### 3.3.2 Item Detail View
- **Image Gallery**: Zoomable images with lightbox
- **Item Information**: All details from listing
- **Seller Profile**: Name, rating, response time
- **Location Map**: Approximate area (privacy-protected)
- **Action Buttons**: Buy Now, Make Offer, Save, Share
- **Related Items**: Similar listings

#### 3.3.3 Purchase & Offers
- **Fixed Price Purchase**:
  - Add to cart functionality
  - Checkout with payment details
  - Order confirmation

- **Make Offer**:
  - Offer amount input
  - Optional message to seller
  - Offer tracking in user dashboard
  - Notification on acceptance/rejection

#### 3.3.4 Buyer Dashboard
- **Purchase History**: All completed transactions
- **Active Offers**: Status tracking
- **Saved Items**: Watchlist management
- **Messages**: Communication with sellers

### 3.4 Admin Features

#### 3.4.1 Moderation Dashboard
- **Pending Approvals Queue**:
  - Bulk actions (approve, reject)
  - Quick view without leaving queue
  - Rejection reasons template
  - Priority sorting (oldest first)

- **Flagged Content**:
  - User reports management
  - Automatic flagging rules
  - Investigation tools

#### 3.4.2 Admin Listing Creation
- **Direct Posting**: Bypass approval workflow
- **Bulk Upload**: CSV import capability
- **Featured Items**: Promotion management
- **Inventory Management**: Stock tracking for admin items

#### 3.4.3 Analytics Dashboard
- **Sales Metrics**:
  - Total GMV (Gross Merchandise Value)
  - Commission earned
  - Average order value
  - Conversion rates

- **User Metrics**:
  - Active users (DAU, MAU)
  - New registrations
  - User retention

- **Listing Metrics**:
  - Total active listings
  - Categories performance
  - Average time to sell

#### 3.4.4 Transaction Management
- **Transaction History**: All platform transactions
- **Dispute Resolution**: Mediation tools
- **Refund Processing**: Manual override capability
- **Commission Tracking**: Detailed revenue reports

### 3.5 Communication Features

#### 3.5.1 In-App Messaging
- **Buyer-Seller Chat**: Context-aware (linked to specific item)
- **Message History**: Persistent conversation threads
- **Notification System**: Email and in-app notifications
- **Spam Protection**: Rate limiting, content filtering

---

## 4. User Stories

### 4.1 Seller User Stories

**US-S1**: As a seller, I want to create a listing with multiple photos so buyers can see my item clearly
- **Acceptance Criteria**:
  - Can upload 1-10 images
  - Can reorder images
  - Can set primary image
  - Images are automatically optimized

**US-S2**: As a seller, I want to choose between fixed price and accepting offers so I can maximize my selling potential
- **Acceptance Criteria**:
  - Can select pricing strategy during listing
  - Can switch between strategies (before approval)
  - Can set minimum acceptable offer

**US-S3**: As a seller, I want to track my earnings after commission so I know my net income
- **Acceptance Criteria**:
  - Dashboard shows gross and net earnings
  - Commission calculation is transparent
  - Can export earnings report

### 4.2 Buyer User Stories

**US-B1**: As a buyer, I want to search and filter items so I can find exactly what I need
- **Acceptance Criteria**:
  - Can search by keyword
  - Can filter by multiple criteria simultaneously
  - Search results are relevant
  - Can save search preferences

**US-B2**: As a buyer, I want to make offers on items so I can negotiate a fair price
- **Acceptance Criteria**:
  - Can submit offer with optional message
  - Receive notification of seller response
  - Can track all active offers
  - Offers expire after set time

**US-B3**: As a buyer, I want to see seller ratings and history so I can trust my purchase
- **Acceptance Criteria**:
  - Seller profile shows rating
  - Can view seller's other items
  - Response time is displayed

### 4.3 Admin User Stories

**US-A1**: As an admin, I want to review listings before they go live so I can maintain platform quality
- **Acceptance Criteria**:
  - Queue shows pending listings
  - Can approve/reject with reasons
  - Can bulk process similar items
  - Rejection sends notification to seller

**US-A2**: As an admin, I want to view platform analytics so I can make data-driven decisions
- **Acceptance Criteria**:
  - Real-time dashboard updates
  - Customizable date ranges
  - Export capabilities
  - Mobile-responsive views

---

## 5. Technical Requirements

### 5.1 Architecture

#### 5.1.1 Frontend Architecture
- **Framework**: Next.js 16.0.0 with App Router
- **UI Library**: React 19.2.0
- **Component Library**: shadcn/ui (latest)
- **Styling**: Tailwind CSS v4
- **State Management**: React Context + Server State
- **Form Handling**: React Hook Form with Zod validation
- **Image Handling**: Next/Image with cloud storage

#### 5.1.2 Backend Architecture
- **API Routes**: Next.js Route Handlers (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **File Storage**: AWS S3 or Cloudinary
- **Payment Processing**: Integration ready (Paystack/PayFast)
- **Email Service**: SendGrid or Resend

#### 5.1.3 Performance Requirements
- **Page Load**: < 2 seconds on 3G
- **Time to Interactive**: < 3 seconds
- **Lighthouse Score**: > 90 for performance
- **API Response**: < 500ms for standard queries
- **Image Optimization**: Automatic WebP conversion

### 5.2 Data Models

#### 5.2.1 User Model
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  location: {
    city: string;
    province: string;
  };
  role: 'buyer' | 'seller' | 'admin';
  profileImage?: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 5.2.2 Listing Model
```typescript
interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  images: string[];
  primaryImage: string;
  pricingType: 'fixed' | 'offers';
  price?: number;
  minOffer?: number;
  status: 'pending' | 'approved' | 'rejected' | 'sold' | 'paused';
  location: Location;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  soldAt?: Date;
}
```

#### 5.2.3 Transaction Model
```typescript
interface Transaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  createdAt: Date;
  completedAt?: Date;
}
```

#### 5.2.4 Offer Model
```typescript
interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  amount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'countered';
  expiresAt: Date;
  createdAt: Date;
  respondedAt?: Date;
}
```

### 5.3 API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Password reset

#### Listings
- `GET /api/listings` - Browse listings (with filters)
- `GET /api/listings/[id]` - Get single listing
- `POST /api/listings` - Create listing
- `PUT /api/listings/[id]` - Update listing
- `DELETE /api/listings/[id]` - Delete listing

#### Offers
- `POST /api/offers` - Create offer
- `GET /api/offers` - Get user's offers
- `PUT /api/offers/[id]` - Respond to offer

#### Admin
- `GET /api/admin/pending` - Get pending listings
- `POST /api/admin/approve/[id]` - Approve listing
- `POST /api/admin/reject/[id]` - Reject listing
- `GET /api/admin/analytics` - Get platform analytics

---

## 6. UI/UX Design System with shadcn/ui & Tailwind CSS v4

### 6.1 Design Principles

#### 6.1.1 Mobile-First Responsive Design
- **Approach**: Design for mobile (unprefixed utilities), scale up to desktop
- **Breakpoints**:
  - Default: Mobile (< 640px)
  - `sm`: 640px (tablet portrait)
  - `md`: 768px (tablet landscape)
  - `lg`: 1024px (desktop)
  - `xl`: 1280px (large desktop)
  - `2xl`: 1536px (extra large)

#### 6.1.2 Accessibility Standards
- **WCAG 2.1 AA Compliance**: All components meet accessibility requirements
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators**: Visible focus states on all interactive elements

#### 6.1.3 Component Composition Pattern
- **shadcn/ui Best Practice**: Use composition over render props
- **Type Safety**: Full TypeScript support with proper type inference
- **Customization**: Components are copy-paste and fully customizable
- **Consistency**: Unified design language across all components

### 6.2 Core UI Components (shadcn/ui)

#### 6.2.1 Form Components
- **Input**: Text, email, password, number inputs
- **Textarea**: Multi-line text input for descriptions
- **Select**: Dropdown selection (category, condition, location)
- **RadioGroup**: Pricing type selection (fixed vs offers)
- **Checkbox**: Terms acceptance, filters
- **Label**: Accessible form labels
- **Form**: Form wrapper with validation (React Hook Form + Zod)

#### 6.2.2 Layout Components
- **Card**: Product cards, dashboard widgets
- **Separator**: Visual dividers
- **Tabs**: Navigation between dashboard sections
- **Sheet**: Mobile navigation drawer
- **Dialog**: Modals for confirmations, forms
- **Drawer**: Bottom sheet for mobile actions

#### 6.2.3 Data Display Components
- **Table**: Transaction history, admin listings
- **DataTable**: Advanced tables with sorting, filtering, pagination
- **Badge**: Status indicators (pending, approved, sold)
- **Avatar**: User profile images
- **Carousel**: Image galleries for listings
- **Skeleton**: Loading states

#### 6.2.4 Feedback Components
- **Toast**: Success/error notifications
- **Alert**: Important messages
- **Progress**: Upload progress, loading states
- **Spinner**: Loading indicators

#### 6.2.5 Navigation Components
- **Breadcrumb**: Page hierarchy
- **Pagination**: Browse listings
- **NavigationMenu**: Main navigation
- **DropdownMenu**: User account menu

### 6.3 Page Layouts & Responsive Design

#### 6.3.1 Homepage Layout
```typescript
// Mobile-first responsive grid
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {listings.map(item => (
    <Card key={item.id}>
      {/* Responsive image */}
      <img className="h-48 w-full object-cover md:h-64" src={item.image} />
      <CardContent className="p-4">
        <h3 className="text-base font-semibold sm:text-lg">{item.title}</h3>
        <p className="mt-2 text-xl font-bold text-primary">R{item.price}</p>
      </CardContent>
    </Card>
  ))}
</div>
```

#### 6.3.2 Item Detail Page
```typescript
// Container queries for adaptive components
<div className="@container">
  <div className="flex flex-col @lg:flex-row gap-6">
    {/* Image gallery - full width on mobile, 60% on desktop */}
    <div className="w-full @lg:w-3/5">
      <Carousel images={listing.images} />
    </div>

    {/* Item details - stacked on mobile, sidebar on desktop */}
    <div className="w-full @lg:w-2/5">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl @md:text-2xl">{listing.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold @md:text-3xl">R{listing.price}</p>
          <Button className="mt-4 w-full @md:w-auto">Buy Now</Button>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
```

#### 6.3.3 Seller Dashboard
```typescript
// Responsive tabs and data tables
<Tabs defaultValue="active" className="w-full">
  <TabsList className="w-full justify-start overflow-x-auto">
    <TabsTrigger value="active">Active</TabsTrigger>
    <TabsTrigger value="pending">Pending</TabsTrigger>
    <TabsTrigger value="sold">Sold</TabsTrigger>
  </TabsList>

  <TabsContent value="active">
    {/* Mobile: Card view, Desktop: Table view */}
    <div className="block md:hidden">
      {listings.map(item => <ListingCard key={item.id} {...item} />)}
    </div>
    <div className="hidden md:block">
      <DataTable columns={columns} data={listings} />
    </div>
  </TabsContent>
</Tabs>
```

#### 6.3.4 Admin Moderation Queue
```typescript
// Responsive admin dashboard
<div className="flex flex-col lg:flex-row gap-6">
  {/* Sidebar filters - full width on mobile, 1/4 on desktop */}
  <aside className="w-full lg:w-1/4">
    <Card>
      <CardHeader>
        <CardTitle className="text-base lg:text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="electronics">Electronics</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  </aside>

  {/* Main content - full width on mobile, 3/4 on desktop */}
  <main className="w-full lg:w-3/4">
    <DataTable
      columns={moderationColumns}
      data={pendingListings}
      className="table-auto lg:table-fixed"
    />
  </main>
</div>
```

### 6.4 Form Patterns & Validation

#### 6.4.1 Create Listing Form
```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Zod schema for validation
const listingSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(50).max(2000),
  category: z.string(),
  condition: z.enum(["new", "like-new", "good", "fair", "poor"]),
  pricingType: z.enum(["fixed", "offers"]),
  price: z.number().min(10).max(1000000).optional(),
  minOffer: z.number().min(10).optional(),
  images: z.array(z.string()).min(1).max(10),
})

// Form component with shadcn/ui
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Title</FormLabel>
          <FormControl>
            <Input placeholder="Item title" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Responsive pricing fields */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField
        control={form.control}
        name="pricingType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pricing Type</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed">Fixed Price</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="offers" id="offers" />
                  <Label htmlFor="offers">Accept Offers</Label>
                </div>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />
    </div>

    <Button type="submit" className="w-full sm:w-auto">Submit Listing</Button>
  </form>
</Form>
```

#### 6.4.2 Authentication Forms
```typescript
// Login form with responsive layout
<Card className="w-full max-w-md mx-auto">
  <CardHeader>
    <CardTitle className="text-xl sm:text-2xl">Login</CardTitle>
    <CardDescription>Enter your credentials to access your account</CardDescription>
  </CardHeader>
  <CardContent>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">Login</Button>
      </form>
    </Form>
  </CardContent>
</Card>
```

### 6.5 Image Upload Component

```typescript
import { useState } from "react"
import { Upload, X } from "lucide-react"

// Drag-and-drop image upload with preview
export function ImageUpload({ onChange, maxImages = 10 }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>([])

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div className="border-2 border-dashed rounded-lg p-6 sm:p-12 text-center hover:border-primary transition-colors">
        <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
        <p className="mt-2 text-sm sm:text-base">
          Drag and drop images, or click to select
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {images.length}/{maxImages} images uploaded
        </p>
      </div>

      {/* Image previews - responsive grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {images.map((image, index) => (
          <div key={index} className="relative group aspect-square">
            <img
              src={image}
              alt={`Upload ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 6.6 Responsive Navigation

```typescript
// Desktop & mobile navigation
export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-lg sm:text-xl">SecondHand</span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex flex-1 items-center space-x-6">
          <Link href="/browse" className="text-sm font-medium">Browse</Link>
          <Link href="/categories" className="text-sm font-medium">Categories</Link>
          <Link href="/sell" className="text-sm font-medium">Sell</Link>
        </nav>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* User actions */}
        <div className="flex items-center space-x-2">
          <Button variant="default" size="sm" className="hidden sm:inline-flex">
            Sell Item
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar>
                  <AvatarImage src={user.image} />
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Dashboard</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile menu sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-4 mt-4">
            <Link href="/browse" className="text-lg font-medium">Browse</Link>
            <Link href="/categories" className="text-lg font-medium">Categories</Link>
            <Link href="/sell" className="text-lg font-medium">Sell</Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  )
}
```

### 6.7 Data Tables for Admin

```typescript
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

// Responsive data table columns
const columns: ColumnDef<Listing>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <img
          src={row.original.primaryImage}
          alt={row.original.title}
          className="h-10 w-10 rounded object-cover hidden sm:block"
        />
        <span className="font-medium truncate max-w-[200px]">
          {row.original.title}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <span className="font-semibold">R{row.original.price}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={
        row.original.status === "approved" ? "default" :
        row.original.status === "pending" ? "secondary" :
        "destructive"
      }>
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View</DropdownMenuItem>
          <DropdownMenuItem>Approve</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Reject</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

// Usage in admin dashboard
<DataTable
  columns={columns}
  data={pendingListings}
  // Mobile-friendly table with horizontal scroll
  className="min-w-[600px]"
/>
```

### 6.8 Theme Configuration (Tailwind CSS v4)

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Custom breakpoints for project needs */
  --breakpoint-xs: 475px;
  --breakpoint-3xl: 1920px;

  /* Custom container sizes */
  --container-8xl: 96rem;

  /* Color system (shadcn/ui compatible) */
  --color-background: 0 0% 100%;
  --color-foreground: 222.2 84% 4.9%;
  --color-primary: 221.2 83.2% 53.3%;
  --color-primary-foreground: 210 40% 98%;
  --color-secondary: 210 40% 96.1%;
  --color-muted: 210 40% 96.1%;
  --color-accent: 210 40% 96.1%;
  --color-destructive: 0 84.2% 60.2%;
  --color-border: 214.3 31.8% 91.4%;
  --color-input: 214.3 31.8% 91.4%;
  --color-ring: 221.2 83.2% 53.3%;

  /* Dark mode colors */
  @media (prefers-color-scheme: dark) {
    --color-background: 222.2 84% 4.9%;
    --color-foreground: 210 40% 98%;
    --color-primary: 217.2 91.2% 59.8%;
    --color-primary-foreground: 222.2 47.4% 11.2%;
    --color-secondary: 217.2 32.6% 17.5%;
    --color-muted: 217.2 32.6% 17.5%;
    --color-accent: 217.2 32.6% 17.5%;
    --color-destructive: 0 62.8% 30.6%;
    --color-border: 217.2 32.6% 17.5%;
    --color-input: 217.2 32.6% 17.5%;
    --color-ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 6.9 Accessibility Features

#### 6.9.1 Keyboard Navigation
- All interactive elements accessible via Tab key
- Escape key closes modals and dropdowns
- Enter/Space activates buttons and links
- Arrow keys navigate lists and menus

#### 6.9.2 Screen Reader Support
```typescript
// Proper ARIA labels
<Button aria-label="Add item to cart">
  <ShoppingCart className="h-4 w-4" />
</Button>

// Status announcements
<div role="status" aria-live="polite" className="sr-only">
  {items.length} items in your cart
</div>

// Form error announcements
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input
          {...field}
          aria-invalid={!!form.formState.errors.email}
          aria-describedby="email-error"
        />
      </FormControl>
      <FormMessage id="email-error" />
    </FormItem>
  )}
/>
```

#### 6.9.3 Focus Management
```typescript
// Trap focus in modals
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="focus:outline-none">
    <DialogHeader>
      <DialogTitle>Confirm Purchase</DialogTitle>
    </DialogHeader>
    {/* Focus automatically trapped within dialog */}
    <Button onClick={confirmPurchase} autoFocus>
      Confirm
    </Button>
  </DialogContent>
</Dialog>
```

### 6.10 Loading States & Skeletons

```typescript
// Skeleton loading for listing cards
export function ListingCardSkeleton() {
  return (
    <Card>
      <Skeleton className="h-48 w-full rounded-t-lg" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/4" />
      </CardContent>
    </Card>
  )
}

// Loading state for dashboard
export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  )
}
```

---

## 7. Business Logic

### 7.1 Commission Structure
- **Rate**: 20% of transaction value
- **Calculation**: Applied on successful sale completion
- **Timing**: Deducted before seller payout
- **Transparency**: Shown clearly during listing and checkout
- **Example**: R1000 sale = R800 to seller, R200 platform fee

### 7.2 Offer System Rules
- **Offer Validity**: 24-72 hours (configurable)
- **Multiple Offers**: Buyers can have one active offer per item
- **Counter Offers**: Sellers can counter once per offer
- **Auto-Rejection**: Offers below minimum are auto-rejected
- **Acceptance**: Binding commitment to sell
- **Notification**: Real-time updates to both parties

### 7.3 Approval Workflow
- **Submission**: Listing enters pending queue
- **Review Time**: Target < 24 hours
- **Approval Criteria**:
  - Appropriate images
  - Accurate description
  - Reasonable pricing
  - Correct categorization
- **Rejection**: Must include reason
- **Re-submission**: Allowed after addressing issues

### 7.4 Transaction Flow
1. **Purchase Initiation**: Buyer commits to purchase
2. **Payment Hold**: Funds secured (when payment integrated)
3. **Seller Notification**: Alert to arrange delivery
4. **Delivery Confirmation**: Buyer confirms receipt
5. **Commission Deduction**: 20% platform fee
6. **Seller Payout**: Net amount transferred
7. **Rating Exchange**: Both parties rate experience

---

## 8. Information Architecture

### 8.1 Page Hierarchy
```
/
├── /browse
│   ├── /category/[slug]
│   └── /search
├── /item/[id]
├── /sell
│   ├── /create
│   └── /edit/[id]
├── /account
│   ├── /dashboard
│   ├── /listings
│   ├── /purchases
│   ├── /offers
│   ├── /messages
│   └── /settings
├── /admin
│   ├── /moderation
│   ├── /analytics
│   ├── /transactions
│   └── /users
└── /auth
    ├── /login
    ├── /register
    └── /reset-password
```

---

## 9. Success Metrics

### 9.1 Business KPIs
- **GMV (Gross Merchandise Value)**: Total transaction value
- **Revenue**: Total commission earned (20% of GMV)
- **Take Rate**: Percentage of listings that convert to sales
- **Average Order Value**: Mean transaction amount
- **Monthly Active Sellers**: Sellers with active listings

### 9.2 User Metrics
- **User Acquisition**: New registrations per month
- **User Activation**: % of registered users who list/buy
- **User Retention**: Monthly active users (MAU)
- **User Satisfaction**: NPS score > 50

### 9.3 Platform Metrics
- **Listing Volume**: New listings per day
- **Approval Rate**: % of listings approved
- **Response Time**: Average seller response to offers
- **Time to Sell**: Average days from listing to sale
- **Search Effectiveness**: Click-through rate from search

### 9.4 Technical Metrics
- **Uptime**: 99.9% availability
- **Page Load Speed**: < 2 seconds
- **API Response Time**: < 500ms
- **Error Rate**: < 1% of requests
- **Mobile Usage**: > 60% of traffic
- **Lighthouse Score**: > 90 across all categories

---

## 10. Security & Compliance

### 10.1 Data Protection
- **POPIA Compliance**: South African data protection
- **Data Encryption**: TLS 1.3 for transmission, AES-256 at rest
- **PII Handling**: Minimal collection, secure storage
- **Data Retention**: 5 years for transactions, 2 years for messages
- **Right to Deletion**: User data removal on request

### 10.2 Payment Security
- **PCI DSS Compliance**: When payment integration added
- **Tokenization**: No credit card storage
- **Fraud Detection**: Unusual activity monitoring
- **Secure Checkout**: SSL/TLS encrypted
- **Payment Partners**: Paystack or PayFast (South African providers)

### 10.3 Content Moderation
- **Prohibited Items**: Illegal goods, weapons, counterfeit
- **Image Screening**: Inappropriate content detection
- **Text Filtering**: Profanity and spam detection
- **User Reporting**: Flag inappropriate content
- **Appeal Process**: Review wrongful removals

### 10.4 User Safety
- **Identity Verification**: Email and phone verification
- **Privacy Protection**: Hide exact addresses
- **Secure Messaging**: No personal info in initial contact
- **Scam Prevention**: Educational content and warnings
- **Rating System**: Build trust through reviews

---

## 11. Implementation Phases

### Phase 1: MVP (Months 1-2)
- User authentication (NextAuth.js)
- Basic listing creation with image upload
- Admin approval workflow
- Browse and search functionality
- Fixed price purchases
- Basic seller/buyer dashboards
- shadcn/ui component setup
- Responsive mobile-first layouts

### Phase 2: Core Features (Months 2-3)
- Offer system implementation
- In-app messaging
- Advanced search filters
- Seller ratings and reviews
- Transaction management
- Analytics dashboard for admin
- Email notifications

### Phase 3: Optimization (Months 3-4)
- Performance optimization (image CDN, caching)
- Mobile app-like experience (PWA)
- SEO implementation
- A/B testing framework
- Bug fixes and UX refinements
- Accessibility audit and fixes

### Phase 4: Growth (Months 4-6)
- Payment integration (Paystack/PayFast)
- Marketing features (featured listings)
- Advanced analytics
- Premium seller features
- API documentation
- Integration testing

---

## 12. Future Enhancements (Phase 2+)

### 12.1 Advanced Features
- **Mobile Apps**: iOS and Android native apps
- **Push Notifications**: Real-time alerts
- **AI Price Suggestions**: ML-based pricing recommendations
- **Virtual Try-On**: AR for clothing/accessories
- **Delivery Integration**: Partner with courier services

### 12.2 Premium Features
- **Featured Listings**: Paid promotion
- **Store Subscriptions**: Professional seller accounts
- **Analytics Pro**: Advanced seller insights
- **Bulk Tools**: Mass upload and management
- **Priority Support**: Dedicated seller assistance

### 12.3 Social Features
- **Follow Sellers**: Subscribe to favorite sellers
- **Social Sharing**: Share to WhatsApp, Facebook
- **Community Groups**: Interest-based buying groups
- **Live Auctions**: Real-time bidding events
- **Referral Program**: Incentivized user acquisition

---

## Appendices

### A. Category List
- Electronics & Gadgets
- Clothing & Accessories
- Home & Garden
- Sports & Outdoors
- Books & Media
- Toys & Games
- Vehicles & Parts
- Collectibles & Art
- Baby & Kids
- Pet Supplies

### B. Condition Definitions
- **New**: Never used, original packaging
- **Like New**: Minimal use, no visible wear
- **Good**: Normal wear, fully functional
- **Fair**: Visible wear, minor issues
- **Poor**: Significant wear, disclosed issues

### C. Commission Examples
- Item sold for R100: Seller receives R80, Platform R20
- Item sold for R1,000: Seller receives R800, Platform R200
- Item sold for R10,000: Seller receives R8,000, Platform R2,000

### D. shadcn/ui Component Checklist

**Forms & Inputs:**
- [ ] Form (with React Hook Form)
- [ ] Input
- [ ] Textarea
- [ ] Select
- [ ] RadioGroup
- [ ] Checkbox
- [ ] Label
- [ ] Switch

**Layout:**
- [ ] Card
- [ ] Separator
- [ ] Tabs
- [ ] Sheet
- [ ] Dialog
- [ ] Drawer

**Data Display:**
- [ ] Table
- [ ] DataTable
- [ ] Badge
- [ ] Avatar
- [ ] Carousel
- [ ] Skeleton

**Feedback:**
- [ ] Toast
- [ ] Alert
- [ ] Progress
- [ ] Spinner

**Navigation:**
- [ ] Breadcrumb
- [ ] Pagination
- [ ] NavigationMenu
- [ ] DropdownMenu

---

**Document Status**: Ready for Implementation

This PRD provides a comprehensive foundation for building the second-hand marketplace platform with modern UI/UX best practices using shadcn/ui and Tailwind CSS v4. The document emphasizes mobile-first responsive design, accessibility, and component composition patterns for a scalable, maintainable codebase.
