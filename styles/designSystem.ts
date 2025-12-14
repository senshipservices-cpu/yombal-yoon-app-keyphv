
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
 * Design System - Yombal Yoon
 * PARTIE 1 — STRUCTURE GLOBALE & PRINCIPES UI (COMMUNS)
 * 
 * Vision UI globale:
 * - Moderne, dynamique, professionnelle
 * - Ancrée au Sénégal 🇸🇳 sans être "chargée drapeau"
 * - Le VERT porte la marque
 * - Le JAUNE déclenche l'action
 * - Le ROUGE signale (alertes, badges)
 * 
 * ✨ NOUVELLE VERSION AVEC DÉGRADÉS ET ANIMATIONS
 */

/**
 * Color Tokens - Design System Officiel avec Dégradés
 */
export const designColors = {
  // Brand colors (Senegal flag) - NOUVELLE PALETTE ENRICHIE
  brand: {
    green: '#0B7A3B',        // Vert marque - LE VERT PORTE LA MARQUE
    greenDark: '#064A26',    // Vert foncé
    greenLight: '#10A854',   // Vert clair pour dégradés
    yellow: '#F7C948',       // Jaune CTA - LE JAUNE DÉCLENCHE L'ACTION
    yellowLight: '#FFD966',  // Jaune clair pour dégradés
    red: '#E53935',          // Rouge alerte - LE ROUGE SIGNALE
    redDark: '#C62828',      // Rouge foncé pour dégradés
  },

  // Gradient definitions
  gradients: {
    primary: ['#0B7A3B', '#10A854'],        // Vert gradient
    secondary: ['#F7C948', '#FFD966'],      // Jaune gradient
    accent: ['#E53935', '#C62828'],         // Rouge gradient
    senegal: ['#0B7A3B', '#F7C948', '#E53935'], // Drapeau complet
    subtle: ['#F7F8FA', '#FFFFFF'],         // Fond subtil
    dark: ['#1A1A1A', '#2A2A2A'],          // Dark mode
  },

  // Semantic colors
  semantic: {
    success: '#0B7A3B',      // Vert marque
    warning: '#F7C948',      // Jaune
    error: '#E53935',        // Rouge
    info: '#007AFF',
  },

  // Background colors
  background: {
    light: {
      primary: '#F7F8FA',    // Fond principal
      secondary: '#FFFFFF',  // Cards
      tertiary: '#F0F0F0',
    },
    dark: {
      primary: '#1A1A1A',
      secondary: '#2A2A2A',
      tertiary: '#333333',
    },
  },

  // Text colors
  text: {
    light: {
      primary: '#101828',    // Texte principal
      secondary: '#666666',
      tertiary: '#999999',
      inverse: '#FFFFFF',
    },
    dark: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
      tertiary: '#999999',
      inverse: '#000000',
    },
  },

  // Border colors
  border: {
    light: '#E0E0E0',
    dark: '#444444',
  },

  // Overlay colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
  },
};

/**
 * Enhanced Shadow System - Ombres optimisées et élévations
 */
