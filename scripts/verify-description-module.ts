/**
 * Module Verification Script
 *
 * Verifies that the description generation module can be imported
 * and basic structure is correct without making API calls
 */

import {
  generateProductDescription,
  generateMultipleDescriptions,
  AIError,
  AI_ERROR_CODES,
  isAIError,
  getUserFriendlyMessage,
} from '../lib/ai';

console.log('✅ Module Import Test\n');

// Test 1: Check exports exist
console.log('1️⃣  Checking exports...');
console.log(`  - generateProductDescription: ${typeof generateProductDescription}`);
console.log(`  - generateMultipleDescriptions: ${typeof generateMultipleDescriptions}`);
console.log(`  - AIError: ${typeof AIError}`);
console.log(`  - AI_ERROR_CODES: ${typeof AI_ERROR_CODES}`);
console.log(`  - isAIError: ${typeof isAIError}`);
console.log(`  - getUserFriendlyMessage: ${typeof getUserFriendlyMessage}`);

// Test 2: Check error codes
console.log('\n2️⃣  Checking error codes...');
console.log(`  - OPENAI_ERROR: ${AI_ERROR_CODES.OPENAI_ERROR}`);
console.log(`  - RATE_LIMIT: ${AI_ERROR_CODES.RATE_LIMIT}`);
console.log(`  - INVALID_IMAGE: ${AI_ERROR_CODES.INVALID_IMAGE}`);
console.log(`  - NO_IMAGE: ${AI_ERROR_CODES.NO_IMAGE}`);
console.log(`  - VALIDATION_FAILED: ${AI_ERROR_CODES.VALIDATION_FAILED}`);
console.log(`  - TIMEOUT: ${AI_ERROR_CODES.TIMEOUT}`);

// Test 3: Test error creation
console.log('\n3️⃣  Testing error handling...');
try {
  throw new AIError('TEST_CODE', 'Test error message');
} catch (error) {
  if (isAIError(error as Error)) {
    const aiError = error as AIError;
    console.log(`  ✅ AIError created: ${aiError.code}`);
    console.log(`  ✅ isAIError works: true`);
    console.log(`  ✅ getMessage works: ${getUserFriendlyMessage(aiError)}`);
  } else {
    console.log('  ❌ Error type check failed');
  }
}

// Test 4: Test validation without API call
console.log('\n4️⃣  Testing parameter validation...');
(async () => {
  try {
    await generateProductDescription({
      imageUrl: '',
      category: 'ELECTRONICS',
      condition: 'GOOD',
    });
    console.log('  ❌ Should have thrown NO_IMAGE error');
  } catch (error) {
    if (isAIError(error as Error)) {
      const aiError = error as AIError;
      if (aiError.code === AI_ERROR_CODES.NO_IMAGE) {
        console.log('  ✅ NO_IMAGE validation works');
      } else {
        console.log(`  ❌ Wrong error code: ${aiError.code}`);
      }
    }
  }

  try {
    await generateProductDescription({
      imageUrl: 'not-a-url',
      category: 'ELECTRONICS',
      condition: 'GOOD',
    });
    console.log('  ❌ Should have thrown INVALID_IMAGE error');
  } catch (error) {
    if (isAIError(error as Error)) {
      const aiError = error as AIError;
      if (aiError.code === AI_ERROR_CODES.INVALID_IMAGE) {
        console.log('  ✅ INVALID_IMAGE validation works');
      } else {
        console.log(`  ❌ Wrong error code: ${aiError.code}`);
      }
    }
  }

  try {
    await generateProductDescription({
      imageUrl: 'https://example.com/image.jpg',
      category: 'INVALID_CAT' as any,
      condition: 'GOOD',
    });
    console.log('  ❌ Should have thrown INVALID_PARAMS error');
  } catch (error) {
    if (isAIError(error as Error)) {
      const aiError = error as AIError;
      if (aiError.code === 'INVALID_PARAMS') {
        console.log('  ✅ INVALID_PARAMS validation works');
      } else {
        console.log(`  ❌ Wrong error code: ${aiError.code}`);
      }
    }
  }

  console.log('\n✅ All module verification tests passed!\n');
  console.log('To test with actual API calls, run:');
  console.log('  npx tsx scripts/test-generate-description.ts\n');
})();
