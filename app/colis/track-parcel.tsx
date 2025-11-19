
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useColis } from '@/contexts/ColisContext';
import { useDelivery } from '@/contexts/DeliveryContext';

export default function TrackParcelScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { parcelId } = useLocalSearchParams<{ parcelId: string }>();
  const { getParcelById } = useColis();
  const { getAssignmentByParcelId, getDeliveryPersonById } = useDelivery();

  const parcel = getParcelById(parcelId || '');
  const assignment = getAssignmentByParcelId(parcelId || '');
  const deliveryPerson = assignment ? getDeliveryPersonById(assignment.deliveryPersonId) : undefined;

  if (!parcel) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={isDark ? colors.darkText : colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Suivi du Colis
          </Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: isDark ? colors.darkText : colors.text }]}>
            Colis non trouvé
          </Text>
        </View>
      </View>
    );
  }

  const getStatusInfo = () => {
    switch (parcel.status) {
      case 'pending':
        return {
          icon: 'clock.fill',
          androidIcon: 'schedule',
          color: colors.secondary,
          title: 'En attente',
          description: 'Recherche d\'un livreur disponible...',
        };
      case 'assigned':
        return {
          icon: 'person.fill.checkmark',
          androidIcon: 'person-check',
          color: colors.primary,
          title: 'Livreur assigné',
          description: 'Un livreur a accepté votre demande',
        };
      case 'en_route_pickup':
        return {
          icon: 'car.fill',
          androidIcon: 'directions-car',
          color: '#FF8C00',
          title: 'En route vers vous',
          description: 'Le livreur se dirige vers l\'adresse de départ',
        };
      case 'picked_up':
        return {
          icon: 'checkmark.circle.fill',
          androidIcon: 'check-circle',
          color: colors.primary,
          title: 'Colis récupéré',
          description: 'Le livreur a récupéré votre colis',
        };
      case 'en_route_delivery':
        return {
          icon: 'car.fill',
          androidIcon: 'directions-car',
          color: '#FF8C00',
          title: 'En livraison',
          description: 'Le livreur se dirige vers le destinataire',
        };
      case 'delivered':
        return {
          icon: 'checkmark.seal.fill',
          androidIcon: 'verified',
          color: colors.primary,
          title: 'Livré',
          description: 'Votre colis a été livré avec succès',
        };
      case 'cancelled':
        return {
          icon: 'xmark.circle.fill',
          androidIcon: 'cancel',
          color: colors.accent,
          title: 'Annulé',
          description: 'La livraison a été annulée',
        };
      default:
        return {
          icon: 'questionmark.circle.fill',
          androidIcon: 'help',
          color: colors.textSecondary,
          title: 'Statut inconnu',
          description: '',
        };
    }
  };

  const statusInfo = getStatusInfo();

  const statusSteps = [
    { key: 'pending', label: 'En attente', completed: true },
    { key: 'assigned', label: 'Assigné', completed: ['assigned', 'en_route_pickup', 'picked_up', 'en_route_delivery', 'delivered'].includes(parcel.status) },
    { key: 'en_route_pickup', label: 'En route', completed: ['en_route_pickup', 'picked_up', 'en_route_delivery', 'delivered'].includes(parcel.status) },
    { key: 'picked_up', label: 'Récupéré', completed: ['picked_up', 'en_route_delivery', 'delivered'].includes(parcel.status) },
    { key: 'en_route_delivery', label: 'En livraison', completed: ['en_route_delivery', 'delivered'].includes(parcel.status) },
    { key: 'delivered', label: 'Livré', completed: parcel.status === 'delivered' },
  ];

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
            Suivi du Colis
          </Text>
        </View>

        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <View style={[styles.statusIconContainer, { backgroundColor: statusInfo.color + '20' }]}>
            <IconSymbol
              ios_icon_name={statusInfo.icon}
              android_material_icon_name={statusInfo.androidIcon}
              size={48}
              color={statusInfo.color}
            />
          </View>
          <Text style={[styles.statusTitle, { color: isDark ? colors.darkText : colors.text }]}>
            {statusInfo.title}
          </Text>
          <Text style={[styles.statusDescription, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            {statusInfo.description}
          </Text>
        </View>

        {/* Progress Steps */}
        {parcel.status !== 'cancelled' && (
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Progression
            </Text>
            <View style={styles.stepsContainer}>
              {statusSteps.map((step, index) => (
                <React.Fragment key={index}>
                  <View style={styles.stepRow}>
                    <View style={[
                      styles.stepIndicator,
                      { backgroundColor: step.completed ? colors.primary : colors.border }
                    ]}>
                      {step.completed && (
                        <IconSymbol
                          ios_icon_name="checkmark"
                          android_material_icon_name="check"
                          size={16}
                          color="#FFFFFF"
                        />
                      )}
                    </View>
                    <Text style={[
                      styles.stepLabel,
                      {
                        color: step.completed
                          ? (isDark ? colors.darkText : colors.text)
                          : (isDark ? colors.darkTextSecondary : colors.textSecondary)
                      }
                    ]}>
                      {step.label}
                    </Text>
                  </View>
                  {index < statusSteps.length - 1 && (
                    <View style={[
                      styles.stepConnector,
                      { backgroundColor: step.completed ? colors.primary : colors.border }
                    ]} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Delivery Person Info */}
        {deliveryPerson && (
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Votre Livreur
            </Text>
            <View style={styles.deliveryPersonInfo}>
              <View style={[styles.deliveryPersonAvatar, { backgroundColor: colors.primary + '20' }]}>
                <IconSymbol
                  ios_icon_name="person.fill"
                  android_material_icon_name="person"
                  size={32}
                  color={colors.primary}
                />
              </View>
              <View style={styles.deliveryPersonDetails}>
                <Text style={[styles.deliveryPersonName, { color: isDark ? colors.darkText : colors.text }]}>
                  {deliveryPerson.name}
                </Text>
                <View style={styles.deliveryPersonMeta}>
                  <IconSymbol
                    ios_icon_name="star.fill"
                    android_material_icon_name="star"
                    size={16}
                    color="#FFD700"
                  />
                  <Text style={[styles.deliveryPersonRating, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    {deliveryPerson.rating} • {deliveryPerson.completedDeliveries} livraisons
                  </Text>
                </View>
                <Text style={[styles.deliveryPersonVehicle, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  {deliveryPerson.vehicleType === 'moto' ? '🏍️ Moto' : deliveryPerson.vehicleType === 'car' ? '🚗 Voiture' : '🚲 Vélo'}
                </Text>
              </View>
            </View>
            
            {/* Note about map */}
            <View style={[styles.mapNote, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.mapNoteText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Le suivi en temps réel sur carte sera disponible prochainement. Pour l&apos;instant, vous pouvez suivre la progression via les statuts ci-dessus.
              </Text>
            </View>
          </View>
        )}

        {/* Parcel Details */}
        <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Détails du Colis
          </Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              De
            </Text>
            <Text style={[styles.detailValue, { color: isDark ? colors.darkText : colors.text }]}>
              {parcel.senderName}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              À
            </Text>
            <Text style={[styles.detailValue, { color: isDark ? colors.darkText : colors.text }]}>
              {parcel.recipientName}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Départ
            </Text>
            <Text style={[styles.detailValue, { color: isDark ? colors.darkText : colors.text }]} numberOfLines={2}>
              {parcel.departureAddress}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Arrivée
            </Text>
            <Text style={[styles.detailValue, { color: isDark ? colors.darkText : colors.text }]} numberOfLines={2}>
              {parcel.arrivalAddress}
            </Text>
          </View>

          {parcel.pricing && (
            <React.Fragment>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  Distance
                </Text>
                <Text style={[styles.detailValue, { color: isDark ? colors.darkText : colors.text }]}>
                  {parcel.pricing.distance} km
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  Prix
                </Text>
                <Text style={[styles.detailValue, { color: colors.accent, fontWeight: '700' }]}>
                  {parcel.pricing.total} FCFA
                </Text>
              </View>
            </React.Fragment>
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  statusIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  stepsContainer: {
    paddingLeft: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepConnector: {
    width: 2,
    height: 24,
    marginLeft: 13,
    marginVertical: 4,
  },
  deliveryPersonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  deliveryPersonAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryPersonDetails: {
    flex: 1,
  },
  deliveryPersonName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  deliveryPersonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  deliveryPersonRating: {
    fontSize: 14,
  },
  deliveryPersonVehicle: {
    fontSize: 14,
  },
  mapNote: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  mapNoteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
});