export const enhancedShadows = {
  // Subtle shadows for cards
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  
  // Medium elevation for floating elements
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  
  // Strong elevation for modals and overlays
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // Colored shadows for brand elements
  brandGreen: {
    shadowColor: '#0B7A3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  brandYellow: {
    shadowColor: '#F7C948',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  brandRed: {
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
 * Component Styles - Design System Officiel avec Dégradés
 * Cards: radius 18–20, ombre douce optimisée
 * Boutons: Primaire JAUNE plein, Secondaire contour VERT, Destructif texte ROUGE
 */
export const componentStyles = {
  // Card styles - radius 18-20, ombre douce optimisée
  card: {
    base: {
      backgroundColor: designColors.background.light.secondary,
      borderRadius: 18,
      padding: LayoutUtils.getSpacing('md'),
      ...enhancedShadows.card,
    } as ViewStyle,
    elevated: {
      backgroundColor: designColors.background.light.secondary,
      borderRadius: 20,
      padding: LayoutUtils.getSpacing('md'),
      ...enhancedShadows.floating,
    } as ViewStyle,
    outlined: {
      backgroundColor: designColors.background.light.secondary,
      borderRadius: 18,
      padding: LayoutUtils.getSpacing('md'),
      borderWidth: 1,
      borderColor: designColors.border.light,
    } as ViewStyle,
    // Nouvelle variante avec ombre colorée
    brandGreen: {
      backgroundColor: designColors.background.light.secondary,
      borderRadius: 20,
      padding: LayoutUtils.getSpacing('md'),
      ...enhancedShadows.brandGreen,
    } as ViewStyle,
  },

  // Button styles - Primaire JAUNE, Secondaire contour VERT, Destructif ROUGE
  button: {
    base: {
      borderRadius: LayoutUtils.borderRadius.md,
      paddingVertical: LayoutUtils.getSpacing('sm'),
      paddingHorizontal: LayoutUtils.getSpacing('md'),
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    } as ViewStyle,
    primary: {
      backgroundColor: designColors.brand.yellow, // JAUNE plein
      ...enhancedShadows.brandYellow,
    } as ViewStyle,
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: designColors.brand.green, // Contour VERT
    } as ViewStyle,
    accent: {
      backgroundColor: designColors.brand.green, // VERT
      ...enhancedShadows.brandGreen,
    } as ViewStyle,
    destructive: {
      backgroundColor: 'transparent',
      // Texte ROUGE (géré dans le composant)
    } as ViewStyle,
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: designColors.brand.green,
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
      borderColor: designColors.border.light,
      fontSize: LayoutUtils.getFontSize('md'),
      minHeight: 44,
    } as ViewStyle & TextStyle,
    focused: {
      borderColor: designColors.brand.green,
      borderWidth: 2,
      ...enhancedShadows.brandGreen,
    } as ViewStyle,
    error: {
      borderColor: designColors.brand.red,
      borderWidth: 2,
    } as ViewStyle,
  },

  // Container styles
  container: {
    base: {
      flex: 1,
      backgroundColor: designColors.background.light.primary,
    } as ViewStyle,
    centered: {
      flex: 1,
      backgroundColor: designColors.background.light.primary,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,
    padded: {
      flex: 1,
      backgroundColor: designColors.background.light.primary,
      padding: LayoutUtils.getSpacing('md'),
    } as ViewStyle,
    responsive: {
      flex: 1,
      backgroundColor: designColors.background.light.primary,
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
      borderBottomColor: designColors.border.light,
      minHeight: 56,
    } as ViewStyle,
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: LayoutUtils.getSpacing('md'),
      backgroundColor: designColors.background.light.secondary,
      borderRadius: 18,
      marginBottom: LayoutUtils.getSpacing('sm'),
      ...enhancedShadows.card,
    } as ViewStyle,
  },

  // Badge styles - Améliorés avec couleurs dynamiques
  badge: {
    base: {
      paddingVertical: LayoutUtils.spacing.xs,
      paddingHorizontal: LayoutUtils.spacing.sm,
      borderRadius: LayoutUtils.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,
    primary: {
      backgroundColor: designColors.brand.green,
      ...enhancedShadows.brandGreen,
    } as ViewStyle,
    secondary: {
      backgroundColor: designColors.brand.yellow,
      ...enhancedShadows.brandYellow,
    } as ViewStyle,
    accent: {
      backgroundColor: designColors.brand.red,
      ...enhancedShadows.brandRed,
    } as ViewStyle,
    // Nouvelles variantes avec bordures
    outlinePrimary: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: designColors.brand.green,
    } as ViewStyle,
    outlineSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: designColors.brand.yellow,
    } as ViewStyle,
    outlineAccent: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: designColors.brand.red,
    } as ViewStyle,
  },

  // Divider styles
  divider: {
    horizontal: {
      height: 1,
      backgroundColor: designColors.border.light,
      width: '100%',
    } as ViewStyle,
    vertical: {
      width: 1,
      backgroundColor: designColors.border.light,
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
