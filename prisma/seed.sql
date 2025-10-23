-- Seed data for Second-Hand Marketplace
-- Run with: docker exec -i second_hand_postgres psql -U postgres -d second_hand < prisma/seed.sql

-- Clear existing data
TRUNCATE "Review", "Offer", "Transaction", "Listing", "User" CASCADE;

-- Insert Users (password is bcrypt hash of 'password123')
INSERT INTO "User" (id, email, name, phone, city, province, role, password, "emailVerified", rating, "reviewCount", "failedLoginAttempts", "createdAt", "updatedAt")
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'admin@secondhand.co.za', 'Admin User', '+27821234567', 'Cape Town', 'Western Cape', 'ADMIN', '$2a$10$rVqQXhYlVCmKf6vElcUH4OmKYKwYVpx2cCzU1J7LJKl5YLMQ6Bb8e', NOW(), 5.0, 0, 0, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'john.seller@example.com', 'John Seller', '+27837654321', 'Johannesburg', 'Gauteng', 'SELLER', '$2a$10$rVqQXhYlVCmKf6vElcUH4OmKYKwYVpx2cCzU1J7LJKl5YLMQ6Bb8e', NOW(), 4.5, 12, 0, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'sarah.buyer@example.com', 'Sarah Buyer', '+27829876543', 'Durban', 'KwaZulu-Natal', 'BUYER', '$2a$10$rVqQXhYlVCmKf6vElcUH4OmKYKwYVpx2cCzU1J7LJKl5YLMQ6Bb8e', NOW(), 4.8, 8, 0, NOW(), NOW());

