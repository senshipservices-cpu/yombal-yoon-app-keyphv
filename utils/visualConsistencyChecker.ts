
/**
 * Visual Consistency Checker
 * 
 * Utility to verify that screens use the standardized Yombal Yoon components
 * and theme tokens instead of hardcoded values.
 */

import { YYTheme } from '@/styles/theme';

/**
 * Check if a color value is hardcoded (not from theme)
 */
export const isHardcodedColor = (color: string): boolean => {
  // Check if it's a hex color
  if (/^#[0-9A-F]{6}$/i.test(color)) {
    // Check if it exists in theme
    const themeColors = Object.values(YYTheme.colors).flat();
    return !themeColors.includes(color);
  }
  
  // Check if it's an rgb/rgba color
  if (color.startsWith('rgb')) {
    return true;
  }
  
  return false;
};

/**
 * Check if a font size is hardcoded (not from theme)
 */
export const isHardcodedFontSize = (fontSize: number): boolean => {
  const themeFontSizes = Object.values(YYTheme.typography).map(
    (style: any) => style.fontSize
  );
  return !themeFontSizes.includes(fontSize);
};

/**
 * Check if spacing is hardcoded (not from theme)
 */
export const isHardcodedSpacing = (spacing: number): boolean => {
  const themeSpacings = Object.values(YYTheme.spacing);
  return !themeSpacings.includes(spacing);
};

/**
 * Screen consistency report
 */
export interface ConsistencyReport {
  screenName: string;
  issues: ConsistencyIssue[];
  score: number; // 0-100
  passed: boolean;
}

export interface ConsistencyIssue {
  type: 'color' | 'fontSize' | 'spacing' | 'component';
  severity: 'error' | 'warning';
  message: string;
  location?: string;
}

/**
 * Generate a consistency report for a screen
 */
export const generateConsistencyReport = (
  screenName: string,
  issues: ConsistencyIssue[]
): ConsistencyReport => {
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  
  // Calculate score (errors are -10 points, warnings are -5 points)
  const score = Math.max(0, 100 - (errorCount * 10) - (warningCount * 5));
  
  return {
    screenName,
    issues,
    score,
    passed: score >= 80, // 80% is passing grade
  };
};

/**
 * Checklist for screen migration
 */
export interface MigrationChecklist {
  usesYYScreenContainer: boolean;
  usesYYButton: boolean;
  usesYYCard: boolean;
  usesYYFormField: boolean;
  usesThemeColors: boolean;
  usesThemeTypography: boolean;
  usesThemeSpacing: boolean;
  noHardcodedColors: boolean;
  noHardcodedFontSizes: boolean;
  noHardcodedSpacing: boolean;
  noPlatformSpecificDesign: boolean;
  testedOnWeb: boolean;
  testedOnIOS: boolean;
  testedOnAndroid: boolean;
}

/**
 * Calculate migration progress
 */
export const calculateMigrationProgress = (
  checklist: MigrationChecklist
): number => {
  const items = Object.values(checklist);
  const completed = items.filter(Boolean).length;
  return Math.round((completed / items.length) * 100);
};

/**
 * Get migration status
 */
export const getMigrationStatus = (
  progress: number
): 'not-started' | 'in-progress' | 'completed' => {
  if (progress === 0) return 'not-started';
  if (progress === 100) return 'completed';
  return 'in-progress';
};

/**
 * Common hardcoded colors to check for
 */
export const COMMON_HARDCODED_COLORS = [
  '#008000', // Should use YYTheme.colors.primary
  '#FFFF00', // Should use YYTheme.colors.secondary
  '#FF0000', // Should use YYTheme.colors.accent
  '#F5F5F5', // Should use YYTheme.colors.background.light
  '#FFFFFF', // Should use YYTheme.colors.background.white
  '#333333', // Should use YYTheme.colors.text.primary
  '#666666', // Should use YYTheme.colors.text.secondary
  '#E0E0E0', // Should use YYTheme.colors.border
];

