# Wave 1A: Authentication & Infrastructure Setup - oren-backend

**Agent**: oren-backend
**Priority**: P0 - Critical Path
**Estimated Effort**: Medium (3-5 days)
**Dependencies**: None (runs parallel with gal-database)
**Blocks**: All authentication features, listing creation, email notifications

---

## Mission

Set up the complete authentication and infrastructure foundation for the Second-Hand Marketplace platform. You will configure NextAuth.js with JWT strategy, set up email verification service, configure image storage, and implement the core authentication middleware needed for Phase 1 MVP.

---

## Context

- **Project**: South African Second-Hand Marketplace
- **Stack**: Next.js 16.0.0 App Router, React 19.2.0, TypeScript, NextAuth.js v5
- **Location**: `/Users/haim/Projects/second_hand`
- **Phase**: MVP Phase 1
- **Auth Strategy**: JWT tokens with 30-day persistent sessions
- **Email Provider**: Resend (preferred) or SendGrid
- **Image Storage**: Cloudinary (preferred) or AWS S3

---

## Your Tasks

### Task 1: Install NextAuth.js and Dependencies

**Install NextAuth.js v5:**
```bash
npm install next-auth@beta
npm install @auth/prisma-adapter
npm install bcryptjs
npm install -D @types/bcryptjs
```

**Install Email Service (Resend - recommended):**
```bash
npm install resend
```

**Alternative - SendGrid:**
```bash
npm install @sendgrid/mail
```

**Install Image Storage (Cloudinary - recommended):**
```bash
npm install cloudinary
npm install next-cloudinary
```

**Alternative - AWS S3:**
```bash
npm install @aws-sdk/client-s3
npm install @aws-sdk/s3-request-presigner
```

---

### Task 2: Configure Environment Variables

Create/update `.env` file with:

```env
# Database (coordinated with gal-database)
DATABASE_URL="postgresql://user:password@localhost:5432/second_hand?schema=public"

# NextAuth.js
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

# Resend (Email Service)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="Second-Hand Marketplace <noreply@yourdomain.com>"

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_UPLOAD_PRESET="second-hand-listings"

# Alternative: AWS S3
# AWS_REGION="af-south-1"
# AWS_ACCESS_KEY_ID="your-access-key"
# AWS_SECRET_ACCESS_KEY="your-secret-key"
# AWS_S3_BUCKET="second-hand-images"
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

### Task 3: Set Up NextAuth.js Configuration

Create `auth.ts` in the project root:

```typescript
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        // Check if account is locked
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
          const remainingMinutes = Math.ceil(
            (user.lockoutUntil.getTime() - Date.now()) / 60000
          );
          throw new Error(
            `Account locked. Try again in ${remainingMinutes} minutes.`
          );
        }

        // Verify password
        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          // Increment failed login attempts
          const failedAttempts = user.failedLoginAttempts + 1;
          const lockoutUntil =
            failedAttempts >= 5
              ? new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
              : null;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: failedAttempts,
              lockoutUntil: lockoutUntil,
            },
          });

          throw new Error("Invalid credentials");
        }

        // Reset failed login attempts on successful login
        if (user.failedLoginAttempts > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockoutUntil: null,
            },
          });
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.profileImage,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as User).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
```

---

### Task 4: Create NextAuth API Route Handler

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

---

### Task 5: Create Authentication Middleware

Create `middleware.ts` in project root:

```typescript
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/reset-password",
    "/browse",
    "/item",
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Protected routes
  const protectedRoutes = ["/account", "/sell"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Admin routes
  const adminRoutes = ["/admin"];
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Allow public routes
  if (isPublicRoute && !isProtectedRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  // Require authentication for protected routes
  if (isProtectedRoute && !req.auth) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Require admin role for admin routes
  if (isAdminRoute) {
    if (!req.auth) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (req.auth.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

### Task 6: Set Up Email Service (Resend)

Create `lib/email.ts`:

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@example.com",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      throw new Error("Failed to send email");
    }

    return data;
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
}

// Email verification template
export function getVerificationEmailHtml(
  verificationUrl: string,
  name: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333;">Verify Your Email</h1>
        <p>Hi ${name},</p>
        <p>Thank you for registering with Second-Hand Marketplace. Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
          Verify Email
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #999; font-size: 12px;">Second-Hand Marketplace</p>
      </body>
    </html>
  `;
}

// Password reset template
export function getPasswordResetEmailHtml(
  resetUrl: string,
  name: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333;">Reset Your Password</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #999; font-size: 12px;">Second-Hand Marketplace</p>
      </body>
    </html>
  `;
}
```

---

### Task 7: Set Up Image Storage (Cloudinary)

Create `lib/cloudinary.ts`:

```typescript
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload image to Cloudinary
 * @param file - Base64 string or file path
 * @param folder - Cloudinary folder (default: "listings")
 * @returns Upload result with URL and metadata
 */
export async function uploadImage(
  file: string,
  folder: string = "listings"
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `second-hand/${folder}`,
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Upload multiple images in batch
 */
export async function uploadImages(
  files: string[],
  folder: string = "listings"
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file) => uploadImage(file, folder));
  return Promise.all(uploadPromises);
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image");
  }
}

