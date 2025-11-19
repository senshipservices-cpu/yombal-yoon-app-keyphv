
import React, { useState, useEffect } from 'react';
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
import { useCovoiturage, Ride } from '@/contexts/CovoiturageContext';
import { useProfile } from '@/contexts/ProfileContext';

export default function SearchResultsScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const params = useLocalSearchParams();
  const { searchRides, addReservation } = useCovoiturage();
  const { profile } = useProfile();

  const [results, setResults] = useState<Ride[]>([]);

  useEffect(() => {
    performSearch();
  }, []);

  const performSearch = () => {
    const departureCity = params.departureCity as string || '';
    const arrivalCity = params.arrivalCity as string || '';
    const date = params.date as string || '';
    const numberOfPassengers = parseInt(params.numberOfPassengers as string || '1');

    console.log('Searching with:', { departureCity, arrivalCity, date, numberOfPassengers });

    const searchResults = searchRides(departureCity, arrivalCity, date, numberOfPassengers);
    setResults(searchResults);
    console.log('Found results:', searchResults.length);
  };

  const handleReserve = (ride: Ride) => {
    const numberOfPassengers = parseInt(params.numberOfPassengers as string || '1');

    Alert.alert(
      'Confirmer la réservation',
      `Réserver ${numberOfPassengers} place(s) pour ${ride.pricePerPassenger * numberOfPassengers} FCFA ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réserver',
          onPress: async () => {
            try {
              await addReservation({
                rideId: ride.id,
                passengerId: 'passenger_' + Date.now(),
                passengerName: profile.fullName || 'Passager',
                numberOfPassengers,
              });

              Alert.alert('Succès', 'Votre réservation a été envoyée au conducteur !', [
                {
                  text: 'OK',
                  onPress: () => router.push('/covoiturage/my-reservations'),
                },
              ]);
            } catch (error) {
              console.error('Error making reservation:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors de la réservation.');
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
                {/* Driver Info */}
                <View style={styles.driverSection}>
                  <View style={styles.driverAvatar}>
                    <IconSymbol
                      ios_icon_name="person.fill"
                      android_material_icon_name="person"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.driverInfo}>
                    <Text style={[styles.driverName, { color: isDark ? colors.darkText : colors.text }]}>
                      {ride.driverName}
                    </Text>
                    {ride.vehicleType && (
                      <Text style={[styles.vehicleType, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {ride.vehicleType}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Route */}
                <View style={styles.routeSection}>
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
                </View>

                {/* Details */}
                <View style={styles.detailsSection}>
                  <View style={styles.detailRow}>
                    <IconSymbol
                      ios_icon_name="clock"
                      android_material_icon_name="access-time"
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
                      {ride.availableSeats} place(s) restante(s)
                    </Text>
                  </View>

                  {ride.intermediateStops && (
                    <View style={styles.detailRow}>
                      <IconSymbol
                        ios_icon_name="location.fill"
                        android_material_icon_name="place"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        Arrêts: {ride.intermediateStops}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Price and Reserve Button */}
                <View style={styles.footer}>
                  <View style={styles.priceContainer}>
                    <Text style={[styles.priceLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      Prix par passager
                    </Text>
                    <Text style={[styles.priceText, { color: colors.primary }]}>
                      {ride.pricePerPassenger} FCFA
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.reserveButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleReserve(ride)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.reserveButtonText}>Réserver</Text>
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
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  vehicleType: {
    fontSize: 13,
  },
  routeSection: {
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '600',
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
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
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
  reserveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  reserveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
