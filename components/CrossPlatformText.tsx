
import React from 'react';
import { Text, TextProps, TextStyle, StyleSheet } from 'react-native';
import { PlatformUtils, TypographyUtils, LayoutUtils } from '@/utils/platformUtils';
import { typography } from '@/styles/designSystem';

/**
 * CrossPlatformText
 * A Text component that ensures consistent typography across platforms
 */

type TypographyVariant = 
  | 'display-large'
  | 'display-medium'
  | 'display-small'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body-large'
  | 'body-medium'
  | 'body-small'
  | 'label-large'
  | 'label-medium'
  | 'label-small'
  | 'caption';

interface CrossPlatformTextProps extends TextProps {
  /**
   * Typography variant
   */
  variant?: TypographyVariant;
  
  /**
   * Font weight
   */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  
  /**
   * Platform-specific styles
   */
  webStyle?: TextStyle;
  iosStyle?: TextStyle;
  androidStyle?: TextStyle;
  nativeStyle?: TextStyle;
  
  /**
   * Children (text content)
   */
  children?: React.ReactNode;
}

export const CrossPlatformText: React.FC<CrossPlatformTextProps> = ({
  style,
  variant,
  weight,
  webStyle,
  iosStyle,
  androidStyle,
  nativeStyle,
  children,
  ...props
}) => {
  // Get typography style based on variant
  let typographyStyle: TextStyle = {};
  
  if (variant) {
    const [category, size] = variant.split('-');
    
    if (category === 'display') {
      typographyStyle = typography.display[size as 'large' | 'medium' | 'small'];
    } else if (category === 'h1' || category === 'h2' || category === 'h3' || category === 'h4') {
      typographyStyle = typography.heading[category];
    } else if (category === 'body') {
      typographyStyle = typography.body[size as 'large' | 'medium' | 'small'];
    } else if (category === 'label') {
      typographyStyle = typography.label[size as 'large' | 'medium' | 'small'];
    } else if (category === 'caption') {
      typographyStyle = typography.caption;
    }
  }
  
  // Get font weight style
  const weightStyle: TextStyle = weight ? {
    fontWeight: TypographyUtils.getFontWeight(weight),
  } : {};
  
  // Get platform-specific styles
  const platformStyle = PlatformUtils.select({
    web: webStyle || {},
    ios: iosStyle || {},
    android: androidStyle || {},
    native: nativeStyle || {},
    default: {},
  });
  
  // Combine all styles
  const combinedStyle = StyleSheet.flatten([
    typographyStyle,
    weightStyle,
    style,
    platformStyle,
  ]);
  
  return (
    <Text style={combinedStyle} {...props}>
      {children}
    </Text>
  );
};

export default CrossPlatformText;
