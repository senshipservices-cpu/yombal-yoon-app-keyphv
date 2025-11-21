
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function AdminDashboardScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();

  const adminModules = [
    {
      id: 'withdrawals',
      title: 'Gestion des retraits',
      description: 'Approuver ou refuser les demandes de retrait',
      icon: 'arrow.down.circle.fill',
      androidIcon: 'get-app',
      color: colors.accent,
      route: '/admin/withdrawals',
    },
    {
      id: 'recharges',
      title: 'Gestion des recharges',
      description: 'Valider les demandes de recharge wallet',
      icon: 'arrow.up.circle.fill',
      androidIcon: 'publish',
      color: colors.primary,
      route: '/admin/recharges',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Yombal Yoon</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Welcome Card */}
          <View style={[styles.welcomeCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <IconSymbol
              ios_icon_name="person.badge.shield.checkmark.fill"
              android_material_icon_name="admin-panel-settings"
              size={48}
              color={colors.primary}
            />
            <Text style={[styles.welcomeTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Bienvenue, Admin
            </Text>
            <Text style={[styles.welcomeText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Gérez les demandes de retrait et de recharge des utilisateurs
            </Text>
          </View>

          {/* Admin Modules */}
          <View style={styles.modulesContainer}>
            {adminModules.map((module) => (
              <TouchableOpacity
                key={module.id}
                style={[styles.moduleCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                onPress={() => router.push(module.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.moduleIcon, { backgroundColor: module.color + '20' }]}>
                  <IconSymbol
                    ios_icon_name={module.icon}
                    android_material_icon_name={module.androidIcon}
                    size={32}
                    color={module.color}
                  />
                </View>
                <View style={styles.moduleInfo}>
                  <Text style={[styles.moduleTitle, { color: isDark ? colors.darkText : colors.text }]}>
                    {module.title}
                  </Text>
                  <Text style={[styles.moduleDescription, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    {module.description}
                  </Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={24}
                  color={isDark ? colors.darkTextSecondary : colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.warning + '20' }]}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="warning"
              size={24}
              color={colors.warning}
            />
            <Text style={[styles.infoText, { color: isDark ? colors.darkText : colors.text }]}>
              Assurez-vous de vérifier toutes les informations avant d&apos;approuver ou de refuser une demande.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 68 : 60,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  content: {
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  modulesContainer: {
    gap: 16,
    marginBottom: 24,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  moduleIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
