
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface LocationPermissionPromptProps {
  onDismiss?: () => void;
}

export default function LocationPermissionPrompt({ onDismiss }: LocationPermissionPromptProps) {
  const theme = useTheme();
  const isDark = theme.dark;

  const handleOpenSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
        <IconSymbol
          ios_icon_name="location.fill"
          android_material_icon_name="location-on"
          size={64}
          color={colors.secondary}
        />
      </View>
      
      <Text style={[styles.title, { color: isDark ? colors.darkText : colors.text }]}>
        Localisation désactivée
      </Text>
      
      <Text style={[styles.message, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
        La localisation automatique n&apos;est pas disponible, mais vous pouvez toujours utiliser l&apos;application en saisissant vos adresses manuellement.
      </Text>

      <View style={styles.infoBox}>
        <IconSymbol
          ios_icon_name="info.circle.fill"
          android_material_icon_name="info"
          size={20}
          color={colors.primary}
        />
        <Text style={[styles.infoText, { color: isDark ? colors.darkText : colors.text }]}>
          Pour activer la localisation automatique, vous pouvez modifier les paramètres de votre appareil.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={handleOpenSettings}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="gear"
            android_material_icon_name="settings"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.primaryButtonText}>Ouvrir les paramètres</Text>
        </TouchableOpacity>

        {onDismiss && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, { borderColor: isDark ? colors.darkTextSecondary : colors.textSecondary }]}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryButtonText, { color: isDark ? colors.darkText : colors.text }]}>
              Continuer sans localisation
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 32,
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
    fontSize: 22,
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.primary + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  primaryButton: {
    boxShadow: '0px 4px 8px rgba(0, 128, 0, 0.2)',
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
