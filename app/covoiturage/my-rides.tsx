
import React, { useEffect, useCallback } from 'react';
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
import VerifiedDriverBadge from '@/components/VerifiedDriverBadge';
import ContactButtons from '@/components/ContactButtons';
import { maskPhoneNumber } from '@/utils/phoneUtils';
import { supabase } from '@/app/integrations/supabase/client';

export default function MyRidesScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { rides, getReservationsByRide, updateReservationStatus, cancelRide, startRide, markDriverArrived, isLoading, refreshData } = useCovoiturage();
  const { sendLocalNotification, registerForPushNotifications } = useNotifications();
  const [refreshing, setRefreshing] = React.useState(false);
  const [cancellingRideId, setCancellingRideId] = React.useState<string | null>(null);
  const [startingRideId, setStartingRideId] = React.useState<string | null>(null);
  const [arrivingRideId, setArrivingRideId] = React.useState<string | null>(null);
  const [passengerPhones, setPassengerPhones] = React.useState<{ [key: string]: string }>({});
  const [isMounted, setIsMounted] = React.useState(false);

  const registerNotifications = useCallback(() => {
    try {
      registerForPushNotifications();
    } catch (error) {
      console.error('[my-rides] Error registering for push notifications:', error);
    }
  }, [registerForPushNotifications]);

  useEffect(() => {
    setIsMounted(true);
    // Register for push notifications when screen loads
    registerNotifications();
    
    return () => {
      setIsMounted(false);
    };
  }, [registerNotifications]);

  useEffect(() => {
    if (isMounted) {
      loadPassengerPhones();
    }
  }, [isMounted]);

  const loadPassengerPhones = async () => {
    try {
      console.log('[my-rides] Loading passenger phones...');
      // Fetch all bookings to get passenger phone numbers
      const { data: bookings, error } = await supabase
        .from('carpool_bookings')
        .select('id, passenger_phone');

      if (error) {
        console.error('[my-rides] Error fetching passenger phones:', error);
        return;
      }

      if (bookings && Array.isArray(bookings)) {
        const phoneMap: { [key: string]: string } = {};
        bookings.forEach(booking => {
          if (booking && booking.id && booking.passenger_phone) {
            phoneMap[booking.id] = booking.passenger_phone;
          }
        });
        if (isMounted) {
          setPassengerPhones(phoneMap);
        }
        console.log('[my-rides] Loaded passenger phones:', Object.keys(phoneMap).length);
      }
    } catch (error) {
      console.error('[my-rides] Error loading passenger phones:', error);
    }
  };

  const handleRefresh = async () => {
    console.log('[my-rides] Refreshing data...');
    setRefreshing(true);
    try {
      await refreshData();
      await loadPassengerPhones();
    } catch (error) {
      console.error('[my-rides] Error refreshing data:', error);
    } finally {
      setTimeout(() => {
        if (isMounted) {
          setRefreshing(false);
        }
      }, 1000);
    }
  };

  // Safely get rides array with null checks
  const myRides = React.useMemo(() => {
    if (!Array.isArray(rides)) {
      console.warn('[my-rides] Rides is not an array:', rides);
      return [];
    }
    return rides.filter(ride => ride && ride.id);
  }, [rides]);

  console.log('[my-rides] Total rides:', myRides.length);

  const handleAcceptReservation = async (reservationId: string, passengerName: string) => {
    if (!reservationId || !passengerName) {
      console.error('[my-rides] Invalid reservation data');
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Voulez-vous accepter la réservation de ${passengerName} ?`);
      if (!confirmed) return;

      try {
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
      } catch (error) {
        console.error('[my-rides] Error accepting reservation:', error);
        window.alert('Une erreur est survenue');
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
              try {
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
              } catch (error) {
                console.error('[my-rides] Error accepting reservation:', error);
                Alert.alert('Erreur', 'Une erreur est survenue');
              }
            },
          },
        ]
      );
    }
  };

  const handleRefuseReservation = async (reservationId: string, passengerName: string) => {
    if (!reservationId || !passengerName) {
      console.error('[my-rides] Invalid reservation data');
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Voulez-vous refuser la réservation de ${passengerName} ?`);
      if (!confirmed) return;

      try {
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
      } catch (error) {
        console.error('[my-rides] Error refusing reservation:', error);
        window.alert('Une erreur est survenue');
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
              try {
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
              } catch (error) {
                console.error('[my-rides] Error refusing reservation:', error);
                Alert.alert('Erreur', 'Une erreur est survenue');
              }
            },
          },
        ]
      );
    }
  };

  const handleDriverArrived = async (rideId: string) => {
    if (!rideId) {
      console.error('[my-rides] Invalid ride ID');
      return;
    }

    console.log('[my-rides] === handleDriverArrived CALLED ===');
    console.log('[my-rides] Ride ID:', rideId);

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Confirmez-vous que vous êtes arrivé au point de rencontre ?');
      
      if (!confirmed) {
        console.log('[my-rides] User cancelled the action');
        return;
      }

      try {
        console.log('[my-rides] Marking driver as arrived...');
        setArrivingRideId(rideId);

        const result = await markDriverArrived(rideId);

        console.log('[my-rides] Arrival result:', result);
        if (isMounted) {
          setArrivingRideId(null);
        }

        if (result.success) {
          window.alert('Les passagers ont été notifiés de votre arrivée.');
          await refreshData();
        } else {
          window.alert(result.message || 'Impossible de notifier les passagers');
        }
      } catch (error) {
        console.error('[my-rides] Error in handleDriverArrived:', error);
        if (isMounted) {
          setArrivingRideId(null);
        }
        window.alert('Une erreur est survenue');
      }
    } else {
      Alert.alert(
        'Je suis arrivé',
        'Confirmez-vous que vous êtes arrivé au point de rencontre ?',
        [
          { text: 'Non', style: 'cancel' },
          {
            text: 'Oui, je suis arrivé',
            onPress: async () => {
              try {
                console.log('[my-rides] User confirmed arrival for ride:', rideId);
                setArrivingRideId(rideId);

                const result = await markDriverArrived(rideId);

                if (isMounted) {
                  setArrivingRideId(null);
                }

                if (result.success) {
                  Alert.alert('Succès', 'Les passagers ont été notifiés de votre arrivée.');
                  await refreshData();
                } else {
                  Alert.alert('Erreur', result.message || 'Impossible de notifier les passagers');
                }
              } catch (error) {
                console.error('[my-rides] Error in handleDriverArrived:', error);
                if (isMounted) {
                  setArrivingRideId(null);
                }
                Alert.alert('Erreur', 'Une erreur est survenue');
              }
            },
          },
        ]
      );
    }
  };

  const handleStartRide = async (rideId: string) => {
    if (!rideId) {
      console.error('[my-rides] Invalid ride ID');
      return;
    }

    console.log('[my-rides] === handleStartRide CALLED ===');
    console.log('[my-rides] Ride ID:', rideId);

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Voulez-vous démarrer ce trajet ?');
      
      if (!confirmed) {
        console.log('[my-rides] User cancelled the action');
        return;
      }

      try {
        console.log('[my-rides] Starting ride...');
        setStartingRideId(rideId);

        const result = await startRide(rideId);

        console.log('[my-rides] Start result:', result);
        if (isMounted) {
          setStartingRideId(null);
        }

        if (result.success) {
          window.alert('Trajet démarré ! Les passagers ont été notifiés.');
          await refreshData();
        } else {
          window.alert(result.message || 'Impossible de démarrer le trajet');
        }
      } catch (error) {
        console.error('[my-rides] Error in handleStartRide:', error);
        if (isMounted) {
          setStartingRideId(null);
        }
        window.alert('Une erreur est survenue lors du démarrage du trajet');
      }
    } else {
      Alert.alert(
        'Démarrer le trajet',
        'Voulez-vous démarrer ce trajet ?',
        [
          { text: 'Non', style: 'cancel' },
          {
            text: 'Oui, démarrer',
            onPress: async () => {
              try {
                console.log('[my-rides] User confirmed start for ride:', rideId);
                setStartingRideId(rideId);

                const result = await startRide(rideId);

                if (isMounted) {
                  setStartingRideId(null);
                }

                if (result.success) {
                  Alert.alert('Succès', 'Trajet démarré ! Les passagers ont été notifiés.');
                  await refreshData();
                } else {
                  Alert.alert('Erreur', result.message || 'Impossible de démarrer le trajet');
                }
              } catch (error) {
                console.error('[my-rides] Error in handleStartRide:', error);
                if (isMounted) {
                  setStartingRideId(null);
                }
                Alert.alert('Erreur', 'Une erreur est survenue lors du démarrage du trajet');
              }
            },
          },
        ]
      );
    }
  };

  const handleCancelRide = async (rideId: string, rideDetails: any) => {
    if (!rideId || !rideDetails) {
      console.error('[my-rides] Invalid ride data');
      return;
    }

    console.log('[my-rides] === handleCancelRide CALLED ===');
    console.log('[my-rides] Platform:', Platform.OS);
    console.log('[my-rides] Ride ID:', rideId);

    if (Platform.OS === 'web') {
      // Use native browser confirm for web
      const confirmed = window.confirm(
        'Êtes-vous sûr de vouloir annuler ce trajet ? Toutes les réservations seront refusées et les passagers seront notifiés.'
      );
      
      console.log('[my-rides] User confirmation (web):', confirmed);
      
      if (!confirmed) {
        console.log('[my-rides] User cancelled the action');
        return;
      }

      try {
        console.log('[my-rides] Starting cancellation process...');
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

        console.log('[my-rides] Cancel result:', result);
        if (isMounted) {
          setCancellingRideId(null);
        }

        if (result.success) {
          window.alert('Trajet annulé. Les passagers ont été notifiés.');
          await refreshData();
        } else {
          window.alert(result.message || 'Impossible d\'annuler le trajet');
        }
      } catch (error) {
        console.error('[my-rides] Error in handleCancelRide:', error);
        if (isMounted) {
          setCancellingRideId(null);
        }
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
                console.log('[my-rides] User confirmed cancellation for ride:', rideId);
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

                if (isMounted) {
                  setCancellingRideId(null);
                }

                if (result.success) {
                  Alert.alert('Succès', 'Trajet annulé. Les passagers ont été notifiés.');
                  await refreshData();
                } else {
                  Alert.alert('Erreur', result.message || 'Impossible d\'annuler le trajet');
                }
              } catch (error) {
                console.error('[my-rides] Error in handleCancelRide:', error);
                if (isMounted) {
                  setCancellingRideId(null);
                }
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
              // Safely get reservations with error handling
              let reservations = [];
              try {
                if (ride && ride.id) {
                  reservations = getReservationsByRide(ride.id) || [];
                }
              } catch (error) {
                console.error('[my-rides] Error getting reservations for ride:', ride?.id, error);
                reservations = [];
              }

              const isFull = ride.availableSeats === 0;
              const isCancelled = ride.status === 'cancelled';
              const isCancelling = cancellingRideId === ride.id;
              const isStarting = startingRideId === ride.id;
              const isArriving = arrivingRideId === ride.id;
              const rideStatus = ride.rideStatus || 'pending';
              const isStarted = rideStatus === 'started';
              const isEnded = rideStatus === 'ended';

              return (
                <View
                  key={`ride-${ride.id}-${index}`}
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
                        {ride.departureCity || 'N/A'}
                      </Text>
                      <IconSymbol
                        ios_icon_name="arrow.right"
                        android_material_icon_name="arrow-forward"
                        size={20}
                        color={colors.primary}
                      />
                      <Text style={[styles.cityText, { color: isDark ? colors.darkText : colors.text }]}>
                        {ride.arrivalCity || 'N/A'}
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

                  {/* Verified Driver Badge */}
                  <VerifiedDriverBadge
                    isVerified={true}
                    memberSince="2024"
                    ridesPublished={myRides.length}
                  />

                  <View style={styles.rideDetails}>
                    <View style={styles.detailRow}>
                      <IconSymbol
                        ios_icon_name="calendar"
                        android_material_icon_name="calendar-today"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {ride.date ? new Date(ride.date).toLocaleDateString('fr-FR') : 'N/A'} à {ride.time || 'N/A'}
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
                        {ride.availableSeats || 0} / {ride.totalSeats || 0} places disponibles
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
                        {ride.pricePerPassenger || 0} FCFA / place
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  {!isCancelled && !isEnded && (
                    <View style={styles.actionButtonsContainer}>
                      {!isStarted && (
                        <React.Fragment>
                          <TouchableOpacity
                            style={[
                              styles.arrivedButton, 
                              { 
                                backgroundColor: '#4CAF50',
                                opacity: isArriving ? 0.5 : 1,
                              }
                            ]}
                            onPress={() => {
                              console.log('[my-rides] Driver arrived button pressed for ride:', ride.id);
                              handleDriverArrived(ride.id);
                            }}
                            activeOpacity={0.7}
                            disabled={isArriving}
                          >
                            {isArriving ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <React.Fragment>
                                <IconSymbol
                                  ios_icon_name="location.fill"
                                  android_material_icon_name="location-on"
                                  size={16}
                                  color="#FFFFFF"
                                />
                                <Text style={[styles.arrivedButtonText, { color: '#FFFFFF' }]}>
                                  Je suis arrivé
                                </Text>
                              </React.Fragment>
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.startTripButton, 
                              { 
                                backgroundColor: colors.primary,
                                opacity: isStarting ? 0.5 : 1,
                              }
                            ]}
                            onPress={() => {
                              console.log('[my-rides] Start trip button pressed for ride:', ride.id);
                              handleStartRide(ride.id);
                            }}
                            activeOpacity={0.7}
                            disabled={isStarting}
                          >
                            {isStarting ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <React.Fragment>
                                <IconSymbol
                                  ios_icon_name="play.circle.fill"
                                  android_material_icon_name="play-circle"
                                  size={16}
                                  color="#FFFFFF"
                                />
                                <Text style={[styles.startTripButtonText, { color: '#FFFFFF' }]}>
                                  Démarrer le trajet
                                </Text>
                              </React.Fragment>
                            )}
                          </TouchableOpacity>
                        </React.Fragment>
                      )}

                      {isStarted && (
                        <React.Fragment>
                          <TouchableOpacity
                            style={[
                              styles.trackingButton, 
                              { 
                                backgroundColor: '#2196F3',
                              }
                            ]}
                            onPress={() => {
                              console.log('[my-rides] Tracking button pressed for ride:', ride.id);
                              router.push({
                                pathname: '/covoiturage/ride-tracking',
                                params: {
                                  rideId: ride.id,
                                  driverId: ride.driverId,
                                  plannedDistance: ride.distanceKm || 0,
                                  departureLat: ride.departureLat || 0,
                                  departureLng: ride.departureLng || 0,
                                  arrivalLat: ride.arrivalLat || 0,
                                  arrivalLng: ride.arrivalLng || 0,
                                },
                              });
                            }}
                            activeOpacity={0.7}
                          >
                            <IconSymbol
                              ios_icon_name="location.fill"
                              android_material_icon_name="my-location"
                              size={16}
                              color="#FFFFFF"
                            />
                            <Text style={[styles.trackingButtonText, { color: '#FFFFFF' }]}>
                              Suivi GPS
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.endTripButton, 
                              { 
                                backgroundColor: colors.primary,
                              }
                            ]}
                            onPress={() => {
                              console.log('[my-rides] End trip button pressed for ride:', ride.id);
                              router.push(`/covoiturage/end-trip-payment?rideId=${ride.id}`);
                            }}
                            activeOpacity={0.7}
                          >
                            <IconSymbol
                              ios_icon_name="checkmark.circle.fill"
                              android_material_icon_name="check-circle"
                              size={16}
                              color="#FFFFFF"
                            />
                            <Text style={[styles.endTripButtonText, { color: '#FFFFFF' }]}>
                              Terminer le trajet
                            </Text>
                          </TouchableOpacity>
                        </React.Fragment>
                      )}

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
                          console.log('[my-rides] Cancel button pressed for ride:', ride.id);
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
                    </View>
                  )}

                  {/* Reservations */}
                  {reservations.length > 0 && (
                    <View style={styles.reservationsSection}>
                      <Text style={[styles.reservationsTitle, { color: isDark ? colors.darkText : colors.text }]}>
                        Réservations ({reservations.length})
                      </Text>

                      {reservations.map((reservation, resIndex) => {
                        if (!reservation || !reservation.id) {
                          return null;
                        }

                        const passengerPhone = passengerPhones[reservation.id] || '';
                        const maskedPhone = maskPhoneNumber(passengerPhone);

                        return (
                          <View
                            key={`reservation-${reservation.id}-${resIndex}`}
                            style={[
                              styles.reservationCard,
                              { backgroundColor: isDark ? colors.darkBackground : colors.background },
                            ]}
                          >
                            <View style={styles.reservationHeader}>
                              <Text style={[styles.passengerName, { color: isDark ? colors.darkText : colors.text }]}>
                                {reservation.passengerName || 'N/A'}
                              </Text>
                              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) + '20' }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(reservation.status) }]}>
                                  {getStatusText(reservation.status)}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.passengerDetails}>
                              <View style={styles.detailRow}>
                                <IconSymbol
                                  ios_icon_name="person.2.fill"
                                  android_material_icon_name="people"
                                  size={14}
                                  color={colors.textSecondary}
                                />
                                <Text style={[styles.passengersCount, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                                  {reservation.numberOfPassengers || 0} passager(s)
                                </Text>
                              </View>

                              {passengerPhone && (
                                <View style={styles.detailRow}>
                                  <IconSymbol
                                    ios_icon_name="phone.fill"
                                    android_material_icon_name="phone"
                                    size={14}
                                    color={colors.textSecondary}
                                  />
                                  <Text style={[styles.passengersCount, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                                    {maskedPhone}
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* Contact Buttons - Only show for accepted reservations */}
                            {reservation.status === 'accepted' && passengerPhone && (
                              <View style={styles.contactSection}>
                                <ContactButtons
                                  phoneNumber={passengerPhone}
                                  userName={reservation.passengerName}
                                  compact={true}
                                />
                              </View>
                            )}

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
                        );
                      })}
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
  actionButtonsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  arrivedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  arrivedButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  startTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  startTripButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  trackingButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  endTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  endTripButtonText: {
    fontSize: 14,
    fontWeight: '700',
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
    marginBottom: 8,
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
  passengerDetails: {
    gap: 6,
    marginBottom: 8,
  },
  passengersCount: {
    fontSize: 13,
  },
  contactSection: {
    marginTop: 8,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-start',
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
