
import { Platform, Dimensions, PixelRatio } from 'react-native';

/**
 * Platform Detection Utilities
 * Provides consistent platform detection across the app
 */
export const PlatformUtils = {
  isWeb: Platform.OS === 'web',
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isNative: Platform.OS === 'ios' || Platform.OS === 'android',
  
  /**
   * Get platform-specific value
   */
  select: <T,>(options: {
    web?: T;
    ios?: T;
    android?: T;
    native?: T;
    default: T;
  }): T => {
    if (Platform.OS === 'web' && options.web !== undefined) return options.web;
    if (Platform.OS === 'ios' && options.ios !== undefined) return options.ios;
    if (Platform.OS === 'android' && options.android !== undefined) return options.android;
    if ((Platform.OS === 'ios' || Platform.OS === 'android') && options.native !== undefined) {
      return options.native;
    }
    return options.default;
  },
};

/**
 * Responsive Design Utilities
 * Handles different screen sizes and device types
 */
export const ResponsiveUtils = {
  /**
   * Get current screen dimensions
   */
  getScreenDimensions: () => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  },

  /**
   * Check if device is a tablet
   */
  isTablet: () => {
    const { width, height } = Dimensions.get('window');
    const aspectRatio = height / width;
    return Math.min(width, height) >= 600 && aspectRatio < 1.6;
  },

  /**
   * Check if device is desktop (web only)
   */
  isDesktop: () => {
    if (Platform.OS !== 'web') return false;
    const { width } = Dimensions.get('window');
    return width >= 1024;
  },

  /**
   * Get device type
   */
  getDeviceType: (): 'mobile' | 'tablet' | 'desktop' => {
    if (ResponsiveUtils.isDesktop()) return 'desktop';
    if (ResponsiveUtils.isTablet()) return 'tablet';
    return 'mobile';
  },

  /**
   * Breakpoints for responsive design
   */
  breakpoints: {
    mobile: 0,
    tablet: 600,
    desktop: 1024,
    wide: 1440,
  },

  /**
   * Check if screen width matches breakpoint
   */
  matchesBreakpoint: (breakpoint: 'mobile' | 'tablet' | 'desktop' | 'wide'): boolean => {
    const { width } = Dimensions.get('window');
    const breakpointValue = ResponsiveUtils.breakpoints[breakpoint];
    
    switch (breakpoint) {
      case 'mobile':
        return width < ResponsiveUtils.breakpoints.tablet;
      case 'tablet':
        return width >= ResponsiveUtils.breakpoints.tablet && width < ResponsiveUtils.breakpoints.desktop;
      case 'desktop':
        return width >= ResponsiveUtils.breakpoints.desktop && width < ResponsiveUtils.breakpoints.wide;
      case 'wide':
        return width >= ResponsiveUtils.breakpoints.wide;
      default:
        return false;
    }
  },

  /**
   * Get responsive value based on screen size
   */
  getResponsiveValue: <T,>(values: {
    mobile: T;
    tablet?: T;
    desktop?: T;
    wide?: T;
  }): T => {
    const deviceType = ResponsiveUtils.getDeviceType();
    
    if (deviceType === 'desktop' && values.desktop !== undefined) {
      return values.desktop;
    }
    if (deviceType === 'tablet' && values.tablet !== undefined) {
      return values.tablet;
    }
    if (ResponsiveUtils.matchesBreakpoint('wide') && values.wide !== undefined) {
      return values.wide;
    }
    
    return values.mobile;
  },

  /**
   * Scale size based on screen density (for consistent sizing across devices)
   */
  normalize: (size: number): number => {
    const { width } = Dimensions.get('window');
    const scale = width / 375; // Base width (iPhone X)
    const newSize = size * scale;
    
    if (Platform.OS === 'ios') {
      return Math.round(PixelRatio.roundToNearestPixel(newSize));
    }
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  },
};

/**
 * Layout Utilities
 * Provides consistent spacing and sizing
 */
