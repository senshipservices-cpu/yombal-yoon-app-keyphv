
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useCovoiturage } from '@/contexts/CovoiturageContext';
import { useNotifications } from '@/contexts/NotificationContext';

export default function MyRidesScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { rides, getReservationsByRide, updateReservationStatus, cancelRide, isLoading, refreshData } = useCovoiturage();
  const { sendLocalNotification, registerForPushNotifications } = useNotifications();
  const [refreshing, setRefreshing] = React.useState(false);
  const [cancellingRideId, setCancellingRideId] = React.useState<string | null>(null);

  useEffect(() => {
    // Register for push notifications when screen loads
    registerForPushNotifications();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // For demo purposes, we'll show all rides. In production, filter by driverId
  const myRides = rides;

  const handleAcceptReservation = async (reservationId: string, passengerName: string) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Voulez-vous accepter la réservation de ${passengerName} ?`);
      if (!confirmed) return;

      const result = await updateReservationStatus(
        reservationId,
        'accepted',
        (type, passengerId, rideDetails) => {
          // Send notification to passenger
          sendLocalNotification(
            'Réservation acceptée ! 🎉',
            `Votre réservation pour ${rideDetails.ride.departureCity} → ${rideDetails.ride.arrivalCity} a été acceptée`,
            { type, reservationId, ...rideDetails }
          );
        }
      );

      if (result.success) {
        window.alert('Réservation acceptée !');
        await refreshData();
      } else {
        window.alert(result.message || 'Impossible d\'accepter la réservation');
      }
    } else {
      Alert.alert(
        'Accepter la réservation',
        `Voulez-vous accepter la réservation de ${passengerName} ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Accepter',
            onPress: async () => {
              const result = await updateReservationStatus(
                reservationId,
                'accepted',
                (type, passengerId, rideDetails) => {
                  // Send notification to passenger
                  sendLocalNotification(
                    'Réservation acceptée ! 🎉',
                    `Votre réservation pour ${rideDetails.ride.departureCity} → ${rideDetails.ride.arrivalCity} a été acceptée`,
                    { type, reservationId, ...rideDetails }
                  );
                }
              );

              if (result.success) {
                Alert.alert('Succès', 'Réservation acceptée !');
                await refreshData();
              } else {
                Alert.alert('Erreur', result.message || 'Impossible d\'accepter la réservation');
              }
            },
          },
        ]
      );
    }
  };

  const handleRefuseReservation = async (reservationId: string, passengerName: string) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Voulez-vous refuser la réservation de ${passengerName} ?`);
      if (!confirmed) return;

      const result = await updateReservationStatus(
        reservationId,
        'refused',
        (type, passengerId, rideDetails) => {
          // Send notification to passenger
          sendLocalNotification(
            'Réservation refusée',
            `Votre réservation pour ${rideDetails.ride.departureCity} → ${rideDetails.ride.arrivalCity} a été refusée`,
            { type, reservationId, ...rideDetails }
          );
        }
      );

      if (result.success) {
        window.alert('Réservation refusée.');
        await refreshData();
      } else {
        window.alert(result.message || 'Impossible de refuser la réservation');
      }
    } else {
      Alert.alert(
        'Refuser la réservation',
        `Voulez-vous refuser la réservation de ${passengerName} ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Refuser',
            style: 'destructive',
            onPress: async () => {
              const result = await updateReservationStatus(
                reservationId,
                'refused',
                (type, passengerId, rideDetails) => {
                  // Send notification to passenger
                  sendLocalNotification(
                    'Réservation refusée',
                    `Votre réservation pour ${rideDetails.ride.departureCity} → ${rideDetails.ride.arrivalCity} a été refusée`,
                    { type, reservationId, ...rideDetails }
                  );
                }
              );

              if (result.success) {
                Alert.alert('Succès', 'Réservation refusée.');
                await refreshData();
              } else {
                Alert.alert('Erreur', result.message || 'Impossible de refuser la réservation');
              }
            },
          },
        ]
      );
    }
  };

  const handleCancelRide = async (rideId: string, rideDetails: any) => {
    console.log('=== handleCancelRide CALLED ===');
    console.log('Platform:', Platform.OS);
    console.log('Ride ID:', rideId);
    console.log('Ride details:', rideDetails);

    if (Platform.OS === 'web') {
      // Use native browser confirm for web
      const confirmed = window.confirm(
        'Êtes-vous sûr de vouloir annuler ce trajet ? Toutes les réservations seront refusées et les passagers seront notifiés.'
      );
      
      console.log('User confirmation (web):', confirmed);
      
      if (!confirmed) {
        console.log('User cancelled the action');
        return;
      }

      try {
        console.log('Starting cancellation process...');
        setCancellingRideId(rideId);

        const result = await cancelRide(rideId, (type, passengerIds, details) => {
          // Send notification to all passengers
          passengerIds.forEach(() => {
            sendLocalNotification(
              'Trajet annulé ⚠️',
              `Le trajet ${details.ride.departureCity} → ${details.ride.arrivalCity} du ${new Date(details.ride.date).toLocaleDateString('fr-FR')} a été annulé par le conducteur`,
              { type, rideId, ...details }
            );
          });
        });

        console.log('Cancel result:', result);
        setCancellingRideId(null);

        if (result.success) {
          window.alert('Trajet annulé. Les passagers ont été notifiés.');
          await refreshData();
        } else {
          window.alert(result.message || 'Impossible d\'annuler le trajet');
        }
      } catch (error) {
        console.error('Error in handleCancelRide:', error);
        setCancellingRideId(null);
        window.alert('Une erreur est survenue lors de l\'annulation du trajet');
      }
    } else {
      // Native Alert for iOS/Android
      Alert.alert(
        'Annuler le trajet',
        'Êtes-vous sûr de vouloir annuler ce trajet ? Toutes les réservations seront refusées et les passagers seront notifiés.',
        [
          { text: 'Non', style: 'cancel' },
          {
            text: 'Oui, annuler',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('User confirmed cancellation for ride:', rideId);
                setCancellingRideId(rideId);

                const result = await cancelRide(rideId, (type, passengerIds, details) => {
                  // Send notification to all passengers
                  passengerIds.forEach(() => {
                    sendLocalNotification(
                      'Trajet annulé ⚠️',
                      `Le trajet ${details.ride.departureCity} → ${details.ride.arrivalCity} du ${new Date(details.ride.date).toLocaleDateString('fr-FR')} a été annulé par le conducteur`,
                      { type, rideId, ...details }
                    );
                  });
                });

                setCancellingRideId(null);

                if (result.success) {
                  Alert.alert('Succès', 'Trajet annulé. Les passagers ont été notifiés.');
                  await refreshData();
                } else {
                  Alert.alert('Erreur', result.message || 'Impossible d\'annuler le trajet');
                }
              } catch (error) {
                console.error('Error in handleCancelRide:', error);
                setCancellingRideId(null);
                Alert.alert('Erreur', 'Une erreur est survenue lors de l\'annulation du trajet');
              }
            },
          },
        ]
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return colors.primary;
      case 'refused':
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
      default:
        return 'En attente';
    }
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
          <Text style={styles.headerTitle}>Mes trajets publiés</Text>
          <Text style={styles.headerSubtitle}>{myRides.length} trajet(s)</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: isDark ? colors.darkText : colors.text }]}>
                Chargement des trajets...
              </Text>
            </View>
          ) : myRides.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
              <IconSymbol
                ios_icon_name="car.fill"
                android_material_icon_name="directions-car"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: isDark ? colors.darkText : colors.text }]}>
                Aucun trajet publié
              </Text>
              <Text style={[styles.emptySubtext, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Publiez votre premier trajet pour commencer
              </Text>
            </View>
          ) : (
            myRides.map((ride, index) => {
              const reservations = getReservationsByRide(ride.id);
              const isFull = ride.availableSeats === 0;
              const isCancelled = ride.status === 'cancelled';
              const isCancelling = cancellingRideId === ride.id;

              return (
                <View
                  key={index}
                  style={[
                    styles.rideCard,
                    { backgroundColor: isDark ? colors.darkCard : colors.card },
                    isCancelled && styles.cancelledCard,
                  ]}
                >
                  {/* Ride Info */}
                  <View style={styles.rideHeader}>
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
                    {isCancelled ? (
                      <View style={[styles.badge, { backgroundColor: '#999' }]}>
                        <Text style={styles.badgeText}>Annulé</Text>
                      </View>
                    ) : isFull ? (
                      <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                        <Text style={styles.badgeText}>Complet</Text>
                      </View>
                    ) : null}
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
                        {ride.availableSeats} / {ride.totalSeats} places disponibles
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
                        {ride.pricePerPassenger} FCFA / place
                      </Text>
                    </View>
                  </View>

                  {/* Cancel Ride Button */}
                  {!isCancelled && (
                    <TouchableOpacity
                      style={[
                        styles.cancelRideButton, 
                        { 
                          backgroundColor: colors.accent + '20', 
                          borderColor: colors.accent,
                          opacity: isCancelling ? 0.5 : 1,
                          cursor: Platform.OS === 'web' ? 'pointer' : undefined,
                        }
                      ]}
                      onPress={() => {
                        console.log('Cancel button pressed for ride:', ride.id);
                        handleCancelRide(ride.id, ride);
                      }}
                      activeOpacity={0.7}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <ActivityIndicator size="small" color={colors.accent} />
                      ) : (
                        <React.Fragment>
                          <IconSymbol
                            ios_icon_name="xmark.circle"
                            android_material_icon_name="cancel"
                            size={16}
                            color={colors.accent}
                          />
                          <Text style={[styles.cancelRideButtonText, { color: colors.accent }]}>
                            Annuler le trajet
                          </Text>
                        </React.Fragment>
                      )}
                    </TouchableOpacity>
                  )}

                  {/* Reservations */}
                  {reservations.length > 0 && (
                    <View style={styles.reservationsSection}>
                      <Text style={[styles.reservationsTitle, { color: isDark ? colors.darkText : colors.text }]}>
                        Réservations ({reservations.length})
                      </Text>

                      {reservations.map((reservation, resIndex) => (
                        <View
                          key={resIndex}
                          style={[
                            styles.reservationCard,
                            { backgroundColor: isDark ? colors.darkBackground : colors.background },
                          ]}
                        >
                          <View style={styles.reservationHeader}>
                            <Text style={[styles.passengerName, { color: isDark ? colors.darkText : colors.text }]}>
                              {reservation.passengerName}
                            </Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) + '20' }]}>
                              <Text style={[styles.statusText, { color: getStatusColor(reservation.status) }]}>
                                {getStatusText(reservation.status)}
                              </Text>
                            </View>
                          </View>

                          <Text style={[styles.passengersCount, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                            {reservation.numberOfPassengers} passager(s)
                          </Text>

                          {reservation.status === 'pending' && !isCancelled && (
                            <View style={styles.actionButtons}>
                              <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                                onPress={() => handleAcceptReservation(reservation.id, reservation.passengerName)}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.actionButtonText}>Accepter</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.accent }]}
                                onPress={() => handleRefuseReservation(reservation.id, reservation.passengerName)}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.actionButtonText}>Refuser</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
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
  cancelledCard: {
    opacity: 0.6,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  rideDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  cancelRideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  cancelRideButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reservationsSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    marginTop: 8,
  },
  reservationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  reservationCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  passengerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  passengersCount: {
    fontSize: 13,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
