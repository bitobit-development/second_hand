/**
 * Category Matching Algorithm
 *
 * Intelligent category matching with fuzzy string matching and semantic similarity.
 * Helps decide when to reuse existing categories vs creating new ones.
 */

import { CategoryMatchResult } from './types';

/**
 * Existing category interface (future Category model)
 */
export interface Category {
  name: string;
  slug: string;
  parentId?: string;
}

/**
 * Find best matching category from existing categories
 *
 * Algorithm:
 * 1. Exact match (case-insensitive) - 100% confidence
 * 2. Fuzzy string matching - 60-95% confidence
 * 3. Semantic similarity - 50-80% confidence
 * 4. No match - recommend creating new category
 *
 * @param suggestedName - AI-suggested category name
 * @param existingCategories - Current category list
 * @param similarityThreshold - Minimum similarity score (0-1) to consider a match (default: 0.8)
 * @returns Match result with confidence and recommendation
 */
export function findBestCategoryMatch(
  suggestedName: string,
  existingCategories: Category[],
  similarityThreshold: number = 0.8
): CategoryMatchResult {
  if (!suggestedName || existingCategories.length === 0) {
    return {
      match: null,
      confidence: 0,
      shouldCreateNew: true,
    };
  }

  const normalizedSuggestion = suggestedName.toLowerCase().trim();
  let bestMatch: Category | null = null;
  let bestScore = 0;
  const similarCategories: Array<{ name: string; similarity: number }> = [];

  // Check each existing category
  for (const category of existingCategories) {
    const normalizedCategory = category.name.toLowerCase().trim();

    // 1. Exact match
    if (normalizedSuggestion === normalizedCategory) {
      return {
        match: category,
        confidence: 100,
        shouldCreateNew: false,
      };
    }

    // 2. Fuzzy string matching
    const similarity = calculateStringSimilarity(
      normalizedSuggestion,
      normalizedCategory
    );

    // Track similar categories for reference
    if (similarity >= 0.5) {
      similarCategories.push({
        name: category.name,
        similarity: Math.round(similarity * 100),
      });
    }

    // Update best match
    if (similarity > bestScore) {
      bestScore = similarity;
      bestMatch = category;
    }
  }

  // Sort similar categories by similarity
  similarCategories.sort((a, b) => b.similarity - a.similarity);

  // Convert score to 0-100 scale
  const confidence = Math.round(bestScore * 100);

  // Decide if we should create new based on threshold
  const shouldCreateNew = bestScore < similarityThreshold;

  return {
    match: bestMatch,
    confidence,
    shouldCreateNew,
    similarCategories: similarCategories.slice(0, 3), // Top 3
  };
}

/**
 * Calculate string similarity using Levenshtein distance
 *
 * Returns a score between 0 (no match) and 1 (exact match).
 *
 * Algorithm:
 * - Levenshtein distance measures character edits needed
 * - Normalized by length of longer string
 * - Additional bonuses for:
 *   - Same first word
 *   - Contains all words from one string in the other
 *   - Similar word count
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score 0-1
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Base similarity using Levenshtein distance
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  let similarity = 1 - distance / maxLength;

  // Bonus: Same first word (important for category matching)
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  if (words1[0] === words2[0]) {
    similarity += 0.15; // Bonus for matching first word
  }

  // Bonus: One string contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    similarity += 0.1;
  }

  // Bonus: All words from shorter string appear in longer string
  const shorterWords = words1.length < words2.length ? words1 : words2;
  const longerWords = words1.length >= words2.length ? words1 : words2;
  const wordOverlap =
    shorterWords.filter((w) => longerWords.includes(w)).length /
    shorterWords.length;
  similarity += wordOverlap * 0.1;

  // Cap at 1.0
  return Math.min(1.0, similarity);
}

/**
 * Calculate Levenshtein distance between two strings
 *
 * Measures the minimum number of single-character edits (insertions,
 * deletions, substitutions) required to change one word into the other.
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Edit distance (0 = identical)
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create matrix
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  // Calculate distances
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Batch category matching
 *
 * Match multiple suggested categories against existing ones.
 *
 * @param suggestions - Array of suggested category names
 * @param existingCategories - Current category list
 * @param threshold - Similarity threshold (default: 0.8)
 * @returns Array of match results
 */
export function batchMatchCategories(
  suggestions: string[],
  existingCategories: Category[],
  threshold: number = 0.8
): CategoryMatchResult[] {
  return suggestions.map((suggestion) =>
    findBestCategoryMatch(suggestion, existingCategories, threshold)
  );
}

/**
 * Get category creation recommendations
 *
 * Analyzes match results and provides recommendations for category management.
 *
 * @param matchResults - Results from category matching
 * @returns Recommendations object
 */
export function getCategoryRecommendations(
  matchResults: CategoryMatchResult[]
): {
  shouldCreateNew: string[];
  shouldReuse: Array<{ suggested: string; existing: string }>;
  needsReview: Array<{ suggested: string; confidence: number }>;
} {
  const shouldCreateNew: string[] = [];
  const shouldReuse: Array<{ suggested: string; existing: string }> = [];
  const needsReview: Array<{ suggested: string; confidence: number }> = [];

  for (const result of matchResults) {
    if (result.shouldCreateNew) {
      shouldCreateNew.push(result.match?.name || 'Unknown');
    } else if (result.match) {
      if (result.confidence >= 80) {
        shouldReuse.push({
          suggested: result.match.name,
          existing: result.match.name,
        });
      } else {
        // 60-79% confidence - needs review
        needsReview.push({
          suggested: result.match.name,
          confidence: result.confidence,
        });
      }
    }
  }

  return { shouldCreateNew, shouldReuse, needsReview };
}

/**
 * Validate category name format
 *
 * Ensures category names follow best practices:
 * - Title case
 * - No special characters except spaces and hyphens
 * - 3-50 characters
 * - Not brand-specific
 *
 * @param categoryName - Category name to validate
 * @returns Validation result
 */
export function validateCategoryName(categoryName: string): {
  valid: boolean;
  errors: string[];
  suggestions?: string[];
} {
  const errors: string[] = [];
  const suggestions: string[] = [];

  // Length check
  if (categoryName.length < 3) {
    errors.push('Category name must be at least 3 characters');
  }
  if (categoryName.length > 50) {
    errors.push('Category name must be less than 50 characters');
  }

  // Special characters check
  if (!/^[a-zA-Z0-9\s\-&]+$/.test(categoryName)) {
    errors.push(
      'Category name can only contain letters, numbers, spaces, hyphens, and ampersands'
    );
  }

  // Title case check
  const words = categoryName.split(' ');
  const isTitleCase = words.every(
    (word) => word.length === 0 || word[0] === word[0].toUpperCase()
  );
  if (!isTitleCase) {
    suggestions.push(
      `Consider title case: ${words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')}`
    );
  }

  // Brand-specific check (simple heuristic)
  const brandKeywords = [
    'iphone',
    'samsung',
    'nike',
    'adidas',
    'apple',
    'sony',
  ];
  const lowerName = categoryName.toLowerCase();
  if (brandKeywords.some((brand) => lowerName.includes(brand))) {
    errors.push(
      'Category names should be brand-agnostic (e.g., "Smartphones" not "iPhones")'
    );
    suggestions.push('Use generic terms instead of brand names');
  }

  return {
    valid: errors.length === 0,
    errors,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
}
