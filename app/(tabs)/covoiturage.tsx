
import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useProfile } from "@/contexts/ProfileContext";
import { useCovoiturage } from "@/contexts/CovoiturageContext";

export default function CovoiturageScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { profile, isLoading: profileLoading } = useProfile();
  const { isLoading: covoiturageLoading, error } = useCovoiturage();

  const handlePublishRide = () => {
    router.push('/covoiturage/publish-ride');
  };

  const handleMyRides = () => {
    router.push('/covoiturage/my-rides');
  };

  const handleSearchRide = () => {
    router.push('/covoiturage/search-ride');
  };

  const handleMyReservations = () => {
    router.push('/covoiturage/my-reservations');
  };

  const handleMyAlerts = () => {
    router.push('/covoiturage/my-alerts');
  };

  // Show loading state
  if (profileLoading || covoiturageLoading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: isDark ? colors.darkText : colors.text }]}>
          Chargement...
        </Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: '#FF8C00' }]}>
            <Text style={styles.headerEmoji}>🇸🇳</Text>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Covoiturage</Text>
              <Text style={styles.headerSubtitle}>Partagez vos trajets et économisez</Text>
            </View>
          </View>

          {/* Error Message */}
          <View style={styles.content}>
            <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
              <View style={styles.errorContainer}>
                <IconSymbol
                  ios_icon_name="exclamationmark.triangle.fill"
                  android_material_icon_name="warning"
                  size={48}
                  color={colors.accent}
                />
                <Text style={[styles.errorTitle, { color: isDark ? colors.darkText : colors.text }]}>
                  Erreur de chargement
                </Text>
                <Text style={[styles.errorMessage, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  {error}
                </Text>
                <Text style={[styles.errorHint, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  Vérifiez votre connexion internet et réessayez.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Safely access profile roles with fallback
  const roles = profile?.roles || { driver: false, passenger: false, delivery: false, sender: false };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: '#FF8C00' }]}>
          <Text style={styles.headerEmoji}>🇸🇳</Text>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Covoiturage</Text>
            <Text style={styles.headerSubtitle}>Partagez vos trajets et économisez</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Driver Section */}
          {roles.driver && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Espace Conducteur
              </Text>
              
              <TouchableOpacity
                style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                onPress={handlePublishRide}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                    <IconSymbol
                      ios_icon_name="plus.circle.fill"
                      android_material_icon_name="add-circle"
                      size={32}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
                      Publier un trajet
                    </Text>
                    <Text style={[styles.cardDescription, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      Proposez un trajet et partagez vos frais
                    </Text>
                  </View>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                onPress={handleMyRides}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.secondary + '20' }]}>
                    <IconSymbol
                      ios_icon_name="car.fill"
                      android_material_icon_name="directions-car"
                      size={32}
                      color="#CC9900"
                    />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
                      Mes trajets publiés
                    </Text>
                    <Text style={[styles.cardDescription, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      Gérez vos trajets et réservations
                    </Text>
                  </View>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Passenger Section */}
          {roles.passenger && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Espace Passager
              </Text>
              
              <TouchableOpacity
                style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                onPress={handleSearchRide}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.accent + '20' }]}>
                    <IconSymbol
                      ios_icon_name="magnifyingglass"
                      android_material_icon_name="search"
                      size={32}
                      color={colors.accent}
                    />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
                      Rechercher un trajet
                    </Text>
                    <Text style={[styles.cardDescription, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      Trouvez un trajet qui vous convient
                    </Text>
                  </View>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                onPress={handleMyReservations}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                    <IconSymbol
                      ios_icon_name="list.bullet"
                      android_material_icon_name="list"
                      size={32}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
                      Mes réservations
                    </Text>
                    <Text style={[styles.cardDescription, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      Consultez vos réservations en cours
                    </Text>
                  </View>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                onPress={handleMyAlerts}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.accent + '20' }]}>
                    <IconSymbol
                      ios_icon_name="bell.badge"
                      android_material_icon_name="notifications-active"
                      size={32}
                      color={colors.accent}
                    />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
                      Mes alertes de trajet
                    </Text>
                    <Text style={[styles.cardDescription, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      Soyez notifié des nouveaux trajets
                    </Text>
                  </View>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* No roles selected */}
          {!roles.driver && !roles.passenger && (
            <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
              <Text style={[styles.infoText, { color: isDark ? colors.darkText : colors.text }]}>
                Veuillez sélectionner un rôle (Conducteur ou Passager) dans votre profil pour accéder aux fonctionnalités de covoiturage.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 48 : 0,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 60,
  },
  headerEmoji: {
    fontSize: 32,
    marginRight: 12,
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
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
