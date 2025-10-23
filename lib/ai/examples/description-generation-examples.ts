/**
 * Example Usage: AI Description Generation
 *
 * Practical examples of how to use the description generation API
 * in different scenarios.
 */

import {
  generateProductDescription,
  generateMultipleDescriptions,
  isAIError,
  getUserFriendlyMessage,
  AI_ERROR_CODES,
  type DescriptionResult,
} from '@/lib/ai';

/**
 * Example 1: Basic description generation
 *
 * Generate a single description with the default detailed template
 */
export async function example1_BasicGeneration() {
  try {
    const result = await generateProductDescription({
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      title: 'MacBook Pro 2020',
      category: 'ELECTRONICS',
      condition: 'GOOD',
      // template defaults to 'detailed'
    });

    console.log('Description:', result.description);
    console.log('Word count:', result.wordCount);
    console.log('Attributes:', result.attributes);

    return result;
  } catch (error) {
    if (isAIError(error)) {
      console.error('Error:', error.code);
      console.error('Message:', getUserFriendlyMessage(error));
    }
    throw error;
  }
}

/**
 * Example 2: Generate all three templates
 *
 * Give seller options to choose from
 */
export async function example2_MultipleTemplates() {
  try {
    const results = await generateMultipleDescriptions({
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      category: 'CLOTHING',
      condition: 'LIKE_NEW',
    });

    return {
      detailed: results.detailed.description,
      concise: results.concise.description,
      seo: results.seo.description,
    };
  } catch (error) {
    if (isAIError(error)) {
      console.error('Failed to generate descriptions:', getUserFriendlyMessage(error));
    }
    throw error;
  }
}

/**
 * Example 3: Handle rate limiting with retry
 *
 * Implement exponential backoff for rate limit errors
 */
