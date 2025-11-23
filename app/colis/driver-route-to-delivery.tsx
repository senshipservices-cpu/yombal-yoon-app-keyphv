
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useColis } from '@/contexts/ColisContext';
import { useDelivery } from '@/contexts/DeliveryContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { maskPhoneNumber } from '@/utils/phoneUtils';
import ContactButtons from '@/components/ContactButtons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { supabase, isSupabaseConfigured } from '@/config/supabase';
import { demoMode } from '@/config/demoMode';

export default function DriverRouteToDeliveryScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const params = useLocalSearchParams();
  const parcelId = params.parcelId as string;
  
  const { getParcelById, updateParcelStatus } = useColis();
  const { updateDeliveryPersonLocation, getDeliveryPersonById, updateDeliveryPersonStatus } = useDelivery();
  const { sendLocalNotification } = useNotifications();
  
  const [parcel, setParcel] = useState(getParcelById(parcelId));
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isDelivering, setIsDelivering] = useState(false);
  const [eta, setEta] = useState<string>('Calcul en cours...');

  // Mock driver ID - in production, use actual logged-in driver ID
  const deliveryPersonId = 'dp1';
  const driver = getDeliveryPersonById(deliveryPersonId);

  // Update driver location periodically
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission not granted');
          return;
        }

        // Get initial location
        const location = await Location.getCurrentPositionAsync({});
        const newLocation = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };
        setDriverLocation(newLocation);
        
        // Update in context and Supabase
        await updateDeliveryPersonLocation(deliveryPersonId, newLocation);
        await updateDriverLocationInSupabase(deliveryPersonId, newLocation);

        // Watch location changes
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000, // Update every 10 seconds
            distanceInterval: 50, // Or when moved 50 meters
          },
          (location) => {
            const updatedLocation = {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            };
            setDriverLocation(updatedLocation);
            updateDeliveryPersonLocation(deliveryPersonId, updatedLocation);
            updateDriverLocationInSupabase(deliveryPersonId, updatedLocation);
          }
        );
      } catch (error) {
        console.error('Error starting location tracking:', error);
      }
    };

    startLocationTracking();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [deliveryPersonId, updateDeliveryPersonLocation]);

  // Update driver location in Supabase
  const updateDriverLocationInSupabase = async (driverId: string, location: { lat: number; lng: number }) => {
    if (isSupabaseConfigured() && !demoMode) {
      try {
        const { error } = await supabase
          .from('drivers')
          .update({
            last_lat: location.lat,
            last_lng: location.lng,
          })
          .eq('id', driverId);

        if (error) {
          console.error('Error updating driver location in Supabase:', error);
        }
      } catch (error) {
        console.error('Error updating driver location:', error);
      }
    }
  };

  // Calculate ETA using Google Distance Matrix API
  useEffect(() => {
    const calculateETA = async () => {
      if (!driverLocation || !parcel?.arrivalLocation) {
        setEta('Position non disponible');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('google-places-proxy', {
          body: {
            action: 'distance_matrix',
            origins: `${driverLocation.lat},${driverLocation.lng}`,
            destinations: `${parcel.arrivalLocation.lat},${parcel.arrivalLocation.lng}`,
            mode: 'driving',
            language: 'fr',
          },
        });

        if (error || data.status !== 'OK') {
          setEta('Non disponible');
          return;
        }

        const element = data.rows?.[0]?.elements?.[0];
        if (element?.status === 'OK' && element.duration) {
          const minutes = Math.round(element.duration.value / 60);
          setEta(`${minutes} min`);
        } else {
          setEta('Non disponible');
        }
      } catch (error) {
        console.error('Error calculating ETA:', error);
        setEta('Non disponible');
      }
    };

    calculateETA();
    
    // Update ETA every 30 seconds
    const interval = setInterval(calculateETA, 30000);
    
    return () => clearInterval(interval);
  }, [driverLocation, parcel]);

  // Refresh parcel data
  useEffect(() => {
    const updatedParcel = getParcelById(parcelId);
    setParcel(updatedParcel);
  }, [parcelId, getParcelById]);

  const handleOpenGoogleMaps = () => {
    if (!parcel?.arrivalLocation) {
      Alert.alert('Erreur', 'Adresse de livraison non disponible');
      return;
    }

    const url = Platform.select({
      ios: `maps://app?daddr=${parcel.arrivalLocation.lat},${parcel.arrivalLocation.lng}`,
      android: `google.navigation:q=${parcel.arrivalLocation.lat},${parcel.arrivalLocation.lng}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${parcel.arrivalLocation.lat},${parcel.arrivalLocation.lng}`,
    });

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to web URL
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${parcel.arrivalLocation.lat},${parcel.arrivalLocation.lng}`;
        Linking.openURL(webUrl);
      }
    });
  };

  const handleDelivered = async () => {
    if (!parcel) return;

    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    // Navigate to payment completion screen
    router.push({
      pathname: '/colis/delivery-complete-payment',
      params: { parcelId },
    });
  };

  if (!parcel) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
        <View style={styles.errorContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle.fill"
            android_material_icon_name="warning"
            size={48}
            color={colors.warning}
          />
          <Text style={[styles.errorText, { color: isDark ? colors.darkText : colors.text }]}>
            Colis introuvable
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.accent }]}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => router.back()}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>🚚 Trajet 2 : Livraison</Text>
            <Text style={styles.headerSubtitle}>Direction le destinataire</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* ETA Card */}
          <View style={[styles.etaCard, { backgroundColor: colors.accent }]}>
            <IconSymbol
              ios_icon_name="clock.fill"
              android_material_icon_name="schedule"
              size={48}
              color="#FFFFFF"
            />
            <View style={styles.etaInfo}>
              <Text style={styles.etaLabel}>Temps estimé d&apos;arrivée</Text>
              <Text style={styles.etaValue}>{eta}</Text>
            </View>
          </View>

          {/* Map Note */}
          <View style={[styles.mapNote, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <IconSymbol
              ios_icon_name="map.fill"
              android_material_icon_name="map"
              size={24}
              color={colors.accent}
            />
            <Text style={[styles.mapNoteText, { color: isDark ? colors.darkText : colors.text }]}>
              Les cartes interactives ne sont pas encore disponibles dans Natively.
              Utilisez le bouton ci-dessous pour ouvrir Google Maps.
            </Text>
          </View>

          {/* Navigation Button */}
          <TouchableOpacity
            style={[styles.navigationButton, { backgroundColor: colors.accent }]}
            onPress={handleOpenGoogleMaps}
          >
            <IconSymbol
              ios_icon_name="map.fill"
              android_material_icon_name="navigation"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.navigationButtonText}>Ouvrir dans Google Maps</Text>
          </TouchableOpacity>

          {/* Delivery Address Card */}
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <View style={styles.cardHeader}>
              <IconSymbol
                ios_icon_name="mappin.circle.fill"
                android_material_icon_name="location-on"
                size={32}
                color={colors.accent}
              />
              <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Adresse de livraison
              </Text>
            </View>

            <Text style={[styles.addressText, { color: isDark ? colors.darkText : colors.text }]}>
              {parcel.arrivalAddress}
            </Text>
          </View>

          {/* Recipient Info Card */}
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <View style={styles.cardHeader}>
              <IconSymbol
                ios_icon_name="person.circle.fill"
                android_material_icon_name="person"
                size={32}
                color={colors.accent}
              />
              <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Destinataire
              </Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={[styles.infoLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Nom
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? colors.darkText : colors.text }]}>
                {parcel.recipientName}
              </Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={[styles.infoLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Téléphone
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? colors.darkText : colors.text }]}>
                {maskPhoneNumber(parcel.recipientPhone)}
              </Text>
            </View>

            {/* Contact Buttons */}
            <View style={styles.contactButtonsContainer}>
              <ContactButtons phoneNumber={parcel.recipientPhone} compact={false} />
            </View>
          </View>

          {/* Parcel Details Card */}
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <View style={styles.cardHeader}>
              <IconSymbol
                ios_icon_name="shippingbox.fill"
                android_material_icon_name="local-shipping"
                size={32}
                color={colors.primary}
              />
              <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Détails du colis
              </Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={[styles.infoLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Description
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? colors.darkText : colors.text }]}>
                {parcel.description || 'Aucune description'}
              </Text>
            </View>

            {parcel.pricing && (
              <View style={styles.infoSection}>
                <Text style={[styles.infoLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  Prix de la course
                </Text>
                <Text style={[styles.priceValue, { color: colors.accent }]}>
                  {parcel.pricing.total} FCFA
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Delivered Button */}
      <View style={[styles.actionButtonContainer, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
        <TouchableOpacity
          style={[styles.deliveredButton, { backgroundColor: colors.primary }]}
          onPress={handleDelivered}
          disabled={isDelivering}
        >
          <IconSymbol
            ios_icon_name="checkmark.seal.fill"
            android_material_icon_name="verified"
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.deliveredButtonText}>
            {isDelivering ? 'CONFIRMATION...' : 'LIVRAISON EFFECTUÉE'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 48 : 0,
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 60,
  },
  headerBackButton: {
    marginRight: 12,
    padding: 8,
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
  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    boxShadow: '0px 4px 12px rgba(255, 193, 7, 0.3)',
    elevation: 5,
  },
  etaInfo: {
    flex: 1,
  },
  etaLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  etaValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mapNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  mapNoteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    boxShadow: '0px 4px 8px rgba(255, 193, 7, 0.2)',
    elevation: 3,
  },
  navigationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  addressText: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    lineHeight: 24,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  contactButtonsContainer: {
    marginTop: 4,
  },
  actionButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  deliveredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 12,
    boxShadow: '0px 4px 8px rgba(0, 128, 0, 0.2)',
    elevation: 3,
  },
  deliveredButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
