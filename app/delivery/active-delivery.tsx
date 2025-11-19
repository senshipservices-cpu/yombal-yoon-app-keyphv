
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useDelivery } from '@/contexts/DeliveryContext';
import { useColis } from '@/contexts/ColisContext';

export default function ActiveDeliveryScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { assignments, updateAssignmentStatus, deliveryPersons } = useDelivery();
  const { getParcelById, updateParcelStatus } = useColis();

  // In production, get the actual delivery person ID from auth
  const currentDeliveryPerson = deliveryPersons.find(dp => dp.status === 'busy');
  const deliveryPersonId = currentDeliveryPerson?.id || 'dp1';

  const activeAssignment = assignments.find(
    a => a.deliveryPersonId === deliveryPersonId && 
    ['accepted', 'en_route_pickup', 'picked_up', 'en_route_delivery'].includes(a.status)
  );

  const parcel = activeAssignment ? getParcelById(activeAssignment.parcelId) : null;

  const handleStatusUpdate = async (newStatus: 'en_route_pickup' | 'picked_up' | 'en_route_delivery' | 'delivered') => {
    if (!activeAssignment || !parcel) return;

    const statusMessages = {
      en_route_pickup: 'Vous êtes en route vers l\'adresse de départ',
      picked_up: 'Vous avez récupéré le colis',
      en_route_delivery: 'Vous êtes en route vers le destinataire',
      delivered: 'Le colis a été livré avec succès',
    };

    Alert.alert(
      'Confirmer',
      statusMessages[newStatus],
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            await updateAssignmentStatus(activeAssignment.id, newStatus);
            await updateParcelStatus(parcel.id, newStatus);
            
            if (newStatus === 'delivered') {
              Alert.alert(
                'Félicitations !',
                'Livraison terminée avec succès. Vous êtes maintenant disponible pour de nouvelles livraisons.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]
              );
            }
          },
        },
      ]
    );
  };

  const getNextAction = () => {
    if (!activeAssignment) return null;

    switch (activeAssignment.status) {
      case 'accepted':
        return {
          label: 'Commencer la récupération',
          status: 'en_route_pickup' as const,
          icon: 'car.fill',
          androidIcon: 'directions-car',
        };
      case 'en_route_pickup':
        return {
          label: 'Colis récupéré',
          status: 'picked_up' as const,
          icon: 'checkmark.circle.fill',
          androidIcon: 'check-circle',
        };
      case 'picked_up':
        return {
          label: 'Commencer la livraison',
          status: 'en_route_delivery' as const,
          icon: 'car.fill',
          androidIcon: 'directions-car',
        };
      case 'en_route_delivery':
        return {
          label: 'Colis livré',
          status: 'delivered' as const,
          icon: 'checkmark.seal.fill',
          androidIcon: 'verified',
        };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  if (!activeAssignment || !parcel) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
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
            Livraison Active
          </Text>
        </View>
        <View style={styles.centerContent}>
          <IconSymbol
            ios_icon_name="tray"
            android_material_icon_name="inbox"
            size={64}
            color={isDark ? colors.darkTextSecondary : colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Aucune livraison active
          </Text>
          <Text style={[styles.emptyText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            Vous n&apos;avez pas de livraison en cours
          </Text>
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
            Livraison Active
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Status Card */}
          <View style={[styles.statusCard, { backgroundColor: colors.primary }]}>
            <IconSymbol
              ios_icon_name="car.fill"
              android_material_icon_name="directions-car"
              size={48}
              color="#FFFFFF"
            />
            <Text style={styles.statusTitle}>Livraison en cours</Text>
            <Text style={styles.statusSubtitle}>
              Colis #{parcel.id.slice(-6)}
            </Text>
          </View>

          {/* Parcel Details */}
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Détails du Colis
            </Text>

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
                  <View style={styles.contactInfo}>
                    <IconSymbol
                      ios_icon_name="person.fill"
                      android_material_icon_name="person"
                      size={14}
                      color={isDark ? colors.darkTextSecondary : colors.textSecondary}
                    />
                    <Text style={[styles.contactText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      {parcel.senderName} • {parcel.senderPhone}
                    </Text>
                  </View>
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
                  <View style={styles.contactInfo}>
                    <IconSymbol
                      ios_icon_name="person.fill"
                      android_material_icon_name="person"
                      size={14}
                      color={isDark ? colors.darkTextSecondary : colors.textSecondary}
                    />
                    <Text style={[styles.contactText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      {parcel.recipientName} • {parcel.recipientPhone}
                    </Text>
                  </View>
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

          {/* Next Action Button */}
          {nextAction && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => handleStatusUpdate(nextAction.status)}
            >
              <IconSymbol
                ios_icon_name={nextAction.icon}
                android_material_icon_name={nextAction.androidIcon}
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>
                {nextAction.label}
              </Text>
            </TouchableOpacity>
          )}

          {/* Map Note */}
          <View style={[styles.mapNote, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.mapNoteText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              La navigation GPS intégrée sera disponible prochainement. Pour l&apos;instant, utilisez votre application de navigation préférée avec les adresses ci-dessus.
            </Text>
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
  content: {
    padding: 20,
    paddingTop: 0,
  },
  statusCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: '0px 4px 12px rgba(0, 128, 0, 0.3)',
    elevation: 5,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
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
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 12,
  },
  addressConnector: {
    width: 2,
    height: 24,
    marginLeft: 5,
    marginVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    boxShadow: '0px 4px 12px rgba(0, 128, 0, 0.3)',
    elevation: 5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  mapNote: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  mapNoteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
