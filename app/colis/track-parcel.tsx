
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { maskPhoneNumber } from '@/utils/phoneUtils';
import ContactButtons from '@/components/ContactButtons';
import { supabase, isSupabaseConfigured } from '@/config/supabase';
import { demoMode } from '@/config/demoMode';

interface ParcelDetails {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  distance_km: number | null;
  price_fcfa: number | null;
  status: string;
  created_at: string;
  sender_name: string;
  sender_phone: string;
  recipient_name: string;
  recipient_phone: string;
  description: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  assigned_driver_id: string | null;
  assigned_at: string | null;
  accepted_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
}

interface TimelineStep {
  label: string;
  completed: boolean;
  icon: string;
  color: string;
}

export default function TrackParcelScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const params = useLocalSearchParams();
  const parcelId = params.parcelId as string;
  
  const [parcel, setParcel] = useState<ParcelDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadParcelDetails = React.useCallback(async () => {
    try {
      if (!isSupabaseConfigured() || demoMode) {
        console.log('Demo mode or Supabase not configured');
        setIsLoading(false);
        return;
      }

      console.log('📦 Loading parcel details:', parcelId);

      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .eq('id', parcelId)
        .single();

      if (error) {
        console.error('Error loading parcel:', error);
        Alert.alert('Erreur', 'Impossible de charger les détails du colis.');
        return;
      }

      if (data) {
        console.log('✅ Parcel loaded:', data);
        setParcel(data as ParcelDetails);
      }
    } catch (error) {
      console.error('Error loading parcel:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  }, [parcelId]);

  useEffect(() => {
    loadParcelDetails();
  }, [loadParcelDetails]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Demande envoyée';
      case 'assigned':
        return 'Recherche livreur…';
      case 'accepted':
        return 'Livreur en route pour récupérer';
      case 'picked_up':
        return 'Colis récupéré par le livreur';
      case 'delivering':
        return 'En cours de livraison';
      case 'delivered':
        return 'Colis livré';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFD700';
      case 'assigned':
        return '#FF8C00';
      case 'accepted':
        return colors.primary;
      case 'picked_up':
        return '#4169E1';
      case 'delivering':
        return '#9370DB';
      case 'delivered':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const getTimelineSteps = (status: string): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        label: 'Demande envoyée',
        completed: ['pending', 'assigned', 'accepted', 'picked_up', 'delivering', 'delivered'].includes(status),
        icon: 'check-circle',
        color: colors.primary,
      },
      {
        label: 'Livreur trouvé',
        completed: ['assigned', 'accepted', 'picked_up', 'delivering', 'delivered'].includes(status),
        icon: 'person',
        color: colors.primary,
      },
      {
        label: 'En route vers vous',
        completed: ['accepted', 'picked_up', 'delivering', 'delivered'].includes(status),
        icon: 'directions-car',
        color: colors.primary,
      },
      {
        label: 'Colis récupéré',
        completed: ['picked_up', 'delivering', 'delivered'].includes(status),
        icon: 'check-circle',
        color: colors.primary,
      },
      {
        label: 'En livraison',
        completed: ['delivering', 'delivered'].includes(status),
        icon: 'local-shipping',
        color: colors.primary,
      },
      {
        label: 'Livré',
        completed: status === 'delivered',
        icon: 'check-circle',
        color: colors.primary,
      },
    ];

    return steps;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: isDark ? colors.darkText : colors.text }]}>
            Chargement...
          </Text>
        </View>
      </View>
    );
  }

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

  const timelineSteps = getTimelineSteps(parcel.status);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: '#FF8C00' }]}>
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
            <Text style={styles.headerTitle}>Suivi du colis</Text>
            <Text style={styles.headerSubtitle}>Thiak Thiak</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Status Card */}
          <View style={[styles.statusCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(parcel.status) + '20' }]}>
              <Text style={[styles.statusBadgeText, { color: getStatusColor(parcel.status) }]}>
                {getStatusText(parcel.status)}
              </Text>
            </View>
            <Text style={[styles.statusDate, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Envoyé le {formatDate(parcel.created_at)}
            </Text>
          </View>

          {/* Map Placeholder - Only show if not delivered */}
          {parcel.status !== 'delivered' && (
            <View style={[styles.mapCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
              <View style={[styles.mapPlaceholder, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
                <IconSymbol
                  ios_icon_name="map.fill"
                  android_material_icon_name="map"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={[styles.mapPlaceholderText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  Les cartes ne sont pas disponibles sur cette plateforme.
                </Text>
                <Text style={[styles.mapPlaceholderSubtext, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  Utilisez l&apos;application mobile pour voir la position en temps réel du livreur.
                </Text>
              </View>
            </View>
          )}

          {/* Timeline Card */}
          <View style={[styles.timelineCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <View style={styles.timelineHeader}>
              <IconSymbol
                ios_icon_name="clock.fill"
                android_material_icon_name="schedule"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.timelineTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Progression
              </Text>
            </View>

            <View style={styles.timeline}>
              {timelineSteps.map((step, index) => (
                <View key={index} style={styles.timelineStep}>
                  <View style={styles.timelineIconContainer}>
                    <View
                      style={[
                        styles.timelineIcon,
                        {
                          backgroundColor: step.completed ? step.color : colors.border,
                          borderColor: step.completed ? step.color : colors.border,
                        },
                      ]}
                    >
                      {step.completed && (
                        <IconSymbol
                          ios_icon_name="checkmark"
                          android_material_icon_name="check"
                          size={16}
                          color="#FFFFFF"
                        />
                      )}
                    </View>
                    {index < timelineSteps.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          {
                            backgroundColor: step.completed ? step.color : colors.border,
                          },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineLabel,
                        {
                          color: step.completed
                            ? isDark
                              ? colors.darkText
                              : colors.text
                            : isDark
                            ? colors.darkTextSecondary
                            : colors.textSecondary,
                          fontWeight: step.completed ? '700' : '400',
                        },
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Parcel Details Card */}
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <View style={styles.cardHeader}>
              <IconSymbol
                ios_icon_name="shippingbox.fill"
                android_material_icon_name="local-shipping"
                size={32}
                color={colors.accent}
              />
              <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Détails du colis
              </Text>
            </View>

            {/* Addresses */}
            <View style={styles.infoSection}>
              <View style={styles.infoHeader}>
                <IconSymbol
                  ios_icon_name="location.circle.fill"
                  android_material_icon_name="place"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.infoLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  Adresse de départ
                </Text>
              </View>
              <Text style={[styles.infoValue, { color: isDark ? colors.darkText : colors.text }]}>
                {parcel.pickup_address}
              </Text>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoHeader}>
                <IconSymbol
                  ios_icon_name="mappin.circle.fill"
                  android_material_icon_name="location-on"
                  size={24}
                  color={colors.accent}
                />
                <Text style={[styles.infoLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  Adresse d&apos;arrivée
                </Text>
              </View>
              <Text style={[styles.infoValue, { color: isDark ? colors.darkText : colors.text }]}>
                {parcel.dropoff_address}
              </Text>
            </View>

            {/* Description */}
            {parcel.description && (
              <View style={styles.infoSection}>
                <View style={styles.infoHeader}>
                  <IconSymbol
                    ios_icon_name="doc.text.fill"
                    android_material_icon_name="description"
                    size={24}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.infoLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    Description
                  </Text>
                </View>
                <Text style={[styles.infoValue, { color: isDark ? colors.darkText : colors.text }]}>
                  {parcel.description}
                </Text>
              </View>
            )}

            {/* Distance and Price */}
            {(parcel.distance_km || parcel.price_fcfa) && (
              <View style={[styles.pricingSection, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
                {parcel.distance_km && (
                  <View style={styles.pricingRow}>
                    <IconSymbol
                      ios_icon_name="location.fill"
                      android_material_icon_name="place"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.pricingLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      Distance
                    </Text>
                    <Text style={[styles.pricingValue, { color: isDark ? colors.darkText : colors.text }]}>
                      {parcel.distance_km.toFixed(1)} km
                    </Text>
                  </View>
                )}
                {parcel.price_fcfa && (
                  <View style={styles.pricingRow}>
                    <IconSymbol
                      ios_icon_name="creditcard.fill"
                      android_material_icon_name="payments"
                      size={20}
                      color={colors.accent}
                    />
                    <Text style={[styles.pricingLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      Prix
                    </Text>
                    <Text style={[styles.pricingValue, { color: colors.accent, fontWeight: '700' }]}>
                      {parcel.price_fcfa} FCFA
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Sender Info Card */}
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <View style={styles.cardHeader}>
              <IconSymbol
                ios_icon_name="person.circle.fill"
                android_material_icon_name="person"
                size={32}
                color={colors.primary}
              />
              <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Expéditeur
              </Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={[styles.infoLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Nom
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? colors.darkText : colors.text }]}>
                {parcel.sender_name}
              </Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={[styles.infoLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Téléphone
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? colors.darkText : colors.text }]}>
                {maskPhoneNumber(parcel.sender_phone)}
              </Text>
            </View>
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
                {parcel.recipient_name}
              </Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={[styles.infoLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Téléphone
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? colors.darkText : colors.text }]}>
                {maskPhoneNumber(parcel.recipient_phone)}
              </Text>
            </View>

            {/* Contact Buttons */}
            <View style={styles.contactButtonsContainer}>
              <ContactButtons phoneNumber={parcel.recipient_phone} compact={false} />
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 120,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
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
  statusCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusDate: {
    fontSize: 14,
  },
  mapCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapPlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  mapPlaceholderSubtext: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  timelineCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: 4,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 6,
    paddingBottom: 16,
  },
  timelineLabel: {
    fontSize: 15,
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
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    lineHeight: 24,
  },
  pricingSection: {
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 14,
    flex: 1,
  },
  pricingValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  contactButtonsContainer: {
    marginTop: 12,
  },
});
