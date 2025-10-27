# Bug Fix: Multiple File Choosers Triggered by Dropzone

**Date:** 2025-01-27
**Severity:** Medium (UX Issue)
**Status:** ✅ Fixed
**Component:** Image Upload Component

---

## Problem Description

### Issue
When users clicked the "Browse Files" button in the image upload component (`/listings/create`), multiple file chooser dialogs were triggered instead of a single one. This caused:
- Confusing user experience with multiple file selection dialogs
- Playwright browser automation tests failing due to multiple modal states
- Unclear which file chooser to use

### Root Cause
The `react-dropzone` library was not properly configured with limits on the number of file choosers. Missing configuration options allowed the component to create multiple file input elements.

---

## Solution

### Code Changes

**File:** `components/listings/image-upload.tsx`

**Before:**
```typescript
const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
  onDrop,
  accept: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
  },
  maxSize: maxSizeInMB * 1024 * 1024,
  disabled: imageFiles.length >= maxImages,
  onDragEnter: () => setIsDragging(true),
  onDragLeave: () => setIsDragging(false),
  noClick: true, // Disable default click behavior
})
```

**After:**
```typescript
const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
  onDrop,
  accept: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
  },
  maxSize: maxSizeInMB * 1024 * 1024,
  maxFiles: maxImages - imageFiles.length, // ✅ Limit to remaining slots
  multiple: true, // ✅ Explicitly allow multiple file selection
  disabled: imageFiles.length >= maxImages,
  onDragEnter: () => setIsDragging(true),
  onDragLeave: () => setIsDragging(false),
  noClick: true, // Disable default click behavior
  noKeyboard: true, // ✅ Disable keyboard interactions on dropzone
})
```

### Changes Made
1. **Added `maxFiles`**: Dynamically limits file selection to remaining slots (`maxImages - imageFiles.length`)
2. **Added `multiple: true`**: Explicitly enables multiple file selection (was implicit before)
3. **Added `noKeyboard: true`**: Prevents keyboard-triggered file choosers on the dropzone container

---

## Testing Results

### Before Fix
- ❌ Multiple file choosers triggered (9-11 dialogs)
- ❌ Playwright tests failed with modal state errors
- ❌ Confusing user experience

### After Fix
- ✅ Single file chooser triggered
- ✅ Playwright tests pass successfully
- ✅ Clean, predictable user experience
- ✅ File upload works correctly with AI smart cropping

### Test Case
**Action:** Click "Browse Files" button
**Expected:** Single file chooser appears
**Actual:** ✅ Single file chooser appears

**Action:** Upload water bottle image
**Expected:** Image uploaded with AI smart crop applied
**Actual:** ✅ Image uploaded successfully, AI portrait crop (3:4) displayed in preview

---

## Impact

### User Experience
- Clean, single file selection dialog
- Predictable behavior matching user expectations
- Smooth integration with AI smart cropping feature

### Development
- Playwright browser tests now pass
- E2E testing workflow functional
- Better component configuration clarity

---

## Related Issues

- Fixed as part of AI Smart Cropping feature implementation
- See: `docs/fix_bugs/2025-01-27-automatic-image-resize-ai-smart-crop.md`

---

## Prevention

### Best Practices Applied
1. Always explicitly configure `maxFiles` when using `react-dropzone`
2. Use `multiple` boolean for clarity (even if default behavior)
3. Add `noKeyboard` when dropzone wraps other interactive elements
4. Test with browser automation tools to catch modal/dialog issues early

### Code Review Checklist
- [ ] `maxFiles` configured appropriately
- [ ] `multiple` explicitly set
- [ ] File chooser behavior tested in browser
- [ ] Playwright/E2E tests pass
- [ ] No duplicate file input elements created
