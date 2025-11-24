
/**
 * YYButton - Yombal Yoon Button Component
 * 
 * Standardized button component for consistent appearance across all platforms.
 * Uses theme tokens exclusively - no hardcoded colors.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { YYTheme } from '@/styles/theme';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface YYButtonProps {
  /**
   * Button text
   */
  children: React.ReactNode;
  
  /**
   * Button variant
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
    if (variant === 'outline' || variant === 'ghost') {
      return YYTheme.colors.primary;
    }
    if (variant === 'secondary') {
      return YYTheme.colors.text.primary;
    }
    return YYTheme.colors.text.inverse;
  };
  
  return (
    <TouchableOpacity
      style={[
        YYTheme.buttons.base,
        variantStyle,
        sizeStyle,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
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
