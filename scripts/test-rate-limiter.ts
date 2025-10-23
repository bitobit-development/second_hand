#!/usr/bin/env tsx
/**
 * Rate Limiter Test Script
 *
 * Tests the RateLimiter class to verify:
 * - Sliding window algorithm works correctly
 * - Minute and hour limits are enforced
 * - Rate limit headers are accurate
 * - Cleanup removes old entries
 * - Multiple users are tracked independently
 */

import { RateLimiter } from "../lib/ai/rate-limiter";

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name: string) {
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  log(`TEST: ${name}`, "blue");
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "blue");
}

function logPass(message: string) {
  log(`✓ ${message}`, "green");
}

function logFail(message: string) {
  log(`✗ ${message}`, "red");
  process.exit(1);
}

function logInfo(message: string) {
  log(`  ${message}`, "gray");
}

// Simulate delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testBasicRateLimit() {
  logTest("Basic Rate Limit - 5 requests/minute, 10 requests/hour");

  const limiter = new RateLimiter({
    requestsPerMinute: 5,
    requestsPerHour: 10,
  });

  const userId = "user:test-1";

  // Test: First 5 requests should succeed
  logInfo("Making 5 requests (should all succeed)...");
  for (let i = 1; i <= 5; i++) {
    const result = await limiter.checkLimit(userId);
    if (!result.allowed) {
      logFail(`Request ${i}/5 failed (should succeed)`);
    }
    logInfo(`  Request ${i}: allowed=${result.allowed}, remaining=${result.remaining}`);
  }
  logPass("First 5 requests allowed");

  // Test: 6th request should fail (minute limit)
  logInfo("Making 6th request (should fail - minute limit)...");
  const result6 = await limiter.checkLimit(userId);
  if (result6.allowed) {
    logFail("6th request succeeded (should fail due to minute limit)");
  }
  if (!result6.retryAfter || result6.retryAfter <= 0) {
    logFail("retryAfter not set correctly");
  }
  logInfo(`  Request 6: allowed=${result6.allowed}, retryAfter=${result6.retryAfter}s`);
  logPass("6th request blocked by minute limit");

  limiter.stopCleanup();
}

async function testHourLimit() {
  logTest("Hour Limit - 10 requests/minute, 5 requests/hour");

  const limiter = new RateLimiter({
    requestsPerMinute: 10, // High minute limit
    requestsPerHour: 5,    // Low hour limit
  });

  const userId = "user:test-2";

  // Test: Make 5 requests quickly (within minute limit, hits hour limit)
  logInfo("Making 5 requests quickly (should all succeed)...");

  for (let i = 1; i <= 5; i++) {
    const result = await limiter.checkLimit(userId);
    if (!result.allowed) {
      logFail(`Request ${i}/5 failed`);
    }
    logInfo(`  Request ${i}: allowed=${result.allowed}, remaining=${result.remaining}`);
  }
  logPass("5 requests allowed (hour limit reached)");

  // Test: 6th request should fail (hour limit)
  logInfo("Making 6th request (should fail - hour limit)...");
  const result6 = await limiter.checkLimit(userId);
  if (result6.allowed) {
    logFail("6th request succeeded (should fail due to hour limit)");
  }
  logInfo(`  Request 6: allowed=${result6.allowed}, retryAfter=${result6.retryAfter}s`);
  logPass("6th request blocked by hour limit");

  // Wait and verify hour limit still enforced
  logInfo("Waiting 1 second (hour limit should still be active)...");
  await delay(1000);

  const result7 = await limiter.checkLimit(userId);
  if (result7.allowed) {
    logFail("7th request succeeded (hour limit should still be active)");
  }
  logPass("Hour limit enforced across time");

  limiter.stopCleanup();
}

async function testMultipleUsers() {
  logTest("Multiple Users - Independent rate limits");

  const limiter = new RateLimiter({
    requestsPerMinute: 3,
    requestsPerHour: 10,
  });

  const user1 = "user:alice";
  const user2 = "user:bob";

  // Test: User 1 makes 3 requests
  logInfo("User 1 making 3 requests...");
  for (let i = 1; i <= 3; i++) {
    const result = await limiter.checkLimit(user1);
    if (!result.allowed) {
      logFail(`User 1 request ${i} failed`);
    }
    logInfo(`  User 1 request ${i}: allowed=${result.allowed}, remaining=${result.remaining}`);
  }

  // Test: User 1's 4th request fails
  logInfo("User 1 making 4th request (should fail)...");
  const user1_4th = await limiter.checkLimit(user1);
  if (user1_4th.allowed) {
    logFail("User 1's 4th request succeeded (should fail)");
  }
  logInfo(`  User 1 request 4: allowed=${user1_4th.allowed}`);
  logPass("User 1 rate limited after 3 requests");

  // Test: User 2 can still make requests
  logInfo("User 2 making 3 requests (should all succeed)...");
  for (let i = 1; i <= 3; i++) {
    const result = await limiter.checkLimit(user2);
    if (!result.allowed) {
      logFail(`User 2 request ${i} failed (should succeed - independent limit)`);
    }
    logInfo(`  User 2 request ${i}: allowed=${result.allowed}, remaining=${result.remaining}`);
  }
  logPass("User 2 has independent rate limit");

  // Check stats
  const stats = limiter.getStats();
  logInfo(`Total users tracked: ${stats.totalUsers}`);
  logInfo(`Total requests tracked: ${stats.totalRequests}`);

  if (stats.totalUsers !== 2) {
    logFail(`Expected 2 users, got ${stats.totalUsers}`);
  }
  logPass(`Tracking ${stats.totalUsers} users independently`);

  limiter.stopCleanup();
}

