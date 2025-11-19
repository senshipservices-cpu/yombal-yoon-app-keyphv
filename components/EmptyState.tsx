
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface EmptyStateProps {
  icon?: {
    ios: string;
    android: string;
  };
  title: string;
  message: string;
  iconSize?: number;
}

export default function EmptyState({ icon, title, message, iconSize = 64 }: EmptyStateProps) {
  const theme = useTheme();
  const isDark = theme.dark;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
          <IconSymbol
            ios_icon_name={icon.ios}
            android_material_icon_name={icon.android}
            size={iconSize}
            color={isDark ? colors.darkTextSecondary : colors.textSecondary}
          />
        </View>
      )}
      <Text style={[styles.title, { color: isDark ? colors.darkText : colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.message, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
    marginVertical: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