export const LayoutUtils = {
  /**
   * Standard spacing scale (in pixels)
   */
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  /**
   * Get responsive spacing
   */
  getSpacing: (size: keyof typeof LayoutUtils.spacing): number => {
    const baseSpacing = LayoutUtils.spacing[size];
    const deviceType = ResponsiveUtils.getDeviceType();
    
    // Increase spacing on larger devices
    if (deviceType === 'desktop') return baseSpacing * 1.5;
    if (deviceType === 'tablet') return baseSpacing * 1.25;
    return baseSpacing;
  },

  /**
   * Standard border radius scale
   */
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  /**
   * Standard font sizes
   */
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  /**
   * Get responsive font size
   */
  getFontSize: (size: keyof typeof LayoutUtils.fontSize): number => {
    const baseFontSize = LayoutUtils.fontSize[size];
    const deviceType = ResponsiveUtils.getDeviceType();
    
    // Slightly increase font size on larger devices
    if (deviceType === 'desktop') return baseFontSize * 1.1;
    if (deviceType === 'tablet') return baseFontSize * 1.05;
    return baseFontSize;
  },

  /**
   * Get safe area padding for different platforms
   */
  getSafeAreaPadding: () => {
    return PlatformUtils.select({
      ios: { top: 0, bottom: 0 }, // SafeAreaView handles this
      android: { top: 48, bottom: 0 }, // Account for status bar
      web: { top: 0, bottom: 0 },
      default: { top: 0, bottom: 0 },
    });
  },

  /**
   * Get content max width for responsive layouts
   */
  getContentMaxWidth: (): number => {
    return ResponsiveUtils.getResponsiveValue({
      mobile: Dimensions.get('window').width,
      tablet: 768,
      desktop: 1024,
      wide: 1280,
    });
  },
};

/**
 * Shadow Utilities
 * Provides consistent shadows across platforms
 */
export const ShadowUtils = {
  /**
   * Get platform-specific shadow styles
   */
  getShadow: (elevation: 'sm' | 'md' | 'lg' | 'xl') => {
    const shadows = {
      sm: {
        web: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
        },
        native: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
          elevation: 2,
        },
      },
      md: {
        web: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
        native: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        },
      },
      lg: {
        web: {
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
        },
        native: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 5,
        },
      },
      xl: {
        web: {
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.16)',
        },
        native: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.16,
          shadowRadius: 24,
          elevation: 8,
        },
      },
    };

    const shadow = shadows[elevation];
    return PlatformUtils.isWeb ? shadow.web : shadow.native;
  },
};

/**
 * Typography Utilities
 * Ensures consistent text rendering across platforms
 */
export const TypographyUtils = {
  /**
   * Get platform-specific font family
   */
  getFontFamily: (weight: 'regular' | 'medium' | 'semibold' | 'bold') => {
    return PlatformUtils.select({
      ios: {
        regular: 'System',
        medium: 'System',
        semibold: 'System',
        bold: 'System',
      }[weight],
      android: {
        regular: 'Roboto',
        medium: 'Roboto-Medium',
        semibold: 'Roboto-Medium',
        bold: 'Roboto-Bold',
      }[weight],
      web: {
        regular: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        medium: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        semibold: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        bold: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }[weight],
      default: 'System',
    });
  },

  /**
   * Get platform-specific font weight
   */
  getFontWeight: (weight: 'regular' | 'medium' | 'semibold' | 'bold') => {
    const weights = {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    };
    return weights[weight] as '400' | '500' | '600' | '700';
  },

  /**
   * Get line height based on font size
   */
  getLineHeight: (fontSize: number): number => {
    return Math.round(fontSize * 1.5);
  },
};

/**
 * Animation Utilities
 * Provides consistent animation timings
 */
export const AnimationUtils = {
  /**
   * Standard animation durations (in ms)
   */
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },

  /**
   * Standard easing curves
   */
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

/**
 * Accessibility Utilities
 * Ensures consistent accessibility across platforms
 */
export const AccessibilityUtils = {
  /**
   * Get minimum touch target size
   */
  getMinTouchTarget: (): number => {
    return PlatformUtils.select({
      ios: 44,
      android: 48,
      web: 44,
      default: 44,
    });
  },

  /**
   * Check if reduced motion is preferred (web only)
   */
  prefersReducedMotion: (): boolean => {
    if (Platform.OS !== 'web') return false;
    
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    return false;
  },
};
