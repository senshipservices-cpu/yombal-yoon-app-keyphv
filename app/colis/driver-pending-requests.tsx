
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useColis } from '@/contexts/ColisContext';
import { useDelivery } from '@/contexts/DeliveryContext';

export default function DriverPendingRequestsScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { parcelRequests, refreshParcels } = useColis();
  const { getPendingAssignmentsForDeliveryPerson, assignments } = useDelivery();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Mock delivery person ID - in production, use actual logged-in driver ID
  const deliveryPersonId = 'dp1';
  
  const pendingAssignments = getPendingAssignmentsForDeliveryPerson(deliveryPersonId);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshParcels();
    setIsRefreshing(false);
  };

  const formatTimeAgo = (dateString: string) => {
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
            <Text style={styles.headerTitle}>Demandes en attente</Text>
            <Text style={styles.headerSubtitle}>
              {pendingAssignments.length} demande{pendingAssignments.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {pendingAssignments.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
              <IconSymbol
                ios_icon_name="tray.fill"
                android_material_icon_name="inbox"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Aucune demande en attente
              </Text>
              <Text style={[styles.emptySubtitle, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Vous recevrez une notification lorsqu&apos;une nouvelle demande sera disponible.
              </Text>
            </View>
          ) : (
            pendingAssignments.map((assignment) => {
              const parcel = parcelRequests.find(p => p.id === assignment.parcelId);
              if (!parcel) return null;

              return (
                <TouchableOpacity
                  key={assignment.id}
                  style={[styles.requestCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                  onPress={() => {
                    router.push({
                      pathname: '/colis/driver-parcel-detail',
                      params: {
                        parcelId: parcel.id,
                        assignmentId: assignment.id,
                      },
                    });
                  }}
                >
                  <View style={styles.requestHeader}>
                    <View style={[styles.newBadge, { backgroundColor: colors.accent + '20' }]}>
                      <Text style={[styles.newBadgeText, { color: colors.accent }]}>
                        NOUVEAU
                      </Text>
                    </View>
                    <Text style={[styles.timeAgo, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      {formatTimeAgo(assignment.assignedAt)}
                    </Text>
                  </View>

                  <View style={styles.requestBody}>
                    <View style={styles.iconContainer}>
                      <IconSymbol
                        ios_icon_name="shippingbox.fill"
                        android_material_icon_name="local-shipping"
                        size={40}
                        color={colors.accent}
                      />
                    </View>

                    <View style={styles.requestInfo}>
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
                          {parcel.departureAddress}
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
                          {parcel.arrivalAddress}
                        </Text>
                      </View>

                      {parcel.pricing && (
                        <View style={styles.pricingInfo}>
                          <View style={styles.pricingItem}>
                            <IconSymbol
                              ios_icon_name="location.fill"
                              android_material_icon_name="place"
                              size={16}
                              color={colors.textSecondary}
                            />
                            <Text style={[styles.pricingText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                              {parcel.pricing.distance.toFixed(1)} km
                            </Text>
                          </View>
                          <View style={styles.pricingItem}>
                            <IconSymbol
                              ios_icon_name="creditcard.fill"
                              android_material_icon_name="payments"
                              size={16}
                              color={colors.accent}
                            />
                            <Text style={[styles.pricingText, { color: colors.accent, fontWeight: '700' }]}>
                              {parcel.pricing.total} FCFA
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.requestFooter}>
                    <View style={styles.viewDetailsButton}>
                      <Text style={[styles.viewDetailsText, { color: colors.primary }]}>
                        Voir les détails
                      </Text>
                      <IconSymbol
                        ios_icon_name="chevron.right"
                        android_material_icon_name="chevron-right"
                        size={20}
                        color={colors.primary}
                      />
                    </View>
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
  requestCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  newBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeAgo: {
    fontSize: 12,
  },
  requestBody: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestInfo: {
    flex: 1,
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
  pricingInfo: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  pricingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pricingText: {
    fontSize: 13,
  },
  requestFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
