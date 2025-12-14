
/**
 * YYButton - Yombal Yoon Button Component
 * 
 * Standardized button component for consistent appearance across all platforms.
 * 
 * Boutons:
 * - Primaire: JAUNE plein
 * - Secondaire: contour VERT
 * - Destructif: texte ROUGE
 * 
 * ✨ NOUVELLE VERSION AVEC ANIMATIONS ET OMBRES COLORÉES
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { YYTheme } from '@/styles/theme';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'destructive' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface YYButtonProps {
  /**
   * Button text
   */
  children: React.ReactNode;
  
  /**
   * Button variant
   * - primary: JAUNE plein
   * - secondary: contour VERT
   * - accent: VERT plein
   * - destructive: texte ROUGE
   */
  variant?: ButtonVariant;
  
  /**
   * Button size
   */
  size?: ButtonSize;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Full width button
   */
  fullWidth?: boolean;
  
  /**
   * On press handler
   */
  onPress?: () => void;
  
  /**
   * Custom style
   */
  style?: ViewStyle;
  
  /**
   * Custom text style
   */
  textStyle?: TextStyle;
}

export const YYButton: React.FC<YYButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  onPress,
  style,
  textStyle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Press animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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
  const variantStyle = YYTheme.buttons[variant] || YYTheme.buttons.primary;
  
  // Get size styles
  const sizeStyles = {
    small: {
      paddingVertical: YYTheme.spacing.xs,
      paddingHorizontal: YYTheme.spacing.sm,
      minHeight: 36,
    },
    medium: {
      paddingVertical: YYTheme.spacing.sm,
      paddingHorizontal: YYTheme.spacing.md,
      minHeight: 44,
    },
    large: {
      paddingVertical: YYTheme.spacing.md,
      paddingHorizontal: YYTheme.spacing.lg,
      minHeight: 52,
    },
  };
  
  const sizeStyle = sizeStyles[size];
  
  // Get text size
  const textSizes = {
    small: YYTheme.typography.labelSmall,
    medium: YYTheme.typography.labelMedium,
    large: YYTheme.typography.labelLarge,
  };
  
  const textSize = textSizes[size];
  
  // Get text color based on variant
  const getTextColor = () => {
    if (variant === 'primary') {
      // JAUNE plein -> texte foncé
      return YYTheme.colors.text.primary;
    }
    if (variant === 'secondary' || variant === 'outline') {
      // Contour VERT -> texte VERT
      return YYTheme.colors.primary;
    }
    if (variant === 'destructive') {
      // Texte ROUGE
      return YYTheme.colors.accent;
    }
    if (variant === 'accent') {
      // VERT plein -> texte blanc
      return YYTheme.colors.text.inverse;
    }
    if (variant === 'ghost') {
      return YYTheme.colors.primary;
    }
    return YYTheme.colors.text.inverse;
  };
  
  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        fullWidth && styles.fullWidth,
      ]}
    >
      <TouchableOpacity
        style={[
          YYTheme.buttons.base,
          variantStyle,
          sizeStyle,
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <Text
            style={[
              textSize,
              { color: getTextColor(), fontWeight: '700' },
              textStyle,
            ]}
          >
            {children}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default YYButton;
