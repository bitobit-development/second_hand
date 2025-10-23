# AI-Powered Description Generation

## Overview

The description generation module uses OpenAI's GPT-4o Vision API to automatically analyze product images and generate high-quality, marketplace-ready descriptions. This implementation supports three distinct writing styles and includes comprehensive error handling.

## Architecture

### Core Components

```
lib/ai/
├── generate-description.ts    # Main API client and generation logic
├── errors.ts                   # Custom error classes and error handling
├── types.ts                    # TypeScript interfaces for parameters and results
├── prompts/
│   └── description-templates.ts # Prompt engineering templates
└── index.ts                    # Public API exports
```

### Key Features

✅ **Three Template Styles**
- **Detailed** (100-200 words): Comprehensive descriptions for serious sellers
- **Concise** (50-75 words): Quick listings for casual sellers
- **SEO-Optimized** (120-180 words): Search-friendly with natural keyword integration

✅ **Robust Error Handling**
- Specific error codes for different failure scenarios
- User-friendly error messages
- Rate limit detection and handling
- Timeout protection (30 seconds)

✅ **Attribute Extraction**
- Automatically extracts color, material, brand, style from descriptions
- Uses pattern matching on generated text
- Returns structured data for filtering/search

✅ **Character Limit Enforcement**
- Hard limit of 2000 characters
- Graceful truncation at sentence boundaries
- Maintains readability when truncating

✅ **Validation**
- Image URL format validation
- Category and condition enum validation
- Input parameter sanitization

## Usage

### Basic Usage

```typescript
import { generateProductDescription } from '@/lib/ai';

const result = await generateProductDescription({
  imageUrl: 'https://cloudinary.com/.../product.jpg',
  title: 'Vintage Leather Jacket',
  category: 'CLOTHING',
  condition: 'GOOD',
  template: 'detailed' // or 'concise' or 'seo'
});

console.log(result.description);
console.log(result.wordCount);         // 142
console.log(result.characterCount);    // 876
console.log(result.attributes);        // { color: 'brown', material: 'leather', ... }
```

### Generate Multiple Templates

```typescript
import { generateMultipleDescriptions } from '@/lib/ai';

const results = await generateMultipleDescriptions({
  imageUrl: 'https://cloudinary.com/.../product.jpg',
  title: 'Modern Grey Sofa',
  category: 'HOME_GARDEN',
  condition: 'LIKE_NEW',
});

// Returns all three templates
console.log(results.detailed.description);
console.log(results.concise.description);
console.log(results.seo.description);
```

### Error Handling

```typescript
import {
  generateProductDescription,
  isAIError,
  getUserFriendlyMessage,
  AI_ERROR_CODES
} from '@/lib/ai';

try {
  const result = await generateProductDescription(params);
  // Success
} catch (error) {
  if (isAIError(error)) {
    // Handle specific error codes
    switch (error.code) {
      case AI_ERROR_CODES.RATE_LIMIT:
        // Wait and retry
        break;
      case AI_ERROR_CODES.INVALID_IMAGE:
        // Ask user to upload different image
        break;
      case AI_ERROR_CODES.NO_IMAGE:
        // Prompt user to upload image
        break;
      case AI_ERROR_CODES.OPENAI_ERROR:
        // Show generic error, log details
        break;
      default:
        // Fallback error handling
    }

    // Get user-friendly message
    const friendlyMessage = getUserFriendlyMessage(error);
    console.error(friendlyMessage);
  }
}
```

## API Reference

### `generateProductDescription(params)`

Main function to generate a product description from an image.

**Parameters:**
```typescript
interface GenerateDescriptionParams {
  imageUrl: string;           // Required: Product image URL (https)
  title?: string;             // Optional: Seller's title (incorporated if provided)
  category: string;           // Required: Product category (see Categories below)
  condition: string;          // Required: Product condition (see Conditions below)
  template?: 'detailed' | 'concise' | 'seo'; // Optional: Default 'detailed'
}
```

