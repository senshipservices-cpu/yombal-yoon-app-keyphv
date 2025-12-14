
/**
 * Yombal Yoon Design System - Theme Configuration
 * PARTIE 1 — STRUCTURE GLOBALE & PRINCIPES UI (COMMUNS)
 * 
 * Vision UI globale:
 * - Moderne, dynamique, professionnelle
 * - Ancrée au Sénégal 🇸🇳 sans être "chargée drapeau"
 * 
 * 👉 Le VERT porte la marque
 * 👉 Le JAUNE déclenche l'action
 * 👉 Le ROUGE signale (alertes, badges)
 * 
 * ⚠️ IMPORTANT: Never use hardcoded colors in components!
 * Always import and use tokens from this file.
 */

import { TextStyle, ViewStyle } from 'react-native';
import { LayoutUtils, TypographyUtils, ShadowUtils } from '@/utils/platformUtils';

/**
 * ============================================
 * COLOR PALETTE - Yombal Yoon (NOUVELLE PALETTE OFFICIELLE)
 * ============================================
 */
export const YYColors = {
  // Brand Colors - NOUVELLE PALETTE
  brand: {
    green: '#0B7A3B',        // Vert marque - LE VERT PORTE LA MARQUE
    greenDark: '#064A26',    // Vert foncé
    yellow: '#F7C948',       // Jaune CTA - LE JAUNE DÉCLENCHE L'ACTION
    red: '#E53935',          // Rouge alerte - LE ROUGE SIGNALE
  },

  // Semantic Colors
  primary: '#0B7A3B',        // Vert marque
  secondary: '#F7C948',      // Jaune CTA
  accent: '#E53935',         // Rouge alerte
  
  // Background Colors
  background: {
    light: '#F7F8FA',        // Fond principal
    white: '#FFFFFF',        // Cards
    dark: '#1A1A1A',         // Dark mode background
    darkCard: '#2A2A2A',     // Dark mode card
  },

  // Text Colors
  text: {
    primary: '#101828',         // Texte principal
    secondary: '#666666',       // Medium gray (secondary text)
    tertiary: '#999999',        // Light gray (tertiary text)
    inverse: '#FFFFFF',         // White text (on dark backgrounds)
    dark: '#FFFFFF',            // Dark mode text
    darkSecondary: '#CCCCCC',   // Dark mode secondary text
  },

  // UI Colors
  card: '#FFFFFF',
  border: '#E0E0E0',
  highlight: '#E0E0E0',
  
  // Status Colors
  success: '#0B7A3B',      // Vert (succès = toast vert)
  warning: '#F7C948',      // Jaune
  error: '#E53935',        // Rouge (erreur = toast rouge)
  info: '#007AFF',         // Blue
  
  // Overlay
  overlay: {
    light: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
  },
};

/**
 * ============================================
 * TYPOGRAPHY SYSTEM
 * ============================================
 */
export const YYTypography = {
  // Display (Large headings)
  displayLarge: {
    fontSize: LayoutUtils.getFontSize('xxxl'),
    fontWeight: TypographyUtils.getFontWeight('bold'),
    lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.xxxl),
    letterSpacing: -0.5,
    color: YYColors.text.primary,
  } as TextStyle,

  displayMedium: {
    fontSize: LayoutUtils.getFontSize('xxl'),
    fontWeight: TypographyUtils.getFontWeight('bold'),
    lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.xxl),
    letterSpacing: -0.3,
    color: YYColors.text.primary,
  } as TextStyle,

  // Headings
  h1: {
    fontSize: LayoutUtils.getFontSize('xxl'),
    fontWeight: TypographyUtils.getFontWeight('bold'),
    lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.xxl),
    color: YYColors.text.primary,
  } as TextStyle,

  h2: {
    fontSize: LayoutUtils.getFontSize('xl'),
    fontWeight: TypographyUtils.getFontWeight('bold'),
    lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.xl),
    color: YYColors.text.primary,
  } as TextStyle,

  h3: {
    fontSize: LayoutUtils.getFontSize('lg'),
    fontWeight: TypographyUtils.getFontWeight('semibold'),
    lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.lg),
    color: YYColors.text.primary,
  } as TextStyle,

  h4: {
    fontSize: LayoutUtils.getFontSize('md'),
    fontWeight: TypographyUtils.getFontWeight('semibold'),
    lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.md),
    color: YYColors.text.primary,
  } as TextStyle,

  // Body Text
  bodyLarge: {
    fontSize: LayoutUtils.getFontSize('lg'),
    fontWeight: TypographyUtils.getFontWeight('regular'),
    lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.lg),
    color: YYColors.text.primary,
  } as TextStyle,

  bodyMedium: {
    fontSize: LayoutUtils.getFontSize('md'),
    fontWeight: TypographyUtils.getFontWeight('regular'),
    lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.md),
    color: YYColors.text.primary,
  } as TextStyle,

  bodySmall: {
    fontSize: LayoutUtils.getFontSize('sm'),
    fontWeight: TypographyUtils.getFontWeight('regular'),
    lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.sm),
    color: YYColors.text.primary,
  } as TextStyle,

  // Labels
  labelLarge: {
    fontSize: LayoutUtils.getFontSize('md'),
    fontWeight: TypographyUtils.getFontWeight('medium'),
    lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.md),
    color: YYColors.text.primary,
  } as TextStyle,

  labelMedium: {
    fontSize: LayoutUtils.getFontSize('sm'),
    fontWeight: TypographyUtils.getFontWeight('medium'),
    lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.sm),
    color: YYColors.text.primary,
  } as TextStyle,

  labelSmall: {
    fontSize: LayoutUtils.getFontSize('xs'),
    fontWeight: TypographyUtils.getFontWeight('medium'),
    lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.xs),
    color: YYColors.text.primary,
  } as TextStyle,

  // Caption
  caption: {
    fontSize: LayoutUtils.getFontSize('xs'),
    fontWeight: TypographyUtils.getFontWeight('regular'),
    lineHeight: TypographyUtils.getLineHeight(LayoutUtils.fontSize.xs),
    color: YYColors.text.secondary,
  } as TextStyle,
};

