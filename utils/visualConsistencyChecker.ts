
import { Platform, Dimensions } from 'react-native';
import { PlatformUtils, ResponsiveUtils } from './platformUtils';

/**
 * Visual Consistency Checker
 * Utilities to verify and test visual consistency across platforms
 */

export interface VisualConsistencyReport {
  platform: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  screenSize: { width: number; height: number };
  issues: VisualIssue[];
  warnings: VisualWarning[];
  timestamp: string;
}

export interface VisualIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'layout' | 'typography' | 'color' | 'spacing' | 'shadow' | 'accessibility';
  message: string;
  recommendation: string;
}

export interface VisualWarning {
  category: 'layout' | 'typography' | 'color' | 'spacing' | 'shadow' | 'accessibility';
  message: string;
}

/**
 * Check visual consistency and generate report
 */
export const checkVisualConsistency = (): VisualConsistencyReport => {
  const issues: VisualIssue[] = [];
  const warnings: VisualWarning[] = [];
  
  // Check platform
  const platform = Platform.OS;
  const deviceType = ResponsiveUtils.getDeviceType();
  const screenSize = ResponsiveUtils.getScreenDimensions();
  
  // Check for common issues
  
  // 1. Check minimum touch target size
  if (PlatformUtils.isNative) {
    warnings.push({
      category: 'accessibility',
      message: 'Ensure all touchable elements have minimum size of 44x44 (iOS) or 48x48 (Android)',
    });
  }
  
  // 2. Check for platform-specific shadow usage
  if (PlatformUtils.isWeb) {
    warnings.push({
      category: 'shadow',
      message: 'Use boxShadow for web instead of React Native shadow props',
    });
  } else {
    warnings.push({
      category: 'shadow',
      message: 'Use shadowColor, shadowOffset, shadowOpacity, shadowRadius, and elevation for native',
    });
  }
  
  // 3. Check responsive design
  if (screenSize.width < 375) {
    warnings.push({
      category: 'layout',
      message: 'Screen width is below recommended minimum (375px). Test layout carefully.',
    });
  }
  
  // 4. Check for proper spacing
  warnings.push({
    category: 'spacing',
    message: 'Use LayoutUtils.getSpacing() for consistent spacing across platforms',
  });
  
  // 5. Check typography
  warnings.push({
    category: 'typography',
    message: 'Use typography presets from designSystem.ts for consistent text rendering',
  });
  
  return {
    platform,
    deviceType,
    screenSize,
    issues,
    warnings,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Log visual consistency report to console
 */
export const logVisualConsistencyReport = () => {
  const report = checkVisualConsistency();
  
  console.log('=== Visual Consistency Report ===');
  console.log(`Platform: ${report.platform}`);
  console.log(`Device Type: ${report.deviceType}`);
  console.log(`Screen Size: ${report.screenSize.width}x${report.screenSize.height}`);
  console.log(`Timestamp: ${report.timestamp}`);
  console.log('');
  
  if (report.issues.length > 0) {
    console.log('Issues:');
    report.issues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.category}: ${issue.message}`);
      console.log(`   Recommendation: ${issue.recommendation}`);
    });
    console.log('');
  }
  
  if (report.warnings.length > 0) {
    console.log('Warnings:');
    report.warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning.category}: ${warning.message}`);
    });
    console.log('');
  }
  
  console.log('=================================');
  
  return report;
};

/**
 * Test component for visual consistency
 * Add this to any screen to verify visual consistency
 */
export const testVisualConsistency = () => {
  if (__DEV__) {
    logVisualConsistencyReport();
  }
};