**Returns:**
```typescript
interface DescriptionResult {
  description: string;        // Generated description (max 2000 chars)
  wordCount: number;          // Number of words in description
  characterCount: number;     // Number of characters in description
  attributes: {
    color?: string;           // Extracted color if mentioned
    material?: string;        // Extracted material if mentioned
    brand?: string;           // Extracted brand if mentioned
    style?: string;           // Extracted style if mentioned
  };
}
```

**Throws:**
- `AIError` with code `NO_IMAGE` - No image URL provided
- `AIError` with code `INVALID_IMAGE` - Invalid or inaccessible image URL
- `AIError` with code `INVALID_PARAMS` - Invalid category or condition
- `AIError` with code `OPENAI_ERROR` - OpenAI API error
- `AIError` with code `RATE_LIMIT` - Rate limit exceeded
- `AIError` with code `TIMEOUT` - Request took longer than 30 seconds
- `AIError` with code `VALIDATION_FAILED` - Generated description too short

### `generateMultipleDescriptions(params)`

Generate descriptions using all three templates in parallel.

**Parameters:**
```typescript
Omit<GenerateDescriptionParams, 'template'>
```

**Returns:**
```typescript
{
  detailed: DescriptionResult;
  concise: DescriptionResult;
  seo: DescriptionResult;
}
```

### Categories

Valid values for `category` parameter:
- `ELECTRONICS` - Laptops, phones, cameras, etc.
- `CLOTHING` - Apparel, shoes, accessories
- `HOME_GARDEN` - Furniture, decor, appliances
- `SPORTS` - Equipment, gear, apparel
- `BOOKS` - Books, magazines, textbooks
- `TOYS` - Toys, games, puzzles
- `VEHICLES` - Cars, motorcycles, bicycles
- `COLLECTIBLES` - Art, antiques, memorabilia
- `BABY_KIDS` - Baby gear, children's items
- `PET_SUPPLIES` - Pet accessories, food, toys

### Conditions

Valid values for `condition` parameter:
- `NEW` - Brand new, unopened, or unused
- `LIKE_NEW` - Barely used, excellent condition
- `GOOD` - Gently used, fully functional
- `FAIR` - Moderate use, fully functional
- `POOR` - Heavy wear, may need repairs

## Error Codes

```typescript
AI_ERROR_CODES = {
  OPENAI_ERROR: 'OPENAI_ERROR',           // OpenAI API failure
  RATE_LIMIT: 'RATE_LIMIT',               // Rate limit exceeded
  INVALID_IMAGE: 'INVALID_IMAGE',         // Invalid/inaccessible image
  NO_IMAGE: 'NO_IMAGE',                   // No image URL provided
  INVALID_PARAMS: 'INVALID_PARAMS',       // Invalid parameters
  VALIDATION_FAILED: 'VALIDATION_FAILED', // Generated text validation failed
  TIMEOUT: 'TIMEOUT',                     // Request timeout (30s)
}
```

## Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional (defaults shown)
# None - all configuration is hardcoded in CONFIG constant
```

### Internal Configuration

Located in `generate-description.ts`:

```typescript
const CONFIG = {
  model: 'gpt-4o',           // Primary model
  fallbackModel: 'gpt-4o-mini', // Not currently used
  maxCharacters: 2000,       // Hard character limit
  timeout: 30000,            // 30 second timeout
  maxRetries: 2,             // Not currently used
}
```

## Testing

### Module Verification (No API Calls)

Tests module structure and validation logic without making OpenAI API calls:

```bash
npx tsx scripts/verify-description-module.ts
```

### Full Integration Tests (Requires API Key)

Tests actual OpenAI API integration with real images:

```bash
export OPENAI_API_KEY="sk-..."
npx tsx scripts/test-generate-description.ts
```

**Test Coverage:**
1. ✅ Basic description generation (detailed template)
2. ✅ Concise template
3. ✅ SEO-optimized template
4. ✅ Invalid image URL error handling
5. ✅ No image URL error handling
6. ✅ Invalid category error handling

## Integration with Prompt Templates

The generation function uses pre-engineered prompts from `prompts/description-templates.ts`:

1. **System Prompt** - Sets the AI's role and guidelines
2. **User Prompt** - Provides specific context (category, condition, title)
3. **Temperature** - Controls randomness (0.6-0.7)
4. **Max Tokens** - Limits response length (200-400)

Example flow:

```typescript
// 1. Get template configuration
const { systemPrompt, userPrompt, temperature, maxTokens } = generatePrompt({
  category: 'ELECTRONICS',
  condition: 'GOOD',
  title: 'MacBook Pro',
  style: 'detailed'
});

