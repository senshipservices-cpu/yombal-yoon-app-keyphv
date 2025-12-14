
/**
 * YYGradient - Yombal Yoon Gradient Component
 * 
 * Wrapper for LinearGradient with predefined Senegal flag colors
 * 
 * ✨ DÉGRADÉS PRÉDÉFINIS POUR YOMBAL YOON
 */

import React from 'react';
import { ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { designColors } from '@/styles/designSystem';

type GradientPreset = 'primary' | 'secondary' | 'accent' | 'senegal' | 'subtle' | 'dark';

interface YYGradientProps {
  /**
   * Gradient preset
   * - primary: Vert gradient
   * - secondary: Jaune gradient
   * - accent: Rouge gradient
   * - senegal: Drapeau complet (Vert -> Jaune -> Rouge)
   * - subtle: Fond subtil
   * - dark: Dark mode
   */
  preset?: GradientPreset;
  
  /**
   * Custom colors (overrides preset)
   */
  colors?: string[];
  
  /**
   * Gradient start point
   */
  start?: { x: number; y: number };
  
  /**
   * Gradient end point
   */
  end?: { x: number; y: number };
  
  /**
   * Children
   */
  children?: React.ReactNode;
  
  /**
   * Custom style
   */
  style?: ViewStyle;
}

export const YYGradient: React.FC<YYGradientProps> = ({
  preset = 'primary',
  colors: customColors,
  start = { x: 0, y: 0 },
  end = { x: 0, y: 1 },
  children,
  style,
}) => {
  // Get gradient colors based on preset
  const getGradientColors = (): string[] => {
    if (customColors) {
      return customColors;
    }
    
    switch (preset) {
      case 'primary':
        return designColors.gradients.primary;
      case 'secondary':
        return designColors.gradients.secondary;
      case 'accent':
        return designColors.gradients.accent;
      case 'senegal':
        return designColors.gradients.senegal;
      case 'subtle':
        return designColors.gradients.subtle;
      case 'dark':
        return designColors.gradients.dark;
      default:
        return designColors.gradients.primary;
    }
  };
  
  return (
    <LinearGradient
      colors={getGradientColors()}
      start={start}
      end={end}
      style={style}
    >
      {children}
    </LinearGradient>
  );
};

export default YYGradient;
