
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
  ActivityIndicator,
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
import { supabase } from '@/app/integrations/supabase/client';
import type { Tables } from '@/app/integrations/supabase/types';

interface RideResult {
  id: string;
  driver_name: string;
  driver_phone: string;
  departure_city: string;
  arrival_city: string;
  departure_datetime: string;
  seats_available: number;
  seats_total: number;
  price_per_seat: number;
  vehicle_type: string | null;
  stops: string | null;
  status: string;
}

export default function SearchResultsScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const params = useLocalSearchParams();
  const { sendLocalNotification } = useNotifications();
  const { isConnected, retry } = useNetworkStatus();

  const departureCity = params.departureCity as string;
  const arrivalCity = params.arrivalCity as string;
  const searchDate = params.date as string;
  const passengers = parseInt(params.numberOfPassengers as string, 10);

  const [rides, setRides] = useState<RideResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    searchRides();
  }, []);

  const searchRides = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Searching rides with params:', {
        departureCity,
        arrivalCity,
        searchDate,
        passengers,
      });

      // Build the query
      let query = supabase
        .from('carpool_rides')
        .select('*')
        .eq('departure_city', departureCity)
        .eq('arrival_city', arrivalCity)
        .gte('departure_datetime', searchDate)
        .gte('seats_available', passengers)
        .eq('status', 'open')
        .order('departure_datetime', { ascending: true });

      const { data, error: searchError } = await query;

      if (searchError) {
        console.error('Error searching rides:', searchError);
        setError('Erreur lors de la recherche des trajets');
        return;
      }

      console.log('Search results:', data);
      setRides(data || []);
    } catch (err) {
      console.error('Error in searchRides:', err);
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookRide = async (ride: RideResult) => {
    if (!passengerName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom');
      return;
    }

    if (!passengerPhone.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre numéro de téléphone');
      return;
    }

    setIsBooking(true);

    try {
      console.log('Booking ride:', {
        ride_id: ride.id,
        passenger_name: passengerName.trim(),
        passenger_phone: passengerPhone.trim(),
        number_of_passengers: passengers,
      });

      // Insert booking into Supabase
      const { data: bookingData, error: bookingError } = await supabase
        .from('carpool_bookings')
        .insert({
          ride_id: ride.id,
          passenger_name: passengerName.trim(),
          passenger_phone: passengerPhone.trim(),
          number_of_passengers: passengers,
          status: 'pending',
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        Alert.alert('Erreur', 'Impossible de réserver ce trajet. Veuillez réessayer.');
        return;
      }

      console.log('Booking created:', bookingData);

      // Update seats_available in carpool_rides
      const newSeatsAvailable = ride.seats_available - passengers;
      const { error: updateError } = await supabase
        .from('carpool_rides')
        .update({ seats_available: newSeatsAvailable })
        .eq('id', ride.id);

      if (updateError) {
        console.error('Error updating seats:', updateError);
        // Don't fail the booking if seat update fails
      } else {
        console.log('Seats updated:', newSeatsAvailable);
      }

      // Send notification
      sendLocalNotification(
        'Réservation enregistrée ! 🎉',
        `Votre réservation pour ${ride.departure_city} → ${ride.arrival_city} est en attente de confirmation du conducteur.`,
        { type: 'reservation_created', bookingId: bookingData.id }
      );

      Alert.alert(
        'Réservation enregistrée et en attente du conducteur.',
        'Vous serez notifié lorsque le conducteur acceptera ou refusera votre réservation.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedRideId(null);
              setPassengerName('');
              setPassengerPhone('');
              router.push('/covoiturage/my-reservations');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error booking ride:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la réservation');
    } finally {
      setIsBooking(false);
    }
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  if (!isConnected) {
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
            {isLoading ? 'Recherche...' : `${rides.length} trajet(s) trouvé(s)`}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={[styles.searchSummary, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <View style={styles.routeContainer}>
              <Text style={[styles.cityText, { color: isDark ? colors.darkText : colors.text }]}>
                {departureCity}
              </Text>
              <IconSymbol
                ios_icon_name="arrow.right"
                android_material_icon_name="arrow-forward"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.cityText, { color: isDark ? colors.darkText : colors.text }]}>
                {arrivalCity}
              </Text>
            </View>
            <Text style={[styles.searchDetails, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              {searchDate ? new Date(searchDate).toLocaleDateString('fr-FR') : 'Aujourd\'hui'} • {passengers} passager(s)
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: isDark ? colors.darkText : colors.text }]}>
                Recherche des trajets disponibles...
              </Text>
            </View>
          ) : error ? (
            <ErrorState message={error} onRetry={searchRides} />
          ) : rides.length === 0 ? (
            <EmptyState
              icon={{ ios: 'car.fill', android: 'directions-car' }}
              title="Aucun trajet trouvé"
              message="Aucun trajet ne correspond à votre recherche. Essayez de modifier vos critères ou revenez plus tard."
            />
          ) : (
            rides.map((ride, index) => {
              const { date, time } = formatDateTime(ride.departure_datetime);
              const totalPrice = ride.price_per_seat * passengers;

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
                        {ride.driver_name}
                      </Text>
                      {ride.vehicle_type && (
                        <Text style={[styles.vehicleType, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                          {ride.vehicle_type}
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
                        {date} à {time}
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
                        {ride.seats_available} place(s) disponible(s)
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
                        {totalPrice} FCFA ({passengers} passager(s))
                      </Text>
                    </View>

                    {ride.stops && (
                      <View style={styles.detailRow}>
                        <IconSymbol
                          ios_icon_name="mappin.circle.fill"
                          android_material_icon_name="place"
                          size={16}
                          color={colors.textSecondary}
                        />
                        <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                          Arrêts: {ride.stops}
                        </Text>
                      </View>
                    )}
                  </View>

                  {selectedRideId === ride.id ? (
                    <View style={styles.bookingForm}>
                      <Text style={[styles.formLabel, { color: isDark ? colors.darkText : colors.text }]}>
                        Votre nom complet *
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

                      <Text style={[styles.formLabel, { color: isDark ? colors.darkText : colors.text }]}>
                        Votre téléphone *
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
                        placeholder="Ex: 771234567"
                        placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
                        value={passengerPhone}
                        onChangeText={setPassengerPhone}
                        keyboardType="phone-pad"
                      />

                      <View style={styles.bookingActions}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.cancelButton, { borderColor: colors.textSecondary }]}
                          onPress={() => {
                            setSelectedRideId(null);
                            setPassengerName('');
                            setPassengerPhone('');
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
                            { 
                              backgroundColor: (passengerName.trim() && passengerPhone.trim()) 
                                ? colors.primary 
                                : colors.border 
                            },
                          ]}
                          onPress={() => handleBookRide(ride)}
                          disabled={!passengerName.trim() || !passengerPhone.trim() || isBooking}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.confirmButtonText}>
                            {isBooking ? 'Réservation...' : 'Confirmer la réservation'}
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
                      <Text style={styles.bookButtonText}>Réserver</Text>
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
  bookingForm: {
    marginTop: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
