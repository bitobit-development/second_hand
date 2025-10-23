# AI Prompt Engineering Guide

## Product Description Generation for South African Second-Hand Marketplace

### Table of Contents
1. [Overview](#overview)
2. [Template Architecture](#template-architecture)
3. [Prompt Design Rationale](#prompt-design-rationale)
4. [Template Specifications](#template-specifications)
5. [Sample Outputs](#sample-outputs)
6. [Edge Case Handling](#edge-case-handling)
7. [Optimization Strategies](#optimization-strategies)
8. [Best Practices for Sellers](#best-practices-for-sellers)

## Overview

This guide documents the AI prompt templates designed for generating product descriptions from images using OpenAI's GPT-4o Vision model. The templates are specifically optimized for a South African second-hand marketplace context.

### Key Design Principles

1. **Factual Accuracy**: Only describe what's observable in the image
2. **Market Localization**: Use South African terminology, spelling, and currency
3. **Trust Building**: Honest, transparent descriptions that build buyer confidence
4. **Search Optimization**: Natural keyword inclusion for discoverability
5. **Safety First**: Built-in content filters to prevent inappropriate listings

## Template Architecture

### Three-Template Strategy

We provide three distinct templates to serve different seller needs:

1. **Detailed Template** (Default)
   - Target: Professional sellers, high-value items
   - Length: 100-200 words
   - Focus: Comprehensive coverage of all observable attributes

2. **Concise Template**
   - Target: Casual sellers, quick listings
   - Length: 50-75 words
   - Focus: Essential information only

3. **SEO-Focused Template**
   - Target: Sellers wanting maximum visibility
   - Length: 120-180 words
   - Focus: Search-optimized with natural keyword density

### Why Three Templates?

- **User Choice**: Different sellers have different needs and time constraints
- **Item Appropriateness**: A R50 book doesn't need the same detail as a R5,000 laptop
- **Platform Flexibility**: Allows A/B testing of description effectiveness
- **Search Strategy**: SEO template helps with long-tail keyword targeting

## Prompt Design Rationale

### System Prompt Structure

Each template uses a two-part prompt structure:

1. **System Prompt**: Sets the AI's role, tone, and constraints
2. **User Prompt**: Provides specific instructions for the current item

This separation ensures consistent quality while allowing flexibility for different products.

### Key Design Decisions

#### 1. Observation-Only Approach
```
"Only describe what you can clearly observe in the image"
```
**Rationale**: Prevents hallucination and ensures accuracy. The AI won't claim features that aren't visible.

#### 2. Structured Output Format
Each template guides the AI through a specific structure:
- Opening hook
- Physical description
- Condition details
- Special features
- Use cases

**Rationale**: Ensures comprehensive coverage and readable flow.

#### 3. Category-Specific Focus
```typescript
ELECTRONICS: 'brand, model, ports, screen size...'
CLOTHING: 'brand, size, color, material, style...'
```
**Rationale**: Different product categories have different important attributes. This ensures relevant details aren't missed.

#### 4. Temperature Settings
- Detailed: 0.7 (balanced creativity)
- Concise: 0.6 (more focused)
- SEO: 0.65 (controlled variation)

**Rationale**: Lower temperatures for concise descriptions ensure consistency. Slightly higher for detailed allows more natural variation.

#### 5. South African Localization
- Spelling: "colour" not "color"
- Currency: "R" for Rand
- Terminology: Local market terms

**Rationale**: Builds trust with local buyers and improves cultural relevance.

## Template Specifications

### Detailed Template

**Purpose**: Comprehensive descriptions for serious sellers

**Prompt Philosophy**:
- Build trust through transparency
- Provide complete information for informed decisions
- Balance positive presentation with honest condition reporting

**Key Features**:
- 5-part structure for comprehensive coverage
- Emphasis on condition specifics
- Buyer benefit focus at the end
- Temperature: 0.7 for natural variation

### Concise Template

**Purpose**: Quick, efficient listings

**Prompt Philosophy**:
- Respect buyer's time with essential info only
- Direct, factual language
- No fluff or marketing speak

**Key Features**:
- 4-point coverage structure
- Short sentence requirement
- Lower temperature (0.6) for consistency
- Hard 75-word limit

### SEO-Focused Template

**Purpose**: Maximum search visibility

**Prompt Philosophy**:
- Natural keyword integration
- Long-tail search term inclusion
- Semantic variation of key terms
- Local SEO considerations

**Key Features**:
- Keyword variation instructions
- Category-specific search terms
- Compatibility mentions for cross-selling
- Balanced temperature (0.65)

## Sample Outputs

### Example 1: Electronics (Laptop)

**Input**:
- Category: ELECTRONICS
- Condition: GOOD
- Title: "Dell Laptop for Sale"
- Style: Detailed

**Generated Output**:
> This Dell Latitude business laptop features a sleek silver aluminum chassis with the iconic Dell logo prominently displayed on the lid. The 14-inch display shows no visible cracks or dead pixels, surrounded by a sturdy black bezel. The keyboard appears to be in good condition with clearly visible letters on all keys, though the spacebar shows slight wear from regular use. The trackpad has a smooth surface with no visible scratches.
>
> The laptop's condition reflects gentle professional use, with minor scuff marks on the corners and a few light scratches on the lid that don't affect functionality. All visible ports along the sides appear intact, including multiple USB ports, an HDMI output, and what appears to be a card reader slot. The screen hinges look solid with no signs of looseness or damage.
>
> This machine would be ideal for students, remote workers, or anyone needing a reliable secondary computer for everyday tasks. Its business-grade build quality ensures durability for continued use.

*(Word count: 155)*

### Example 2: Clothing (Dress)

**Input**:
- Category: CLOTHING
- Condition: LIKE_NEW
- Style: Concise

**Generated Output**:
> Elegant navy blue midi dress in excellent condition, featuring a flattering A-line silhouette and three-quarter sleeves. The smooth polyester blend fabric shows no signs of wear, pulls, or fading. White floral print adds feminine charm throughout. Side zipper closure intact and functioning perfectly. Size tag indicates Medium. Perfect for office wear or special occasions.

*(Word count: 55)*

### Example 3: Home & Garden (Coffee Table)

**Input**:
- Category: HOME_GARDEN
- Condition: FAIR
- Style: SEO

**Generated Output**:
> This wooden coffee table showcases a rustic farmhouse style perfect for South African homes seeking that contemporary country aesthetic. The rectangular table top, approximately 120cm x 60cm, features a natural wood grain finish in warm honey tones. The solid wood construction includes four sturdy legs with a lower shelf for additional storage space, ideal for magazines, remotes, or decorative items.
>
> The table shows honest wear consistent with regular family use, including visible water rings on the surface, minor scratches, and slight fading in high-traffic areas. These character marks add to the rustic charm without compromising structural integrity. The joints remain tight and stable, with no wobbling observed.
>
> This versatile living room furniture piece complements various décor styles from modern minimalist to traditional South African homes. Perfect for lounge areas, TV rooms, or covered patios. The generous surface accommodates coffee service, books, and décor while the lower shelf maximizes storage in compact spaces.

*(Word count: 147)*

### Example 4: Multiple Categories Quick Reference

| Category | Key Output Characteristics |
|----------|---------------------------|
| BOOKS | Title visibility, page condition, edition details, spine integrity |
| TOYS | Completeness, safety features, age appropriateness, interactive elements |
| VEHICLES | Make/model identification, body condition, modification notes, mileage indicators |
| SPORTS | Equipment type, size specifications, wear patterns, brand recognition |
| BABY_KIDS | Safety compliance hints, cleanliness, age range markers, brand trust |

## Edge Case Handling

### 1. Poor Image Quality

**Scenario**: Blurry, dark, or low-resolution images

**Handling Strategy**:
- Prompt includes fallback to describe only clearly visible elements
- Avoid speculation about unclear details
- System returns error if image is completely unusable

**Example Response**:
> "The image quality limits detailed observation, but this appears to be a dark-colored electronic device with a rectangular shape..."

### 2. Multiple Items in Single Photo

**Scenario**: Seller photographs multiple items together

**Handling Strategy**:
- Prompt instructs to focus on the main/central item
- If unclear, describe as a "set" or "bundle"
- Include note about what's included based on visibility

**Example Response**:
> "This listing includes multiple items photographed together. The primary item appears to be... Also visible in the image are..."

### 3. Inappropriate Content Detection

**Scenario**: Image contains prohibited items or content

**Handling Strategy**:
- GPT-4o's built-in safety filters prevent description generation
- Return standardized error message
- Log for manual review

**Response**:
> ERROR_MESSAGES.INAPPROPRIATE_CONTENT

### 4. Brand Counterfeits

**Scenario**: Suspected counterfeit luxury goods

**Handling Strategy**:
- Describe physical attributes without confirming authenticity
- Use phrases like "branded as" or "shows logo of"
- Avoid definitive brand claims

**Example Language**:
> "Features a logo resembling [brand]" rather than "Authentic [brand] product"

### 5. Missing Context Information

**Scenario**: No clear size reference or scale

**Handling Strategy**:
- Use relative descriptions
- Mention lack of scale reference
- Suggest approximate sizes with disclaimers

**Example**:
> "Appears to be medium-sized based on proportions, though exact dimensions cannot be determined from the image"

### 6. Unusual or Unidentifiable Items

**Scenario**: Vintage, specialized, or obscure items

**Handling Strategy**:
- Focus on observable physical characteristics
- Describe function if apparent from form
- Avoid guessing specific use or origin

### 7. Text-Heavy Images

**Scenario**: Books, documents, or items with lots of visible text

**Handling Strategy**:
- Summarize key visible text
- Don't transcribe everything
- Focus on condition and physical attributes

## Optimization Strategies

### Token Efficiency

1. **Preprocessing**:
   - Reduce image size to optimal dimensions (1024x1024 recommended)
   - Compress without losing important details
   - Cost: ~0.00425 USD per image with GPT-4o

2. **Prompt Optimization**:
   - Reuse system prompts across sessions
   - Minimize redundant instructions
   - Use structured outputs to reduce post-processing

### Quality Improvements

1. **Iterative Refinement**:
   - Monitor generated descriptions for patterns
   - Adjust temperature based on consistency needs
   - Fine-tune category-specific instructions

2. **A/B Testing Recommendations**:
   - Test temperature variations (0.5-0.8)
   - Compare word count targets
   - Measure buyer engagement by description style

3. **Feedback Loop**:
   - Track which descriptions lead to sales
   - Identify successful patterns
   - Update templates based on performance

### Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Generation Time | <3 seconds | API response time |
| Success Rate | >95% | Valid descriptions / Total attempts |
| Character Compliance | 100% | Descriptions under 2000 chars |
| Word Count Accuracy | ±10% | Within target range |
| Rejection Rate | <5% | Inappropriate content blocks |

## Best Practices for Sellers

### Getting the Best AI Descriptions

#### Photography Tips

1. **Lighting**:
   - Natural daylight preferred
   - Avoid harsh shadows
   - Even illumination across product

2. **Background**:
   - Plain, contrasting background
   - Avoid clutter or distracting elements
   - White or neutral colors work best

3. **Angles**:
   - Straight-on primary shot
   - Include any important details/defects
   - Show size reference if possible

4. **Focus**:
   - Ensure sharp focus on product
   - Avoid motion blur
   - Check image before uploading

#### Product Preparation

1. **Cleanliness**:
   - Clean items before photographing
   - Remove dust, fingerprints, stickers
   - Iron clothing if applicable

2. **Arrangement**:
   - Display items attractively
   - Show all included parts
   - Highlight unique features

3. **Documentation**:
   - Include visible model numbers
   - Show brand labels clearly
   - Display any certificates/tags

### When to Use Each Template

#### Detailed Template (Recommended Default)
Best for:
- Items over R500
- Electronics, vehicles, collectibles
- Items with many features
- When condition details matter
- Building buyer trust

#### Concise Template
Best for:
- Items under R200
- Simple products (books, basic clothing)
- Bulk listings
- Time-sensitive sales
- Mobile-first buyers

#### SEO Template
Best for:
- Competitive categories
- Unique or rare items
- Technical products
- When targeting specific searches
- Brand-name items

### Common Pitfalls to Avoid

1. **Don't**:
   - Include price in photos
   - Show personal information
   - Use stock photos
   - Photograph multiple unrelated items
   - Include competitor products

2. **Do**:
   - Update descriptions if AI misses something
   - Review generated content before posting
   - Add manual details the AI couldn't see
   - Use the title field to guide the AI
   - Select accurate condition rating

## Implementation Checklist

- [x] Three distinct templates created (Detailed, Concise, SEO)
- [x] South African localization included
- [x] Character limits enforced (max 2000)
- [x] Safety guidelines integrated
- [x] Category-specific focus implemented
- [x] Condition descriptors defined
- [x] Temperature settings optimized
- [x] Validation functions included
- [x] Error messages defined
- [x] Edge cases documented
- [x] Sample outputs provided
- [x] Seller tips included

## Future Enhancements

1. **Multi-language Support**: Add Afrikaans and Zulu descriptions
2. **Dynamic Templates**: Adjust based on category value
3. **Learning System**: Incorporate seller feedback
4. **Batch Processing**: Handle multiple images efficiently
5. **Smart Categorization**: Auto-detect category from image
6. **Price Suggestion**: Estimate value based on condition
7. **Competitive Analysis**: Compare with similar listings

## Conclusion

These AI prompt templates provide a robust foundation for generating high-quality product descriptions in the South African second-hand marketplace. The three-template approach ensures flexibility while maintaining consistency and quality. By following the guidelines and best practices outlined in this document, sellers can maximize the effectiveness of AI-generated descriptions and improve their listing success rates.

The system is designed to be both powerful and safe, with built-in guardrails to prevent misuse while providing sellers with professional-quality descriptions that build buyer trust and improve searchability.