/**
 * Delete multiple images in batch
 */
export async function deleteImages(publicIds: string[]): Promise<void> {
  const deletePromises = publicIds.map((id) => deleteImage(id));
  await Promise.all(deletePromises);
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  } = {}
): string {
  const {
    width = 800,
    height = 800,
    crop = "limit",
    quality = "auto:good",
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop },
      { quality },
      { fetch_format: "auto" },
    ],
  });
}

export default cloudinary;
```

---

### Task 8: Create Image Upload API Route

Create `app/api/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await uploadImage(base64, "listings");

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
```

---

### Task 9: Create Password Utilities

Create `lib/password.ts`:

```typescript
import { hash, compare } from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

/**
 * Validate password strength
 * Requirements: min 8 chars, 1 uppercase, 1 number
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

---

### Task 10: Extend NextAuth Types

Create `types/next-auth.d.ts`:

```typescript
import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
```

---

### Task 11: Create Auth Helper Functions

Create `lib/auth-helpers.ts`:

```typescript
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Get current session or redirect to login
 */
export async function requireAuth() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }
  return session;
}

/**
 * Require admin role or redirect
 */
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session;
}

/**
 * Get current user ID or null
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}
```

---

## Acceptance Criteria

✅ **NextAuth.js Configured:**
- NextAuth.js v5 installed and configured
- JWT strategy with 30-day sessions
- Credentials provider working
- Account lockout after 5 failed attempts (15-minute lockout)
- Email verification check before login

✅ **Middleware Implemented:**
- Public routes accessible without auth
- Protected routes redirect to login
- Admin routes require ADMIN role
- Callback URL preserved on redirect

✅ **Email Service Ready:**
- Resend (or SendGrid) configured
- Email sending utility functions created
- Verification email template
- Password reset email template
- Environment variables configured

✅ **Image Storage Ready:**
- Cloudinary (or AWS S3) configured
- Image upload API route created
- File validation (type, size)
- Automatic optimization (1200x1200, quality: auto)
- Multiple image upload support
- Image deletion support

✅ **Password Security:**
- bcryptjs hashing implemented
- Password validation (8+ chars, 1 uppercase, 1 number)
- Compare utility for verification
- Salt rounds configured (10)

✅ **Type Safety:**
- NextAuth types extended
- User role in session
- TypeScript compilation successful

✅ **Helper Functions:**
- requireAuth() for protected pages
- requireAdmin() for admin pages
- getCurrentUserId() utility
- Role checking utilities

---

## Testing Checklist

Before marking complete, verify:

```bash
# 1. Environment variables set
cat .env  # Check all required vars are present

# 2. TypeScript compilation
npm run build  # Should complete without errors

# 3. Test email sending (manual)
# Create a test script to send verification email

# 4. Test image upload (manual)
# Create a test script to upload an image
```

---

## Important Notes

1. **AUTH_SECRET** - Must be cryptographically secure, never commit to git
2. **Email Provider** - Resend preferred (modern, Next.js friendly, generous free tier)
3. **Image Storage** - Cloudinary preferred (easier setup, automatic optimization)
4. **JWT Strategy** - More scalable than database sessions for this use case
5. **Account Lockout** - 15 minutes after 5 failed attempts (security best practice)
6. **Email Verification** - Required before login (prevents spam accounts)
7. **Image Optimization** - Automatic WebP conversion, quality optimization
8. **File Size** - 5MB limit per image (reasonable for marketplace photos)

---

## Deliverables

Provide a summary report with:

1. **Configuration Summary**: What services were configured (Resend/SendGrid, Cloudinary/S3)
2. **Environment Variables**: List of all required env vars (without exposing secrets)
3. **File Paths**: Absolute paths to all created files:
   - `/Users/haim/Projects/second_hand/auth.ts`
   - `/Users/haim/Projects/second_hand/middleware.ts`
   - `/Users/haim/Projects/second_hand/lib/email.ts`
   - `/Users/haim/Projects/second_hand/lib/cloudinary.ts`
   - `/Users/haim/Projects/second_hand/lib/password.ts`
   - `/Users/haim/Projects/second_hand/lib/auth-helpers.ts`
   - `/Users/haim/Projects/second_hand/app/api/auth/[...nextauth]/route.ts`
   - `/Users/haim/Projects/second_hand/app/api/upload/route.ts`
   - `/Users/haim/Projects/second_hand/types/next-auth.d.ts`

4. **Testing Results**: Confirmation that TypeScript compiles and services are configured
5. **Next Steps**: What agents can now proceed (e.g., adi-fullstack can build auth forms)

---

**Ready to begin!** This infrastructure is critical - focus on security and reliability.
