
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import {
  getTripShareByToken,
  type TripShareDetails,
} from '@/utils/tripSharingUtils';

export default function TripShareViewScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const params = useLocalSearchParams();

  const shareToken = params.token as string;

  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState<TripShareDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadTripDetails();

    // Auto-refresh every 10 seconds
    refreshInterval.current = setInterval(() => {
      loadTripDetails(true);
    }, 10000);

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [shareToken]);

  const loadTripDetails = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
        setError(null);
      }

      const result = await getTripShareByToken(shareToken);

      if (result.success && result.details) {
        setDetails(result.details);
        setLastUpdate(new Date());
      } else {
        setError(result.error?.message || 'Lien de partage invalide ou expiré');
      }
    } catch (err) {
      console.error('Error loading trip details:', err);
      setError('Une erreur est survenue');
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  const handleCallEmergency = () => {
    Alert.alert(
      'Appeler les urgences',
      'Voulez-vous appeler le numéro d\'urgence ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Appeler',
          onPress: () => {
            Linking.openURL('tel:17'); // Senegal emergency number
          },
        },
      ]
    );
  };

  const handleCallDriver = () => {
    if (details?.driver?.phone_number) {
      Linking.openURL(`tel:${details.driver.phone_number}`);
    }
  };

  const handleCallPassenger = () => {
    if (details?.passenger?.phone_number) {
      Linking.openURL(`tel:${details.passenger.phone_number}`);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.textSecondary;
      case 'started':
        return colors.primary;
      case 'ended':
        return colors.accent;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'started':
        return 'En cours';
      case 'ended':
        return 'Terminé';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: isDark ? colors.darkText : colors.text }]}>
          Chargement du trajet...
        </Text>
      </View>
    );
  }

  if (error || !details) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
        <IconSymbol
          ios_icon_name="exclamationmark.triangle.fill"
          android_material_icon_name="warning"
          size={64}
          color={colors.accent}
        />
        <Text style={[styles.errorTitle, { color: isDark ? colors.darkText : colors.text }]}>
          Lien invalide ou expiré
        </Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {error || 'Ce lien de partage n\'est plus valide'}
        </Text>
      </View>
    );
  }

  const { share, ride, driver, passenger, currentLocation } = details;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Suivi de trajet</Text>
          <Text style={styles.headerSubtitle}>
            Yombal Yoon - Sécurité renforcée
          </Text>
        </View>
        {share.sos_triggered && (
          <View style={[styles.sosIndicator, { backgroundColor: colors.accent }]}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="warning"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.sosText}>SOS</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* SOS Alert */}
        {share.sos_triggered && (
          <View style={[styles.sosAlert, { backgroundColor: colors.accent + '20', borderColor: colors.accent }]}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="warning"
              size={32}
              color={colors.accent}
            />
            <View style={styles.sosAlertText}>
              <Text style={[styles.sosAlertTitle, { color: colors.accent }]}>
                🚨 ALERTE SOS DÉCLENCHÉE
              </Text>
              <Text style={[styles.sosAlertMessage, { color: isDark ? colors.darkText : colors.text }]}>
                Le passager a déclenché une alerte d'urgence. Contactez-le immédiatement ou appelez les secours.
              </Text>
            </View>
          </View>
        )}

        {/* Trip Status */}
        <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ride.ride_status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(ride.ride_status) }]}>
                {getStatusText(ride.ride_status)}
              </Text>
            </View>
            <Text style={[styles.lastUpdateText, { color: colors.textSecondary }]}>
              Mis à jour: {formatTime(lastUpdate.toISOString())}
            </Text>
          </View>

          <View style={styles.routeInfo}>
            <View style={styles.routePoint}>
              <IconSymbol
                ios_icon_name="location.circle.fill"
                android_material_icon_name="location-on"
                size={24}
                color={colors.primary}
              />
              <View style={styles.routePointText}>
                <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>
                  Départ
                </Text>
                <Text style={[styles.routeCity, { color: isDark ? colors.darkText : colors.text }]}>
                  {ride.departure_city}
                </Text>
              </View>
            </View>

            <View style={[styles.routeLine, { backgroundColor: colors.border }]} />

            <View style={styles.routePoint}>
              <IconSymbol
                ios_icon_name="mappin.circle.fill"
                android_material_icon_name="place"
                size={24}
                color={colors.accent}
              />
              <View style={styles.routePointText}>
                <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>
                  Arrivée
                </Text>
                <Text style={[styles.routeCity, { color: isDark ? colors.darkText : colors.text }]}>
                  {ride.arrival_city}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.tripDetails}>
            <View style={styles.tripDetailItem}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={18}
                color={colors.textSecondary}
              />
              <Text style={[styles.tripDetailText, { color: colors.textSecondary }]}>
                {formatDate(ride.departure_datetime)}
              </Text>
            </View>
            <View style={styles.tripDetailItem}>
              <IconSymbol
                ios_icon_name="clock"
                android_material_icon_name="access-time"
                size={18}
                color={colors.textSecondary}
              />
              <Text style={[styles.tripDetailText, { color: colors.textSecondary }]}>
                {formatTime(ride.departure_datetime)}
              </Text>
            </View>
          </View>
        </View>

        {/* Current Location */}
        {currentLocation && share.show_exact_location && (
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
              📍 Position actuelle
            </Text>
            <View style={styles.locationInfo}>
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                Latitude: {currentLocation.latitude.toFixed(6)}
              </Text>
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                Longitude: {currentLocation.longitude.toFixed(6)}
              </Text>
              {currentLocation.speed && (
                <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                  Vitesse: {(currentLocation.speed * 3.6).toFixed(0)} km/h
                </Text>
              )}
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                Dernière mise à jour: {formatTime(currentLocation.created_at)}
              </Text>
            </View>
          </View>
        )}

        {/* Passenger Info */}
        {passenger && share.show_passenger_name && (
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
              👤 Passager
            </Text>
            <View style={styles.personInfo}>
              <Text style={[styles.personName, { color: isDark ? colors.darkText : colors.text }]}>
                {passenger.full_name || 'Passager'}
              </Text>
              {passenger.phone_number && (
                <TouchableOpacity
                  style={[styles.callButton, { backgroundColor: colors.primary }]}
                  onPress={handleCallPassenger}
                >
                  <IconSymbol
                    ios_icon_name="phone.fill"
                    android_material_icon_name="phone"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.callButtonText}>Appeler</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Driver Info */}
        {driver && share.show_driver_info && (
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
              🚗 Conducteur
            </Text>
            <View style={styles.personInfo}>
              <Text style={[styles.personName, { color: isDark ? colors.darkText : colors.text }]}>
                {driver.full_name || 'Conducteur'}
              </Text>
              {driver.phone_number && (
                <TouchableOpacity
                  style={[styles.callButton, { backgroundColor: colors.primary }]}
                  onPress={handleCallDriver}
                >
                  <IconSymbol
                    ios_icon_name="phone.fill"
                    android_material_icon_name="phone"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.callButtonText}>Appeler</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Emergency Button */}
        <TouchableOpacity
          style={[styles.emergencyButton, { backgroundColor: colors.accent }]}
          onPress={handleCallEmergency}
        >
          <IconSymbol
            ios_icon_name="phone.fill"
            android_material_icon_name="phone"
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.emergencyButtonText}>Appeler les urgences (17)</Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={[styles.infoBox, { backgroundColor: colors.primary + '15' }]}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Cette page se met à jour automatiquement toutes les 10 secondes
          </Text>
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
    padding: 20,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 68 : 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
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
  sosIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sosAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
  },
  sosAlertText: {
    flex: 1,
  },
  sosAlertTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sosAlertMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lastUpdateText: {
    fontSize: 12,
  },
  routeInfo: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routePointText: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  routeCity: {
    fontSize: 16,
    fontWeight: '600',
  },
  routeLine: {
    width: 2,
    height: 24,
    marginLeft: 11,
    marginVertical: 4,
  },
  tripDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  tripDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripDetailText: {
    fontSize: 14,
  },
  locationInfo: {
    gap: 6,
  },
  locationText: {
    fontSize: 14,
  },
  personInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
