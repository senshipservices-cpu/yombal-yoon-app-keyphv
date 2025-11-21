
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase, isSupabaseConfigured } from '@/config/supabase';
import { demoMode } from '@/config/demoMode';

interface CustomerParcel {
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
}

export default function MyParcelsScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  
  const [parcels, setParcels] = useState<CustomerParcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock sender ID - in production, use actual logged-in user ID from auth
  // For now, we'll use a phone number as identifier
  // TODO: Replace with actual user phone from auth/profile context
  const senderId = '+221765676486'; // This should come from auth context or profile

  const loadParcels = useCallback(async () => {
    try {
      if (!isSupabaseConfigured() || demoMode) {
        console.log('Demo mode or Supabase not configured');
        setIsLoading(false);
        return;
      }

      console.log('📦 Loading parcels for sender:', senderId);

      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .eq('sender_id', senderId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading parcels:', error);
        Alert.alert('Erreur', 'Impossible de charger vos colis. Veuillez réessayer.');
        return;
      }

      if (data) {
        console.log(`✅ Loaded ${data.length} parcels`);
        setParcels(data as CustomerParcel[]);
      }
    } catch (error) {
      console.error('Error loading parcels:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [senderId]);

  useEffect(() => {
    loadParcels();
  }, [loadParcels]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadParcels();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Demande envoyée',
          color: '#FFD700',
          icon: 'clock' as const,
        };
      case 'assigned':
        return {
          label: 'Recherche livreur…',
          color: '#FF8C00',
          icon: 'search' as const,
        };
      case 'accepted':
        return {
          label: 'Livreur en route pour récupérer',
          color: colors.primary,
          icon: 'directions-car' as const,
        };
      case 'picked_up':
        return {
          label: 'Colis récupéré par le livreur',
          color: '#4169E1',
          icon: 'check-circle' as const,
        };
      case 'delivering':
        return {
          label: 'En cours de livraison',
          color: '#9370DB',
          icon: 'local-shipping' as const,
        };
      case 'delivered':
        return {
          label: 'Colis livré',
          color: colors.primary,
          icon: 'check-circle' as const,
        };
      default:
        return {
          label: status,
          color: colors.textSecondary,
          icon: 'info' as const,
        };
    }
  };

  const formatDate = (dateString: string) => {
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

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
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
            <Text style={styles.headerTitle}>Mes colis</Text>
            <Text style={styles.headerSubtitle}>
              {parcels.length} colis au total
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isLoading ? (
            <View style={[styles.emptyCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
              <Text style={[styles.emptyTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Chargement...
              </Text>
            </View>
          ) : parcels.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
              <IconSymbol
                ios_icon_name="shippingbox"
                android_material_icon_name="local-shipping"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Aucun colis
              </Text>
              <Text style={[styles.emptySubtitle, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Vous n&apos;avez pas encore envoyé de colis.
              </Text>
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: colors.accent }]}
                onPress={() => router.back()}
              >
                <Text style={styles.sendButtonText}>Envoyer un colis</Text>
              </TouchableOpacity>
            </View>
          ) : (
            parcels.map((parcel) => {
              const statusBadge = getStatusBadge(parcel.status);
              
              return (
                <TouchableOpacity
                  key={parcel.id}
                  style={[styles.parcelCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                  onPress={() => {
                    router.push({
                      pathname: '/colis/track-parcel',
                      params: { parcelId: parcel.id },
                    });
                  }}
                >
                  {/* Status Badge */}
                  <View style={styles.parcelHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: statusBadge.color + '20' }]}>
                      <IconSymbol
                        ios_icon_name="circle.fill"
                        android_material_icon_name={statusBadge.icon}
                        size={12}
                        color={statusBadge.color}
                      />
                      <Text style={[styles.statusBadgeText, { color: statusBadge.color }]}>
                        {statusBadge.label}
                      </Text>
                    </View>
                  </View>

                  {/* Addresses */}
                  <View style={styles.addressesContainer}>
                    <View style={styles.addressRow}>
                      <IconSymbol
                        ios_icon_name="location.circle.fill"
                        android_material_icon_name="place"
                        size={20}
                        color={colors.primary}
                      />
                      <Text
                        style={[styles.addressText, { color: isDark ? colors.darkText : colors.text }]}
                        numberOfLines={1}
                      >
                        {parcel.pickup_address}
                      </Text>
                    </View>

                    <View style={styles.arrowContainer}>
                      <IconSymbol
                        ios_icon_name="arrow.down"
                        android_material_icon_name="arrow-downward"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </View>

                    <View style={styles.addressRow}>
                      <IconSymbol
                        ios_icon_name="mappin.circle.fill"
                        android_material_icon_name="location-on"
                        size={20}
                        color={colors.accent}
                      />
                      <Text
                        style={[styles.addressText, { color: isDark ? colors.darkText : colors.text }]}
                        numberOfLines={1}
                      >
                        {parcel.dropoff_address}
                      </Text>
                    </View>
                  </View>

                  {/* Info Row */}
                  <View style={styles.infoRow}>
                    {parcel.price_fcfa && (
                      <View style={styles.infoItem}>
                        <IconSymbol
                          ios_icon_name="creditcard.fill"
                          android_material_icon_name="payments"
                          size={16}
                          color={colors.accent}
                        />
                        <Text style={[styles.infoText, { color: colors.accent, fontWeight: '700' }]}>
                          {parcel.price_fcfa} FCFA
                        </Text>
                      </View>
                    )}
                    <View style={styles.infoItem}>
                      <IconSymbol
                        ios_icon_name="calendar"
                        android_material_icon_name="calendar-today"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {formatDate(parcel.created_at)}
                      </Text>
                    </View>
                  </View>

                  {/* View Details Button */}
                  <View style={styles.viewDetailsButton}>
                    <Text style={[styles.viewDetailsText, { color: colors.primary }]}>
                      Voir détails
                    </Text>
                    <IconSymbol
                      ios_icon_name="chevron.right"
                      android_material_icon_name="chevron-right"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                </TouchableOpacity>
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
  emptyCard: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  sendButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  parcelCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  parcelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addressesContainer: {
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  arrowContainer: {
    marginLeft: 4,
    marginVertical: 2,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
