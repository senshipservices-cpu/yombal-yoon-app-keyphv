
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useCovoiturage } from '@/contexts/CovoiturageContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useProfile } from '@/contexts/ProfileContext';

export default function SearchResultsScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const params = useLocalSearchParams();
  const { searchRides, addReservation } = useCovoiturage();
  const { sendLocalNotification } = useNotifications();
  const { profile } = useProfile();

  const departureCity = params.departureCity as string;
  const arrivalCity = params.arrivalCity as string;
  const date = params.date as string;
  const passengers = parseInt(params.passengers as string) || 1;

  const results = searchRides(departureCity, arrivalCity, date, passengers);

  const handleBookRide = async (ride: any) => {
    Alert.alert(
      'Confirmer la réservation',
      `Réserver ${passengers} place(s) pour ${ride.pricePerPassenger * passengers} FCFA ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réserver',
          onPress: async () => {
            const result = await addReservation(
              {
                rideId: ride.id,
                passengerId: 'passenger_demo', // In production, use actual user ID
                passengerName: profile.fullName || 'Passager',
                numberOfPassengers: passengers,
              },
              (type, driverId, rideDetails) => {
                // Send notification to driver
                sendLocalNotification(
                  'Nouvelle réservation ! 🚗',
                  `${rideDetails.passengerName} souhaite réserver ${rideDetails.numberOfPassengers} place(s) pour ${rideDetails.ride.departureCity} → ${rideDetails.ride.arrivalCity}`,
                  { type, ...rideDetails }
                );
              }
            );

            if (result.success) {
              Alert.alert(
                'Réservation effectuée !',
                'Votre réservation a été envoyée au conducteur. Vous serez notifié de sa réponse.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.push('/covoiturage/my-reservations'),
                  },
                ]
              );
            } else {
              Alert.alert('Erreur', result.message || 'Impossible de réserver ce trajet');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#FF8C00' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Résultats de recherche</Text>
          <Text style={styles.headerSubtitle}>{results.length} trajet(s) trouvé(s)</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Search Summary */}
          <View style={[styles.summaryCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <View style={styles.summaryRow}>
              <IconSymbol
                ios_icon_name="location.fill"
                android_material_icon_name="place"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.summaryText, { color: isDark ? colors.darkText : colors.text }]}>
                {departureCity} → {arrivalCity}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.summaryText, { color: isDark ? colors.darkText : colors.text }]}>
                {date ? new Date(date).toLocaleDateString('fr-FR') : 'Toutes les dates'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <IconSymbol
                ios_icon_name="person.2.fill"
                android_material_icon_name="people"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.summaryText, { color: isDark ? colors.darkText : colors.text }]}>
                {passengers} passager(s)
              </Text>
            </View>
          </View>

          {/* Results */}
          {results.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
              <IconSymbol
                ios_icon_name="magnifyingglass"
                android_material_icon_name="search"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: isDark ? colors.darkText : colors.text }]}>
                Aucun trajet trouvé
              </Text>
              <Text style={[styles.emptySubtext, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Essayez de modifier vos critères de recherche
              </Text>
            </View>
          ) : (
            results.map((ride, index) => (
              <View
                key={index}
                style={[styles.rideCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
              >
                {/* Route */}
                <View style={styles.routeContainer}>
                  <Text style={[styles.cityText, { color: isDark ? colors.darkText : colors.text }]}>
                    {ride.departureCity}
                  </Text>
                  <IconSymbol
                    ios_icon_name="arrow.right"
                    android_material_icon_name="arrow-forward"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={[styles.cityText, { color: isDark ? colors.darkText : colors.text }]}>
                    {ride.arrivalCity}
                  </Text>
                </View>

                {/* Details */}
                <View style={styles.detailsSection}>
                  <View style={styles.detailRow}>
                    <IconSymbol
                      ios_icon_name="person.fill"
                      android_material_icon_name="person"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      {ride.driverName}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <IconSymbol
                      ios_icon_name="calendar"
                      android_material_icon_name="calendar-today"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      {new Date(ride.date).toLocaleDateString('fr-FR')} à {ride.time}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <IconSymbol
                      ios_icon_name="person.2.fill"
                      android_material_icon_name="people"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      {ride.availableSeats} place(s) disponible(s)
                    </Text>
                  </View>

                  {ride.vehicleType && (
                    <View style={styles.detailRow}>
                      <IconSymbol
                        ios_icon_name="car.fill"
                        android_material_icon_name="directions-car"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {ride.vehicleType}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Price and Book Button */}
                <View style={styles.footer}>
                  <View style={styles.priceContainer}>
                    <Text style={[styles.priceLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      Prix total
                    </Text>
                    <Text style={[styles.priceText, { color: colors.primary }]}>
                      {ride.pricePerPassenger * passengers} FCFA
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.bookButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleBookRide(ride)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.bookButtonText}>Réserver</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
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
    paddingBottom: 120,
  },
  content: {
    padding: 20,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 8,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCard: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  rideCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailsSection: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
  },
  bookButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
