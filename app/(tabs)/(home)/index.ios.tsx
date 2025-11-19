
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useProfile } from "@/contexts/ProfileContext";
import { useNotifications } from "@/contexts/NotificationContext";

export default function HomeScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { profile } = useProfile();
  const { unreadCount, registerForPushNotifications } = useNotifications();

  useEffect(() => {
    const roles = [];
    if (profile.roles.driver) roles.push('driver');
    if (profile.roles.passenger) roles.push('passenger');
    if (profile.roles.delivery) roles.push('delivery');
    
    registerForPushNotifications('current_user', roles);
  }, [profile.roles]);

  const services = [
    {
      id: 'covoiturage',
      title: 'Covoiturage',
      subtitle: 'Partagez vos trajets',
      icon: { ios: 'car.fill', android: 'directions-car' },
      color: '#FF8C00',
      route: '/covoiturage',
    },
    {
      id: 'colis',
      title: 'Envoi de Colis',
      subtitle: 'Thiak Thiak',
      icon: { ios: 'shippingbox.fill', android: 'local-shipping' },
      color: colors.accent,
      route: '/colis',
    },
    {
      id: 'livraison',
      title: 'Livraison 14 Régions',
      subtitle: 'Inter-régions',
      icon: { ios: 'bolt.fill', android: 'flash-on' },
      color: colors.secondary,
      route: '/livraison',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: 60 }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.greeting, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Bienvenue sur
              </Text>
              <Text style={[styles.appName, { color: isDark ? colors.darkText : colors.text }]}>
                Yombal Yoon 🇸🇳
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/notifications')}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="bell.fill"
                android_material_icon_name="notifications"
                size={28}
                color={isDark ? colors.darkText : colors.text}
              />
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={[styles.tagline, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            Votre partenaire de mobilité au Sénégal
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Nos Services
          </Text>

          {services.map((service, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.serviceCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
              onPress={() => router.push(service.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.serviceIcon, { backgroundColor: service.color + '20' }]}>
                <IconSymbol
                  ios_icon_name={service.icon.ios}
                  android_material_icon_name={service.icon.android}
                  size={32}
                  color={service.color}
                />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={[styles.serviceTitle, { color: isDark ? colors.darkText : colors.text }]}>
                  {service.title}
                </Text>
                <Text style={[styles.serviceSubtitle, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  {service.subtitle}
                </Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}

          <View style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.infoText, { color: isDark ? colors.darkText : colors.text }]}>
              Sélectionnez vos rôles dans votre profil pour accéder à toutes les fonctionnalités
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    padding: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 16,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
    gap: 16,
  },
  serviceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 14,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
