
/**
 * YYCard - Yombal Yoon Card Component
 * 
 * Standardized card component for modules (Covoiturage, Colis, Livraison).
 * Cards: radius 18–20, ombre douce
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
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
  style,
  noPadding = false,
}) => {
  const theme = useTheme();
  const isDark = theme.dark;
  
  // Get variant styles
  const variantStyle = YYTheme.cards[variant] || YYTheme.cards.base;
  
  // Dark mode background
  const darkModeStyle = isDark ? {
    backgroundColor: YYTheme.colors.background.darkCard,
  } : {};
  
  // Remove padding if needed
  const paddingStyle = noPadding ? { padding: 0 } : {};
  
  const cardContent = (
    <View
      style={[
        variantStyle,
        darkModeStyle,
        paddingStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
  
  // If onPress is provided, wrap in TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
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