// 2. Build OpenAI messages
const messages = [
  { role: 'system', content: systemPrompt },
  {
    role: 'user',
    content: [
      { type: 'text', text: userPrompt },
      { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }
    ]
  }
];

// 3. Call OpenAI API
const completion = await client.chat.completions.create({
  model: 'gpt-4o',
  messages,
  temperature,
  max_tokens: maxTokens,
});
```

## Performance Considerations

### API Costs

OpenAI GPT-4o Vision pricing (as of 2024):
- Input: ~$5.00 / 1M tokens
- Output: ~$15.00 / 1M tokens

Typical costs per description:
- **Detailed**: ~$0.02-0.03 per generation
- **Concise**: ~$0.01-0.02 per generation
- **SEO**: ~$0.02-0.03 per generation

### Response Times

Expected response times:
- **Detailed**: 3-5 seconds
- **Concise**: 2-3 seconds
- **SEO**: 3-5 seconds
- **Multiple templates**: 3-5 seconds (parallel execution)

### Rate Limits

OpenAI rate limits (Tier 1):
- **RPM** (Requests per minute): 500
- **TPM** (Tokens per minute): 30,000

The module automatically detects rate limit errors and returns `RATE_LIMIT` error code with retry-after duration if provided by OpenAI.

## Security Considerations

1. **API Key Protection**
   - Never commit `.env` file
   - Use environment variables only
   - Rotate keys regularly

2. **Input Validation**
   - All parameters validated before API call
   - Image URLs must be HTTPS
   - Category/condition checked against enums

3. **Output Sanitization**
   - Generated content checked for prohibited patterns
   - Personal information filtered by system prompts
   - Character limits enforced

4. **Error Information**
   - Sensitive error details logged server-side only
   - User-facing messages are generic and safe
   - No API keys or tokens in error messages

## Troubleshooting

### "OPENAI_API_KEY environment variable is not set"

**Solution:** Add to `.env` file:
```bash
OPENAI_API_KEY=sk-...
```

### Rate Limit Exceeded

**Solution:** Implement exponential backoff:
```typescript
if (error.code === AI_ERROR_CODES.RATE_LIMIT) {
  const retryAfter = parseInt(error.message.match(/\d+/)?.[0] || '60');
  await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
  // Retry request
}
```

### Generated Description Too Short

**Cause:** Image may be unclear or unsuitable for analysis

**Solution:**
1. Ensure image is high quality (min 800x600px)
2. Check image shows product clearly
3. Try different image or template style

### Timeout Errors

**Cause:** OpenAI API taking longer than 30 seconds

**Solution:**
1. Check network connection
2. Verify OpenAI status (status.openai.com)
3. Try with smaller image or concise template

## Future Enhancements

Potential improvements for v2:

- [ ] Batch processing support for multiple images
- [ ] Automatic fallback to gpt-4o-mini on rate limits
- [ ] Caching layer for repeated images
- [ ] Multi-language support (Afrikaans, Zulu, etc.)
- [ ] Custom prompt template injection
- [ ] Description quality scoring
- [ ] A/B testing for template effectiveness
- [ ] Integration with price suggestion
- [ ] Auto-tagging and categorization

## Support

For issues or questions:
1. Check error code in `AI_ERROR_CODES`
2. Use `getUserFriendlyMessage()` for user display
3. Log full error details server-side
4. Check OpenAI API status page
5. Review prompt templates for adjustments

## Related Files

- `/lib/ai/generate-description.ts` - Main implementation
- `/lib/ai/errors.ts` - Error classes and codes
- `/lib/ai/types.ts` - TypeScript interfaces
- `/lib/ai/prompts/description-templates.ts` - Prompt engineering
- `/scripts/test-generate-description.ts` - Integration tests
- `/scripts/verify-description-module.ts` - Module verification
