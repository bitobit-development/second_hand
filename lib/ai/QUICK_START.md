# Quick Start: AI Description Generation

## 🚀 5-Minute Setup

### 1. Environment Setup

Add to your `.env` file:

```bash
OPENAI_API_KEY=sk-proj-your-key-here
```

### 2. Basic Usage

```typescript
import { generateProductDescription } from '@/lib/ai';

const result = await generateProductDescription({
  imageUrl: 'https://cloudinary.com/.../product.jpg',
  category: 'ELECTRONICS',
  condition: 'GOOD',
  template: 'detailed' // or 'concise' or 'seo'
});

console.log(result.description);
// → "This MacBook Pro laptop in excellent condition features..."

console.log(result.attributes);
// → { color: 'silver', material: 'aluminum', brand: 'Apple' }
```

### 3. With Error Handling

```typescript
import {
  generateProductDescription,
  isAIError,
  getUserFriendlyMessage
} from '@/lib/ai';

try {
  const result = await generateProductDescription({...});
  // Use result.description
} catch (error) {
  if (isAIError(error)) {
    // Show user-friendly message
    alert(getUserFriendlyMessage(error));
  }
}
```

## 📋 Valid Parameters

### Categories
`ELECTRONICS` | `CLOTHING` | `HOME_GARDEN` | `SPORTS` | `BOOKS` | `TOYS` | `VEHICLES` | `COLLECTIBLES` | `BABY_KIDS` | `PET_SUPPLIES`

### Conditions
`NEW` | `LIKE_NEW` | `GOOD` | `FAIR` | `POOR`

### Templates
`detailed` (100-200 words) | `concise` (50-75 words) | `seo` (120-180 words)

## 🧪 Test It

```bash
# Quick test (no API key needed)
npx tsx scripts/verify-description-module.ts

# Full test (requires API key)
export OPENAI_API_KEY="sk-..."
npx tsx scripts/test-generate-description.ts
```

## 📚 More Info

- **Full Docs**: `/lib/ai/DESCRIPTION_GENERATION.md`
- **Examples**: `/lib/ai/examples/description-generation-examples.ts`
- **Summary**: `/lib/ai/TASK_BACK-001_SUMMARY.md`

## ⚡ Common Patterns

### Server Action
```typescript
'use server';

export async function generateDescription(imageUrl: string) {
  try {
    const result = await generateProductDescription({
      imageUrl,
      category: 'ELECTRONICS',
      condition: 'GOOD',
    });
    return { success: true, description: result.description };
  } catch (error) {
    if (isAIError(error)) {
      return { success: false, error: getUserFriendlyMessage(error) };
    }
    return { success: false, error: 'Unknown error' };
  }
}
```

### React Component
```typescript
'use client';

const [description, setDescription] = useState('');
const [loading, setLoading] = useState(false);

const handleGenerate = async () => {
  setLoading(true);
  try {
    const result = await generateProductDescription({...});
    setDescription(result.description);
  } catch (error) {
    if (isAIError(error)) {
      alert(getUserFriendlyMessage(error));
    }
  } finally {
    setLoading(false);
  }
};
```

## 💰 Costs

~$0.01-0.03 per description (GPT-4o pricing)

## ⏱️ Response Time

Typically 2-5 seconds per description

## 🆘 Troubleshooting

**"OPENAI_API_KEY not set"**
→ Add to `.env` file

**Rate limit error**
→ Wait and retry (implement exponential backoff)

**Invalid image URL**
→ Ensure HTTPS URL, valid format, accessible

**Description too short**
→ Check image quality, try different template

---

**Ready to use!** Import from `@/lib/ai` and start generating descriptions.
