
import * as Font from 'expo-font';

/**
 * Preload fonts with timeout and error handling
 * This ensures fonts load properly across all platforms
 */
export async function loadFonts(): Promise<boolean> {
  try {
    console.log('🔤 Starting font loading...');
    
    // Set a timeout for font loading
    const fontLoadPromise = Font.loadAsync({
      SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
      'SpaceMono-Bold': require('../assets/fonts/SpaceMono-Bold.ttf'),
      'SpaceMono-Italic': require('../assets/fonts/SpaceMono-Italic.ttf'),
      'SpaceMono-BoldItalic': require('../assets/fonts/SpaceMono-BoldItalic.ttf'),
    });

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Font loading timeout')), 10000); // 10 second timeout
    });

    // Race between font loading and timeout
    await Promise.race([fontLoadPromise, timeoutPromise]);
    
    console.log('✅ Fonts loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Font loading error:', error);
    console.warn('⚠️ Continuing with system fonts as fallback');
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
