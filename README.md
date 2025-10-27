# LOTOSALE - Second-Hand Marketplace Platform

A modern, AI-powered marketplace for buying and selling pre-owned items in South Africa. Built with Next.js 16, React 19, TypeScript, and cutting-edge AI technology.

## Features

### For Sellers
- **Images-First Listing Creation**: Upload photos first, AI handles the rest
- **AI Category Suggestions**: GPT-4o Vision automatically suggests categories from images (70-85% accuracy)
- **AI-Powered Descriptions**: Generate compelling product descriptions and titles from images
- **Smart Pricing**: Choose between fixed pricing or accept offers with optional minimums
- **Real-Time Dashboard**: Track views, manage listings, and monitor offers

### For Buyers
- **Advanced Search & Filters**: Find exactly what you're looking for
- **Location-Based Browsing**: Filter by South African provinces and cities
- **Smart Categories**: Hierarchical category system with AI-powered suggestions
- **Offer Negotiation**: Make offers on items accepting negotiations
- **Secure Transactions**: Built-in payment processing with 20% platform commission

### For Admins
- **Admin Dashboard**: Comprehensive platform analytics and charts
- **Listing Moderation**: Approve, reject, or pause listings with reasons
- **Category Management**: Create, edit, merge, and analyze categories
- **AI Category Review**: Monitor and optimize AI-generated categories
- **User Management**: Manage roles, ban users, and track activity
- **Audit Logging**: Complete audit trail for compliance and debugging

### AI-Powered Features

#### 1. AI Category Suggestions
- **Technology**: OpenAI GPT-4o Vision
- **Accuracy**: 70-85% acceptance rate
- **Confidence Scoring**: 0-100% confidence per suggestion
- **Token Efficient**: Uses 'low' detail images (65 tokens vs 1105 for 'high')
- **A/B Testing**: Built-in support for prompt optimization
- **Smart Learning**: Improves from user corrections

**How It Works:**
```
User uploads images → AI analyzes → Suggests 2-3 categories
with confidence scores → User accepts or overrides
```

#### 2. AI Description Generation
- **Multiple Templates**: Detailed, Concise, or Storytelling styles
- **Title Extraction**: Automatically generates optimized titles
- **Editable Suggestions**: Review and edit before applying
- **Context-Aware**: Considers category and product features

#### 3. Dynamic Category System
- **Flexible Hierarchy**: Parent-child category relationships
- **AI-Generated Categories**: System creates categories based on patterns
- **Admin Control**: Review, merge, or remove AI categories
- **Analytics**: Track category performance and distribution

## Technology Stack

- **Framework**: Next.js 16.0.0 (App Router, RSC)
- **Frontend**: React 19.2.0, TypeScript 5
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: PostgreSQL (Neon serverless) + Prisma ORM
- **Authentication**: NextAuth.js v5 with JWT sessions
- **AI Services**: OpenAI GPT-4o Vision
- **File Storage**: Cloudinary CDN
- **Email**: Resend API
- **Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright MCP
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm package manager (`npm install -g pnpm`)
- PostgreSQL database (or Neon account)
- OpenAI API key (for AI features)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/second_hand.git
   cd second_hand
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   ```env
   DATABASE_URL="postgresql://..."
   AUTH_SECRET="generate-with-openssl-rand-base64-32"
   OPENAI_API_KEY="sk-..."
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   RESEND_API_KEY="re_..."
   EMAIL_FROM="noreply@yourdomain.com"
   ```

4. **Set up the database**:
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate deploy

   # Seed database with sample data
   npx tsx scripts/seed-neon.ts
   ```

5. **Run the development server**:
   ```bash
   pnpm dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

### First-Time Setup

**Create an admin account**:
```bash
# Check if admin exists
npx tsx scripts/check-admin.ts

# Reset admin password if needed
npx tsx scripts/reset-admin-password.ts
```

**Access admin dashboard**: `/admin` (requires ADMIN role)

## Development

