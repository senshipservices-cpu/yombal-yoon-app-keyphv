
/**
 * YYFormField - Yombal Yoon Form Field Component
 * 
 * Standardized form input field with label, error handling, and consistent styling.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { YYTheme } from '@/styles/theme';

interface YYFormFieldProps extends TextInputProps {
  /**
   * Field label
   */
  label?: string;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Helper text
   */
  helperText?: string;
  
  /**
   * Required field indicator
   */
  required?: boolean;
  
  /**
   * Custom container style
   */
  containerStyle?: ViewStyle;
}

export const YYFormField: React.FC<YYFormFieldProps> = ({
  label,
  error,
  helperText,
  required = false,
  containerStyle,
  ...textInputProps
}) => {
  const theme = useTheme();
  const isDark = theme.dark;
  const [isFocused, setIsFocused] = useState(false);
  
  // Text colors based on theme
  const textColor = isDark
    ? YYTheme.colors.text.dark
    : YYTheme.colors.text.primary;
  
  const secondaryTextColor = isDark
    ? YYTheme.colors.text.darkSecondary
    : YYTheme.colors.text.secondary;
  
  // Input background
  const inputBackground = isDark
    ? YYTheme.colors.background.darkCard
    : YYTheme.colors.card;
  
  // Border color based on state
  const getBorderColor = () => {
    if (error) return YYTheme.colors.error;
    if (isFocused) return YYTheme.colors.primary;
    return YYTheme.colors.border;
  };
  
  const getBorderWidth = () => {
    if (error || isFocused) return 2;
    return 1;
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: textColor }]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}
      
      <TextInput
        style={[
          YYTheme.inputs.base,
          {
            backgroundColor: inputBackground,
            color: textColor,
            borderColor: getBorderColor(),
            borderWidth: getBorderWidth(),
          },
        ]}
        placeholderTextColor={secondaryTextColor}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...textInputProps}
      />
      
      {error && (
        <Text style={[styles.errorText, { color: YYTheme.colors.error }]}>
          {error}
        </Text>
      )}
      
      {helperText && !error && (
        <Text style={[styles.helperText, { color: secondaryTextColor }]}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: YYTheme.spacing.md,
  },
  labelContainer: {
    marginBottom: YYTheme.spacing.xs,
  },
  label: {
    ...YYTheme.typography.labelMedium,
    fontWeight: '600',
  },
  required: {
    color: YYTheme.colors.error,
  },
  errorText: {
    ...YYTheme.typography.caption,
    marginTop: YYTheme.spacing.xs,
  },
  helperText: {
    ...YYTheme.typography.caption,
    marginTop: YYTheme.spacing.xs,
  },
});

export default YYFormField;
