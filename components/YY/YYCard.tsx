
/**
 * YYCard - Yombal Yoon Card Component
 * 
 * Standardized card component for modules (Covoiturage, Colis, Livraison).
 * Cards: radius 18–20, ombre douce optimisée
 * 
 * ✨ NOUVELLE VERSION AVEC ANIMATIONS ET OMBRES OPTIMISÉES
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Animated } from 'react-native';
import { YYTheme } from '@/styles/theme';
import { useTheme } from '@react-navigation/native';

type CardVariant = 'base' | 'elevated' | 'outlined';

interface YYCardProps {
  /**
   * Card content
   */
  children: React.ReactNode;
  
  /**
   * Card variant
   * - base: radius 18, ombre douce
   * - elevated: radius 20, ombre douce
   * - outlined: radius 18, bordure
   */
  variant?: CardVariant;
  
  /**
   * Make card pressable
   */
  onPress?: () => void;
  
  /**
   * Animate on mount
   */
  animated?: boolean;
  
  /**
   * Custom style
   */
  style?: ViewStyle;
  
  /**
   * Disable padding
   */
  noPadding?: boolean;
}

export const YYCard: React.FC<YYCardProps> = ({
  children,
  variant = 'base',
  onPress,
  animated = false,
  style,
  noPadding = false,
}) => {
  const theme = useTheme();
  const isDark = theme.dark;
  const scaleAnim = useRef(new Animated.Value(animated ? 0.9 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  
  // Mount animation
  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated, scaleAnim, opacityAnim]);
  
  // Press animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };
  
  // Get variant styles
  const variantStyle = YYTheme.cards[variant] || YYTheme.cards.base;
  
  // Dark mode background
  const darkModeStyle = isDark ? {
    backgroundColor: YYTheme.colors.background.darkCard,
  } : {};
  
  // Remove padding if needed
  const paddingStyle = noPadding ? { padding: 0 } : {};
  
  const cardContent = (
    <Animated.View
      style={[
        variantStyle,
        darkModeStyle,
        paddingStyle,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
  
  // If onPress is provided, wrap in TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }
  
  return cardContent;
};

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
  },
});

export default YYCard;
