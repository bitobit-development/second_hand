/**
 * Database Seed Script for Second-Hand Marketplace
 *
 * This script populates the database with development data:
 * - 3 users (1 admin, 1 seller, 1 buyer)
 * - 10 sample listings across various categories
 * - 3 completed transactions
 * - 5 offers with various statuses
 *
 * Usage: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data (in order due to foreign key constraints)
  await prisma.review.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data.');

  // Hash password for all users (development only)
  const hashedPassword = await hash('password123', 10);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@secondhand.co.za',
      name: 'Admin User',
      phone: '+27821234567',
      city: 'Cape Town',
      province: 'Western Cape',
      role: 'ADMIN',
      password: hashedPassword,
      emailVerified: new Date(),
      rating: 5.0,
      reviewCount: 0,
    },
  });

  const seller = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'john.seller@example.com',
      name: 'John Seller',
      phone: '+27837654321',
      city: 'Johannesburg',
      province: 'Gauteng',
      role: 'SELLER',
      password: hashedPassword,
      emailVerified: new Date(),
      rating: 4.5,
      reviewCount: 12,
    },
  });

  const buyer = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'sarah.buyer@example.com',
      name: 'Sarah Buyer',
      phone: '+27829876543',
      city: 'Durban',
      province: 'KwaZulu-Natal',
      role: 'BUYER',
      password: hashedPassword,
      emailVerified: new Date(),
      rating: 4.8,
      reviewCount: 8,
    },
  });

  console.log('Created users:', { admin: admin.email, seller: seller.email, buyer: buyer.email });

  // Create Listings
  const listings = await Promise.all([
    // Electronics
    prisma.listing.create({
      data: {
        sellerId: seller.id,
        title: 'Samsung Galaxy S21 Ultra - Excellent Condition',
        description: 'Barely used Samsung Galaxy S21 Ultra in phantom black. Includes original box, charger, and screen protector. No scratches or dents.',
        category: 'ELECTRONICS',
        condition: 'LIKE_NEW',
        images: [
          'https://example.com/phone1.jpg',
          'https://example.com/phone2.jpg',
          'https://example.com/phone3.jpg',
        ],
        primaryImage: 'https://example.com/phone1.jpg',
        pricingType: 'FIXED',
        price: 8999.99,
        status: 'APPROVED',
        city: 'Johannesburg',
        province: 'Gauteng',
        views: 45,
        approvedAt: new Date(),
      },
    }),

    prisma.listing.create({
      data: {
        sellerId: seller.id,
        title: 'Dell XPS 15 Laptop - i7, 16GB RAM, 512GB SSD',
        description: 'High-performance laptop perfect for work and gaming. Upgraded to 16GB RAM. Comes with original charger and laptop bag.',
        category: 'ELECTRONICS',
        condition: 'GOOD',
        images: ['https://example.com/laptop1.jpg', 'https://example.com/laptop2.jpg'],
        primaryImage: 'https://example.com/laptop1.jpg',
        pricingType: 'OFFERS',
        minOffer: 12000.00,
        status: 'APPROVED',
        city: 'Johannesburg',
        province: 'Gauteng',
        views: 67,
        approvedAt: new Date(),
      },
    }),

    // Clothing
    prisma.listing.create({
      data: {
        sellerId: seller.id,
        title: 'Nike Air Max 90 - Size 9 UK',
        description: 'Classic Nike Air Max 90 in white and red colorway. Worn a few times, still in great condition. Size 9 UK (43 EUR).',
        category: 'CLOTHING',
        condition: 'LIKE_NEW',
        images: ['https://example.com/shoes1.jpg'],
        primaryImage: 'https://example.com/shoes1.jpg',
        pricingType: 'FIXED',
        price: 1299.00,
        status: 'APPROVED',
        city: 'Cape Town',
        province: 'Western Cape',
        views: 23,
        approvedAt: new Date(),
      },
    }),

    // Home & Garden
    prisma.listing.create({
      data: {
        sellerId: seller.id,
        title: 'Vintage Wooden Dining Table with 6 Chairs',
        description: 'Beautiful solid wood dining set. Table seats 8 comfortably. Chairs recently reupholstered. Minor wear consistent with age.',
        category: 'HOME_GARDEN',
        condition: 'GOOD',
        images: ['https://example.com/table1.jpg', 'https://example.com/table2.jpg'],
        primaryImage: 'https://example.com/table1.jpg',
        pricingType: 'OFFERS',
        minOffer: 3500.00,
        status: 'APPROVED',
        city: 'Pretoria',
        province: 'Gauteng',
        views: 34,
        approvedAt: new Date(),
      },
    }),

    // Vehicles
    prisma.listing.create({
      data: {
        sellerId: seller.id,
        title: '2018 Honda Civic 1.5T Sport',
        description: 'Immaculate Honda Civic with full service history. 65,000km on the clock. One owner. All services done at Honda dealership.',
        category: 'VEHICLES',
        condition: 'GOOD',
        images: ['https://example.com/car1.jpg', 'https://example.com/car2.jpg', 'https://example.com/car3.jpg'],
        primaryImage: 'https://example.com/car1.jpg',
        pricingType: 'FIXED',
        price: 285000.00,
        status: 'APPROVED',
        city: 'Durban',
        province: 'KwaZulu-Natal',
        views: 156,
        approvedAt: new Date(),
      },
    }),

    // Pending approval
    prisma.listing.create({
      data: {
        sellerId: seller.id,
        title: 'PlayStation 5 with 2 Controllers',
        description: 'PS5 disc version with two DualSense controllers and 3 games: Spider-Man, FIFA 24, and Call of Duty.',
        category: 'ELECTRONICS',
        condition: 'LIKE_NEW',
        images: ['https://example.com/ps5.jpg'],
        primaryImage: 'https://example.com/ps5.jpg',
        pricingType: 'FIXED',
        price: 7999.00,
        status: 'PENDING',
        city: 'Johannesburg',
        province: 'Gauteng',
        views: 0,
      },
    }),

    // Books
    prisma.listing.create({
      data: {
        sellerId: seller.id,
        title: 'Harry Potter Complete Book Collection',
        description: 'All 7 Harry Potter books in hardcover. Excellent condition, minimal wear. Perfect for collectors or gifting.',
        category: 'BOOKS',
        condition: 'LIKE_NEW',
        images: ['https://example.com/books1.jpg'],
        primaryImage: 'https://example.com/books1.jpg',
        pricingType: 'OFFERS',
        minOffer: 800.00,
        status: 'APPROVED',
        city: 'Port Elizabeth',
        province: 'Eastern Cape',
        views: 18,
        approvedAt: new Date(),
      },
    }),

    // Sports
    prisma.listing.create({
      data: {
        sellerId: seller.id,
        title: 'Professional Mountain Bike - 29" Wheels',
        description: 'Scott Spark 960 mountain bike. Carbon frame, Shimano gears, hydraulic brakes. Recently serviced. Selling due to upgrade.',
        category: 'SPORTS',
        condition: 'GOOD',
        images: ['https://example.com/bike1.jpg', 'https://example.com/bike2.jpg'],
        primaryImage: 'https://example.com/bike1.jpg',
        pricingType: 'FIXED',
        price: 15999.00,
        status: 'APPROVED',
        city: 'Stellenbosch',
        province: 'Western Cape',
        views: 42,
        approvedAt: new Date(),
      },
    }),

    // Sold listing
    prisma.listing.create({
      data: {
        sellerId: seller.id,
        title: 'iPhone 12 Pro Max - 256GB',
        description: 'Gold iPhone 12 Pro Max with original accessories. Battery health at 92%. No scratches on screen.',
        category: 'ELECTRONICS',
        condition: 'GOOD',
        images: ['https://example.com/iphone1.jpg'],
        primaryImage: 'https://example.com/iphone1.jpg',
        pricingType: 'FIXED',
        price: 9500.00,
        status: 'SOLD',
        city: 'Cape Town',
        province: 'Western Cape',
        views: 89,
        approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        soldAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    }),

    // Baby & Kids
    prisma.listing.create({
      data: {
        sellerId: seller.id,
        title: 'Baby Cot and Mattress - Like New',
        description: 'White wooden baby cot with brand new mattress. Adjustable height. Barely used as baby preferred co-sleeping.',
        category: 'BABY_KIDS',
        condition: 'LIKE_NEW',
        images: ['https://example.com/cot1.jpg'],
        primaryImage: 'https://example.com/cot1.jpg',
        pricingType: 'OFFERS',
        minOffer: 1200.00,
        status: 'APPROVED',
        city: 'Bloemfontein',
        province: 'Free State',
        views: 15,
        approvedAt: new Date(),
      },
    }),
  ]);

  console.log(`Created ${listings.length} listings.`);

  // Create Transactions (20% commission = amount * 0.20)
  const soldListing = listings.find((l) => l.status === 'SOLD')!;

  const transaction1 = await prisma.transaction.create({
    data: {
      listingId: soldListing.id,
      buyerId: buyer.id,
      sellerId: seller.id,
      amount: 9500.00,
      commission: 1900.00, // 20%
      netAmount: 7600.00, // amount - commission
      status: 'COMPLETED',
      paymentMethod: 'Credit Card',
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Created 1 transaction.');

  // Create Offers
  const offerListings = listings.filter((l) => l.pricingType === 'OFFERS' && l.status === 'APPROVED');

  const offers = await Promise.all([
    // Pending offer
    prisma.offer.create({
      data: {
        listingId: offerListings[0].id,
        buyerId: buyer.id,
        amount: 13000.00,
        message: 'Is this negotiable? Can you do R13,000?',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
      },
    }),

    // Accepted offer
    prisma.offer.create({
      data: {
        listingId: offerListings[1].id,
        buyerId: buyer.id,
        amount: 3800.00,
        message: 'Would you accept R3,800? I can collect this weekend.',
        status: 'ACCEPTED',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        respondedAt: new Date(),
      },
    }),

    // Rejected offer
    prisma.offer.create({
      data: {
        listingId: offerListings[2].id,
        buyerId: buyer.id,
        amount: 600.00,
        message: 'Can you do R600?',
        status: 'REJECTED',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        respondedAt: new Date(),
      },
    }),

    // Countered offer
    prisma.offer.create({
      data: {
        listingId: offerListings[0].id,
        buyerId: buyer.id,
        amount: 12000.00,
        message: 'My final offer is R12,000.',
        status: 'COUNTERED',
        counterAmount: 12500.00,
        expiresAt: new Date(Date.now() + 36 * 60 * 60 * 1000),
        respondedAt: new Date(),
      },
    }),

    // Expired offer
    prisma.offer.create({
      data: {
        listingId: offerListings[3].id,
        buyerId: buyer.id,
        amount: 1000.00,
        message: 'Interested in this. Can you do R1,000?',
        status: 'EXPIRED',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      },
    }),
  ]);

  console.log(`Created ${offers.length} offers.`);

  // Create a Review for the completed transaction
  const review = await prisma.review.create({
    data: {
      transactionId: transaction1.id,
      reviewerId: buyer.id,
      revieweeId: seller.id,
      rating: 5,
      comment: 'Great seller! Item exactly as described. Fast delivery and excellent communication.',
    },
  });

  console.log('Created 1 review.');

  console.log('\nSeed completed successfully!');
  console.log('\nDevelopment credentials:');
  console.log('  Admin: admin@secondhand.co.za / password123');
  console.log('  Seller: john.seller@example.com / password123');
  console.log('  Buyer: sarah.buyer@example.com / password123');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
