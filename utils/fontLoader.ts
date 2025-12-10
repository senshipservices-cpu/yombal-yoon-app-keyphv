
import * as Font from 'expo-font';

/**
 * Preload fonts with aggressive timeout and error handling
 * This ensures the app never gets stuck on font loading
 */
export async function loadFonts(): Promise<boolean> {
  try {
    console.log('🔤 Starting font loading...');
    
    // Create font loading promise - only load SpaceMono Regular to minimize load time
    const fontLoadPromise = Font.loadAsync({
      SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    // Create a timeout promise - 3 seconds should be more than enough
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Font loading timeout after 3000ms'));
      }, 3000);
    });

    // Race between font loading and timeout
    await Promise.race([fontLoadPromise, timeoutPromise]);
    
    console.log('✅ Fonts loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Font loading error:', error);
    console.warn('⚠️ Continuing with system fonts as fallback');
    
    // Even if fonts fail, we return false but don't throw
    // This allows the app to continue with system fonts
    return false;
  }
}

/**
 * Check if fonts are loaded
 */
export function areFontsLoaded(): boolean {
  try {
    return Font.isLoaded('SpaceMono');
  } catch (error) {
    console.log('Error checking font status:', error);
    return false;
  }
}

/**
 * Get safe font family name
 * Returns SpaceMono if loaded, otherwise returns system font
 */
export function getSafeFontFamily(): string {
  try {
    if (Font.isLoaded('SpaceMono')) {
      return 'SpaceMono';
    }
  } catch (error) {
    console.log('Error checking font:', error);
  }
  
  // Fallback to system font
  return 'System';
}
