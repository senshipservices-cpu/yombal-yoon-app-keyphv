
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { colors } from './commonStyles';
import {
  PlatformUtils,
  ResponsiveUtils,
  LayoutUtils,
  ShadowUtils,
  TypographyUtils,
} from '@/utils/platformUtils';

/**
 * Design System
 * Centralized design tokens and component styles for cross-platform consistency
 */

/**
 * Color Tokens
 * Extended color palette with semantic naming
 */
export const designColors = {
  // Brand colors (Senegal flag)
  brand: {
    primary: colors.primary,      // Green
    secondary: colors.secondary,  // Yellow
    accent: colors.accent,        // Red
  },

  // Semantic colors
  semantic: {
    success: colors.primary,
    warning: colors.secondary,
    error: colors.accent,
    info: '#007AFF',
  },

  // Background colors
  background: {
    light: {
      primary: colors.background,
      secondary: colors.backgroundAlt,
      tertiary: colors.highlight,
    },
    dark: {
      primary: colors.darkBackground,
      secondary: colors.darkCard,
      tertiary: '#333333',
    },
  },

  // Text colors
  text: {
    light: {
      primary: colors.text,
      secondary: colors.textSecondary,
      tertiary: '#999999',
      inverse: '#FFFFFF',
    },
    dark: {
      primary: colors.darkText,
      secondary: colors.darkTextSecondary,
      tertiary: '#999999',
      inverse: '#000000',
    },
  },

  // Border colors
  border: {
    light: colors.border,
    dark: '#444444',
  },

  // Overlay colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
  },
};

/**
 * Typography System
 * Consistent text styles across platforms
 */
export const typography = {
  // Display text (large headings)
  display: {
    large: {
      fontSize: LayoutUtils.getFontSize('xxxl'),
      fontWeight: TypographyUtils.getFontWeight('bold'),
      lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.xxxl),
      letterSpacing: -0.5,
    } as TextStyle,
    medium: {
      fontSize: LayoutUtils.getFontSize('xxl'),
      fontWeight: TypographyUtils.getFontWeight('bold'),
      lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.xxl),
      letterSpacing: -0.3,
    } as TextStyle,
    small: {
      fontSize: LayoutUtils.getFontSize('xl'),
      fontWeight: TypographyUtils.getFontWeight('bold'),
      lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.xl),
    } as TextStyle,
  },

  // Headings
  heading: {
    h1: {
      fontSize: LayoutUtils.getFontSize('xxl'),
      fontWeight: TypographyUtils.getFontWeight('bold'),
      lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.xxl),
    } as TextStyle,
    h2: {
      fontSize: LayoutUtils.getFontSize('xl'),
      fontWeight: TypographyUtils.getFontWeight('bold'),
      lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.xl),
    } as TextStyle,
    h3: {
      fontSize: LayoutUtils.getFontSize('lg'),
      fontWeight: TypographyUtils.getFontWeight('semibold'),
      lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.lg),
    } as TextStyle,
    h4: {
      fontSize: LayoutUtils.getFontSize('md'),
      fontWeight: TypographyUtils.getFontWeight('semibold'),
      lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.md),
    } as TextStyle,
  },

  // Body text
  body: {
    large: {
      fontSize: LayoutUtils.getFontSize('lg'),
      fontWeight: TypographyUtils.getFontWeight('regular'),
      lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.lg),
    } as TextStyle,
    medium: {
      fontSize: LayoutUtils.getFontSize('md'),
      fontWeight: TypographyUtils.getFontWeight('regular'),
      lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.md),
    } as TextStyle,
    small: {
      fontSize: LayoutUtils.getFontSize('sm'),
      fontWeight: TypographyUtils.getFontWeight('regular'),
      lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.sm),
    } as TextStyle,
  },

  // Labels
  label: {
    large: {
      fontSize: LayoutUtils.getFontSize('md'),
      fontWeight: TypographyUtils.getFontWeight('medium'),
      lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.md),
    } as TextStyle,
    medium: {
      fontSize: LayoutUtils.getFontSize('sm'),
      fontWeight: TypographyUtils.getFontWeight('medium'),
      lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.sm),
    } as TextStyle,
    small: {
      fontSize: LayoutUtils.getFontSize('xs'),
      fontWeight: TypographyUtils.getFontWeight('medium'),
      lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.xs),
    } as TextStyle,
  },

  // Caption text
  caption: {
    fontSize: LayoutUtils.getFontSize('xs'),
    fontWeight: TypographyUtils.getFontWeight('regular'),
    lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.xs),
  } as TextStyle,
};

/**
 * Component Styles
 * Reusable component style definitions
 */
