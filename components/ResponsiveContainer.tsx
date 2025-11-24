
import React from 'react';
import { View, ViewProps, ViewStyle, StyleSheet, ScrollView } from 'react-native';
import { ResponsiveUtils, LayoutUtils } from '@/utils/platformUtils';

/**
 * ResponsiveContainer
 * A container component that adapts to different screen sizes
 */

interface ResponsiveContainerProps extends ViewProps {
  /**
   * Maximum width for the container
   */
  maxWidth?: number | 'mobile' | 'tablet' | 'desktop' | 'wide';
  
  /**
   * Whether to center the container
   */
  centered?: boolean;
  
  /**
   * Padding size
   */
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Whether to make the container scrollable
   */
  scrollable?: boolean;
  
  /**
   * Children components
   */
  children?: React.ReactNode;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  style,
  maxWidth = 'desktop',
  centered = true,
  padding = 'md',
  scrollable = false,
  children,
  ...props
}) => {
  // Get max width value
  const maxWidthValue = typeof maxWidth === 'number' 
    ? maxWidth 
    : ResponsiveUtils.breakpoints[maxWidth] || LayoutUtils.getContentMaxWidth();
  
  // Get padding value
  const paddingValue = padding !== 'none' ? LayoutUtils.getSpacing(padding) : 0;
  
  // Create container style
  const containerStyle: ViewStyle = {
    width: '100%',
    maxWidth: maxWidthValue,
    paddingHorizontal: paddingValue,
    ...(centered && { alignSelf: 'center' }),
  };
  
  // Combine styles
  const combinedStyle = StyleSheet.flatten([containerStyle, style]);
  
  if (scrollable) {
    return (
      <ScrollView
        style={combinedStyle}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        {...props}
      >
        {children}
      </ScrollView>
    );
  }
  
  return (
    <View style={combinedStyle} {...props}>
      {children}
    </View>
  );
};

export default ResponsiveContainer;
