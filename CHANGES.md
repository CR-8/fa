# Image Generation API Changes

## Summary
Refactored the image generation utility to be a common API supporting both wardrobe try-on and product image generation.

## Key Changes

### 1. **Updated Model** ✅
- Changed from `gemini-1.5-pro` to `gemini-2.0-flash-preview-image-generation`
- This model is specifically designed for image generation tasks
- **API Limits**: 10 RPM, 200K TPM, 100 RPD (within free tier limits)

### 2. **Fixed Response Modalities** ✅
- Model requires both `["image", "text"]` response modalities
- Updated configuration to properly request image output
- Fixed the error: "The requested combination of response modalities (TEXT) is not supported"

### 3. **Unified API Interface** ✅
- Created common `generateImage()` function supporting two types:
  - `try-on`: Virtual try-on with user and product images
  - `generate`: Text-to-image generation
- Maintained backward compatibility with `generateTryOnImage()` wrapper

### 4. **Updated API Routes** ✅
- `/api/try-on`: Now supports both `productId` (shop) and `clothingImage` (wardrobe)
- Unified request format: `{ personImage, clothingImage?, category?, productId? }`
- Single endpoint for both product try-on and wardrobe try-on

### 5. **Enhanced Error Handling** ✅
- Better fallback descriptions with styling advice
- Quota management and error categorization
- Graceful degradation when API limits are reached

## API Usage Tracking

Current limits (Free Tier):
```
Model: gemini-2.0-flash-preview-image-generation
- RPM: 0 / 10 (Requests Per Minute)
- TPM: 0 / 200K (Tokens Per Minute)
- RPD: 0 / 100 (Requests Per Day)
```

## Testing
1. Test wardrobe try-on: Upload wardrobe items and generate outfit try-ons
2. Test product try-on: View products in shop and try them on
3. Verify API stays within rate limits (10 RPM, 100 RPD)

## Files Modified
- `lib/image-generation.ts` - Refactored with unified API
- `app/api/try-on/route.ts` - Updated to support both use cases
- `app/shop/[id]/page.tsx` - Updated request format

## Next Steps
- Monitor API usage to ensure staying within free tier limits
- Consider adding rate limiting on client side
- Implement caching for generated images to reduce API calls
