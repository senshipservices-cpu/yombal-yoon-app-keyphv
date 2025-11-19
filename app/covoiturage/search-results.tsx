
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useCovoiturage } from '@/contexts/CovoiturageContext';
import { useNotifications } from '@/contexts/NotificationContext';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { demoMode, demoRides, calculateEconomy } from '@/config/demoMode';

export default function SearchResultsScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const params = useLocalSearchParams();
  const { searchRides, addReservation } = useCovoiturage();
  const { sendLocalNotification } = useNotifications();
  const { isConnected, retry } = useNetworkStatus();

  const departureCity = params.departureCity as string;
  const arrivalCity = params.arrivalCity as string;
  const date = params.date as string;
  const passengers = parseInt(params.passengers as string, 10);

  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [passengerName, setPassengerName] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Use demo rides if demoMode is enabled, otherwise search real rides
  const rides = demoMode ? demoRides : searchRides(departureCity, arrivalCity, date, passengers);

  const handleBookRide = async (rideId: string) => {
    if (!passengerName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom');
      return;
    }

    setIsBooking(true);

    try {
      const result = await addReservation(
        {
          rideId,
          passengerId: 'passenger_demo',
          passengerName: passengerName.trim(),
          numberOfPassengers: passengers,
        },
        (type, driverId, rideDetails) => {
          sendLocalNotification(
            'Nouvelle réservation ! 🎉',
            `${passengerName} souhaite réserver ${passengers} place(s) pour ${rideDetails.ride.departureCity} → ${rideDetails.ride.arrivalCity}`,
            { type, reservationId: rideDetails.reservationId, ...rideDetails }
          );
        }
      );

      if (result.success) {
        Alert.alert(
          'Réservation envoyée !',
          'Votre demande de réservation a été envoyée au conducteur. Vous serez notifié de sa réponse.',
          [
            {
              text: 'OK',
              onPress: () => {
                setSelectedRideId(null);
                setPassengerName('');
                router.push('/covoiturage/my-reservations');
              },
            },
          ]
        );
      } else {
        Alert.alert('Erreur', result.message || 'Impossible de réserver ce trajet');
      }
    } catch (error) {
      console.error('Error booking ride:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsBooking(false);
    }
  };

  if (!isConnected && !demoMode) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
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
          </View>
        </View>

        <View style={styles.content}>
          <ErrorState
            message="Impossible de charger les trajets. Vérifiez votre connexion internet et réessayez."
            onRetry={retry}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
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
          <Text style={styles.headerSubtitle}>
            {rides.length} trajet(s) trouvé(s)
            {demoMode && ' (Mode Démo)'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {demoMode && (
            <View style={[styles.demoBanner, { backgroundColor: colors.secondary + '40' }]}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={20}
                color={colors.text}
              />
              <Text style={[styles.demoBannerText, { color: isDark ? colors.darkText : colors.text }]}>
                Mode Démo activé - Données d&apos;exemple
              </Text>
            </View>
          )}

          <View style={[styles.searchSummary, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <View style={styles.routeContainer}>
              <Text style={[styles.cityText, { color: isDark ? colors.darkText : colors.text }]}>
                {departureCity || 'Dakar'}
              </Text>
              <IconSymbol
                ios_icon_name="arrow.right"
                android_material_icon_name="arrow-forward"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.cityText, { color: isDark ? colors.darkText : colors.text }]}>
                {arrivalCity || 'Thiès'}
              </Text>
            </View>
            <Text style={[styles.searchDetails, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              {date ? new Date(date).toLocaleDateString('fr-FR') : 'Aujourd\'hui'} • {passengers || 1} passager(s)
            </Text>
          </View>

          {rides.length === 0 ? (
            <EmptyState
              icon={{ ios: 'car.fill', android: 'directions-car' }}
              title="Aucun trajet publié pour le moment"
              message="Aucun trajet ne correspond à votre recherche. Essayez de modifier vos critères ou revenez plus tard."
            />
          ) : (
            rides.map((ride, index) => {
              // Calculate economy for this ride
              const totalPrice = ride.pricePerPassenger * (passengers || 1);
              const economy = calculateEconomy(ride.departureCity, ride.arrivalCity, totalPrice);

              return (
                <View
                  key={index}
                  style={[styles.rideCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                >
                  <View style={styles.rideHeader}>
                    <View style={[styles.driverAvatar, { backgroundColor: colors.primary + '20' }]}>
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

                  <View style={styles.rideDetails}>
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

                    <View style={styles.detailRow}>
                      <IconSymbol
                        ios_icon_name="banknote"
                        android_material_icon_name="attach-money"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {totalPrice} FCFA ({passengers || 1} passager(s))
                      </Text>
                    </View>

                    {ride.intermediateStops && (
                      <View style={styles.detailRow}>
                        <IconSymbol
                          ios_icon_name="mappin.circle.fill"
                          android_material_icon_name="place"
                          size={16}
                          color={colors.textSecondary}
                        />
                        <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                          Arrêts: {ride.intermediateStops}
                        </Text>
                      </View>
                    )}

                    {/* Display economy if available */}
                    {economy !== null && (
                      <View style={[styles.economyBadge, { backgroundColor: colors.primary + '15' }]}>
                        <IconSymbol
                          ios_icon_name="checkmark.circle.fill"
                          android_material_icon_name="check-circle"
                          size={16}
                          color={colors.primary}
                        />
                        <Text style={[styles.economyText, { color: colors.primary }]}>
                          Économie estimée : {economy.toLocaleString('fr-FR')} FCFA par rapport à un taxi classique
                        </Text>
                      </View>
                    )}
                  </View>

                  {selectedRideId === ride.id ? (
                    <View style={styles.bookingForm}>
                      <Text style={[styles.formLabel, { color: isDark ? colors.darkText : colors.text }]}>
                        Votre nom complet
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: isDark ? colors.darkBackground : colors.background,
                            color: isDark ? colors.darkText : colors.text,
                            borderColor: isDark ? colors.darkCard : colors.border,
                          },
                        ]}
                        placeholder="Entrez votre nom"
                        placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
                        value={passengerName}
                        onChangeText={setPassengerName}
                      />

                      <View style={styles.bookingActions}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.cancelButton, { borderColor: colors.textSecondary }]}
                          onPress={() => {
                            setSelectedRideId(null);
                            setPassengerName('');
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.cancelButtonText, { color: isDark ? colors.darkText : colors.text }]}>
                            Annuler
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            styles.confirmButton,
                            { backgroundColor: passengerName.trim() ? colors.primary : colors.border },
                          ]}
                          onPress={() => handleBookRide(ride.id)}
                          disabled={!passengerName.trim() || isBooking}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.confirmButtonText}>
                            {isBooking ? 'Réservation...' : 'Confirmer'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.bookButton, { backgroundColor: colors.primary }]}
                      onPress={() => setSelectedRideId(ride.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.bookButtonText}>Réserver ce trajet</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
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
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  demoBannerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchSummary: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '700',
  },
  searchDetails: {
    fontSize: 14,
  },
  rideCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  rideDetails: {
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
  economyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  economyText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  bookingForm: {
    marginTop: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButton: {
    boxShadow: '0px 4px 8px rgba(0, 128, 0, 0.2)',
    elevation: 3,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  bookButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(0, 128, 0, 0.2)',
    elevation: 3,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
