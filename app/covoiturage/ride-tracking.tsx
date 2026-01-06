
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Location from 'expo-location';
import {
  requestLocationPermissions,
  initializeRideTracking,
  startRideTracking,
  addTrackingPoint,
  verifyDeparture,
  verifyDestination,
  completeRideTracking,
  confirmPassengerBoarding,
  getRideTrackingData,
  generatePassengerQRCode,
  isWithinGeofence,
  type RideTrackingData,
} from '@/utils/rideTrackingUtils';
import { supabase } from '@/app/integrations/supabase/client';
import {
  updateTripShareLocation,
  getActiveTripShares,
} from '@/utils/tripSharingUtils';

export default function RideTrackingScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const rideId = params.rideId as string;
  const driverId = params.driverId as string;
  const plannedDistance = parseFloat(params.plannedDistance as string) || 0;
  const departureLat = parseFloat(params.departureLat as string);
  const departureLng = parseFloat(params.departureLng as string);
  const arrivalLat = parseFloat(params.arrivalLat as string);
  const arrivalLng = parseFloat(params.arrivalLng as string);

  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [trackingData, setTrackingData] = useState<RideTrackingData | null>(null);
  const [departureVerified, setDepartureVerified] = useState(false);
  const [destinationVerified, setDestinationVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedBookings, setAcceptedBookings] = useState<any[]>([]);
  const [confirmedPassengers, setConfirmedPassengers] = useState<Set<string>>(new Set());

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);

  // Load accepted bookings
  useEffect(() => {
    loadAcceptedBookings();
  }, [rideId]);

  const loadAcceptedBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('carpool_bookings')
        .select('*')
        .eq('ride_id', rideId)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error loading bookings:', error);
        return;
      }

      setAcceptedBookings(data || []);
    } catch (error) {
      console.error('Error in loadAcceptedBookings:', error);
    }
  };

  // Initialize tracking
  useEffect(() => {
    initializeTracking();
    return () => {
      stopTracking();
    };
  }, []);

  const initializeTracking = async () => {
    try {
      setIsLoading(true);

      // Request permissions
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission requise',
          'L\'accès à la localisation est nécessaire pour le suivi du trajet.'
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCurrentLocation(location);

      // Initialize tracking record
      const expectedPassengers = acceptedBookings.reduce(
        (sum, booking) => sum + (booking.number_of_passengers || 0),
        0
      );

      const result = await initializeRideTracking(
        rideId,
        driverId,
        plannedDistance,
        expectedPassengers
      );

      if (result.success && result.trackingId) {
        setTrackingId(result.trackingId);
        
        // Load tracking data
        const trackingResult = await getRideTrackingData(rideId);
        if (trackingResult.success && trackingResult.data) {
          setTrackingData(trackingResult.data);
        }
      }
    } catch (error) {
      console.error('Error initializing tracking:', error);
      Alert.alert('Erreur', 'Impossible d\'initialiser le suivi du trajet');
    } finally {
      setIsLoading(false);
    }
  };

  const startTracking = async () => {
    if (!trackingId) {
      Alert.alert('Erreur', 'Le suivi n\'est pas initialisé');
      return;
    }

    try {
      setIsLoading(true);

      // Start tracking in database
      const result = await startRideTracking(trackingId);
      if (!result.success) {
        throw new Error('Failed to start tracking');
      }

      // Start location updates
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // 10 seconds
          distanceInterval: 50, // 50 meters
        },
        (location) => {
          setCurrentLocation(location);
          handleLocationUpdate(location);
        }
      );

      setIsTracking(true);
      Alert.alert('Suivi démarré', 'Le suivi GPS du trajet est maintenant actif');
    } catch (error) {
      console.error('Error starting tracking:', error);
      Alert.alert('Erreur', 'Impossible de démarrer le suivi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationUpdate = async (location: Location.LocationObject) => {
    if (!trackingId) return;

    try {
      // Add tracking point
      await addTrackingPoint(trackingId, location);

      // Update trip share locations (for passengers sharing their trip)
      // TODO: Backend Integration - Update trip share locations in real-time
      const sharesResult = await getActiveTripShares(driverId);
      if (sharesResult.success && sharesResult.shares) {
        for (const share of sharesResult.shares) {
          if (share.ride_id === rideId) {
            await updateTripShareLocation(
              share.id,
              rideId,
              location,
              'en_route'
            );
          }
        }
      }

      // Check departure geofence
      if (!departureVerified && departureLat && departureLng) {
        const inDepartureZone = isWithinGeofence(
          location.coords.latitude,
          location.coords.longitude,
          departureLat,
          departureLng
        );

        if (inDepartureZone) {
          const result = await verifyDeparture(
            trackingId,
            location.coords.latitude,
            location.coords.longitude,
            departureLat,
            departureLng
          );

          if (result.success && result.verified) {
            setDepartureVerified(true);
            Alert.alert('✅ Départ vérifié', 'Vous êtes au point de départ');
          }
        }
      }

      // Check destination geofence
      if (!destinationVerified && arrivalLat && arrivalLng) {
        const inDestinationZone = isWithinGeofence(
          location.coords.latitude,
          location.coords.longitude,
          arrivalLat,
          arrivalLng
        );

        if (inDestinationZone) {
          const result = await verifyDestination(
            trackingId,
            location.coords.latitude,
            location.coords.longitude,
            arrivalLat,
            arrivalLng
          );

          if (result.success && result.verified) {
            setDestinationVerified(true);
            Alert.alert('✅ Arrivée vérifiée', 'Vous êtes au point d\'arrivée');
          }
        }
      }

      // Reload tracking data
      const trackingResult = await getRideTrackingData(rideId);
      if (trackingResult.success && trackingResult.data) {
        setTrackingData(trackingResult.data);
      }
    } catch (error) {
      console.error('Error handling location update:', error);
    }
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
      trackingInterval.current = null;
    }
    setIsTracking(false);
  };

  const handleConfirmPassenger = async (booking: any) => {
    try {
      const qrCode = generatePassengerQRCode(rideId, booking.id, booking.passenger_id);

      const result = await confirmPassengerBoarding(
        rideId,
        booking.id,
        booking.passenger_id,
        'driver',
        qrCode,
        currentLocation?.coords.latitude,
        currentLocation?.coords.longitude
      );

      if (result.success) {
        setConfirmedPassengers(prev => new Set(prev).add(booking.passenger_id));
        Alert.alert('✅ Passager confirmé', `${booking.passenger_name} a embarqué`);
        
        // Reload tracking data
        const trackingResult = await getRideTrackingData(rideId);
        if (trackingResult.success && trackingResult.data) {
          setTrackingData(trackingResult.data);
        }
      }
    } catch (error) {
      console.error('Error confirming passenger:', error);
      Alert.alert('Erreur', 'Impossible de confirmer le passager');
    }
  };

  const handleCompleteTracking = async () => {
    if (!trackingId) return;

    Alert.alert(
      'Terminer le suivi',
      'Voulez-vous terminer le suivi du trajet et effectuer la vérification finale ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Terminer',
          onPress: async () => {
            try {
              setIsLoading(true);
              stopTracking();

              const result = await completeRideTracking(trackingId);

              if (result.success) {
                Alert.alert(
                  result.verificationPassed ? '✅ Vérification réussie' : '⚠️ Vérification échouée',
                  result.verificationPassed
                    ? 'Le trajet a été vérifié avec succès'
                    : 'Le trajet n\'a pas passé tous les critères de vérification',
                  [
                    {
                      text: 'OK',
                      onPress: () => router.back(),
                    },
                  ]
                );
              }
            } catch (error) {
              console.error('Error completing tracking:', error);
              Alert.alert('Erreur', 'Impossible de terminer le suivi');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Suivi du trajet</Text>
          <Text style={styles.headerSubtitle}>
            {isTracking ? '🟢 Suivi actif' : '⚪ Suivi inactif'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Tracking Status */}
        <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
            État du suivi
          </Text>

          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <IconSymbol
                ios_icon_name={departureVerified ? 'checkmark.circle.fill' : 'circle'}
                android_material_icon_name={departureVerified ? 'check-circle' : 'radio-button-unchecked'}
                size={24}
                color={departureVerified ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.statusText, { color: isDark ? colors.darkText : colors.text }]}>
                Départ vérifié
              </Text>
            </View>

            <View style={styles.statusItem}>
              <IconSymbol
                ios_icon_name={destinationVerified ? 'checkmark.circle.fill' : 'circle'}
                android_material_icon_name={destinationVerified ? 'check-circle' : 'radio-button-unchecked'}
                size={24}
                color={destinationVerified ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.statusText, { color: isDark ? colors.darkText : colors.text }]}>
                Arrivée vérifiée
              </Text>
            </View>
          </View>

          {trackingData && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Distance parcourue
                </Text>
                <Text style={[styles.statValue, { color: isDark ? colors.darkText : colors.text }]}>
                  {trackingData.total_distance_tracked.toFixed(1)} km
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Distance prévue
                </Text>
                <Text style={[styles.statValue, { color: isDark ? colors.darkText : colors.text }]}>
                  {trackingData.planned_distance.toFixed(1)} km
                </Text>
              </View>

              {trackingData.distance_match_percentage > 0 && (
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Correspondance
                  </Text>
                  <Text style={[styles.statValue, { color: isDark ? colors.darkText : colors.text }]}>
                    {trackingData.distance_match_percentage.toFixed(0)}%
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Passenger Confirmations */}
        <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Passagers ({trackingData?.passengers_confirmed || 0}/{trackingData?.passengers_expected || 0})
          </Text>

          {acceptedBookings.map((booking) => (
            <View key={booking.id} style={styles.passengerItem}>
              <View style={styles.passengerInfo}>
                <IconSymbol
                  ios_icon_name="person.fill"
                  android_material_icon_name="person"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={[styles.passengerName, { color: isDark ? colors.darkText : colors.text }]}>
                  {booking.passenger_name}
                </Text>
                <Text style={[styles.passengerCount, { color: colors.textSecondary }]}>
                  ({booking.number_of_passengers} place{booking.number_of_passengers > 1 ? 's' : ''})
                </Text>
              </View>

              {confirmedPassengers.has(booking.passenger_id) ? (
                <View style={[styles.confirmedBadge, { backgroundColor: colors.primary + '20' }]}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={[styles.confirmedText, { color: colors.primary }]}>
                    Confirmé
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleConfirmPassenger(booking)}
                >
                  <Text style={styles.confirmButtonText}>Confirmer</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Current Location */}
        {currentLocation && (
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Position actuelle
            </Text>
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              Lat: {currentLocation.coords.latitude.toFixed(6)}
            </Text>
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              Lng: {currentLocation.coords.longitude.toFixed(6)}
            </Text>
            {currentLocation.coords.speed && (
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                Vitesse: {(currentLocation.coords.speed * 3.6).toFixed(0)} km/h
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionContainer, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
        {!isTracking ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={startTracking}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol
                  ios_icon_name="play.circle.fill"
                  android_material_icon_name="play-circle"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.actionButtonText}>Démarrer le suivi</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
            onPress={handleCompleteTracking}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.actionButtonText}>Terminer le suivi</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
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
    padding: 20,
    paddingBottom: 120,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statusItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  passengerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  passengerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  passengerCount: {
    fontSize: 13,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confirmedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 14,
    marginBottom: 4,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
