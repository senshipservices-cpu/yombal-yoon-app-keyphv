
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useColis } from '@/contexts/ColisContext';
import { useDelivery } from '@/contexts/DeliveryContext';
import { maskPhoneNumber } from '@/utils/phoneUtils';
import ContactButtons from '@/components/ContactButtons';
import * as Haptics from 'expo-haptics';

export default function DriverParcelDetailScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const params = useLocalSearchParams();
  const parcelId = params.parcelId as string;
  const assignmentId = params.assignmentId as string;
  
  const { getParcelById, updateParcelStatus } = useColis();
  const { acceptAssignment, refuseAssignment, getDeliveryPersonById } = useDelivery();
  
  const [parcel, setParcel] = useState(getParcelById(parcelId));
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRefusing, setIsRefusing] = useState(false);

  useEffect(() => {
    console.log('📱 Driver Parcel Detail Screen loaded');
    console.log('Parcel ID:', parcelId);
    console.log('Assignment ID:', assignmentId);
    
    // Refresh parcel data
    const updatedParcel = getParcelById(parcelId);
    setParcel(updatedParcel);
    
    // Trigger haptic feedback when screen loads
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, [parcelId]);

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

  const handleAccept = async () => {
    setIsAccepting(true);
    
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      // Mock delivery person ID - in production, use actual logged-in driver ID
      const deliveryPersonId = 'dp1';
      
      const success = await acceptAssignment(assignmentId, deliveryPersonId);
      
      if (success) {
        // Update parcel status to 'accepted'
        await updateParcelStatus(parcelId, 'accepted');
        
        Alert.alert(
          '✅ Demande acceptée',
          'Vous avez accepté cette demande de colis. Rendez-vous à l\'adresse de départ pour récupérer le colis.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to active deliveries screen
                router.replace('/delivery/active-delivery');
              },
            },
          ]
        );
      } else {
        Alert.alert(
          '❌ Colis déjà pris',
          'Ce colis a déjà été accepté par un autre livreur.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error accepting assignment:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRefuse = async () => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Alert.alert(
      'Refuser la demande',
      'Êtes-vous sûr de vouloir refuser cette demande ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async () => {
            setIsRefusing(true);
            try {
              // Mock delivery person ID - in production, use actual logged-in driver ID
              const deliveryPersonId = 'dp1';
              
              await refuseAssignment(assignmentId, deliveryPersonId, 'Refusé par le livreur');
              
              // Update parcel status to 'refused' or back to 'pending'
              await updateParcelStatus(parcelId, 'pending');
              
              Alert.alert(
                'Demande refusée',
                'Vous avez refusé cette demande.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (error) {
              console.error('Error refusing assignment:', error);
              Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
            } finally {
              setIsRefusing(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return colors.primary;
      case 'assigned':
        return colors.accent;
      case 'refused':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'assigned':
        return 'Assigné';
      case 'accepted':
        return 'Accepté';
      case 'refused':
        return 'Refusé';
      case 'en_route_pickup':
        return 'En route (collecte)';
      case 'picked_up':
        return 'Collecté';
      case 'en_route_delivery':
        return 'En route (livraison)';
      case 'delivered':
        return 'Livré';
      default:
        return status;
    }
  };

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
            <Text style={styles.headerTitle}>🚨 Nouvelle demande</Text>
            <Text style={styles.headerSubtitle}>Colis Thiak Thiak</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(parcel.status) + '20' }]}>
            <Text style={[styles.statusBadgeText, { color: getStatusColor(parcel.status) }]}>
              {getStatusText(parcel.status)}
            </Text>
          </View>

          {/* Urgent Notice */}
          {(parcel.status === 'assigned' || parcel.status === 'pending') && (
            <View style={[styles.urgentNotice, { backgroundColor: colors.accent + '20' }]}>
              <IconSymbol
                ios_icon_name="exclamationmark.circle.fill"
                android_material_icon_name="info"
                size={24}
                color={colors.accent}
              />
              <Text style={[styles.urgentNoticeText, { color: colors.accent }]}>
                Veuillez accepter ou refuser cette demande rapidement
              </Text>
            </View>
          )}

          {/* Parcel Info Card */}
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <View style={styles.cardHeader}>
              <IconSymbol
                ios_icon_name="shippingbox.fill"
                android_material_icon_name="local-shipping"
                size={32}
                color={colors.accent}
              />
              <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Informations du colis
              </Text>
            </View>

            {/* Pickup Address */}
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
                {parcel.departureAddress}
              </Text>
            </View>

            {/* Dropoff Address */}
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
                {parcel.arrivalAddress}
              </Text>
            </View>

            {/* Description */}
            <View style={styles.infoSection}>
              <View style={styles.infoHeader}>
                <IconSymbol
                  ios_icon_name="doc.text.fill"
                  android_material_icon_name="description"
                  size={24}
                  color={colors.textSecondary}
                />
                <Text style={[styles.infoLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  Description du colis
                </Text>
              </View>
              <Text style={[styles.infoValue, { color: isDark ? colors.darkText : colors.text }]}>
                {parcel.description || 'Aucune description'}
              </Text>
            </View>

            {/* Distance and Price */}
            {parcel.pricing && (
              <View style={[styles.pricingSection, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
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
                    {parcel.pricing.distance.toFixed(1)} km
                  </Text>
                </View>
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
                    {parcel.pricing.total} FCFA
                  </Text>
                </View>
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
                {parcel.senderName}
              </Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={[styles.infoLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Téléphone
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? colors.darkText : colors.text }]}>
                {maskPhoneNumber(parcel.senderPhone)}
              </Text>
            </View>

            {/* Contact Buttons */}
            <View style={styles.contactButtonsContainer}>
              <ContactButtons phoneNumber={parcel.senderPhone} compact={false} />
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
        </View>
      </ScrollView>

      {/* Action Buttons - Only show if status is 'assigned' or 'pending' */}
      {(parcel.status === 'assigned' || parcel.status === 'pending') && (
        <View style={[styles.actionButtonsContainer, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <TouchableOpacity
            style={[styles.refuseButton, { backgroundColor: colors.error }]}
            onPress={handleRefuse}
            disabled={isRefusing || isAccepting}
          >
            <IconSymbol
              ios_icon_name="xmark.circle.fill"
              android_material_icon_name="cancel"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>
              {isRefusing ? 'REFUS...' : 'REFUSER'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: colors.primary }]}
            onPress={handleAccept}
            disabled={isAccepting || isRefusing}
          >
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>
              {isAccepting ? 'ACCEPTATION...' : 'ACCEPTER'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  urgentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  urgentNoticeText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
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
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  refuseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    boxShadow: '0px 4px 8px rgba(255, 0, 0, 0.2)',
    elevation: 3,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    boxShadow: '0px 4px 8px rgba(0, 128, 0, 0.2)',
    elevation: 3,
  },
  actionButtonText: {
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
