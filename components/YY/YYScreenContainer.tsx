
/**
 * YYScreenContainer - Yombal Yoon Screen Container
 * 
 * Standardized screen layout container for consistent appearance.
 * Handles safe areas, responsive layouts, and dark mode.
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { YYTheme } from '@/styles/theme';
import { LayoutUtils } from '@/utils/platformUtils';

interface YYScreenContainerProps {
  /**
   * Screen content
   */
  children: React.ReactNode;
  
  /**
   * Enable scrolling
   */
  scrollable?: boolean;
  
  /**
   * Custom style
   */
  style?: ViewStyle;
  
  /**
   * Content container style (for ScrollView)
   */
  contentContainerStyle?: ViewStyle;
  
  /**
   * Disable padding
   */
  noPadding?: boolean;
  
  /**
   * Center content
   */
  centered?: boolean;
  
  /**
   * Safe area edges
   */
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const YYScreenContainer: React.FC<YYScreenContainerProps> = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  noPadding = false,
  centered = false,
  safeAreaEdges = ['top', 'bottom'],
}) => {
  const theme = useTheme();
  const isDark = theme.dark;
  
  // Background color based on theme
  const backgroundColor = isDark
    ? YYTheme.colors.background.dark
    : YYTheme.colors.background.light;
  
  // Padding
  const paddingStyle = noPadding ? {} : {
    paddingHorizontal: YYTheme.spacing.md,
  };
  
  // Centered content
  const centeredStyle = centered ? {
    alignItems: 'center',
    justifyContent: 'center',
  } : {};
  
  // Android top padding (for notch)
  const androidTopPadding = Platform.OS === 'android' ? {
    paddingTop: 48,
  } : {};
  
  // Responsive max width
  const responsiveStyle = {
    maxWidth: LayoutUtils.getContentMaxWidth(),
    width: '100%',
    alignSelf: 'center',
  } as ViewStyle;
  
  const containerStyle = [
    styles.container,
    { backgroundColor },
    androidTopPadding,
    style,
  ];
  
  const innerStyle = [
    styles.inner,
    paddingStyle,
    centeredStyle,
    responsiveStyle,
    contentContainerStyle,
  ];
  
  if (scrollable) {
    return (
      <SafeAreaView style={containerStyle} edges={safeAreaEdges}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            innerStyle,
            { paddingBottom: 140 }, // Space for FloatingTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={containerStyle} edges={safeAreaEdges}>
      <View style={innerStyle}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
});

export default YYScreenContainer;
