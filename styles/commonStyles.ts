
import { StyleSheet } from 'react-native';

// Import platform utilities for consistent styling
// Note: ShadowUtils and LayoutUtils are available but not used here to maintain backward compatibility
// For new code, prefer using the design system from styles/designSystem.ts

// Yombal Yoon - Senegal Flag Colors
export const colors = {
  // Senegal Flag Colors
  primary: '#008000',      // Green
  secondary: '#FFFF00',    // Yellow
  accent: '#FF0000',       // Red
  
  // Base Colors
  background: '#F5F5F5',   // Light Gray
  backgroundAlt: '#FFFFFF', // White
  text: '#333333',         // Dark Gray
  textSecondary: '#666666', // Medium Gray
  card: '#FFFFFF',         // White
  highlight: '#E0E0E0',    // Light Gray
  border: '#E0E0E0',       // Light Gray
  
  // Dark Mode Colors
  darkBackground: '#1A1A1A',
  darkCard: '#2A2A2A',
  darkText: '#FFFFFF',
  darkTextSecondary: '#CCCCCC',
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 8px rgba(0, 128, 0, 0.2)',
    elevation: 3,
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 8px rgba(255, 255, 0, 0.2)',
    elevation: 3,
  },
  accent: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 8px rgba(255, 0, 0, 0.2)',
    elevation: 3,
  },
  outline: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  icon: {
    width: 60,
    height: 60,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
