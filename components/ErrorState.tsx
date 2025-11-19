
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export default function ErrorState({ 
  title = 'Erreur de connexion', 
  message, 
  onRetry,
  retryText = 'Réessayer'
}: ErrorStateProps) {
  const theme = useTheme();
  const isDark = theme.dark;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
        <IconSymbol
          ios_icon_name="exclamationmark.triangle.fill"
          android_material_icon_name="error"
          size={64}
          color={colors.accent}
        />
      </View>
      
      <Text style={[styles.title, { color: isDark ? colors.darkText : colors.text }]}>
        {title}
      </Text>
      
      <Text style={[styles.message, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
        {message}
      </Text>

      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="arrow.clockwise"
            android_material_icon_name="refresh"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.retryButtonText}>{retryText}</Text>
        </TouchableOpacity>
      )}
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
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    boxShadow: '0px 4px 8px rgba(0, 128, 0, 0.2)',
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
