
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import { useProfile } from '@/contexts/ProfileContext';
import { formatCurrency, creditDriverWallet, debitCommission } from '@/utils/walletUtils';
import * as Haptics from 'expo-haptics';

type PaymentMethod = 'wave' | 'orange_money' | 'especes';

export default function EndTripPaymentScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const params = useLocalSearchParams();
  const { profile } = useProfile();

  const [rideData, setRideData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  const rideId = params.rideId as string;

  useEffect(() => {
    loadRideData();
  }, [rideId]);

  const loadRideData = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('carpool_rides')
        .select('*')
        .eq('id', rideId)
        .single();

      if (error) {
        console.error('Error loading ride data:', error);
        Alert.alert('Erreur', 'Impossible de charger les données du trajet');
        router.back();
        return;
      }

      if (!data) {
        Alert.alert('Erreur', 'Trajet introuvable');
        router.back();
        return;
      }

      setRideData(data);
    } catch (error) {
      console.error('Error in loadRideData:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod || !rideData) return;

    setShowConfirmModal(false);
    setIsProcessing(true);

    try {
      // Get user ID
      const userId = await getUserId();

      // 1. Update ride payment status
      const { error: updateError } = await supabase
        .from('carpool_rides')
        .update({
          statut_paiement: 'paye',
          mode_paiement: selectedPaymentMethod,
          date_paiement: new Date().toISOString(),
        })
        .eq('id', rideId);

      if (updateError) {
        throw new Error('Erreur lors de la mise à jour du trajet');
      }

      // 2. Credit driver wallet
      const creditResult = await creditDriverWallet(
        userId,
        rideData.prix_prestataire,
        rideId,
        `Gain covoiturage ${rideData.departure_city} → ${rideData.arrival_city}`
      );

      if (!creditResult.success) {
        throw new Error('Erreur lors du crédit du wallet');
      }

      // 3. Debit commission
      const debitResult = await debitCommission(
        userId,
        rideData.commission_yombal,
        rideId,
        `Commission Yombal Yoon - ${rideData.departure_city} → ${rideData.arrival_city}`,
        rideData.commission_yombal // Unblock the same amount
      );

      if (!debitResult.success) {
        throw new Error('Erreur lors du prélèvement de la commission');
      }

      // Success!
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        'Paiement confirmé !',
        `Votre wallet a été crédité de ${formatCurrency(rideData.prix_prestataire)}`,
        [
          {
            text: 'Voir mon wallet',
            onPress: () => router.push('/wallet'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error processing payment:', error);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      Alert.alert(
        'Erreur',
        error.message || 'Une erreur est survenue lors du traitement du paiement'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getUserId = async (): Promise<string> => {
    const USER_ID_KEY = '@yombal_yoon_user_id';
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }

    return userId;
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'wave':
        return 'creditcard.fill';
      case 'orange_money':
        return 'phone.fill';
      case 'especes':
        return 'banknote.fill';
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'wave':
        return 'Wave';
      case 'orange_money':
        return 'Orange Money';
      case 'especes':
        return 'Espèces';
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: isDark ? colors.darkText : colors.text }]}>
            Chargement...
          </Text>
        </View>
      </View>
    );
  }

  if (!rideData) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Fin de trajet</Text>
          <Text style={styles.headerSubtitle}>Confirmation de paiement</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Trip Summary */}
          <View style={[styles.summaryCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Récapitulatif du trajet
            </Text>

            <View style={styles.routeContainer}>
              <Text style={[styles.cityText, { color: isDark ? colors.darkText : colors.text }]}>
                {rideData.departure_city}
              </Text>
              <IconSymbol
                ios_icon_name="arrow.right"
                android_material_icon_name="arrow-forward"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.cityText, { color: isDark ? colors.darkText : colors.text }]}>
                {rideData.arrival_city}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.amountRow}>
              <Text style={[styles.amountLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Prix total
              </Text>
              <Text style={[styles.amountValue, { color: isDark ? colors.darkText : colors.text }]}>
                {formatCurrency(rideData.prix_total)}
              </Text>
            </View>

            <View style={styles.amountRow}>
              <Text style={[styles.amountLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Commission Yombal Yoon (12%)
              </Text>
              <Text style={[styles.amountValue, { color: colors.accent }]}>
                -{formatCurrency(rideData.commission_yombal)}
              </Text>
            </View>

            <View style={[styles.amountRow, styles.totalRow]}>
              <Text style={[styles.amountLabel, styles.totalLabel, { color: isDark ? colors.darkText : colors.text }]}>
                Montant conducteur (net)
              </Text>
              <Text style={[styles.amountValue, styles.totalValue, { color: colors.primary }]}>
                {formatCurrency(rideData.prix_prestataire)}
              </Text>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={[styles.paymentCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Mode de paiement
            </Text>

            <Text style={[styles.paymentSubtitle, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Comment avez-vous été payé par les passagers ?
            </Text>

            <View style={styles.paymentMethods}>
              <TouchableOpacity
                style={[
                  styles.paymentButton,
                  { backgroundColor: isDark ? colors.darkBackground : colors.background },
                ]}
                onPress={() => handlePaymentMethodSelect('wave')}
                activeOpacity={0.7}
                disabled={isProcessing}
              >
                <IconSymbol
                  ios_icon_name="creditcard.fill"
                  android_material_icon_name="credit-card"
                  size={32}
                  color="#FF8C00"
                />
                <Text style={[styles.paymentButtonText, { color: isDark ? colors.darkText : colors.text }]}>
                  Wave
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentButton,
                  { backgroundColor: isDark ? colors.darkBackground : colors.background },
                ]}
                onPress={() => handlePaymentMethodSelect('orange_money')}
                activeOpacity={0.7}
                disabled={isProcessing}
              >
                <IconSymbol
                  ios_icon_name="phone.fill"
                  android_material_icon_name="phone"
                  size={32}
                  color="#FF8C00"
                />
                <Text style={[styles.paymentButtonText, { color: isDark ? colors.darkText : colors.text }]}>
                  Orange Money
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentButton,
                  { backgroundColor: isDark ? colors.darkBackground : colors.background },
                ]}
                onPress={() => handlePaymentMethodSelect('especes')}
                activeOpacity={0.7}
                disabled={isProcessing}
              >
                <IconSymbol
                  ios_icon_name="banknote.fill"
                  android_material_icon_name="attach-money"
                  size={32}
                  color="#FF8C00"
                />
                <Text style={[styles.paymentButtonText, { color: isDark ? colors.darkText : colors.text }]}>
                  Espèces
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.primary + '20' }]}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.infoText, { color: isDark ? colors.darkText : colors.text }]}>
              Après confirmation, votre wallet sera crédité du montant net et la commission sera automatiquement prélevée.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? colors.darkCard : '#FFFFFF' }]}>
            <IconSymbol
              ios_icon_name={selectedPaymentMethod ? getPaymentMethodIcon(selectedPaymentMethod) : 'checkmark.circle.fill'}
              android_material_icon_name="check-circle"
              size={64}
              color={colors.primary}
            />

            <Text style={[styles.modalTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Confirmer le paiement
            </Text>

            <Text style={[styles.modalMessage, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Vous confirmez avoir reçu le paiement via {selectedPaymentMethod && getPaymentMethodLabel(selectedPaymentMethod)} ?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: colors.border }]}
                onPress={() => setShowConfirmModal(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: isDark ? colors.darkText : colors.text }]}>
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: colors.primary }]}
                onPress={handleConfirmPayment}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  Confirmer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Processing Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <View style={[styles.processingCard, { backgroundColor: isDark ? colors.darkCard : '#FFFFFF' }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.processingText, { color: isDark ? colors.darkText : colors.text }]}>
              Traitement en cours...
            </Text>
          </View>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
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
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: colors.primary + '30',
  },
  amountLabel: {
    fontSize: 14,
    flex: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  paymentCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  paymentSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  paymentMethods: {
    gap: 12,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    gap: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  paymentButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
  },
  modalButtonConfirm: {
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.3)',
    elevation: 10,
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
});