-- Insert Listings
INSERT INTO "Listing" (id, "sellerId", title, description, category, condition, images, "primaryImage", "pricingType", price, status, city, province, views, "createdAt", "updatedAt", "approvedAt")
VALUES
  (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440001', 'Samsung Galaxy S21 Ultra - Excellent Condition', 'Barely used Samsung Galaxy S21 Ultra in phantom black. Includes original box, charger, and screen protector.', 'ELECTRONICS', 'LIKE_NEW', ARRAY['https://example.com/phone1.jpg','https://example.com/phone2.jpg'], 'https://example.com/phone1.jpg', 'FIXED', 8999.99, 'APPROVED', 'Johannesburg', 'Gauteng', 45, NOW(), NOW(), NOW()),
  (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440001', 'Dell XPS 15 Laptop - i7, 16GB RAM, 512GB SSD', 'High-performance laptop perfect for work and gaming.', 'ELECTRONICS', 'GOOD', ARRAY['https://example.com/laptop1.jpg'], 'https://example.com/laptop1.jpg', 'OFFERS', NULL, 'APPROVED', 'Johannesburg', 'Gauteng', 67, NOW(), NOW(), NOW()),
  (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440001', 'Nike Air Max 90 - Size 9 UK', 'Classic Nike Air Max 90 in white and red colorway.', 'CLOTHING', 'LIKE_NEW', ARRAY['https://example.com/shoes1.jpg'], 'https://example.com/shoes1.jpg', 'FIXED', 1299.00, 'APPROVED', 'Cape Town', 'Western Cape', 23, NOW(), NOW(), NOW()),
  (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440001', 'Vintage Wooden Dining Table with 6 Chairs', 'Beautiful solid wood dining set. Chairs recently reupholstered.', 'HOME_GARDEN', 'GOOD', ARRAY['https://example.com/table1.jpg'], 'https://example.com/table1.jpg', 'OFFERS', NULL, 'APPROVED', 'Pretoria', 'Gauteng', 34, NOW(), NOW(), NOW()),
  (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440001', '2018 Honda Civic 1.5T Sport', 'Immaculate Honda Civic with full service history. 65,000km on the clock.', 'VEHICLES', 'GOOD', ARRAY['https://example.com/car1.jpg','https://example.com/car2.jpg'], 'https://example.com/car1.jpg', 'FIXED', 285000.00, 'APPROVED', 'Durban', 'KwaZulu-Natal', 156, NOW(), NOW(), NOW()),
  (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440001', 'PlayStation 5 with 2 Controllers', 'PS5 disc version with two DualSense controllers and 3 games.', 'ELECTRONICS', 'LIKE_NEW', ARRAY['https://example.com/ps5.jpg'], 'https://example.com/ps5.jpg', 'FIXED', 7999.00, 'PENDING', 'Johannesburg', 'Gauteng', 0, NOW(), NOW(), NULL),
  (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440001', 'Harry Potter Complete Book Collection', 'All 7 Harry Potter books in hardcover. Excellent condition.', 'BOOKS', 'LIKE_NEW', ARRAY['https://example.com/books1.jpg'], 'https://example.com/books1.jpg', 'OFFERS', NULL, 'APPROVED', 'Port Elizabeth', 'Eastern Cape', 18, NOW(), NOW(), NOW()),
  (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440001', 'Professional Mountain Bike - 29" Wheels', 'Scott Spark 960 mountain bike. Carbon frame, Shimano gears.', 'SPORTS', 'GOOD', ARRAY['https://example.com/bike1.jpg'], 'https://example.com/bike1.jpg', 'FIXED', 15999.00, 'APPROVED', 'Stellenbosch', 'Western Cape', 42, NOW(), NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'iPhone 12 Pro Max - 256GB', 'Gold iPhone 12 Pro Max with original accessories. Battery health at 92%.', 'ELECTRONICS', 'GOOD', ARRAY['https://example.com/iphone1.jpg'], 'https://example.com/iphone1.jpg', 'FIXED', 9500.00, 'SOLD', 'Cape Town', 'Western Cape', 89, NOW() - INTERVAL '7 days', NOW(), NOW() - INTERVAL '7 days'),
  (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440001', 'Baby Cot and Mattress - Like New', 'White wooden baby cot with brand new mattress. Adjustable height.', 'BABY_KIDS', 'LIKE_NEW', ARRAY['https://example.com/cot1.jpg'], 'https://example.com/cot1.jpg', 'OFFERS', NULL, 'APPROVED', 'Bloemfontein', 'Free State', 15, NOW(), NOW(), NOW());

-- Update sold listing with soldAt
UPDATE "Listing" SET "soldAt" = NOW() - INTERVAL '2 days' WHERE id = '550e8400-e29b-41d4-a716-446655440010';

-- Insert Transaction (20% commission)
INSERT INTO "Transaction" (id, "listingId", "buyerId", "sellerId", amount, commission, "netAmount", status, "paymentMethod", "createdAt", "completedAt")
VALUES
  (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 9500.00, 1900.00, 7600.00, 'COMPLETED', 'Credit Card', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

-- Get listing IDs for offers (only OFFERS listings)
DO $$
DECLARE
  listing1_id TEXT;
  listing2_id TEXT;
  transaction1_id TEXT;
BEGIN
  -- Get offer-based listing IDs
  SELECT id INTO listing1_id FROM "Listing" WHERE title LIKE 'Dell XPS%' LIMIT 1;
  SELECT id INTO listing2_id FROM "Listing" WHERE title LIKE 'Vintage Wooden%' LIMIT 1;
  SELECT id INTO transaction1_id FROM "Transaction" LIMIT 1;

  -- Insert Offers
  INSERT INTO "Offer" (id, "listingId", "buyerId", amount, message, status, "expiresAt", "createdAt")
  VALUES
    (gen_random_uuid()::text, listing1_id, '550e8400-e29b-41d4-a716-446655440002', 13000.00, 'Is this negotiable? Can you do R13,000?', 'PENDING', NOW() + INTERVAL '48 hours', NOW()),
    (gen_random_uuid()::text, listing2_id, '550e8400-e29b-41d4-a716-446655440002', 3800.00, 'Would you accept R3,800? I can collect this weekend.', 'ACCEPTED', NOW() + INTERVAL '24 hours', NOW());

  -- Insert Review
  INSERT INTO "Review" (id, "transactionId", "reviewerId", "revieweeId", rating, comment, "createdAt")
  VALUES
    (gen_random_uuid()::text, transaction1_id, '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 5, 'Great seller! Item exactly as described.', NOW());

END $$;

-- Display summary
SELECT 'Seed completed successfully!' as message;
SELECT COUNT(*) as user_count FROM "User";
SELECT COUNT(*) as listing_count FROM "Listing";
SELECT COUNT(*) as transaction_count FROM "Transaction";
SELECT COUNT(*) as offer_count FROM "Offer";
SELECT COUNT(*) as review_count FROM "Review";
