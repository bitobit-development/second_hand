# AI Category Suggestion API Documentation

## Overview

The AI Category Suggestion API analyzes product images using OpenAI GPT-4o Vision to automatically suggest appropriate categories for marketplace listings. This reduces user friction during the listing creation process and improves categorization accuracy.

**Base URL:** `https://second-hand-xi.vercel.app/api` (production)
**Base URL:** `http://localhost:3000/api` (development)

**OpenAPI Version:** 3.0.3
**Last Updated:** 2025-10-26

---

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Caching](#caching)
4. [Endpoints](#endpoints)
   - [POST /suggest-categories](#post-suggest-categories)
   - [GET /suggest-categories](#get-suggest-categories)
5. [Error Codes](#error-codes)
6. [Usage Examples](#usage-examples)
7. [Cost Estimates](#cost-estimates)
8. [OpenAPI Specification](#openapi-specification)

---

## Authentication

All endpoints require authentication via NextAuth.js session cookies.

### Authentication Method
- **Type:** Session-based (JWT)
- **Cookie Name:** `authjs.session-token` (production) or `next-auth.session-token` (development)
- **Requirement:** User must be logged in with a valid session

### Unauthenticated Requests
**Response:**
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```
**Status Code:** `401 Unauthorized`

---

## Rate Limiting

API requests are rate-limited per user or IP address to prevent abuse and control costs.

### Limits
- **Per Minute:** 10 requests
- **Per Hour:** 100 requests

### Rate Limit Headers
All responses include rate limit information:

| Header | Description | Example |
|--------|-------------|---------|
| `X-RateLimit-Remaining` | Requests remaining in current window | `9` |
| `X-RateLimit-Reset` | Unix timestamp when limit resets | `1698765432` |
| `Retry-After` | Seconds to wait before retry (only on 429) | `60` |

### Rate Limit Exceeded Response
**Status Code:** `429 Too Many Requests`

**Response:**
```json
{
  "error": "Rate Limit Exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 42,
  "reset": 1698765432000
}
```

**Headers:**
```
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1698765432
Retry-After: 42
```

---

## Caching

Responses are cached in-memory to reduce OpenAI API costs and improve response times.

### Cache Configuration
- **Storage:** In-memory Map (Redis upgrade planned)
- **TTL:** 15 minutes
- **Max Entries:** 1,000 suggestions
- **Key:** Hash of first image URL
- **Cleanup:** Automatic every 5 minutes

### Cache Behavior
- **Cache Hit:** Returns cached result with `"cached": true`
- **Cache Miss:** Calls OpenAI API and caches result
- **Expiration:** Entries auto-expire after 15 minutes

### Cache Metrics
Monitor cache performance via `GET /suggest-categories` endpoint.

---

## Endpoints

### POST /suggest-categories

Generate AI-powered category suggestions from product images.

#### Request

**Method:** `POST`
**URL:** `/api/suggest-categories`
**Content-Type:** `application/json`

**Request Body Schema:**

```typescript
{
  imageUrls: string[];      // 1-5 Cloudinary URLs (required)
  context?: string;         // Optional description (max 500 chars)
  promptVersion?: 'v1' | 'v2' | 'v3'; // AI prompt version (default: 'v1')
}
```

**Field Validation:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `imageUrls` | `string[]` | Yes | 1-5 valid URLs | Product image URLs from Cloudinary |
| `context` | `string` | No | Max 500 characters | Additional context for better suggestions |
| `promptVersion` | `enum` | No | `v1`, `v2`, or `v3` | AI prompt template version |

**Request Example:**

```json
{
  "imageUrls": [
    "https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg",
    "https://res.cloudinary.com/demo/image/upload/v1234567891/sample2.jpg"
  ],
  "context": "Vintage leather jacket with brass buttons and quilted lining",
  "promptVersion": "v1"
}
```

#### Response

**Status Code:** `200 OK`

**Response Body Schema:**

```typescript
{
  success: true;
  suggestions: Array<{
    category: string;          // Suggested category name
    parentCategory: string;    // Parent category enum value
    confidence: number;        // Confidence score (0-100)
    reasoning: string;         // AI reasoning for suggestion
    granularity: 'base' | 'subcategory' | 'specific';
  }>;
  createNew: boolean;          // Whether to create new category
  grouping: string;            // Category grouping/theme
  qualityIssues?: string[];    // Image quality warnings
  tokensUsed: number;          // Estimated tokens consumed
  cached: boolean;             // Whether result was cached
}
```

**Success Response Example:**

```json
{
  "success": true,
  "suggestions": [
    {
      "category": "Leather Jackets",
      "parentCategory": "CLOTHING",
      "confidence": 95,
      "reasoning": "Vintage leather jacket visible with brass buttons and quilted lining",
      "granularity": "subcategory"
    },
    {
      "category": "Outerwear",
      "parentCategory": "CLOTHING",
      "confidence": 85,
      "reasoning": "Clothing item designed for outdoor wear",
      "granularity": "subcategory"
    }
  ],
  "createNew": false,
  "grouping": "Leather Jackets",
  "qualityIssues": [],
  "tokensUsed": 730,
  "cached": false
}
```

**Cached Response Example:**

```json
{
  "success": true,
  "suggestions": [...],
  "createNew": false,
  "grouping": "Electronics",
  "tokensUsed": 650,
  "cached": true
}
```

#### Error Responses

**400 Bad Request - Invalid JSON**
```json
{
  "success": false,
  "error": "Invalid JSON in request body",
  "code": "INVALID_JSON"
}
```

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "error": "At least one image is required",
  "code": "VALIDATION_ERROR"
}
```

**400 Bad Request - Invalid Image**
```json
{
  "success": false,
  "error": "Image could not be processed. Please upload a different photo.",
  "code": "INVALID_IMAGE"
}
```

**400 Bad Request - Inappropriate Content**
```json
{
  "success": false,
  "error": "Image contains inappropriate content",
  "code": "INAPPROPRIATE_CONTENT"
}
```

**401 Unauthorized**
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**429 Too Many Requests**
```json
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Failed to generate description. Please try again.",
  "code": "OPENAI_ERROR"
}
```

---

### GET /suggest-categories

Retrieve cache metrics for monitoring and debugging.

#### Request

**Method:** `GET`
**URL:** `/api/suggest-categories`
**Authentication:** Required

#### Response

**Status Code:** `200 OK`

**Response Body Schema:**

```typescript
{
  success: true;
  metrics: {
    hits: number;           // Total cache hits
    misses: number;         // Total cache misses
    totalRequests: number;  // Total requests processed
    hitRate: number;        // Cache hit rate percentage
    size: number;           // Current cache entries
  };
}
```

**Success Response Example:**

```json
{
  "success": true,
  "metrics": {
    "hits": 342,
    "misses": 158,
    "totalRequests": 500,
    "hitRate": 68.4,
    "size": 247
  }
}
```

**Interpretation:**
- **Hit Rate:** 68.4% of requests served from cache (good)
- **Size:** 247 cached entries (out of 1,000 max)
- **Total Requests:** 500 suggestions generated since last restart

---

## Error Codes

Comprehensive list of error codes returned by the API.

| Code | HTTP Status | Description | User Action |
|------|-------------|-------------|-------------|
| `INVALID_JSON` | 400 | Request body is not valid JSON | Fix JSON syntax |
| `VALIDATION_ERROR` | 400 | Request parameters failed validation | Check field constraints |
| `INVALID_IMAGE` | 400 | Image URL is invalid or inaccessible | Upload a different image |
| `NO_IMAGE` | 400 | No image URLs provided | Provide at least one image |
| `INAPPROPRIATE_CONTENT` | 400 | Image contains inappropriate content | Upload appropriate product images |
| `UNCLEAR_IMAGE` | 400 | Image quality too low for analysis | Upload clearer photos |
| `MULTIPLE_ITEMS` | 400 | Multiple distinct items detected | Upload images of single item |
| `RATE_LIMIT` | 429 | Rate limit exceeded | Wait and retry after specified time |
| `OPENAI_ERROR` | 500 | OpenAI API request failed | Retry request |
| `TIMEOUT` | 500 | Request exceeded 30 second timeout | Retry with fewer/smaller images |
| `INTERNAL_ERROR` | 500 | Unexpected server error | Contact support if persists |

---

## Usage Examples

### cURL

**Basic Request:**
```bash
curl -X POST https://second-hand-xi.vercel.app/api/suggest-categories \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "imageUrls": [
      "https://res.cloudinary.com/demo/image/upload/v1234567890/product.jpg"
    ],
    "promptVersion": "v1"
  }'
```

**With Context:**
```bash
curl -X POST https://second-hand-xi.vercel.app/api/suggest-categories \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "imageUrls": [
      "https://res.cloudinary.com/demo/image/upload/v1234567890/jacket.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1234567891/detail.jpg"
    ],
    "context": "Vintage leather motorcycle jacket, size L",
    "promptVersion": "v2"
  }'
```

**Get Cache Metrics:**
```bash
curl -X GET https://second-hand-xi.vercel.app/api/suggest-categories \
  -H "Cookie: authjs.session-token=YOUR_SESSION_TOKEN"
```

---

### JavaScript (Fetch API)

**Browser/Client-Side:**
```javascript
async function suggestCategories(imageUrls, context = '') {
  try {
    const response = await fetch('/api/suggest-categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include session cookie
      body: JSON.stringify({
        imageUrls,
        context,
        promptVersion: 'v1',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to suggest categories');
    }

    const data = await response.json();

    if (data.cached) {
      console.log('Result served from cache');
    }

    return data.suggestions;
  } catch (error) {
    console.error('Category suggestion error:', error);
    throw error;
  }
}

// Usage
const suggestions = await suggestCategories([
  'https://res.cloudinary.com/demo/image/upload/v1234567890/phone.jpg'
], 'iPhone 12 Pro in excellent condition');

console.log('Suggested categories:', suggestions);
```

**With Error Handling:**
```javascript
async function suggestCategoriesWithRetry(imageUrls, context = '', maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/suggest-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ imageUrls, context, promptVersion: 'v1' }),
      });

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        console.warn(`Rate limited. Retrying after ${retryAfter}s...`);
        await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
        continue;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    }
  }

  throw lastError;
}
```

---

### TypeScript

**Type-Safe Client:**
```typescript
// types.ts
interface CategorySuggestion {
  category: string;
  parentCategory: string;
  confidence: number;
  reasoning: string;
  granularity: 'base' | 'subcategory' | 'specific';
}

interface SuggestCategoriesRequest {
  imageUrls: string[];
  context?: string;
  promptVersion?: 'v1' | 'v2' | 'v3';
}

interface SuggestCategoriesResponse {
  success: true;
  suggestions: CategorySuggestion[];
  createNew: boolean;
  grouping: string;
  qualityIssues?: string[];
  tokensUsed: number;
  cached: boolean;
}

interface APIError {
  success: false;
  error: string;
  code?: string;
}

type APIResponse<T> = T | APIError;

// client.ts
class CategorySuggestionClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async suggest(
    request: SuggestCategoriesRequest
  ): Promise<SuggestCategoriesResponse> {
    const response = await fetch(`${this.baseUrl}/suggest-categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    const data: APIResponse<SuggestCategoriesResponse> = await response.json();

    if (!data.success) {
      throw new CategorySuggestionError(
        data.error,
        data.code,
        response.status
      );
    }

    return data;
  }

  async getMetrics() {
    const response = await fetch(`${this.baseUrl}/suggest-categories`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }
}

class CategorySuggestionError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'CategorySuggestionError';
  }
}

// Usage
const client = new CategorySuggestionClient();

try {
  const result = await client.suggest({
    imageUrls: [
      'https://res.cloudinary.com/demo/image/upload/v1234567890/laptop.jpg'
    ],
    context: 'MacBook Pro 2021 M1 chip',
    promptVersion: 'v2',
  });

  console.log('Top suggestion:', result.suggestions[0]);
  console.log('Cached:', result.cached);
  console.log('Tokens used:', result.tokensUsed);
} catch (error) {
  if (error instanceof CategorySuggestionError) {
    console.error(`Error ${error.code}:`, error.message);
  }
}
```

---

### React Hook

**Custom Hook with State Management:**
```typescript
import { useState, useCallback } from 'react';

interface UseCategorySuggestionOptions {
  onSuccess?: (suggestions: CategorySuggestion[]) => void;
  onError?: (error: Error) => void;
}

export function useCategorySuggestion(options: UseCategorySuggestionOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [cached, setCached] = useState(false);

  const suggest = useCallback(async (
    imageUrls: string[],
    context?: string,
    promptVersion: 'v1' | 'v2' | 'v3' = 'v1'
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/suggest-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ imageUrls, context, promptVersion }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to suggest categories');
      }

      const data = await response.json();

      setSuggestions(data.suggestions);
      setCached(data.cached);

      options.onSuccess?.(data.suggestions);

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setSuggestions([]);
    setError(null);
    setCached(false);
  }, []);

  return {
    suggest,
    suggestions,
    loading,
    error,
    cached,
    reset,
  };
}

// Usage in component
function CategorySelector({ imageUrls }: { imageUrls: string[] }) {
  const { suggest, suggestions, loading, error, cached } = useCategorySuggestion({
    onSuccess: (suggestions) => {
      console.log('Got suggestions:', suggestions);
    },
  });

  const handleSuggest = async () => {
    try {
      await suggest(imageUrls, 'Optional context here');
    } catch (err) {
      // Error already handled by hook
    }
  };

  return (
    <div>
      <button onClick={handleSuggest} disabled={loading}>
        {loading ? 'Analyzing...' : 'Suggest Categories'}
      </button>

      {cached && <span>⚡ Cached result</span>}

      {error && <div className="error">{error.message}</div>}

      {suggestions.map((suggestion, i) => (
        <div key={i}>
          <strong>{suggestion.category}</strong> ({suggestion.confidence}%)
          <p>{suggestion.reasoning}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Cost Estimates

Understanding the cost per API request helps with budgeting and optimization.

### Token Usage Breakdown

**Per Request (2 images, v1 prompt):**

| Component | Tokens | Notes |
|-----------|--------|-------|
| Input Images (2x) | ~130 | 65 tokens per image (low detail) |
| Prompt (v1) | ~450 | Category definitions + instructions |
| Response | ~150 | JSON-formatted suggestions |
| **Total** | **~730** | Typical request |

**Prompt Version Comparison:**

| Version | Prompt Tokens | Use Case | Total Tokens (2 images) |
|---------|---------------|----------|-------------------------|
| v1 | 450 | Standard suggestions | ~730 |
| v2 | 650 | Enhanced with examples | ~930 |
| v3 | 250 | Minimal/fast | ~530 |

### OpenAI Pricing (GPT-4o Vision)

**Model:** `gpt-4o-2024-08-06`
**Input:** $2.50 per 1M tokens
**Output:** $10.00 per 1M tokens

**Cost Per Request:**

| Configuration | Input Tokens | Output Tokens | Cost | Notes |
|---------------|--------------|---------------|------|-------|
| 1 image, v3 prompt | 315 | 150 | $0.0023 | Minimal |
| 2 images, v1 prompt | 580 | 150 | $0.0029 | Standard |
| 2 images, v2 prompt | 780 | 150 | $0.0035 | Enhanced |
| 5 images, v1 prompt | 775 | 150 | $0.0034 | Max images (not recommended) |

**Monthly Cost Estimates (1,000 requests/month):**

| Scenario | Config | Cache Hit Rate | Unique Requests | Monthly Cost |
|----------|--------|----------------|-----------------|--------------|
| Low usage | 1 image, v3 | 0% | 1,000 | $2.30 |
| Standard | 2 images, v1 | 50% | 500 | $1.45 |
| High usage | 2 images, v1 | 70% | 300 | $0.87 |
| Optimized | 2 images, v3 | 80% | 200 | $0.52 |

### Cost Optimization Strategies

1. **Enable Caching** (Already Implemented)
   - 15-minute TTL reduces duplicate API calls
   - Expected cache hit rate: 50-70%
   - Cost savings: 50-70%

2. **Use Minimal Prompt Version**
   - Switch to `v3` for faster/cheaper suggestions
   - Tradeoff: Slightly less detailed reasoning
   - Savings: ~27% per request

3. **Limit Image Count**
   - API already limits to 2 images (out of max 5)
   - Using 1 image instead saves ~65 tokens
   - Tradeoff: May reduce accuracy for complex items

4. **Batch Processing**
   - Process multiple listings in succession
   - Takes advantage of cache warming
   - Higher cache hit rates = lower costs

5. **Smart Request Timing**
   - Avoid duplicate requests for same images
   - Client-side deduplication before API call
   - Exponential backoff on errors

### Real-World Cost Example

**Scenario:** Marketplace with 10,000 listings/month

- **Configuration:** 2 images, v1 prompt
- **Cache Hit Rate:** 60% (good)
- **Unique Requests:** 4,000
- **Cost per Request:** $0.0029
- **Monthly Cost:** $11.60
- **Annual Cost:** $139.20

**With Optimization (v3 + 80% cache):**
- **Unique Requests:** 2,000
- **Cost per Request:** $0.0026
- **Monthly Cost:** $5.20
- **Annual Cost:** $62.40
- **Savings:** $76.80/year (55%)

---

## OpenAPI Specification

Complete OpenAPI 3.0 specification for integration with API tools.

```yaml
openapi: 3.0.3
info:
  title: AI Category Suggestion API
  description: |
    AI-powered category suggestion endpoint for marketplace listings.
    Analyzes product images using OpenAI GPT-4o Vision to suggest appropriate categories.
  version: 1.0.0
  contact:
    name: LOTOSALE Support
    url: https://second-hand-xi.vercel.app
  license:
    name: Proprietary

servers:
  - url: https://second-hand-xi.vercel.app/api
    description: Production server
  - url: http://localhost:3000/api
    description: Development server

tags:
  - name: AI
    description: AI-powered features
  - name: Categories
    description: Category management

paths:
  /suggest-categories:
    post:
      tags:
        - AI
        - Categories
      summary: Generate category suggestions
      description: |
        Analyzes product images using AI to suggest appropriate marketplace categories.
        Returns ranked suggestions with confidence scores and reasoning.
      operationId: suggestCategories

      security:
        - sessionAuth: []

      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SuggestCategoriesRequest'
            examples:
              basic:
                summary: Basic request with single image
                value:
                  imageUrls:
                    - https://res.cloudinary.com/demo/image/upload/v1234567890/product.jpg
              withContext:
                summary: Request with context and multiple images
                value:
                  imageUrls:
                    - https://res.cloudinary.com/demo/image/upload/v1234567890/jacket1.jpg
                    - https://res.cloudinary.com/demo/image/upload/v1234567891/jacket2.jpg
                  context: Vintage leather motorcycle jacket, size L
                  promptVersion: v2

      responses:
        '200':
          description: Successful suggestion generation
          headers:
            X-RateLimit-Remaining:
              schema:
                type: integer
              description: Requests remaining in current window
            X-RateLimit-Reset:
              schema:
                type: integer
              description: Unix timestamp when limit resets
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuggestCategoriesResponse'
              examples:
                success:
                  summary: Successful suggestion
                  value:
                    success: true
                    suggestions:
                      - category: Leather Jackets
                        parentCategory: CLOTHING
                        confidence: 95
                        reasoning: Vintage leather jacket visible with brass buttons
                        granularity: subcategory
                      - category: Outerwear
                        parentCategory: CLOTHING
                        confidence: 85
                        reasoning: Clothing item designed for outdoor wear
                        granularity: subcategory
                    createNew: false
                    grouping: Leather Jackets
                    qualityIssues: []
                    tokensUsed: 730
                    cached: false
                cached:
                  summary: Cached result
                  value:
                    success: true
                    suggestions:
                      - category: Smartphones
                        parentCategory: ELECTRONICS
                        confidence: 98
                        reasoning: iPhone device clearly visible
                        granularity: subcategory
                    createNew: false
                    grouping: Smartphones
                    tokensUsed: 650
                    cached: true

        '400':
          description: Bad request (validation error)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              examples:
                invalidJson:
                  summary: Invalid JSON
                  value:
                    success: false
                    error: Invalid JSON in request body
                    code: INVALID_JSON
                validation:
                  summary: Validation error
                  value:
                    success: false
                    error: At least one image is required
                    code: VALIDATION_ERROR
                invalidImage:
                  summary: Invalid image URL
                  value:
                    success: false
                    error: Image could not be processed. Please upload a different photo.
                    code: INVALID_IMAGE

        '401':
          description: Unauthorized (no valid session)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedError'

        '429':
          description: Rate limit exceeded
          headers:
            X-RateLimit-Remaining:
              schema:
                type: integer
                example: 0
            X-RateLimit-Reset:
              schema:
                type: integer
              description: Unix timestamp when limit resets
            Retry-After:
              schema:
                type: integer
              description: Seconds to wait before retry
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RateLimitError'

        '500':
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              examples:
                openaiError:
                  summary: OpenAI API error
                  value:
                    success: false
                    error: Failed to generate description. Please try again.
                    code: OPENAI_ERROR
                timeout:
                  summary: Request timeout
                  value:
                    success: false
                    error: Request took too long. Please try again.
                    code: TIMEOUT

    get:
      tags:
        - AI
        - Categories
      summary: Get cache metrics
      description: |
        Retrieve cache performance metrics for monitoring.
        Includes hit/miss statistics and current cache size.
      operationId: getCacheMetrics

      security:
        - sessionAuth: []

      responses:
        '200':
          description: Cache metrics retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CacheMetricsResponse'
              example:
                success: true
                metrics:
                  hits: 342
                  misses: 158
                  totalRequests: 500
                  hitRate: 68.4
                  size: 247

        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedError'

components:
  securitySchemes:
    sessionAuth:
      type: apiKey
      in: cookie
      name: authjs.session-token
      description: NextAuth.js session cookie

  schemas:
    SuggestCategoriesRequest:
      type: object
      required:
        - imageUrls
      properties:
        imageUrls:
          type: array
          minItems: 1
          maxItems: 5
          items:
            type: string
            format: uri
          description: Array of 1-5 Cloudinary image URLs
          example:
            - https://res.cloudinary.com/demo/image/upload/v1234567890/product.jpg
        context:
          type: string
          maxLength: 500
          description: Optional context/description for better suggestions
          example: Vintage leather jacket with brass buttons
        promptVersion:
          type: string
          enum: [v1, v2, v3]
          default: v1
          description: AI prompt template version

    SuggestCategoriesResponse:
      type: object
      required:
        - success
        - suggestions
        - createNew
        - grouping
        - tokensUsed
        - cached
      properties:
        success:
          type: boolean
          enum: [true]
        suggestions:
          type: array
          items:
            $ref: '#/components/schemas/CategorySuggestion'
        createNew:
          type: boolean
          description: Whether to create a new category
        grouping:
          type: string
          description: Category grouping/theme
        qualityIssues:
          type: array
          items:
            type: string
          description: Image quality warnings (if any)
        tokensUsed:
          type: integer
          description: Estimated tokens consumed
          example: 730
        cached:
          type: boolean
          description: Whether result was served from cache

    CategorySuggestion:
      type: object
      required:
        - category
        - parentCategory
        - confidence
        - reasoning
        - granularity
      properties:
        category:
          type: string
          description: Suggested category name
          example: Leather Jackets
        parentCategory:
          type: string
          enum:
            - ELECTRONICS
            - CLOTHING
            - HOME_GARDEN
            - SPORTS
            - BOOKS
            - TOYS
            - VEHICLES
            - COLLECTIBLES
            - BABY_KIDS
            - PET_SUPPLIES
          description: Parent category enum value
          example: CLOTHING
        confidence:
          type: integer
          minimum: 0
          maximum: 100
          description: Confidence score (0-100)
          example: 95
        reasoning:
          type: string
          description: AI reasoning for this suggestion
          example: Vintage leather jacket visible with brass buttons
        granularity:
          type: string
          enum: [base, subcategory, specific]
          description: Suggestion granularity level

    ErrorResponse:
      type: object
      required:
        - success
        - error
      properties:
        success:
          type: boolean
          enum: [false]
        error:
          type: string
          description: Human-readable error message
        code:
          type: string
          description: Machine-readable error code
          enum:
            - INVALID_JSON
            - VALIDATION_ERROR
            - INVALID_IMAGE
            - NO_IMAGE
            - INAPPROPRIATE_CONTENT
            - UNCLEAR_IMAGE
            - MULTIPLE_ITEMS
            - RATE_LIMIT
            - OPENAI_ERROR
            - TIMEOUT
            - INTERNAL_ERROR

    UnauthorizedError:
      type: object
      required:
        - error
        - message
      properties:
        error:
          type: string
          example: Unauthorized
        message:
          type: string
          example: Authentication required

    RateLimitError:
      type: object
      required:
        - error
        - message
      properties:
        error:
          type: string
          example: Rate Limit Exceeded
        message:
          type: string
          example: Too many requests. Please try again later.
        retryAfter:
          type: integer
          description: Seconds to wait before retry
          example: 42
        reset:
          type: integer
          format: int64
          description: Unix timestamp (ms) when limit resets
          example: 1698765432000

    CacheMetricsResponse:
      type: object
      required:
        - success
        - metrics
      properties:
        success:
          type: boolean
          enum: [true]
        metrics:
          type: object
          required:
            - hits
            - misses
            - totalRequests
            - hitRate
            - size
          properties:
            hits:
              type: integer
              description: Total cache hits
              example: 342
            misses:
              type: integer
              description: Total cache misses
              example: 158
            totalRequests:
              type: integer
              description: Total requests processed
              example: 500
            hitRate:
              type: number
              format: float
              description: Cache hit rate percentage
              example: 68.4
            size:
              type: integer
              description: Current number of cached entries
              example: 247
```

---

## Best Practices

### Request Optimization

1. **Minimize Image Count**
   - Use 1-2 images for most products
   - Additional images don't significantly improve accuracy
   - Saves ~65 tokens per image

2. **Provide Context**
   - Add brief product description when available
   - Improves suggestion accuracy
   - Helps disambiguate edge cases

3. **Choose Appropriate Prompt Version**
   - `v1`: Standard accuracy, balanced cost
   - `v2`: Higher accuracy, more tokens
   - `v3`: Faster/cheaper, slightly less detailed

### Error Handling

1. **Handle Rate Limits Gracefully**
   - Check `X-RateLimit-Remaining` header
   - Implement exponential backoff
   - Show user-friendly messages

2. **Retry Transient Errors**
   - Retry `OPENAI_ERROR` and `TIMEOUT` errors
   - Don't retry validation errors (400)
   - Maximum 3 retry attempts

3. **Validate Client-Side**
   - Check image URLs before API call
   - Enforce 1-5 image limit
   - Validate context length (<500 chars)

### Performance

1. **Cache Results**
   - Store suggestions in client state
   - Avoid duplicate API calls for same images
   - Leverage API's built-in caching (15 min TTL)

2. **Optimize Image Loading**
   - Ensure images are uploaded to Cloudinary first
   - Use optimized image URLs
   - Consider image quality/size tradeoffs

3. **Monitor Metrics**
   - Check cache hit rate via `GET /suggest-categories`
   - Aim for >60% hit rate
   - Investigate low hit rates

### Security

1. **Protect Session Cookies**
   - Use HTTPS in production
   - Set `secure` and `httpOnly` flags
   - Implement CSRF protection

2. **Validate Image URLs**
   - Only accept Cloudinary URLs
   - Verify URL accessibility
   - Scan for inappropriate content

3. **Monitor Rate Limits**
   - Track per-user request patterns
   - Alert on unusual activity
   - Implement additional throttling if needed

---

## Changelog

### Version 1.0.0 (2025-10-26)
- Initial API release
- POST endpoint for category suggestions
- GET endpoint for cache metrics
- Rate limiting (10/min, 100/hour)
- In-memory caching (15-minute TTL)
- Support for 3 prompt versions (v1, v2, v3)
- Comprehensive error handling
- OpenAPI 3.0 specification

---

## Support

For API support, integration assistance, or to report issues:

- **Documentation:** This file
- **Feature Requests:** Submit via admin dashboard
- **Bug Reports:** Contact development team
- **Integration Help:** Refer to usage examples above

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-26
**Maintained By:** LOTOSALE Engineering Team
