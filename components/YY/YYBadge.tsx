
/**
 * YYBadge - Yombal Yoon Badge Component
 * 
 * Standardized badge component for status indicators, labels, etc.
 * Le ROUGE signale (alertes, badges)
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { YYTheme } from '@/styles/theme';

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'small' | 'medium' | 'large';

interface YYBadgeProps {
  /**
   * Badge text
   */
  children: React.ReactNode;
  
  /**
   * Badge variant
   * - primary: VERT
   * - secondary: JAUNE
   * - accent: ROUGE (alertes)
   */
  variant?: BadgeVariant;
  
  /**
   * Badge size
   */
  size?: BadgeSize;
  
  /**
   * Custom style
   */
  style?: ViewStyle;
  
  /**
   * Custom text style
   */
  textStyle?: TextStyle;
}

export const YYBadge: React.FC<YYBadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
  // Get variant color
  const getVariantColor = () => {
    switch (variant) {
      case 'primary':
        return YYTheme.colors.primary; // VERT
      case 'secondary':
        return YYTheme.colors.secondary; // JAUNE
      case 'accent':
        return YYTheme.colors.accent; // ROUGE (alertes)
      case 'success':
        return YYTheme.colors.success; // VERT
      case 'warning':
        return YYTheme.colors.warning; // JAUNE
      case 'error':
        return YYTheme.colors.error; // ROUGE
      case 'info':
        return YYTheme.colors.info;
      default:
        return YYTheme.colors.primary;
    }
  };
  
  // Get size styles
  const sizeStyles = {
    small: {
      paddingVertical: 2,
      paddingHorizontal: YYTheme.spacing.xs,
    },
    medium: {
      paddingVertical: YYTheme.spacing.xs,
      paddingHorizontal: YYTheme.spacing.sm,
    },
    large: {
      paddingVertical: YYTheme.spacing.sm,
      paddingHorizontal: YYTheme.spacing.md,
    },
  };
  
  const sizeStyle = sizeStyles[size];
  
  // Get text size
  const textSizes = {
    small: YYTheme.typography.caption,
    medium: YYTheme.typography.labelSmall,
    large: YYTheme.typography.labelMedium,
  };
  
  const textSize = textSizes[size];
  
  // Get text color (white for dark backgrounds, dark for light backgrounds)
  const getTextColor = () => {
    if (variant === 'secondary' || variant === 'warning') {
      // JAUNE -> texte foncé
      return YYTheme.colors.text.primary;
    }
    return YYTheme.colors.text.inverse;
  };
  
  const backgroundColor = getVariantColor();
  
  return (
    <View
      style={[
        YYTheme.badges.base,
        sizeStyle,
        { backgroundColor },
        style,
      ]}
    >
      <Text
        style={[
          textSize,
          { color: getTextColor(), fontWeight: '700' },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({});

export default YYBadge;
