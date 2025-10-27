# Bug Fixes Documentation

This directory contains detailed documentation of bugs found and fixed in the LOTOSALE platform.

## Purpose

- **Track bug history**: Complete record of issues, investigation, and resolution
- **Knowledge sharing**: Help team members understand past problems and solutions
- **Prevention**: Learn from mistakes to avoid similar bugs in the future
- **Onboarding**: New developers can review common pitfalls and solutions

## Document Structure

Each bug fix document should include:

1. **Summary**: Brief overview of the issue
2. **Bug Report**: Initial report with reproduction steps
3. **Investigation**: Code analysis and root cause identification
4. **The Fix**: Code changes with before/after comparison
5. **Testing**: How the fix was verified
6. **Impact**: What changed as a result of the fix
7. **Prevention**: How to avoid similar bugs
8. **Lessons Learned**: Key takeaways

## Bug Fixes Log

### 2025-01-27: Image Upload & AI Category Suggestions
**File**: `2025-01-27-image-upload-category-ai-fixes.md`

**Issues Fixed**:
1. ~~Browse Files button not working~~ (FALSE REPORT - verified working)
2. AI Category Suggestion failing with "Error analyzing image" for valid JPEG files ✅

**Root Cause**: Image URL format detection bug in `lib/ai/category-suggester.ts`
- Code assumed all non-data-URL images were base64 strings
- Cloudinary URLs (https://...) were being wrapped with `data:image/jpeg;base64,` prefix
- OpenAI Vision API rejected malformed URLs

**Fix**: Added proper URL type detection for three formats:
- Data URLs → use as-is
- HTTP/HTTPS URLs → use as-is (NEW)
- Base64 strings → wrap with data URL prefix

**Impact**: AI category suggestions now work correctly for all uploaded images

**Files Modified**:
- `lib/ai/category-suggester.ts` (lines 42-65)

**Verification**:
- Tested with real iPhone 15 Pro Max JPEG (3024x4032px)
- Result: 90% confidence, correct category ("Kitchen & Dining")
- Screenshot: `.playwright-mcp/fix-verified-real-image-90-confidence.png`

---

### 2025-01-27: Image Cropping in Upload Preview
**File**: `2025-01-27-image-cropping-upload-preview.md`

**Issue**: Portrait images (3:4 aspect ratio) were being cropped during upload preview, cutting off ~25% from top and bottom

**Root Cause**: CSS layout issue in `components/listings/image-upload.tsx`
- `aspect-square` forced 1:1 aspect ratio container
- `object-cover` cropped images to fill the square
- Portrait photos (3024x4032px) lost 33% of vertical content

**Fix**: Changed preview to use natural portrait ratio:
- `aspect-square` → `aspect-[3/4]` (match common smartphone photos)
- `object-cover` → `object-contain` (show full image, no cropping)
- Added `bg-muted` for letterboxing

**Design Decision**:
- **Upload Preview**: Show FULL image (`object-contain`) - users see what they're uploading
- **Browse Cards**: Keep uniform squares (`object-cover`) - consistent grid layout
- **Listing Detail**: Native ratios (full product view)

**Impact**: Users now see 100% of uploaded images during preview (was 67% before)

**Files Modified**:
- `components/listings/image-upload.tsx` (lines 249, 258)

**Verification**:
- Tested with iPhone 15 Pro Max photo (3024x4032px)
- Before: Top of bottle and hands cropped out
- After: Full image visible with letterboxing
- Screenshot: `.playwright-mcp/fix-verified-no-cropping-full-image.png`

---

## Guidelines for Adding New Bug Fix Documentation

### File Naming Convention
```
YYYY-MM-DD-brief-description.md
```

Example: `2025-01-27-image-upload-category-ai-fixes.md`

### Template

```markdown
# Bug Fix: [Brief Title]

**Date**: [Date]
**Reporter**: [Name/Source]
**Fixed By**: [Name]
**Status**: ✅ RESOLVED / 🔄 IN PROGRESS / ❌ BLOCKED

---

## Summary
[1-2 sentence overview]

---

## Bug Report
[Initial report with reproduction steps]

---

## Investigation
[Code analysis and root cause]

---

## The Fix
[Code changes with before/after]

---

## Testing & Verification
[How the fix was verified]

---

## Impact
[What changed as a result]

---

## Prevention
[How to avoid similar bugs]

---

## Lessons Learned
[Key takeaways]

---

## Status
[Current status and next steps]
```

---

## Related Documentation

- **Feature Docs**: `/docs/features/` - New feature documentation
- **API Docs**: `/docs/api/` - API endpoint documentation
- **User Guides**: `/docs/user-guides/` - End-user documentation
- **Admin Guides**: `/docs/admin-guides/` - Admin documentation
- **CLAUDE.md**: Root-level technical documentation for Claude Code

---

## Contact

For questions about bug fixes or to report new issues:
- Create a GitHub issue
- Add detailed reproduction steps
- Include error messages and screenshots
- Tag with `bug` label
