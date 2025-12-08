
# Font Loading Timeout Fix

## Problem
The app was experiencing a `6000ms timeout exceeded` error from `fontfaceobserver` in the `node_modules` directory. This was preventing the app from loading properly.

## Root Cause
The issue was caused by:
1. **Redundant font loading logic** - Both `fontLoader.ts` utility and `useFonts()` hook were present, but only `useFonts()` was being used
2. **Loading too many font variants** - Attempting to load 4 font files (Regular, Bold, Italic, BoldItalic) which increased load time
3. **Insufficient error handling** - Font loading errors weren't being handled gracefully

## Solution Applied

### 1. Simplified Font Loading in `app/_layout.tsx`
- **Reduced font variants**: Now only loading `SpaceMono-Regular.ttf` instead of all 4 variants
- **Better error handling**: Added `appReady` state to coordinate font loading completion
- **Graceful fallback**: If fonts fail to load, the app continues with system fonts
- **Improved logging**: Added console logs to track font loading status

### 2. Key Changes
```typescript
// Before: Loading multiple font variants
const [loaded, error] = useFonts({
  SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  'SpaceMono-Bold': require('../assets/fonts/SpaceMono-Bold.ttf'),
  'SpaceMono-Italic': require('../assets/fonts/SpaceMono-Italic.ttf'),
  'SpaceMono-BoldItalic': require('../assets/fonts/SpaceMono-BoldItalic.ttf'),
});

// After: Loading only one font variant
const [fontsLoaded, fontError] = useFonts({
  SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
});
```

### 3. Error Handling Flow
```typescript
useEffect(() => {
  if (fontError) {
    console.error('❌ Font loading error:', fontError);
    console.warn('⚠️ Continuing with system fonts as fallback');
    setAppReady(true); // Continue anyway
  } else if (fontsLoaded) {
    console.log('✅ Fonts loaded successfully');
    setAppReady(true);
  }
}, [fontsLoaded, fontError]);
```

## System Font Fallbacks
The app already has system font fallbacks configured in `styles/commonStyles.ts`:

```typescript
export const fontFamily = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: 'System',
  }),
};
```

This means even if custom fonts fail to load, the app will use native system fonts which look great on all platforms.

## Benefits
1. **Faster load time** - Loading only 1 font file instead of 4
2. **Better reliability** - Graceful fallback to system fonts if loading fails
3. **Improved UX** - App continues to work even if fonts fail to load
4. **Better debugging** - Clear console logs showing font loading status

## Testing
To verify the fix:
1. Restart the Expo dev server
2. Clear the app cache
3. Reload the app
4. Check console logs for:
   - `✅ Fonts loaded successfully` (if fonts load)
   - `⚠️ Continuing with system fonts as fallback` (if fonts fail)
5. The app should load without timeout errors

## Future Improvements
If you need the other font variants (Bold, Italic, BoldItalic):
1. Add them back one at a time
2. Test each addition to ensure no timeout issues
3. Consider using `expo-google-fonts` package for more reliable font loading
4. Implement progressive font loading (load Regular first, then others in background)

## Related Files
- `app/_layout.tsx` - Main font loading logic
- `styles/commonStyles.ts` - Font family fallbacks
- `utils/fontLoader.ts` - Unused utility (can be removed)
