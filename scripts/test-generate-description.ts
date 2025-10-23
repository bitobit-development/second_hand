/**
 * Test Script for AI Description Generation
 *
 * Tests the generateProductDescription function with sample product images
 */

import { generateProductDescription, AIError, isAIError, getUserFriendlyMessage } from '../lib/ai';

// Test images (publicly accessible URLs)
const TEST_IMAGES = {
  electronics: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
  clothing: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
  furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
};

async function testBasicGeneration() {
  console.log('🧪 Test 1: Basic Description Generation (Electronics)\n');

  try {
    const result = await generateProductDescription({
      imageUrl: TEST_IMAGES.electronics,
      title: 'MacBook Pro Laptop',
      category: 'ELECTRONICS',
      condition: 'GOOD',
      template: 'detailed',
    });

    console.log('✅ Success!');
    console.log(`Description (${result.wordCount} words, ${result.characterCount} chars):`);
    console.log(result.description);
    console.log('\nExtracted Attributes:');
    console.log(JSON.stringify(result.attributes, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    return true;
  } catch (error) {
    console.error('❌ Failed:', error);
    if (isAIError(error as Error)) {
      const aiError = error as AIError;
      console.error(`Error Code: ${aiError.code}`);
      console.error(`User Message: ${getUserFriendlyMessage(aiError)}`);
    }
    return false;
  }
}

async function testConciseTemplate() {
  console.log('🧪 Test 2: Concise Template (Clothing)\n');

  try {
    const result = await generateProductDescription({
      imageUrl: TEST_IMAGES.clothing,
      category: 'CLOTHING',
      condition: 'LIKE_NEW',
      template: 'concise',
    });

    console.log('✅ Success!');
    console.log(`Description (${result.wordCount} words, ${result.characterCount} chars):`);
    console.log(result.description);
    console.log('\nExtracted Attributes:');
    console.log(JSON.stringify(result.attributes, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    return true;
  } catch (error) {
    console.error('❌ Failed:', error);
    if (isAIError(error as Error)) {
      const aiError = error as AIError;
      console.error(`Error Code: ${aiError.code}`);
      console.error(`User Message: ${getUserFriendlyMessage(aiError)}`);
    }
    return false;
  }
}

async function testSEOTemplate() {
  console.log('🧪 Test 3: SEO-Optimized Template (Furniture)\n');

  try {
    const result = await generateProductDescription({
      imageUrl: TEST_IMAGES.furniture,
      title: 'Modern Grey Sofa',
      category: 'HOME_GARDEN',
      condition: 'GOOD',
      template: 'seo',
    });

    console.log('✅ Success!');
    console.log(`Description (${result.wordCount} words, ${result.characterCount} chars):`);
    console.log(result.description);
    console.log('\nExtracted Attributes:');
    console.log(JSON.stringify(result.attributes, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    return true;
  } catch (error) {
    console.error('❌ Failed:', error);
    if (isAIError(error as Error)) {
      const aiError = error as AIError;
      console.error(`Error Code: ${aiError.code}`);
      console.error(`User Message: ${getUserFriendlyMessage(aiError)}`);
    }
    return false;
  }
}

async function testErrorHandling() {
  console.log('🧪 Test 4: Error Handling (Invalid Image URL)\n');

  try {
    await generateProductDescription({
      imageUrl: 'invalid-url',
      category: 'ELECTRONICS',
      condition: 'GOOD',
    });

    console.error('❌ Should have thrown an error!');
    return false;
  } catch (error) {
    if (isAIError(error as Error)) {
      const aiError = error as AIError;
      console.log('✅ Correctly caught error');
      console.log(`Error Code: ${aiError.code}`);
      console.log(`Error Message: ${aiError.message}`);
      console.log(`User Message: ${getUserFriendlyMessage(aiError)}`);
      console.log('\n' + '='.repeat(80) + '\n');
      return true;
    }
    console.error('❌ Wrong error type:', error);
    return false;
  }
}

async function testNoImageError() {
  console.log('🧪 Test 5: Error Handling (No Image URL)\n');

  try {
    await generateProductDescription({
      imageUrl: '',
      category: 'ELECTRONICS',
      condition: 'GOOD',
    });

    console.error('❌ Should have thrown an error!');
    return false;
  } catch (error) {
    if (isAIError(error as Error)) {
      const aiError = error as AIError;
      console.log('✅ Correctly caught error');
      console.log(`Error Code: ${aiError.code}`);
      console.log(`Error Message: ${aiError.message}`);
      console.log(`User Message: ${getUserFriendlyMessage(aiError)}`);
      console.log('\n' + '='.repeat(80) + '\n');
      return true;
    }
    console.error('❌ Wrong error type:', error);
    return false;
  }
}

async function testInvalidCategory() {
  console.log('🧪 Test 6: Error Handling (Invalid Category)\n');

  try {
    await generateProductDescription({
      imageUrl: TEST_IMAGES.electronics,
      category: 'INVALID_CATEGORY',
      condition: 'GOOD',
    });

    console.error('❌ Should have thrown an error!');
    return false;
  } catch (error) {
    if (isAIError(error as Error)) {
      const aiError = error as AIError;
      console.log('✅ Correctly caught error');
      console.log(`Error Code: ${aiError.code}`);
      console.log(`Error Message: ${aiError.message}`);
      console.log('\n' + '='.repeat(80) + '\n');
      return true;
    }
    console.error('❌ Wrong error type:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting AI Description Generation Tests\n');
  console.log('='.repeat(80));
  console.log('\n');

  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is not set');
    console.error('Please set it in your .env file or export it:');
    console.error('  export OPENAI_API_KEY="your-key-here"\n');
    process.exit(1);
  }

  const results = {
    passed: 0,
    failed: 0,
  };

  // Run validation tests first (don't require API calls)
  console.log('📋 Running Validation Tests...\n');

  if (await testNoImageError()) results.passed++;
  else results.failed++;

  if (await testErrorHandling()) results.passed++;
  else results.failed++;

  if (await testInvalidCategory()) results.passed++;
  else results.failed++;

  // Run API tests
  console.log('🌐 Running API Tests (requires OpenAI credits)...\n');

  if (await testBasicGeneration()) results.passed++;
  else results.failed++;

  if (await testConciseTemplate()) results.passed++;
  else results.failed++;

  if (await testSEOTemplate()) results.passed++;
  else results.failed++;

  // Summary
  console.log('='.repeat(80));
  console.log('\n📊 Test Results Summary:\n');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total:  ${results.passed + results.failed}\n`);

  if (results.failed === 0) {
    console.log('🎉 All tests passed!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the output above.\n');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
