
/**
 * YYChip - Yombal Yoon Chip Component
 * 
 * Standardized chip component for filters, tags, selections.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
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
  onPress,
  onClose,
  style,
  textStyle,
}) => {
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
  
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor,
          borderColor,
        },
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
          { color: textColor },
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
