
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";

export default function HomeScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();

  const services = [
    {
      id: 1,
      title: "Covoiturage",
      description: "Partagez vos trajets et économisez",
      icon: "car.fill" as const,
      color: colors.primary,
      route: "/(tabs)/covoiturage" as const,
    },
    {
      id: 2,
      title: "Envoi de Colis",
      description: "Envoyez vos colis en toute sécurité",
      icon: "shippingbox.fill" as const,
      color: colors.accent,
      route: "/(tabs)/colis" as const,
    },
    {
      id: 3,
      title: "Livraison Express",
      description: "Livraison rapide en moins de 2h",
      icon: "bolt.fill" as const,
      color: colors.secondary,
      route: "/(tabs)/livraison" as const,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Orange Banner */}
        <View style={[styles.header, { backgroundColor: '#FF8C00' }]}>
          <Text style={styles.headerEmoji}>🇸🇳</Text>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Yombal Yoon</Text>
            <Text style={styles.headerSubtitle}>Plateforme de Mobilité au Sénégal</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Nos Services
          </Text>

          {/* Service Cards */}
          {services.map((service, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={[styles.serviceCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                activeOpacity={0.7}
                onPress={() => {
                  console.log(`Navigating to ${service.title}`);
                  router.push(service.route);
                }}
              >
                <View style={[styles.serviceIconContainer, { backgroundColor: service.color + '20' }]}>
                  <IconSymbol
                    ios_icon_name={service.icon}
                    android_material_icon_name="directions-car"
                    size={40}
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  serviceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
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
});
