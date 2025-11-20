
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useDelivery } from '@/contexts/DeliveryContext';
import { useColis } from '@/contexts/ColisContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useProfile } from '@/contexts/ProfileContext';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export default function PendingAssignmentsScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { assignments, acceptAssignment, refuseAssignment } = useDelivery();
  const { getParcelById } = useColis();
  const { sendLocalNotification, registerForPushNotifications } = useNotifications();
  const { profile } = useProfile();
  const { isConnected, retry } = useNetworkStatus();

  const deliveryPersonId = 'dp1';

  const registerNotifications = useCallback(async () => {
    // Register for push notifications with delivery role
    const activeRoles: string[] = [];
    if (profile.roles.driver) activeRoles.push('driver');
    if (profile.roles.passenger) activeRoles.push('passenger');
    if (profile.roles.delivery) activeRoles.push('delivery');
    if (profile.roles.sender) activeRoles.push('sender');

    console.log('📱 Registering push notifications for delivery person with roles:', activeRoles);
    await registerForPushNotifications(profile.phone || deliveryPersonId, activeRoles);
  }, [registerForPushNotifications, profile.phone, profile.roles]);

  useEffect(() => {
    // Register for push notifications when screen loads
    registerNotifications();
  }, [registerNotifications]);

  const pendingAssignments = assignments.filter(
    a => a.deliveryPersonId === deliveryPersonId && a.status === 'pending'
  );

  const handleAccept = async (assignmentId: string) => {
    const success = await acceptAssignment(assignmentId, deliveryPersonId);
    
    if (success) {
      Alert.alert(
        'Colis accepté !',
        'Vous pouvez maintenant voir les détails de la livraison.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/delivery/active-delivery'),
          },
        ]
      );
    }
  };

  const handleRefuse = async (assignmentId: string) => {
    Alert.alert(
      'Refuser le colis',
      'Voulez-vous vraiment refuser cette livraison ?',
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

  if (!isConnected) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.accent }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Demandes en attente</Text>
          </View>
        </View>

        <View style={styles.content}>
          <ErrorState
            message="Impossible de charger les demandes. Vérifiez votre connexion internet et réessayez."
            onRetry={retry}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.accent }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Demandes en attente</Text>
          <Text style={styles.headerSubtitle}>{pendingAssignments.length} demande(s)</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.primary + '20' }]}>
            <IconSymbol
              ios_icon_name="bell.badge.fill"
              android_material_icon_name="notifications-active"
              size={32}
              color={colors.primary}
            />
            <Text style={[styles.infoTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Notifications activées
            </Text>
            <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Vous recevrez une notification dès qu&apos;une nouvelle demande de colis est disponible près de vous.
            </Text>
          </View>

          {pendingAssignments.length === 0 ? (
            <EmptyState
              icon={{ ios: 'shippingbox', android: 'local-shipping' }}
              title="Aucune demande en attente"
              message="Il n'y a pas de demandes de livraison en attente pour le moment. Vous serez notifié dès qu'une nouvelle demande arrive."
            />
          ) : (
            pendingAssignments.map((assignment, index) => {
              const parcel = getParcelById(assignment.parcelId);
              if (!parcel) return null;

              return (
                <View
                  key={index}
                  style={[styles.assignmentCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.accent + '20' }]}>
                      <IconSymbol
                        ios_icon_name="shippingbox.fill"
                        android_material_icon_name="local-shipping"
                        size={32}
                        color={colors.accent}
                      />
                    </View>
                    <View style={styles.headerInfo}>
                      <Text style={[styles.parcelId, { color: isDark ? colors.darkText : colors.text }]}>
                        Colis #{parcel.id.slice(-6)}
                      </Text>
                      <Text style={[styles.timeAgo, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        Il y a {Math.floor((Date.now() - new Date(assignment.assignedAt).getTime()) / 60000)} min
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.routeSection}>
                    <View style={styles.routePoint}>
                      <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
                      <View style={styles.routeInfo}>
                        <Text style={[styles.routeLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                          Récupération
                        </Text>
                        <Text style={[styles.routeAddress, { color: isDark ? colors.darkText : colors.text }]}>
                          {parcel.departureAddress}
                        </Text>
                        <Text style={[styles.contactInfo, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                          {parcel.senderName} • {parcel.senderPhone}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.routeConnector, { backgroundColor: colors.border }]} />

                    <View style={styles.routePoint}>
                      <View style={[styles.routeDot, { backgroundColor: colors.accent }]} />
                      <View style={styles.routeInfo}>
                        <Text style={[styles.routeLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                          Livraison
                        </Text>
                        <Text style={[styles.routeAddress, { color: isDark ? colors.darkText : colors.text }]}>
                          {parcel.arrivalAddress}
                        </Text>
                        <Text style={[styles.contactInfo, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                          {parcel.recipientName} • {parcel.recipientPhone}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                      <IconSymbol
                        ios_icon_name="doc.text.fill"
                        android_material_icon_name="description"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {parcel.description}
                      </Text>
                    </View>

                    {parcel.pricing && (
                      <View style={styles.detailRow}>
                        <IconSymbol
                          ios_icon_name="banknote"
                          android_material_icon_name="attach-money"
                          size={16}
                          color={colors.textSecondary}
                        />
                        <Text style={[styles.detailText, { color: colors.accent }]}>
                          {parcel.pricing.total} FCFA ({parcel.pricing.distance.toFixed(1)} km)
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.accent }]}
                      onPress={() => handleRefuse(assignment.id)}
                      activeOpacity={0.7}
                    >
                      <IconSymbol
                        ios_icon_name="xmark"
                        android_material_icon_name="close"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.actionButtonText}>Refuser</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.primary }]}
                      onPress={() => handleAccept(assignment.id)}
                      activeOpacity={0.7}
                    >
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.actionButtonText}>Accepter</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 68 : 60,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  content: {
    padding: 20,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  assignmentCard: {
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
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  parcelId: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  routeSection: {
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
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactInfo: {
    fontSize: 13,
  },
  routeConnector: {
    width: 2,
    height: 20,
    marginLeft: 5,
    marginVertical: 8,
  },
  detailsSection: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