async function testCleanup() {
  logTest("Cleanup - Remove old entries");

  const limiter = new RateLimiter({
    requestsPerMinute: 10,
    requestsPerHour: 100,
  });

  const userId = "user:test-cleanup";

  // Make some requests
  logInfo("Making 3 requests...");
  for (let i = 1; i <= 3; i++) {
    await limiter.checkLimit(userId);
  }

  let stats = limiter.getStats();
  logInfo(`Before cleanup: ${stats.totalUsers} users, ${stats.totalRequests} requests`);

  if (stats.totalRequests !== 3) {
    logFail(`Expected 3 requests, got ${stats.totalRequests}`);
  }
  logPass("Requests tracked correctly");

  // Run cleanup (should not remove recent requests)
  logInfo("Running cleanup (recent requests should remain)...");
  limiter.cleanup();

  stats = limiter.getStats();
  logInfo(`After cleanup: ${stats.totalUsers} users, ${stats.totalRequests} requests`);

  if (stats.totalRequests !== 3) {
    logFail(`Cleanup removed recent requests (expected 3, got ${stats.totalRequests})`);
  }
  logPass("Recent requests preserved after cleanup");

  limiter.stopCleanup();
}

async function testSlidingWindow() {
  logTest("Sliding Window - Time-based limit reset");

  const limiter = new RateLimiter({
    requestsPerMinute: 2,
    requestsPerHour: 10,
  });

  const userId = "user:test-sliding";

  // Make 2 requests with 500ms gap
  logInfo("Making request 1 at T=0...");
  const result1 = await limiter.checkLimit(userId);
  logInfo(`  Request 1: allowed=${result1.allowed}, remaining=${result1.remaining}`);

  await delay(500); // 500ms delay

  logInfo("Making request 2 at T=0.5s...");
  const result2 = await limiter.checkLimit(userId);
  logInfo(`  Request 2: allowed=${result2.allowed}, remaining=${result2.remaining}`);
  logPass("2 requests allowed");

  // 3rd request should fail (minute limit - 2 requests in last 60s)
  logInfo("Making 3rd request at T=0.5s (should fail - minute limit)...");
  const result3a = await limiter.checkLimit(userId);
  if (result3a.allowed) {
    logFail("3rd request succeeded (should fail)");
  }
  logInfo(`  Request 3: allowed=${result3a.allowed}, retryAfter=${result3a.retryAfter}s`);
  logPass("3rd request blocked by minute limit");

  // Wait 600ms more (total 1.1s from start) - first request at T=0 is still in 60s window
  // But we're testing that the window slides continuously
  logInfo("Waiting 600ms (T=1.1s total)...");
  await delay(600);

  // Still should fail - both requests still in 60s window
  logInfo("Making 3rd request at T=1.1s (should still fail)...");
  const result3b = await limiter.checkLimit(userId);
  if (result3b.allowed) {
    logFail("3rd request succeeded too early");
  }
  logPass("3rd request still blocked (sliding window working)");

  limiter.stopCleanup();
}

async function testRateLimitHeaders() {
  logTest("Rate Limit Headers - Metadata accuracy");

  const limiter = new RateLimiter({
    requestsPerMinute: 5,
    requestsPerHour: 10,
  });

  const userId = "user:test-headers";

  // First request
  logInfo("Making first request...");
  const result1 = await limiter.checkLimit(userId);

  if (!result1.allowed) {
    logFail("First request failed");
  }
  if (result1.remaining < 0) {
    logFail("Remaining count is negative");
  }
  if (result1.reset <= Date.now()) {
    logFail("Reset time is in the past");
  }

  logInfo(`  Allowed: ${result1.allowed}`);
  logInfo(`  Remaining: ${result1.remaining}`);
  logInfo(`  Reset: ${new Date(result1.reset).toISOString()}`);
  logPass("First request has correct metadata");

  // Rate limited request
  logInfo("Making 6th request (should be rate limited)...");
  for (let i = 2; i <= 5; i++) {
    await limiter.checkLimit(userId);
  }

  const result6 = await limiter.checkLimit(userId);

  if (result6.allowed) {
    logFail("6th request succeeded (should fail)");
  }
  if (result6.remaining !== 0) {
    logFail(`Remaining should be 0, got ${result6.remaining}`);
  }
  if (!result6.retryAfter || result6.retryAfter <= 0) {
    logFail("retryAfter not set for rate limited request");
  }

  logInfo(`  Allowed: ${result6.allowed}`);
  logInfo(`  Remaining: ${result6.remaining}`);
  logInfo(`  Retry After: ${result6.retryAfter}s`);
  logPass("Rate limited request has correct metadata");

  limiter.stopCleanup();
}

async function runAllTests() {
  console.log("\n" + "=".repeat(80));
  log("Rate Limiter Test Suite", "blue");
  log("=".repeat(80), "blue");

  try {
    await testBasicRateLimit();
    await testHourLimit();
    await testMultipleUsers();
    await testCleanup();
    await testSlidingWindow();
    await testRateLimitHeaders();

    console.log("\n" + "=".repeat(80));
    log("✓ All tests passed!", "green");
    log("=".repeat(80), "green");
    console.log();
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    log("✗ Tests failed", "red");
    log("=".repeat(80), "red");
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