export async function example3_RateLimitHandling(
  imageUrl: string,
  category: string,
  condition: string,
  maxRetries = 3
): Promise<DescriptionResult> {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await generateProductDescription({
        imageUrl,
        category,
        condition,
      });
    } catch (error) {
      if (isAIError(error) && error.code === AI_ERROR_CODES.RATE_LIMIT) {
        attempt++;

        if (attempt >= maxRetries) {
          throw error; // Give up after max retries
        }

        // Exponential backoff: 1s, 2s, 4s, 8s...
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Rate limited. Retrying in ${waitTime}ms (attempt ${attempt}/${maxRetries})`);

        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        // Non-rate-limit error, throw immediately
        throw error;
      }
    }
  }

  throw new Error('Failed after maximum retries');
}

/**
 * Example 4: Server action integration
 *
 * Example of how to use in a Next.js server action
 */
export async function example4_ServerAction(
  imageUrl: string,
  category: string,
  condition: string,
  title?: string
): Promise<{ success: boolean; description?: string; error?: string }> {
  'use server';

  try {
    const result = await generateProductDescription({
      imageUrl,
      title,
      category,
      condition,
      template: 'detailed',
    });

    return {
      success: true,
      description: result.description,
    };
  } catch (error) {
    if (isAIError(error)) {
      return {
        success: false,
        error: getUserFriendlyMessage(error),
      };
    }

    // Unknown error
    console.error('Unexpected error in generateDescription:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Example 5: React component usage
 *
 * Example of using the description generation in a React form
 */
export function example5_ReactComponent() {
  /*
  'use client';

  import { useState } from 'react';
  import { generateProductDescription, isAIError, getUserFriendlyMessage } from '@/lib/ai';

  export function DescriptionGenerator({ imageUrl, category, condition }) {
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async (template: 'detailed' | 'concise' | 'seo') => {
      setLoading(true);
      setError('');

      try {
        const result = await generateProductDescription({
          imageUrl,
          category,
          condition,
          template,
        });

        setDescription(result.description);
      } catch (err) {
        if (isAIError(err)) {
          setError(getUserFriendlyMessage(err));
        } else {
          setError('Failed to generate description');
        }
      } finally {
        setLoading(false);
      }
    };

    return (
      <div>
        <div className="flex gap-2 mb-4">
          <button onClick={() => handleGenerate('detailed')} disabled={loading}>
            Detailed
          </button>
          <button onClick={() => handleGenerate('concise')} disabled={loading}>
            Concise
          </button>
          <button onClick={() => handleGenerate('seo')} disabled={loading}>
            SEO
          </button>
        </div>

        {loading && <p>Generating description...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {description && (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            className="w-full"
          />
        )}
      </div>
    );
  }
  */
}

/**
 * Example 6: Batch processing with queue
 *
 * Process multiple listings with rate limit awareness
 */
export async function example6_BatchProcessing(
  listings: Array<{
    id: string;
    imageUrl: string;
    category: string;
    condition: string;
  }>
): Promise<Map<string, DescriptionResult | Error>> {
  const results = new Map<string, DescriptionResult | Error>();

  // Process sequentially to avoid rate limits
  for (const listing of listings) {
    try {
      const result = await generateProductDescription({
        imageUrl: listing.imageUrl,
        category: listing.category,
        condition: listing.condition,
      });

      results.set(listing.id, result);

      // Add small delay between requests to be nice to API
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.set(listing.id, error as Error);

      // If rate limited, wait longer before continuing
      if (isAIError(error) && error.code === AI_ERROR_CODES.RATE_LIMIT) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  return results;
}

/**
 * Example 7: Cache implementation
 *
 * Cache descriptions to avoid duplicate API calls
 */
const descriptionCache = new Map<string, { result: DescriptionResult; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function example7_WithCaching(
  imageUrl: string,
  category: string,
  condition: string,
  template: 'detailed' | 'concise' | 'seo' = 'detailed'
): Promise<DescriptionResult> {
  // Create cache key from parameters
  const cacheKey = `${imageUrl}:${category}:${condition}:${template}`;

  // Check cache
  const cached = descriptionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Cache hit for', cacheKey);
    return cached.result;
  }

  // Generate new description
  const result = await generateProductDescription({
    imageUrl,
    category,
    condition,
    template,
  });

  // Store in cache
  descriptionCache.set(cacheKey, {
    result,
    timestamp: Date.now(),
  });

  return result;
}

/**
 * Example 8: Database integration
 *
 * Save generated description to database
 */
export async function example8_SaveToDatabase(
  listingId: string,
  imageUrl: string,
  category: string,
  condition: string
) {
  /*
  import { prisma } from '@/lib/prisma';

  try {
    // Generate description
    const result = await generateProductDescription({
      imageUrl,
      category,
      condition,
      template: 'detailed',
    });

    // Save to database
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        description: result.description,
        aiGenerated: true,
        aiAttributes: result.attributes,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    if (isAIError(error)) {
      // Log AI-specific errors
      console.error('AI Error:', error.code, error.message);
    }

    return { success: false, error: 'Failed to generate description' };
  }
  */
}

/**
 * Example 9: API route handler
 *
 * Create an API endpoint for description generation
 */
export function example9_APIRoute() {
  /*
  // app/api/listings/generate-description/route.ts

  import { NextRequest, NextResponse } from 'next/server';
  import { generateProductDescription, isAIError, getUserFriendlyMessage } from '@/lib/ai';

  export async function POST(request: NextRequest) {
    try {
      const body = await request.json();
      const { imageUrl, title, category, condition, template } = body;

      // Validate required fields
      if (!imageUrl || !category || !condition) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Generate description
      const result = await generateProductDescription({
        imageUrl,
        title,
        category,
        condition,
        template: template || 'detailed',
      });

      return NextResponse.json({
        success: true,
        data: result,
      });

    } catch (error) {
      if (isAIError(error)) {
        const statusCode = error.code === 'RATE_LIMIT' ? 429 : 500;
        return NextResponse.json(
          {
            success: false,
            error: getUserFriendlyMessage(error),
            code: error.code,
          },
          { status: statusCode }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
  */
}

/**
 * Example 10: Pre-fill form with AI
 *
 * Generate description when user uploads first image
 */
export async function example10_AutoFillForm(
  imageUrl: string,
  category: string,
  condition: string
): Promise<{
  description: string;
  suggestedAttributes: Record<string, string>;
}> {
  try {
    const result = await generateProductDescription({
      imageUrl,
      category,
      condition,
      template: 'detailed',
    });

    // Filter out undefined attributes
    const suggestedAttributes = Object.entries(result.attributes)
      .filter(([_, value]) => value !== undefined)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    return {
      description: result.description,
      suggestedAttributes,
    };
  } catch (error) {
    if (isAIError(error)) {
      console.error('Failed to auto-fill:', getUserFriendlyMessage(error));
    }

    // Return empty values on error - let user fill manually
    return {
      description: '',
      suggestedAttributes: {},
    };
  }
}
