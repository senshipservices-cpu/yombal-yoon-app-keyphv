
import React from 'react';
import { View, ViewProps, ViewStyle, StyleSheet } from 'react-native';
import { PlatformUtils, ResponsiveUtils, LayoutUtils } from '@/utils/platformUtils';

/**
 * ResponsiveGrid
 * A grid layout component that adapts to different screen sizes
 * Uses flexbox on native and CSS Grid on web
 */

interface ResponsiveGridProps extends ViewProps {
  /**
   * Number of columns for different breakpoints
   */
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  
  /**
   * Gap between grid items
   */
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Children components
   */
  children?: React.ReactNode;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  style,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  children,
  ...props
}) => {
  const gapValue = LayoutUtils.getSpacing(gap);
  
  // Get current number of columns based on device type
  const currentColumns = ResponsiveUtils.getResponsiveValue({
    mobile: columns.mobile || 1,
    tablet: columns.tablet || 2,
    desktop: columns.desktop || 3,
  });
  
  if (PlatformUtils.isWeb) {
    // Use CSS Grid on web
    const webGridStyle: any = {
      display: 'grid',
      gridTemplateColumns: `repeat(${currentColumns}, 1fr)`,
      gap: gapValue,
    };
    
    const combinedStyle = StyleSheet.flatten([webGridStyle, style]);
    
    return (
      <View style={combinedStyle} {...props}>
        {children}
      </View>
    );
  }
  
  // Use flexbox on native
  const nativeGridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -gapValue / 2,
  };
  
  const combinedStyle = StyleSheet.flatten([nativeGridStyle, style]);
  
  // Calculate item width for flexbox
  const itemWidth = `${(100 / currentColumns) - 1}%`;
  
  return (
    <View style={combinedStyle} {...props}>
      {React.Children.map(children, (child, index) => (
        <View
          key={index}
          style={{
            width: itemWidth,
            marginHorizontal: gapValue / 2,
            marginBottom: gapValue,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

export default ResponsiveGrid;
