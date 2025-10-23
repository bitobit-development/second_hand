import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Neon database...\n');

  // Seed Users
  const users = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@secondhand.co.za',
      name: 'Admin User',
      phone: '+27821234567',
      city: 'Cape Town',
      province: 'Western Cape',
      role: 'ADMIN' as const,
      rating: 5,
      reviewCount: 0,
      emailVerified: new Date('2025-10-22T06:18:09.801Z'),
      password: '$2a$10$rVqQXhYlVCmKf6vElcUH4OmKYKwYVpx2cCzU1J7LJKl5YLMQ6Bb8e',
      failedLoginAttempts: 0,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'john.seller@example.com',
      name: 'John Seller',
      phone: '+27837654321',
      city: 'Johannesburg',
      province: 'Gauteng',
      role: 'SELLER' as const,
      rating: 4.5,
      reviewCount: 12,
      emailVerified: new Date('2025-10-22T06:18:09.801Z'),
      password: '$2a$10$rVqQXhYlVCmKf6vElcUH4OmKYKwYVpx2cCzU1J7LJKl5YLMQ6Bb8e',
      failedLoginAttempts: 0,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'sarah.buyer@example.com',
      name: 'Sarah Buyer',
      phone: '+27829876543',
      city: 'Durban',
      province: 'KwaZulu-Natal',
      role: 'BUYER' as const,
      rating: 4.8,
      reviewCount: 8,
      emailVerified: new Date('2025-10-22T06:18:09.801Z'),
      password: '$2a$10$rVqQXhYlVCmKf6vElcUH4OmKYKwYVpx2cCzU1J7LJKl5YLMQ6Bb8e',
      failedLoginAttempts: 0,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  console.log('✅ Seeded 3 users');

  // Seed Listings
  const listings = [
    {
      id: '11dcec2e-d9dc-4f33-8f92-86e4f8fa5ae0',
      sellerId: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Samsung Galaxy S21 Ultra - Excellent Condition',
      description: 'Barely used Samsung Galaxy S21 Ultra in phantom black. Includes original box, charger, and screen protector.',
      category: 'ELECTRONICS' as const,
      condition: 'LIKE_NEW' as const,
      images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', 'https://images.unsplash.com/photo-1610945265043-be1b1bae5fdf?w=800'],
      primaryImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
      pricingType: 'FIXED' as const,
      price: 8999.99,
      status: 'APPROVED' as const,
      city: 'Johannesburg',
      province: 'Gauteng',
      views: 45,
      approvedAt: new Date('2025-10-22T06:18:09.803Z'),
    },
    {
      id: 'bdfc9f9e-a2ac-4ae0-a8b1-5939c78e051e',
      sellerId: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Dell XPS 15 Laptop - i7, 16GB RAM, 512GB SSD',
      description: 'High-performance laptop perfect for work and gaming.',
      category: 'ELECTRONICS' as const,
      condition: 'GOOD' as const,
      images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800'],
      primaryImage: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
      pricingType: 'OFFERS' as const,
      status: 'APPROVED' as const,
      city: 'Johannesburg',
      province: 'Gauteng',
      views: 67,
      approvedAt: new Date('2025-10-22T06:18:09.803Z'),
    },
    {
      id: '954fdea4-8d97-40fb-82fc-5729cf179bf0',
      sellerId: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Nike Air Max 90 - Size 9 UK',
      description: 'Classic Nike Air Max 90 in white and red colorway.',
      category: 'CLOTHING' as const,
      condition: 'LIKE_NEW' as const,
      images: ['https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800'],
      primaryImage: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800',
      pricingType: 'FIXED' as const,
      price: 1299.00,
      status: 'APPROVED' as const,
      city: 'Cape Town',
      province: 'Western Cape',
      views: 23,
      approvedAt: new Date('2025-10-22T06:18:09.803Z'),
    },
    {
      id: '98249d53-e059-42af-b317-7567f824db83',
      sellerId: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Vintage Wooden Dining Table with 6 Chairs',
      description: 'Beautiful solid wood dining set. Chairs recently reupholstered.',
      category: 'HOME_GARDEN' as const,
      condition: 'GOOD' as const,
      images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800'],
      primaryImage: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
      pricingType: 'OFFERS' as const,
      status: 'APPROVED' as const,
      city: 'Pretoria',
      province: 'Gauteng',
      views: 34,
      approvedAt: new Date('2025-10-22T06:18:09.803Z'),
    },
    {
      id: '000d7371-176f-490b-b4c3-f140f9f06fe4',
      sellerId: '550e8400-e29b-41d4-a716-446655440001',
      title: '2018 Honda Civic 1.5T Sport',
      description: 'Immaculate Honda Civic with full service history. 65,000km on the clock.',
      category: 'VEHICLES' as const,
      condition: 'GOOD' as const,
      images: ['https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800', 'https://images.unsplash.com/photo-1573038969876-c97a4879acd0?w=800'],
      primaryImage: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800',
      pricingType: 'FIXED' as const,
      price: 285000.00,
      status: 'APPROVED' as const,
      city: 'Durban',
      province: 'KwaZulu-Natal',
      views: 156,
      approvedAt: new Date('2025-10-22T06:18:09.803Z'),
    },
    {
      id: '301d5b0d-ff2d-4385-a24e-caa0717f711e',
      sellerId: '550e8400-e29b-41d4-a716-446655440001',
      title: 'PlayStation 5 with 2 Controllers',
      description: 'PS5 disc version with two DualSense controllers and 3 games.',
      category: 'ELECTRONICS' as const,
      condition: 'LIKE_NEW' as const,
      images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800'],
      primaryImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800',
      pricingType: 'FIXED' as const,
      price: 7999.00,
      status: 'PENDING' as const,
      city: 'Johannesburg',
      province: 'Gauteng',
      views: 0,
    },
    {
      id: 'e4ab7106-7c9f-4abf-b515-5720a82428fb',
      sellerId: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Harry Potter Complete Book Collection',
      description: 'All 7 Harry Potter books in hardcover. Excellent condition.',
      category: 'BOOKS' as const,
      condition: 'LIKE_NEW' as const,
      images: ['https://images.unsplash.com/photo-1618365908648-e71bd5716cba?w=800'],
      primaryImage: 'https://images.unsplash.com/photo-1618365908648-e71bd5716cba?w=800',
      pricingType: 'OFFERS' as const,
      status: 'APPROVED' as const,
      city: 'Port Elizabeth',
      province: 'Eastern Cape',
      views: 18,
      approvedAt: new Date('2025-10-22T06:18:09.803Z'),
    },
    {
      id: 'f92032b6-d044-43e2-8ab0-2fc856d3c3f1',
      sellerId: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Professional Mountain Bike - 29" Wheels',
      description: 'Scott Spark 960 mountain bike. Carbon frame, Shimano gears.',
      category: 'SPORTS' as const,
      condition: 'GOOD' as const,
      images: ['https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800'],
      primaryImage: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800',
      pricingType: 'FIXED' as const,
      price: 15999.00,
      status: 'APPROVED' as const,
      city: 'Stellenbosch',
      province: 'Western Cape',
      views: 42,
      approvedAt: new Date('2025-10-22T06:18:09.803Z'),
    },
    {
      id: '08fffa38-a8b8-4db2-b3b7-d1da3e8fda68',
      sellerId: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Baby Cot and Mattress - Like New',
      description: 'White wooden baby cot with brand new mattress. Adjustable height.',
      category: 'BABY_KIDS' as const,
      condition: 'LIKE_NEW' as const,
      images: ['https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800'],
      primaryImage: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800',
      pricingType: 'OFFERS' as const,
      status: 'APPROVED' as const,
      city: 'Bloemfontein',
      province: 'Free State',
      views: 15,
      approvedAt: new Date('2025-10-22T06:18:09.803Z'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440010',
      sellerId: '550e8400-e29b-41d4-a716-446655440001',
      title: 'iPhone 12 Pro Max - 256GB',
      description: 'Gold iPhone 12 Pro Max with original accessories. Battery health at 92%.',
      category: 'ELECTRONICS' as const,
      condition: 'GOOD' as const,
      images: ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800'],
      primaryImage: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800',
      pricingType: 'FIXED' as const,
      price: 9500.00,
      status: 'SOLD' as const,
      city: 'Cape Town',
      province: 'Western Cape',
      views: 89,
      approvedAt: new Date('2025-10-15T06:18:09.803Z'),
      soldAt: new Date('2025-10-20T06:18:09.809Z'),
    },
  ];

  for (const listing of listings) {
    await prisma.listing.upsert({
      where: { id: listing.id },
      update: listing,
      create: listing,
    });
  }

  console.log('✅ Seeded 10 listings');
  console.log('\n🎉 Migration complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
