
import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useProfile } from "@/contexts/ProfileContext";
import { useNotifications } from "@/contexts/NotificationContext";
import YombalBanner from "@/components/YombalBanner";

const tips = [
  "Réservez vos trajets tôt le matin pour trouver plus de conducteurs.",
  "Précisez bien vos arrêts intermédiaires pour un covoiturage fluide.",
  "Emballez correctement vos colis pour éviter les dommages.",
  "Confirmez toujours votre réservation 24h avant le départ.",
  "Partagez votre position en temps réel pour faciliter la rencontre.",
  "Vérifiez les avis des conducteurs avant de réserver.",
  "Préparez la monnaie exacte pour faciliter le paiement.",
  "Arrivez 10 minutes avant l'heure de départ prévue.",
  "Communiquez avec le conducteur si vous avez des bagages volumineux.",
  "Respectez les horaires pour une expérience agréable pour tous.",
];

type UserMainRole = 'Conducteur' | 'Passager' | 'Envoyeur de colis' | 'Livreur' | null;

export default function HomeScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { profile } = useProfile();
  const { unreadCount, registerForPushNotifications } = useNotifications();
  const [tipOfTheDay, setTipOfTheDay] = useState("");
  const [userMainRole, setUserMainRole] = useState<UserMainRole>(null);
  const hasRegisteredNotifications = useRef(false);

  const registerNotifications = useCallback(async () => {
    // Only register once per app session
    if (hasRegisteredNotifications.current) {
      console.log('Notifications already registered for this session');
      return;
    }

    try {
      const roles = [];
      if (profile.roles.driver) roles.push('driver');
      if (profile.roles.passenger) roles.push('passenger');
      if (profile.roles.delivery) roles.push('delivery');
      
      await registerForPushNotifications('current_user', roles);
      hasRegisteredNotifications.current = true;
      console.log('Push notifications registered successfully');
    } catch (error) {
      console.error('Failed to register push notifications:', error);
    }
  }, [profile.roles, registerForPushNotifications]);

  useEffect(() => {
    registerNotifications();
  }, [registerNotifications]);

  useEffect(() => {
    // Select tip based on day of the month
    const dayOfMonth = new Date().getDate();
    const tipIndex = dayOfMonth % tips.length;
    setTipOfTheDay(tips[tipIndex]);
    console.log('Tip of the day selected:', tips[tipIndex]);
  }, []);

  useEffect(() => {
    // Load user main role
    const loadUserMainRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userMainRole');
        if (role) {
          setUserMainRole(role as UserMainRole);
          console.log('User main role loaded:', role);
        }
      } catch (error) {
        console.error('Error loading user main role:', error);
      }
    };
    loadUserMainRole();
  }, []);

  const getRoleBasedWelcomeMessage = () => {
    switch (userMainRole) {
      case 'Conducteur':
        return "Bienvenue ! Publiez vos trajets et trouvez des passagers.";
      case 'Passager':
        return "Bienvenue ! Trouvez un trajet en covoiturage en quelques clics.";
      case 'Envoyeur de colis':
        return "Bienvenue ! Envoyez vos colis en toute sécurité.";
      case 'Livreur':
        return "Bienvenue ! Recevez des missions de livraison près de vous.";
      default:
        return "Votre partenaire de mobilité au Sénégal";
    }
  };

  const getHighlightedService = () => {
    switch (userMainRole) {
      case 'Conducteur':
      case 'Passager':
        return 'covoiturage';
      case 'Envoyeur de colis':
        return 'colis';
      case 'Livreur':
        return 'livraison';
      default:
        return null;
    }
  };

  const highlightedService = getHighlightedService();

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
      subtitle: 'Livraison rapide',
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
      <View style={[styles.bannerWrapper, { paddingTop: Platform.OS === 'android' ? 48 : 60 }]}>
        <YombalBanner />
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={[styles.greeting, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Bienvenue sur
              </Text>
              <Text style={[styles.appName, { color: isDark ? colors.darkText : colors.text }]}>
                Yombal Yoon 🇸🇳
              </Text>
            </View>
            
            <View style={styles.headerRight}>
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
              
              <Image
                source={require('@/assets/images/0d85b705-7898-4146-82bf-1064a691d334.jpeg')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={[styles.tagline, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            {getRoleBasedWelcomeMessage()}
          </Text>

          {tipOfTheDay && (
            <View style={[styles.tipCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
              <View style={styles.tipHeader}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={[styles.tipTitle, { color: isDark ? colors.darkText : colors.text }]}>
                  Astuce Yombal Yoon
                </Text>
              </View>
              <Text style={[styles.tipText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                {tipOfTheDay}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Nos Services
          </Text>

          {services.map((service) => {
            const isHighlighted = service.id === highlightedService;
            return (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  { backgroundColor: isDark ? colors.darkCard : colors.card },
                  isHighlighted && styles.serviceCardHighlighted,
                  isHighlighted && { borderColor: service.color, borderWidth: 2 },
                ]}
                onPress={() => router.push(service.route as any)}
                activeOpacity={0.7}
              >
                {isHighlighted && (
                  <View style={[styles.highlightBadge, { backgroundColor: service.color }]}>
                    <IconSymbol
                      ios_icon_name="star.fill"
                      android_material_icon_name="star"
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.highlightBadgeText}>Recommandé</Text>
                  </View>
                )}
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
            );
          })}

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
  bannerWrapper: {
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  tagline: {
    fontSize: 16,
    marginBottom: 16,
  },
  tipCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tipIcon: {
    fontSize: 24,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
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
    position: 'relative',
  },
  serviceCardHighlighted: {
    boxShadow: '0px 4px 16px rgba(0, 128, 0, 0.25)',
    elevation: 6,
  },
  highlightBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  highlightBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
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