/**
 * ============================================
 * SPACING SYSTEM
 * ============================================
 */
export const YYSpacing = {
  xs: LayoutUtils.getSpacing('xs'),    // 4px
  sm: LayoutUtils.getSpacing('sm'),    // 8px
  md: LayoutUtils.getSpacing('md'),    // 16px
  lg: LayoutUtils.getSpacing('lg'),    // 24px
  xl: LayoutUtils.getSpacing('xl'),    // 32px
  xxl: LayoutUtils.getSpacing('xxl'),  // 48px
};

/**
 * ============================================
 * BORDER RADIUS SYSTEM
 * Cards: radius 18–20
 * ============================================
 */
export const YYBorderRadius = {
  sm: 8,
  md: 12,
  lg: 18,    // Cards
  xl: 20,    // Cards elevated
  full: 9999, // Circle
};

/**
 * ============================================
 * SHADOW SYSTEM - Ombre douce
 * ============================================
 */
export const YYShadows = {
  sm: ShadowUtils.getShadow('sm'),
  md: ShadowUtils.getShadow('md'),
  lg: ShadowUtils.getShadow('lg'),
  xl: ShadowUtils.getShadow('xl'),
};

/**
 * ============================================
 * ICON SIZES
 * ============================================
 */
export const YYIconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,
};

/**
 * ============================================
 * COMPONENT STYLES
 * Boutons: Primaire JAUNE plein, Secondaire contour VERT, Destructif texte ROUGE
 * Cards: radius 18–20, ombre douce
 * ============================================
 */

// Button Styles
export const YYButtonStyles = {
  base: {
    borderRadius: YYBorderRadius.md,
    paddingVertical: YYSpacing.sm,
    paddingHorizontal: YYSpacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  } as ViewStyle,

  primary: {
    backgroundColor: YYColors.secondary, // JAUNE plein
    ...YYShadows.sm,
  } as ViewStyle,

  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: YYColors.primary, // Contour VERT
  } as ViewStyle,

  accent: {
    backgroundColor: YYColors.primary, // VERT
    ...YYShadows.sm,
  } as ViewStyle,

  destructive: {
    backgroundColor: 'transparent',
    // Texte ROUGE (géré dans le composant)
  } as ViewStyle,

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: YYColors.primary,
  } as ViewStyle,

  ghost: {
    backgroundColor: 'transparent',
  } as ViewStyle,
};

// Card Styles - radius 18-20, ombre douce
export const YYCardStyles = {
  base: {
    backgroundColor: YYColors.card,
    borderRadius: YYBorderRadius.lg, // 18
    padding: YYSpacing.md,
    ...YYShadows.sm, // Ombre douce
  } as ViewStyle,

  elevated: {
    backgroundColor: YYColors.card,
    borderRadius: YYBorderRadius.xl, // 20
    padding: YYSpacing.md,
    ...YYShadows.md, // Ombre douce
  } as ViewStyle,

  outlined: {
    backgroundColor: YYColors.card,
    borderRadius: YYBorderRadius.lg, // 18
    padding: YYSpacing.md,
    borderWidth: 1,
    borderColor: YYColors.border,
  } as ViewStyle,
};

// Input Styles
export const YYInputStyles = {
  base: {
    borderRadius: YYBorderRadius.md,
    paddingVertical: YYSpacing.sm,
    paddingHorizontal: YYSpacing.md,
    borderWidth: 1,
    borderColor: YYColors.border,
    fontSize: LayoutUtils.getFontSize('md'),
    minHeight: 44,
    backgroundColor: YYColors.card,
  } as ViewStyle & TextStyle,

  focused: {
    borderColor: YYColors.primary, // VERT
    borderWidth: 2,
  } as ViewStyle,

  error: {
    borderColor: YYColors.error, // ROUGE
    borderWidth: 2,
  } as ViewStyle,
};

// Badge Styles
export const YYBadgeStyles = {
  base: {
    paddingVertical: YYSpacing.xs,
    paddingHorizontal: YYSpacing.sm,
    borderRadius: YYBorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  primary: {
    backgroundColor: YYColors.primary, // VERT
  } as ViewStyle,

  secondary: {
    backgroundColor: YYColors.secondary, // JAUNE
  } as ViewStyle,

  accent: {
    backgroundColor: YYColors.accent, // ROUGE
  } as ViewStyle,
};

/**
 * Export default theme object
 */
export const YYTheme = {
  colors: YYColors,
  typography: YYTypography,
  spacing: YYSpacing,
  borderRadius: YYBorderRadius,
  shadows: YYShadows,
  iconSizes: YYIconSizes,
  buttons: YYButtonStyles,
  cards: YYCardStyles,
  inputs: YYInputStyles,
  badges: YYBadgeStyles,
};

export default YYTheme;
