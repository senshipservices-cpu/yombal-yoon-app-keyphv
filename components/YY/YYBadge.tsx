
/**
 * YYBadge - Yombal Yoon Badge Component
 * 
 * Standardized badge component for status indicators, labels, etc.
 * Le ROUGE signale (alertes, badges)
 * 
 * ✨ NOUVELLE VERSION AVEC ANIMATIONS ET COULEURS DYNAMIQUES
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Animated } from 'react-native';
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
   * Show outline style
   */
  outline?: boolean;
  
  /**
   * Animate on mount
   */
  animated?: boolean;
  
  /**
   * Pulse animation (for alerts)
   */
  pulse?: boolean;
  
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
  outline = false,
  animated = false,
  pulse = false,
  style,
  textStyle,
}) => {
  const scaleAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Mount animation
  useEffect(() => {
    if (animated) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [animated, scaleAnim]);
  
  // Pulse animation
  useEffect(() => {
    if (pulse) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [pulse, pulseAnim]);
  
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
    if (outline) {
      return getVariantColor();
    }
    if (variant === 'secondary' || variant === 'warning') {
      // JAUNE -> texte foncé
      return YYTheme.colors.text.primary;
    }
    return YYTheme.colors.text.inverse;
  };
  
  const backgroundColor = outline ? 'transparent' : getVariantColor();
  const borderColor = getVariantColor();
  
  return (
    <Animated.View
      style={[
        YYTheme.badges.base,
        sizeStyle,
        { 
          backgroundColor,
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) }
          ],
        },
        outline && {
          borderWidth: 2,
          borderColor,
        },
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({});

export default YYBadge;
