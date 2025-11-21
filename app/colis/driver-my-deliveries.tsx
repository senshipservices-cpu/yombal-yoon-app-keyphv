
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase, isSupabaseConfigured } from '@/config/supabase';
import { demoMode } from '@/config/demoMode';

interface DriverParcel {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  distance_km: number | null;
  price_fcfa: number | null;
  status: string;
  assigned_at: string | null;
  picked_up_at: string | null;
  sender_name: string;
  sender_phone: string;
  recipient_name: string;
  recipient_phone: string;
  description: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
}

export default function DriverMyDeliveriesScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  
  const [parcels, setParcels] = useState<DriverParcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock driver ID - in production, use actual logged-in driver ID from auth
  const driverId = 'dp1';

  const loadParcels = useCallback(async () => {
    try {
      if (!isSupabaseConfigured() || demoMode) {
        console.log('Demo mode or Supabase not configured');
        setIsLoading(false);
        return;
      }

      console.log('📦 Loading parcels for driver:', driverId);

      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .eq('assigned_driver_id', driverId)
        .in('status', ['accepted', 'picked_up', 'delivering'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading parcels:', error);
        Alert.alert('Erreur', 'Impossible de charger les colis. Veuillez réessayer.');
        return;
      }

      if (data) {
        console.log(`✅ Loaded ${data.length} parcels`);
        setParcels(data as DriverParcel[]);
      }
    } catch (error) {
      console.error('Error loading parcels:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [driverId]);

  useEffect(() => {
    loadParcels();
  }, [loadParcels]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadParcels();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return {
          label: 'En route pour récupérer',
          color: colors.primary,
          icon: 'arrow-right' as const,
        };
      case 'picked_up':
        return {
          label: 'Colis récupéré',
          color: '#FF8C00',
          icon: 'check-circle' as const,
        };
      case 'delivering':
        return {
          label: 'En livraison',
          color: '#FFD700',
          icon: 'local-shipping' as const,
        };
      default:
        return {
          label: status,
          color: colors.textSecondary,
          icon: 'info' as const,
        };
    }
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'À l\'instant';
    }
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
            <Text style={styles.headerTitle}>Mes colis à livrer</Text>
            <Text style={styles.headerSubtitle}>
              {parcels.length} colis en cours
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
                Aucun colis à livrer
              </Text>
              <Text style={[styles.emptySubtitle, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Vous recevrez une notification lorsqu&apos;un nouveau colis vous sera assigné.
              </Text>
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
                      pathname: '/colis/driver-delivery-detail',
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
                    {parcel.assigned_at && (
                      <Text style={[styles.timeAgo, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {formatTimeAgo(parcel.assigned_at)}
                      </Text>
                    )}
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
                    {parcel.distance_km && (
                      <View style={styles.infoItem}>
                        <IconSymbol
                          ios_icon_name="location.fill"
                          android_material_icon_name="place"
                          size={16}
                          color={colors.textSecondary}
                        />
                        <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                          {parcel.distance_km.toFixed(1)} km
                        </Text>
                      </View>
                    )}
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
  timeAgo: {
    fontSize: 12,
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
