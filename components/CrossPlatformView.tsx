
import React from 'react';
import { View, ViewProps, ViewStyle, StyleSheet } from 'react-native';
import { PlatformUtils, ShadowUtils } from '@/utils/platformUtils';

/**
 * CrossPlatformView
 * A View component that ensures consistent rendering across platforms
 * Handles shadows, borders, and other platform-specific styling
 */

interface CrossPlatformViewProps extends ViewProps {
  /**
   * Shadow elevation (sm, md, lg, xl)
   */
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  
  /**
   * Platform-specific styles
   */
  webStyle?: ViewStyle;
  iosStyle?: ViewStyle;
  androidStyle?: ViewStyle;
  nativeStyle?: ViewStyle;
  
  /**
   * Children components
   */
  children?: React.ReactNode;
}

export const CrossPlatformView: React.FC<CrossPlatformViewProps> = ({
  style,
  shadow = 'none',
  webStyle,
  iosStyle,
  androidStyle,
  nativeStyle,
  children,
  ...props
}) => {
  // Get shadow styles if specified
  const shadowStyle = shadow !== 'none' ? ShadowUtils.getShadow(shadow) : {};
  
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
    style,
    shadowStyle,
    platformStyle,
  ]);
  
  return (
    <View style={combinedStyle} {...props}>
      {children}
    </View>
  );
};

export default CrossPlatformView;
