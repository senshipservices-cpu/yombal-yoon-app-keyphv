
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import type { Tables } from '@/app/integrations/supabase/types';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import ContactButtons from '@/components/ContactButtons';
import { maskPhoneNumber } from '@/utils/phoneUtils';

interface BookingWithRide extends Tables<'carpool_bookings'> {
  ride?: Tables<'carpool_rides'>;
}

export default function MyReservationsScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();

  const [bookings, setBookings] = useState<BookingWithRide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Loading bookings from Supabase...');

      // Fetch all bookings with their associated rides
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('carpool_bookings')
        .select(`
          *,
          ride:carpool_rides(*)
        `)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        setError('Erreur lors du chargement des réservations');
        return;
      }

      console.log('Bookings loaded:', bookingsData);
      setBookings(bookingsData || []);
    } catch (err) {
      console.error('Error in loadBookings:', err);
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleCancelReservation = (bookingId: string, booking: BookingWithRide) => {
    Alert.alert(
      'Annuler la réservation',
      'Voulez-vous vraiment annuler cette réservation ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Cancelling booking:', bookingId);

              // Update booking status to cancelled
              const { error: updateError } = await supabase
                .from('carpool_bookings')
                .update({ status: 'cancelled' })
                .eq('id', bookingId);

              if (updateError) {
                console.error('Error cancelling booking:', updateError);
                Alert.alert('Erreur', 'Impossible d\'annuler la réservation');
                return;
              }

              // Restore seats if booking was pending
              if (booking.status === 'pending' && booking.ride) {
                const newSeatsAvailable = booking.ride.seats_available + booking.number_of_passengers;
                const { error: seatsError } = await supabase
                  .from('carpool_rides')
                  .update({ seats_available: newSeatsAvailable })
                  .eq('id', booking.ride_id);

                if (seatsError) {
                  console.error('Error restoring seats:', seatsError);
                }
              }

              Alert.alert('Succès', 'Réservation annulée.');
              loadBookings();
            } catch (error) {
              console.error('Error in handleCancelReservation:', error);
              Alert.alert('Erreur', 'Une erreur est survenue');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return colors.primary;
      case 'refused':
      case 'cancelled':
        return colors.accent;
      default:
        return '#FF8C00';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Acceptée';
      case 'refused':
        return 'Refusée';
      case 'cancelled':
        return 'Annulée';
      default:
        return 'En attente';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return { ios: 'checkmark.circle.fill', android: 'check-circle' };
      case 'refused':
      case 'cancelled':
        return { ios: 'xmark.circle.fill', android: 'cancel' };
      default:
        return { ios: 'clock.fill', android: 'schedule' };
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

  if (isLoading && !refreshing) {
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
            <Text style={styles.headerTitle}>Mes réservations</Text>
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: isDark ? colors.darkText : colors.text }]}>
            Chargement de vos réservations...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
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
            <Text style={styles.headerTitle}>Mes réservations</Text>
          </View>
        </View>

        <View style={styles.content}>
          <ErrorState message={error} onRetry={loadBookings} />
        </View>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Mes réservations</Text>
          <Text style={styles.headerSubtitle}>{bookings.length} réservation(s)</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.content}>
          {bookings.length === 0 ? (
            <EmptyState
              icon={{ ios: 'list.bullet', android: 'list' }}
              title="Aucune réservation"
              message="Recherchez un trajet pour commencer"
            />
          ) : (
            bookings.map((booking, index) => {
              const ride = booking.ride;
              if (!ride) {
                return (
                  <View
                    key={index}
                    style={[styles.reservationCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                  >
                    <Text style={[styles.errorText, { color: colors.accent }]}>
                      Trajet introuvable
                    </Text>
                  </View>
                );
              }

              const statusIcon = getStatusIcon(booking.status || 'pending');
              const { date, time } = formatDateTime(ride.departure_datetime);
              const maskedDriverPhone = maskPhoneNumber(ride.driver_phone);

              return (
                <View
                  key={index}
                  style={[styles.reservationCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                >
                  {/* Status Badge */}
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status || 'pending') }]}>
                    <IconSymbol
                      ios_icon_name={statusIcon.ios}
                      android_material_icon_name={statusIcon.android}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.statusText}>{getStatusText(booking.status || 'pending')}</Text>
                  </View>

                  {/* Route */}
                  <View style={styles.routeSection}>
                    <View style={styles.routeContainer}>
                      <Text style={[styles.cityText, { color: isDark ? colors.darkText : colors.text }]}>
                        {ride.departure_city}
                      </Text>
                      <IconSymbol
                        ios_icon_name="arrow.right"
                        android_material_icon_name="arrow-forward"
                        size={20}
                        color={colors.primary}
                      />
                      <Text style={[styles.cityText, { color: isDark ? colors.darkText : colors.text }]}>
                        {ride.arrival_city}
                      </Text>
                    </View>
                  </View>

                  {/* Details */}
                  <View style={styles.detailsSection}>
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
                        ios_icon_name="person.fill"
                        android_material_icon_name="person"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        Conducteur: {ride.driver_name}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <IconSymbol
                        ios_icon_name="phone.fill"
                        android_material_icon_name="phone"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        Téléphone: {maskedDriverPhone}
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
                        {booking.number_of_passengers} passager(s)
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
                        {ride.price_per_seat * booking.number_of_passengers} FCFA
                      </Text>
                    </View>
                  </View>

                  {/* Contact Buttons - Only show for accepted reservations */}
                  {booking.status === 'accepted' && (
                    <View style={styles.contactSection}>
                      <Text style={[styles.contactTitle, { color: isDark ? colors.darkText : colors.text }]}>
                        Contacter le conducteur
                      </Text>
                      <ContactButtons
                        phoneNumber={ride.driver_phone}
                        userName={ride.driver_name}
                      />
                    </View>
                  )}

                  {/* Cancel Button */}
                  {booking.status === 'pending' && (
                    <TouchableOpacity
                      style={[styles.cancelButton, { backgroundColor: colors.accent }]}
                      onPress={() => handleCancelReservation(booking.id, booking)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelButtonText}>Annuler la réservation</Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  reservationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
    gap: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
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
  errorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  contactSection: {
    marginTop: 8,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  cancelButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
