
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface VerifiedDriverBadgeProps {
  isVerified: boolean;
  memberSince?: string;
  ridesPublished?: number;
  compact?: boolean;
  type?: 'driver' | 'sender';
}

export default function VerifiedDriverBadge({
  isVerified,
  memberSince,
  ridesPublished,
  compact = false,
  type = 'driver',
}: VerifiedDriverBadgeProps) {
  const theme = useTheme();
  const isDark = theme.dark;

  if (!isVerified) {
    return null;
  }

  const getLabel = () => {
    if (type === 'sender') {
      return compact ? 'Expéditeur vérifié' : 'Expéditeur vérifié ✅';
    }
    return compact ? 'Vérifié' : 'Conducteur vérifié';
  };

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: colors.primary + '20' }]}>
        <IconSymbol
          ios_icon_name="checkmark.seal.fill"
          android_material_icon_name="verified"
          size={16}
          color={colors.primary}
        />
        <Text style={[styles.compactText, { color: colors.primary }]}>{getLabel()}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
      <View style={styles.verifiedRow}>
        <IconSymbol
          ios_icon_name="checkmark.seal.fill"
          android_material_icon_name="verified"
          size={24}
          color={colors.primary}
        />
        <Text style={[styles.verifiedText, { color: colors.primary }]}>{getLabel()}</Text>
      </View>

      {memberSince && (
        <View style={styles.infoRow}>
          <IconSymbol
            ios_icon_name="calendar"
            android_material_icon_name="calendar-today"
            size={16}
            color={isDark ? colors.darkTextSecondary : colors.textSecondary}
          />
          <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            Membre depuis : {memberSince}
          </Text>
        </View>
      )}

      {ridesPublished !== undefined && (
        <View style={styles.infoRow}>
          <IconSymbol
            ios_icon_name="car.fill"
            android_material_icon_name="directions-car"
            size={16}
            color={isDark ? colors.darkTextSecondary : colors.textSecondary}
          />
          <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            Trajets publiés : {ridesPublished}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  compactText: {
    fontSize: 13,
    fontWeight: '700',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedText: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
});
