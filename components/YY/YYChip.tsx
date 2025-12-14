
/**
 * YYChip - Yombal Yoon Chip Component
 * 
 * Standardized chip component for filters, tags, selections.
 * 
 * ✨ NOUVELLE VERSION AVEC ANIMATIONS ET COULEURS DYNAMIQUES
 */

import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { YYTheme } from '@/styles/theme';
import { IconSymbol } from '@/components/IconSymbol';

interface YYChipProps {
  /**
   * Chip text
   */
  children: React.ReactNode;
  
  /**
   * Selected state
   */
  selected?: boolean;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Show close icon
   */
  closable?: boolean;
  
  /**
   * Animate on selection
   */
  animated?: boolean;
  
  /**
   * On press handler
   */
  onPress?: () => void;
  
  /**
   * On close handler
   */
  onClose?: () => void;
  
  /**
   * Custom style
   */
  style?: ViewStyle;
  
  /**
   * Custom text style
   */
  textStyle?: TextStyle;
}

export const YYChip: React.FC<YYChipProps> = ({
  children,
  selected = false,
  disabled = false,
  closable = false,
  animated = true,
  onPress,
  onClose,
  style,
  textStyle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Selection animation
  useEffect(() => {
    if (animated && selected) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selected, animated, scaleAnim]);
  
  // Background color based on state
  const backgroundColor = selected
    ? YYTheme.colors.primary // VERT
    : YYTheme.colors.background.white;
  
  // Text color based on state
  const textColor = selected
    ? YYTheme.colors.text.inverse
    : YYTheme.colors.text.primary;
  
  // Border color
  const borderColor = selected
    ? YYTheme.colors.primary
    : YYTheme.colors.border;
  
  // Shadow for selected state
  const shadowStyle = selected ? YYTheme.shadows.sm : {};
  
  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.chip,
          {
            backgroundColor,
            borderColor,
          },
          shadowStyle,
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            YYTheme.typography.labelSmall,
            { color: textColor, fontWeight: selected ? '700' : '500' },
            textStyle,
          ]}
        >
          {children}
        </Text>
        
        {closable && (
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconSymbol
              ios_icon_name="xmark"
              android_material_icon_name="close"
              size={16}
              color={textColor}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: YYTheme.spacing.xs,
    paddingHorizontal: YYTheme.spacing.sm,
    borderRadius: YYTheme.borderRadius.full,
    borderWidth: 1,
    gap: YYTheme.spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
  closeButton: {
    marginLeft: YYTheme.spacing.xs,
  },
});

export default YYChip;
