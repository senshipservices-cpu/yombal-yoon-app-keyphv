
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useDelivery } from '@/contexts/DeliveryContext';
import { useColis } from '@/contexts/ColisContext';
import { useProfile } from '@/contexts/ProfileContext';
import { calculateDistance } from '@/utils/distance';

export default function PendingAssignmentsScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { profile } = useProfile();
  const { assignments, acceptAssignment, refuseAssignment, deliveryPersons } = useDelivery();
  const { getParcelById } = useColis();

  // In production, get the actual delivery person ID from auth
  // For now, we'll use the first available delivery person as a mock
  const currentDeliveryPerson = deliveryPersons.find(dp => dp.status === 'available');
  const deliveryPersonId = currentDeliveryPerson?.id || 'dp1';

  const pendingAssignments = assignments.filter(
    a => a.deliveryPersonId === deliveryPersonId && a.status === 'pending'
  );

  const handleAccept = async (assignmentId: string) => {
    const success = await acceptAssignment(assignmentId, deliveryPersonId);
    
    if (success) {
      Alert.alert(
        'Accepté',
        'Vous avez accepté cette livraison. Rendez-vous à l\'adresse de départ pour récupérer le colis.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/delivery/active-delivery'),
          },
        ]
      );
    } else {
      Alert.alert(
        'Déjà pris',
        'Ce colis a déjà été accepté par un autre livreur.'
      );
    }
  };

  const handleRefuse = async (assignmentId: string) => {
    Alert.alert(
      'Refuser la livraison',
      'Êtes-vous sûr de vouloir refuser cette livraison ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async () => {
            await refuseAssignment(assignmentId, deliveryPersonId, 'Refusé par le livreur');
            Alert.alert('Refusé', 'Vous avez refusé cette livraison.');
          },
        },
      ]
    );
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
            Demandes en attente
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {pendingAssignments.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
              <IconSymbol
                ios_icon_name="tray"
                android_material_icon_name="inbox"
                size={64}
                color={isDark ? colors.darkTextSecondary : colors.textSecondary}
              />
              <Text style={[styles.emptyTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Aucune demande
              </Text>
              <Text style={[styles.emptyText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Vous n&apos;avez pas de demandes de livraison en attente
              </Text>
            </View>
          ) : (
            pendingAssignments.map((assignment, index) => {
              const parcel = getParcelById(assignment.parcelId);
              if (!parcel) return null;

              const distance = parcel.departureLocation && currentDeliveryPerson
                ? calculateDistance(
                    currentDeliveryPerson.currentLocation.lat,
                    currentDeliveryPerson.currentLocation.lng,
                    parcel.departureLocation.lat,
                    parcel.departureLocation.lng
                  )
                : 0;

              return (
                <View
                  key={index}
                  style={[styles.assignmentCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                >
                  <View style={styles.assignmentHeader}>
                    <View style={[styles.assignmentIcon, { backgroundColor: colors.accent + '20' }]}>
                      <IconSymbol
                        ios_icon_name="shippingbox.fill"
                        android_material_icon_name="local-shipping"
                        size={32}
                        color={colors.accent}
                      />
                    </View>
                    <View style={styles.assignmentHeaderText}>
                      <Text style={[styles.assignmentTitle, { color: isDark ? colors.darkText : colors.text }]}>
                        Nouvelle demande
                      </Text>
                      <View style={styles.distanceBadge}>
                        <IconSymbol
                          ios_icon_name="location.fill"
                          android_material_icon_name="location-on"
                          size={14}
                          color={colors.primary}
                        />
                        <Text style={[styles.distanceText, { color: colors.primary }]}>
                          {distance.toFixed(1)} km
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.parcelInfo}>
                    <View style={styles.infoRow}>
                      <IconSymbol
                        ios_icon_name="person.fill"
                        android_material_icon_name="person"
                        size={16}
                        color={isDark ? colors.darkTextSecondary : colors.textSecondary}
                      />
                      <Text style={[styles.infoLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        Expéditeur
                      </Text>
                      <Text style={[styles.infoValue, { color: isDark ? colors.darkText : colors.text }]}>
                        {parcel.senderName}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <IconSymbol
                        ios_icon_name="phone.fill"
                        android_material_icon_name="phone"
                        size={16}
                        color={isDark ? colors.darkTextSecondary : colors.textSecondary}
                      />
                      <Text style={[styles.infoLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        Téléphone
                      </Text>
                      <Text style={[styles.infoValue, { color: isDark ? colors.darkText : colors.text }]}>
                        {parcel.senderPhone}
                      </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.addressSection}>
                      <View style={styles.addressRow}>
                        <View style={[styles.addressDot, { backgroundColor: colors.primary }]} />
                        <View style={styles.addressInfo}>
                          <Text style={[styles.addressLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                            Récupération
                          </Text>
                          <Text style={[styles.addressText, { color: isDark ? colors.darkText : colors.text }]}>
                            {parcel.departureAddress}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.addressConnector, { backgroundColor: colors.border }]} />

                      <View style={styles.addressRow}>
                        <View style={[styles.addressDot, { backgroundColor: colors.accent }]} />
                        <View style={styles.addressInfo}>
                          <Text style={[styles.addressLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                            Livraison
                          </Text>
                          <Text style={[styles.addressText, { color: isDark ? colors.darkText : colors.text }]}>
                            {parcel.arrivalAddress}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {parcel.pricing && (
                      <React.Fragment>
                        <View style={styles.divider} />
                        <View style={styles.priceRow}>
                          <Text style={[styles.priceLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                            Prix de la course
                          </Text>
                          <Text style={[styles.priceValue, { color: colors.accent }]}>
                            {parcel.pricing.total} FCFA
                          </Text>
                        </View>
                      </React.Fragment>
                    )}
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.refuseButton, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}
                      onPress={() => handleRefuse(assignment.id)}
                    >
                      <IconSymbol
                        ios_icon_name="xmark"
                        android_material_icon_name="close"
                        size={20}
                        color={colors.accent}
                      />
                      <Text style={[styles.refuseButtonText, { color: colors.accent }]}>
                        Refuser
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.acceptButton, { backgroundColor: colors.primary }]}
                      onPress={() => handleAccept(assignment.id)}
                    >
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.acceptButtonText}>
                        Accepter
                      </Text>
                    </TouchableOpacity>
                  </View>
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
  assignmentCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  assignmentIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignmentHeaderText: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  parcelInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  addressSection: {
    paddingLeft: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  addressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  addressConnector: {
    width: 2,
    height: 16,
    marginLeft: 5,
    marginVertical: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  refuseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  refuseButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
