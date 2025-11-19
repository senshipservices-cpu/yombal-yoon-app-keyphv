
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useColis } from '@/contexts/ColisContext';
import { useProfile } from '@/contexts/ProfileContext';

export default function MyParcelsScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { parcelRequests } = useColis();
  const { profile } = useProfile();

  // Filter parcels by current user's phone (in production, use proper user ID)
  const myParcels = parcelRequests.filter(p => p.senderPhone === profile.phone);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'En attente', color: colors.secondary, bgColor: colors.secondary + '20' };
      case 'assigned':
        return { label: 'Assigné', color: colors.primary, bgColor: colors.primary + '20' };
      case 'en_route_pickup':
        return { label: 'En route', color: '#FF8C00', bgColor: '#FF8C0020' };
      case 'picked_up':
        return { label: 'Récupéré', color: colors.primary, bgColor: colors.primary + '20' };
      case 'en_route_delivery':
        return { label: 'En livraison', color: '#FF8C00', bgColor: '#FF8C0020' };
      case 'delivered':
        return { label: 'Livré', color: colors.primary, bgColor: colors.primary + '20' };
      case 'cancelled':
        return { label: 'Annulé', color: colors.accent, bgColor: colors.accent + '20' };
      default:
        return { label: status, color: colors.textSecondary, bgColor: colors.border };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? 48 : 60 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={isDark ? colors.darkText : colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Mes Colis
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {myParcels.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
              <IconSymbol
                ios_icon_name="shippingbox"
                android_material_icon_name="local-shipping"
                size={64}
                color={isDark ? colors.darkTextSecondary : colors.textSecondary}
              />
              <Text style={[styles.emptyTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Aucun colis
              </Text>
              <Text style={[styles.emptyText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Vous n&apos;avez pas encore envoyé de colis
              </Text>
            </View>
          ) : (
            myParcels.map((parcel, index) => {
              const statusBadge = getStatusBadge(parcel.status);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.parcelCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                  onPress={() => router.push(`/colis/track-parcel?parcelId=${parcel.id}`)}
                >
                  <View style={styles.parcelHeader}>
                    <View style={[styles.parcelIcon, { backgroundColor: colors.accent + '20' }]}>
                      <IconSymbol
                        ios_icon_name="shippingbox.fill"
                        android_material_icon_name="local-shipping"
                        size={24}
                        color={colors.accent}
                      />
                    </View>
                    <View style={styles.parcelHeaderText}>
                      <Text style={[styles.parcelId, { color: isDark ? colors.darkText : colors.text }]}>
                        Colis #{parcel.id.slice(-6)}
                      </Text>
                      <Text style={[styles.parcelDate, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {formatDate(parcel.createdAt)}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
                      <Text style={[styles.statusBadgeText, { color: statusBadge.color }]}>
                        {statusBadge.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.parcelRoute}>
                    <View style={styles.routePoint}>
                      <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
                      <View style={styles.routeInfo}>
                        <Text style={[styles.routeLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                          Départ
                        </Text>
                        <Text style={[styles.routeAddress, { color: isDark ? colors.darkText : colors.text }]} numberOfLines={1}>
                          {parcel.departureAddress}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.routeConnector, { backgroundColor: colors.border }]} />

                    <View style={styles.routePoint}>
                      <View style={[styles.routeDot, { backgroundColor: colors.accent }]} />
                      <View style={styles.routeInfo}>
                        <Text style={[styles.routeLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                          Arrivée
                        </Text>
                        <Text style={[styles.routeAddress, { color: isDark ? colors.darkText : colors.text }]} numberOfLines={1}>
                          {parcel.arrivalAddress}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.parcelFooter}>
                    <View style={styles.parcelRecipient}>
                      <IconSymbol
                        ios_icon_name="person.fill"
                        android_material_icon_name="person"
                        size={16}
                        color={isDark ? colors.darkTextSecondary : colors.textSecondary}
                      />
                      <Text style={[styles.recipientText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {parcel.recipientName}
                      </Text>
                    </View>
                    {parcel.pricing && (
                      <Text style={[styles.parcelPrice, { color: colors.accent }]}>
                        {parcel.pricing.total} FCFA
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.trackButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push(`/colis/track-parcel?parcelId=${parcel.id}`)}
                  >
                    <Text style={styles.trackButtonText}>Suivre le colis</Text>
                    <IconSymbol
                      ios_icon_name="arrow.right"
                      android_material_icon_name="arrow-forward"
                      size={16}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
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
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  parcelCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  parcelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  parcelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parcelHeaderText: {
    flex: 1,
  },
  parcelId: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  parcelDate: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  parcelRoute: {
    paddingLeft: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 14,
  },
  routeConnector: {
    width: 2,
    height: 16,
    marginLeft: 5,
    marginVertical: 4,
  },
  parcelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  parcelRecipient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recipientText: {
    fontSize: 14,
  },
  parcelPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