export const componentStyles = {
  // Card styles
  card: {
    base: {
      backgroundColor: colors.card,
      borderRadius: LayoutUtils.borderRadius.lg,
      padding: LayoutUtils.getSpacing('md'),
      ...ShadowUtils.getShadow('md'),
    } as ViewStyle,
    elevated: {
      backgroundColor: colors.card,
      borderRadius: LayoutUtils.borderRadius.lg,
      padding: LayoutUtils.getSpacing('md'),
      ...ShadowUtils.getShadow('lg'),
    } as ViewStyle,
    outlined: {
      backgroundColor: colors.card,
      borderRadius: LayoutUtils.borderRadius.lg,
      padding: LayoutUtils.getSpacing('md'),
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,
  },

  // Button styles
  button: {
    base: {
      borderRadius: LayoutUtils.borderRadius.md,
      paddingVertical: LayoutUtils.getSpacing('sm'),
      paddingHorizontal: LayoutUtils.getSpacing('md'),
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44, // Minimum touch target
    } as ViewStyle,
    primary: {
      backgroundColor: colors.primary,
      ...ShadowUtils.getShadow('sm'),
    } as ViewStyle,
    secondary: {
      backgroundColor: colors.secondary,
      ...ShadowUtils.getShadow('sm'),
    } as ViewStyle,
    accent: {
      backgroundColor: colors.accent,
      ...ShadowUtils.getShadow('sm'),
    } as ViewStyle,
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary,
    } as ViewStyle,
    ghost: {
      backgroundColor: 'transparent',
    } as ViewStyle,
  },

  // Input styles
  input: {
    base: {
      borderRadius: LayoutUtils.borderRadius.md,
      paddingVertical: LayoutUtils.getSpacing('sm'),
      paddingHorizontal: LayoutUtils.getSpacing('md'),
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: LayoutUtils.getFontSize('md'),
      minHeight: 44, // Minimum touch target
    } as ViewStyle & TextStyle,
    focused: {
      borderColor: colors.primary,
      borderWidth: 2,
    } as ViewStyle,
    error: {
      borderColor: colors.accent,
      borderWidth: 2,
    } as ViewStyle,
  },

  // Container styles
  container: {
    base: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,
    centered: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,
    padded: {
      flex: 1,
      backgroundColor: colors.background,
      padding: LayoutUtils.getSpacing('md'),
    } as ViewStyle,
    responsive: {
      flex: 1,
      backgroundColor: colors.background,
      alignSelf: 'center',
      width: '100%',
      maxWidth: LayoutUtils.getContentMaxWidth(),
    } as ViewStyle,
  },

  // List item styles
  listItem: {
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: LayoutUtils.getSpacing('md'),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      minHeight: 56,
    } as ViewStyle,
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: LayoutUtils.getSpacing('md'),
      backgroundColor: colors.card,
      borderRadius: LayoutUtils.borderRadius.md,
      marginBottom: LayoutUtils.getSpacing('sm'),
      ...ShadowUtils.getShadow('sm'),
    } as ViewStyle,
  },

  // Badge styles
  badge: {
    base: {
      paddingVertical: LayoutUtils.spacing.xs,
      paddingHorizontal: LayoutUtils.spacing.sm,
      borderRadius: LayoutUtils.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,
    primary: {
      backgroundColor: colors.primary,
    } as ViewStyle,
    secondary: {
      backgroundColor: colors.secondary,
    } as ViewStyle,
    accent: {
      backgroundColor: colors.accent,
    } as ViewStyle,
  },

  // Divider styles
  divider: {
    horizontal: {
      height: 1,
      backgroundColor: colors.border,
      width: '100%',
    } as ViewStyle,
    vertical: {
      width: 1,
      backgroundColor: colors.border,
      height: '100%',
    } as ViewStyle,
  },
};

/**
 * Layout Presets
 * Common layout patterns
 */
export const layoutPresets = {
  // Flex layouts
  flex: {
    row: {
      flexDirection: 'row',
    } as ViewStyle,
    column: {
      flexDirection: 'column',
    } as ViewStyle,
    center: {
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,
    spaceBetween: {
      justifyContent: 'space-between',
    } as ViewStyle,
    spaceAround: {
      justifyContent: 'space-around',
    } as ViewStyle,
  },

  // Grid layouts (for web)
  grid: PlatformUtils.isWeb ? {
    base: {
      display: 'grid',
      gap: LayoutUtils.getSpacing('md'),
    } as any,
    twoColumn: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: LayoutUtils.getSpacing('md'),
    } as any,
    threeColumn: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: LayoutUtils.getSpacing('md'),
    } as any,
    responsive: {
      display: 'grid',
      gridTemplateColumns: ResponsiveUtils.getResponsiveValue({
        mobile: '1fr',
        tablet: 'repeat(2, 1fr)',
        desktop: 'repeat(3, 1fr)',
      }),
      gap: LayoutUtils.getSpacing('md'),
    } as any,
  } : {},

  // Spacing utilities
  spacing: {
    xs: { gap: LayoutUtils.getSpacing('xs') } as ViewStyle,
    sm: { gap: LayoutUtils.getSpacing('sm') } as ViewStyle,
    md: { gap: LayoutUtils.getSpacing('md') } as ViewStyle,
    lg: { gap: LayoutUtils.getSpacing('lg') } as ViewStyle,
    xl: { gap: LayoutUtils.getSpacing('xl') } as ViewStyle,
  },
};

/**
 * Responsive Breakpoint Styles
 * Helper to create responsive styles
 */
export const createResponsiveStyle = <T extends ViewStyle | TextStyle>(
  mobileStyle: T,
  tabletStyle?: Partial<T>,
  desktopStyle?: Partial<T>
): T => {
  const deviceType = ResponsiveUtils.getDeviceType();
  
  let style = { ...mobileStyle };
  
  if (deviceType === 'tablet' && tabletStyle) {
    style = { ...style, ...tabletStyle };
  }
  
  if (deviceType === 'desktop' && desktopStyle) {
    style = { ...style, ...desktopStyle };
  }
  
  return style;
};

/**
 * Theme-aware style creator
 */
export const createThemedStyle = (
  lightStyle: ViewStyle | TextStyle,
  darkStyle: ViewStyle | TextStyle,
  isDark: boolean
) => {
  return isDark ? darkStyle : lightStyle;
};