### Available Commands

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate coverage report
```

### Database Commands

```bash
npx prisma studio            # Open Prisma Studio GUI
npx prisma migrate dev       # Create and apply migration
npx prisma migrate deploy    # Apply migrations (production)
npx prisma db push           # Push schema changes (dev only)
npx prisma generate          # Regenerate Prisma client
```

### Testing

Run tests before committing:
```bash
pnpm test              # All tests
pnpm test:coverage     # With coverage report
```

**Coverage thresholds**: 80% (statements, branches, functions, lines)

### Code Structure

```
/app                    # Next.js App Router pages
  /admin                # Admin dashboard
  /auth                 # Authentication pages
  /listings             # Browse and create listings
  /api                  # API routes
/components             # React components
  /ui                   # shadcn/ui base components
  /listings             # Listing-specific components
  /admin                # Admin components
/lib                    # Utilities and configurations
  /ai                   # AI services and prompts
  /validations          # Zod schemas
/prisma                 # Database schema and migrations
/docs                   # Documentation
  /features             # Feature documentation
  /user-guides          # End-user guides
  /admin-guides         # Admin guides
```

## Documentation

- **[CLAUDE.md](./CLAUDE.md)**: Complete technical documentation
- **[AI Category Suggestions User Guide](./docs/user-guides/ai-category-suggestions.md)**: How to use AI features
- **[Category Management Admin Guide](./docs/admin-guides/category-management.md)**: Admin category management
- **[Admin Dashboard Guide](./docs/features/admin-backoffice-dashboard.md)**: Admin panel overview

## Key Features Deep Dive

### Images-First Listing Flow

Traditional marketplaces ask for category first. LOTOSALE flips this:

1. **Upload images** (1-10 photos)
2. **AI analyzes** images in seconds
3. **Review suggestions** with confidence scores
4. **Select category** (or choose manually)
5. **Add details** (title/description can also be AI-generated)
6. **Set pricing** and location
7. **Preview & submit**

**Why images-first?**
- Sellers already have photos ready
- AI can analyze images before user fills forms
- Better category accuracy (visual analysis > text guesses)
- Faster listing creation (less thinking, more doing)

### AI Category System Architecture

```
┌──────────────┐
│ User uploads │
│   images     │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ OpenAI GPT-4o Vision │
│  (category-suggester)│
└──────┬───────────────┘
       │
       ▼
┌─────────────────────┐     ┌──────────────┐
│ Category Matcher    │────►│   Database   │
│ (confidence scorer) │     │  (Category)  │
└──────┬──────────────┘     └──────────────┘
       │
       ▼
┌──────────────────────┐
│  2-3 Suggestions     │
│  [95%] Kitchen App   │
│  [75%] Electronics   │
└──────────────────────┘
```

### Category Hierarchy

Categories use a flexible parent-child structure:

```
Electronics
├── Smartphones
│   ├── Android Phones
│   └── iPhones
├── Laptops
│   ├── Gaming Laptops
│   └── Business Laptops
└── Gaming Consoles

Home & Garden
├── Kitchen Appliances
├── Furniture
│   ├── Living Room
│   └── Bedroom
└── Garden Tools
```

**Admin Controls:**
- Create new categories
- Edit existing (name, icon, description)
- Merge duplicates
- Activate/deactivate
- View analytics (item counts, trends)

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Import to Vercel**
3. **Configure environment variables** (same as `.env`)
4. **Deploy!**

**Important**:
- Set `NEXTAUTH_URL` to your production domain
- Ensure `DATABASE_URL` points to production database
- Run migrations: `npx prisma migrate deploy`

### Self-Hosting

1. **Build the app**:
   ```bash
   pnpm build
   ```

2. **Start production server**:
   ```bash
   pnpm start
   ```

3. **Use a process manager** (PM2, systemd):
   ```bash
   pm2 start npm --name "lotosale" -- start
   ```

## Contributing

We welcome contributions! Please see our contributing guidelines (coming soon).

### Reporting Issues

- **Bugs**: Open an issue with reproduction steps
- **Feature Requests**: Describe the use case and expected behavior
- **Security Issues**: Email security@lotosale.com (do not open public issues)

## License

This project is proprietary. All rights reserved.

## Support

- **Documentation**: See `/docs` folder
- **Email**: support@lotosale.com
- **Issues**: GitHub Issues

---

**Built with ❤️ in South Africa**