/**
 * Validate screen consistency
 */
export const validateScreenConsistency = (
  screenName: string,
  checklist: MigrationChecklist
): ConsistencyReport => {
  const issues: ConsistencyIssue[] = [];
  
  if (!checklist.usesYYScreenContainer) {
    issues.push({
      type: 'component',
      severity: 'error',
      message: 'Screen should use YYScreenContainer instead of SafeAreaView + ScrollView',
    });
  }
  
  if (!checklist.usesThemeColors) {
    issues.push({
      type: 'color',
      severity: 'error',
      message: 'Screen should use YYTheme.colors instead of hardcoded colors',
    });
  }
  
  if (!checklist.usesThemeTypography) {
    issues.push({
      type: 'fontSize',
      severity: 'error',
      message: 'Screen should use YYTheme.typography instead of hardcoded font sizes',
    });
  }
  
  if (!checklist.usesThemeSpacing) {
    issues.push({
      type: 'spacing',
      severity: 'error',
      message: 'Screen should use YYTheme.spacing instead of hardcoded spacing values',
    });
  }
  
  if (!checklist.noHardcodedColors) {
    issues.push({
      type: 'color',
      severity: 'error',
      message: 'Found hardcoded colors. Replace with YYTheme.colors',
    });
  }
  
  if (!checklist.noHardcodedFontSizes) {
    issues.push({
      type: 'fontSize',
      severity: 'warning',
      message: 'Found hardcoded font sizes. Replace with YYTheme.typography',
    });
  }
  
  if (!checklist.noHardcodedSpacing) {
    issues.push({
      type: 'spacing',
      severity: 'warning',
      message: 'Found hardcoded spacing. Replace with YYTheme.spacing',
    });
  }
  
  if (!checklist.noPlatformSpecificDesign) {
    issues.push({
      type: 'component',
      severity: 'error',
      message: 'Found Platform.OS checks for design. Remove platform-specific design logic',
    });
  }
  
  if (!checklist.testedOnWeb || !checklist.testedOnIOS || !checklist.testedOnAndroid) {
    issues.push({
      type: 'component',
      severity: 'warning',
      message: 'Screen not tested on all platforms (Web, iOS, Android)',
    });
  }
  
  return generateConsistencyReport(screenName, issues);
};

/**
 * Print consistency report to console
 */
export const printConsistencyReport = (report: ConsistencyReport): void => {
  console.log('\n========================================');
  console.log(`Visual Consistency Report: ${report.screenName}`);
  console.log('========================================');
  console.log(`Score: ${report.score}/100`);
  console.log(`Status: ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Issues: ${report.issues.length}`);
  
  if (report.issues.length > 0) {
    console.log('\nIssues:');
    report.issues.forEach((issue, index) => {
      const icon = issue.severity === 'error' ? '❌' : '⚠️';
      console.log(`${index + 1}. ${icon} [${issue.type}] ${issue.message}`);
      if (issue.location) {
        console.log(`   Location: ${issue.location}`);
      }
    });
  }
  
  console.log('========================================\n');
};

/**
 * Example usage:
 * 
 * const checklist: MigrationChecklist = {
 *   usesYYScreenContainer: true,
 *   usesYYButton: true,
 *   usesYYCard: true,
 *   usesYYFormField: false,
 *   usesThemeColors: true,
 *   usesThemeTypography: true,
 *   usesThemeSpacing: true,
 *   noHardcodedColors: true,
 *   noHardcodedFontSizes: true,
 *   noHardcodedSpacing: true,
 *   noPlatformSpecificDesign: true,
 *   testedOnWeb: true,
 *   testedOnIOS: true,
 *   testedOnAndroid: false,
 * };
 * 
 * const report = validateScreenConsistency('HomeScreen', checklist);
 * printConsistencyReport(report);
 */
