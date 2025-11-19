
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useTheme } from "@react-navigation/native";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const theme = useTheme();
  const isDark = theme.dark;

  const services = [
    {
      id: 1,
      title: "Transport",
      description: "Réservez votre trajet en toute sécurité",
      icon: "directions-car" as const,
      color: colors.primary,
    },
    {
      id: 2,
      title: "Livraison",
      description: "Envoyez vos colis rapidement",
      icon: "local-shipping" as const,
      color: colors.accent,
    },
    {
      id: 3,
      title: "Courses",
      description: "Faites vos courses en ligne",
      icon: "shopping-cart" as const,
      color: colors.secondary,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <IconSymbol
                ios_icon_name="car.fill"
                android_material_icon_name="directions-car"
                size={40}
                color="#FFFFFF"
              />
            </LinearGradient>
          </View>
          <Text style={[styles.appTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Yombal Yoon
          </Text>
          <Text style={[styles.appSubtitle, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            Votre partenaire de mobilité au Sénégal
          </Text>
        </View>

        {/* Welcome Card */}
        <View style={[styles.welcomeCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.welcomeTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Bienvenue ! 👋
          </Text>
          <Text style={[styles.welcomeText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            Découvrez nos services de transport, livraison et bien plus encore.
          </Text>
        </View>

        {/* Services Grid */}
        <View style={styles.servicesSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Nos Services
          </Text>
          
          {services.map((service, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                activeOpacity={0.7}
                onPress={() => console.log(`Service ${service.title} pressed`)}
              >
                <View style={[styles.serviceIconContainer, { backgroundColor: service.color + '20' }]}>
                  <IconSymbol
                    ios_icon_name="car.fill"
                    android_material_icon_name={service.icon}
                    size={32}
                    color={service.color}
                  />
                </View>
                <View style={styles.serviceContent}>
                  <Text style={[styles.serviceTitle, { color: isDark ? colors.darkText : colors.text }]}>
                    {service.title}
                  </Text>
                  <Text style={[styles.serviceDescription, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    {service.description}
                  </Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={24}
                  color={isDark ? colors.darkTextSecondary : colors.textSecondary}
                />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* Info Section */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <View style={styles.infoRow}>
            <IconSymbol
              ios_icon_name="clock.fill"
              android_material_icon_name="access-time"
              size={24}
              color={colors.primary}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Service 24/7
              </Text>
              <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Disponible à tout moment
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? colors.darkTextSecondary + '30' : colors.border }]} />

          <View style={styles.infoRow}>
            <IconSymbol
              ios_icon_name="shield.fill"
              android_material_icon_name="security"
              size={24}
              color={colors.primary}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Sécurisé
              </Text>
              <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Vos données sont protégées
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? colors.darkTextSecondary + '30' : colors.border }]} />

          <View style={styles.infoRow}>
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={24}
              color={colors.secondary}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Qualité
              </Text>
              <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Service de haute qualité
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Padding for Tab Bar */}
        <View style={styles.bottomPadding} />
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
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(0, 128, 0, 0.3)',
    elevation: 5,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
  },
  servicesSection: {
    marginBottom: 24,
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
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  bottomPadding: {
    height: 20,
  },
});
