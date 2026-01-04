
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import { getOrCreateWallet, formatCurrency } from '@/utils/walletUtils';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PaymentMethod = 'wave' | 'orange_money';

const QUICK_AMOUNTS = [1000, 2500, 5000, 10000, 25000, 50000];

export default function RechargeScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();

  const [wallet, setWallet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('wave');

  const loadWallet = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = await getUserId();
      const { wallet: walletData, error } = await getOrCreateWallet(userId);

      if (error || !walletData) {
        Alert.alert('Erreur', 'Impossible de charger votre wallet');
        router.back();
        return;
      }

      setWallet(walletData);
    } catch (error) {
      console.error('Error loading wallet:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const getUserId = async (): Promise<string> => {
    const USER_ID_KEY = '@yombal_yoon_user_id';
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }

    return userId;
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSubmit = async () => {
    // Validation
    const rechargeAmount = parseInt(amount);

    if (!amount || isNaN(rechargeAmount)) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    if (rechargeAmount < 500) {
      Alert.alert('Montant insuffisant', 'Le montant minimum de recharge est de 500 FCFA');
      return;
    }

    if (rechargeAmount > 500000) {
      Alert.alert('Montant trop élevé', 'Le montant maximum de recharge est de 500 000 FCFA');
      return;
    }

    // Confirm recharge
    Alert.alert(
      'Confirmer la recharge',
      `Vous allez recharger ${formatCurrency(rechargeAmount)} via ${selectedMethod === 'wave' ? 'Wave' : 'Orange Money'}.\n\nVous serez redirigé vers la page de paiement.`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Continuer',
          onPress: () => processRecharge(rechargeAmount),
        },
      ]
    );
  };

  const processRecharge = async (rechargeAmount: number) => {
    setIsSubmitting(true);

    try {
      const userId = await getUserId();

      // TODO: Backend Integration - Call PayTech API to initiate payment
      // This will be replaced with actual PayTech integration
      // Expected flow:
      // 1. Call backend endpoint: POST /api/wallet/initiate-recharge
      // 2. Backend creates PayTech payment link
      // 3. Backend returns payment URL
      // 4. Open payment URL in WebView or browser
      // 5. PayTech webhook validates payment
      // 6. Wallet is credited automatically

      // For now, create a pending recharge request
      const { error: insertError } = await supabase
        .from('recharges_wallet')
        .insert({
          wallet_id: wallet.id,
          user_id: userId,
          montant: rechargeAmount,
          mode_paiement: selectedMethod,
          transaction_id: `PENDING_${Date.now()}`, // Will be replaced by PayTech transaction ID
          statut: 'en_attente',
        });

      if (insertError) {
        throw new Error('Erreur lors de la création de la demande');
      }

      // Success!
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        'Demande créée !',
        `Votre demande de recharge de ${formatCurrency(rechargeAmount)} a été créée.\n\n⚠️ INTÉGRATION PAYTECH EN COURS\n\nProchainement, vous serez automatiquement redirigé vers la page de paiement ${selectedMethod === 'wave' ? 'Wave' : 'Orange Money'}.\n\nVotre wallet sera crédité instantanément après paiement.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error processing recharge:', error);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      Alert.alert(
        'Erreur',
        error.message || 'Une erreur est survenue lors du traitement de votre demande'
      );
    } finally {
      setIsSubmitting(false);
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
          <Text style={styles.headerTitle}>Recharge Wallet</Text>
          <Text style={styles.headerSubtitle}>Paiement sécurisé via PayTech</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Balance Card */}
          <View style={[styles.balanceCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.balanceLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Solde actuel
            </Text>
            <Text style={[styles.balanceAmount, { color: wallet.solde < 0 ? colors.error : colors.primary }]}>
              {formatCurrency(wallet.solde)}
            </Text>
          </View>

          {/* Quick Amount Buttons */}
          <View style={[styles.quickAmountCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.quickAmountLabel, { color: isDark ? colors.darkText : colors.text }]}>
              Montants rapides
            </Text>
            <View style={styles.quickAmountGrid}>
              {QUICK_AMOUNTS.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={[
                    styles.quickAmountButton,
                    { backgroundColor: isDark ? colors.darkBackground : colors.background },
                    amount === quickAmount.toString() && { 
                      backgroundColor: colors.primary + '20',
                      borderColor: colors.primary,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => handleQuickAmount(quickAmount)}
                  disabled={isSubmitting}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      { color: isDark ? colors.darkText : colors.text },
                      amount === quickAmount.toString() && { color: colors.primary, fontWeight: '700' },
                    ]}
                  >
                    {formatCurrency(quickAmount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Amount Input */}
          <View style={[styles.inputCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.darkText : colors.text }]}>
              Montant personnalisé
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
              <TextInput
                style={[styles.input, { color: isDark ? colors.darkText : colors.text }]}
                placeholder="Ex: 10000"
                placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                editable={!isSubmitting}
              />
              <Text style={[styles.currency, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                FCFA
              </Text>
            </View>
            <Text style={[styles.inputHint, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Min: 500 FCFA • Max: 500 000 FCFA
            </Text>
          </View>

          {/* Payment Method */}
          <View style={[styles.methodCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.methodLabel, { color: isDark ? colors.darkText : colors.text }]}>
              Mode de paiement
            </Text>
            <View style={styles.methodButtons}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  selectedMethod === 'wave' && styles.methodButtonActive,
                  { backgroundColor: isDark ? colors.darkBackground : colors.background },
                  selectedMethod === 'wave' && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => {
                  setSelectedMethod('wave');
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                disabled={isSubmitting}
              >
                <IconSymbol
                  ios_icon_name="creditcard.fill"
                  android_material_icon_name="credit-card"
                  size={32}
                  color={selectedMethod === 'wave' ? colors.primary : colors.textSecondary}
                />
                <Text style={[
                  styles.methodButtonText,
                  { color: selectedMethod === 'wave' ? colors.primary : (isDark ? colors.darkText : colors.text) }
                ]}>
                  Wave
                </Text>
                {selectedMethod === 'wave' && (
                  <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={16}
                      color="#FFFFFF"
                    />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  selectedMethod === 'orange_money' && styles.methodButtonActive,
                  { backgroundColor: isDark ? colors.darkBackground : colors.background },
                  selectedMethod === 'orange_money' && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => {
                  setSelectedMethod('orange_money');
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                disabled={isSubmitting}
              >
                <IconSymbol
                  ios_icon_name="phone.fill"
                  android_material_icon_name="phone"
                  size={32}
                  color={selectedMethod === 'orange_money' ? colors.primary : colors.textSecondary}
                />
                <Text style={[
                  styles.methodButtonText,
                  { color: selectedMethod === 'orange_money' ? colors.primary : (isDark ? colors.darkText : colors.text) }
                ]}>
                  Orange Money
                </Text>
                {selectedMethod === 'orange_money' && (
                  <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={16}
                      color="#FFFFFF"
                    />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* PayTech Info Card */}
          <View style={[styles.paytechCard, { backgroundColor: colors.primary + '15' }]}>
            <View style={styles.paytechHeader}>
              <IconSymbol
                ios_icon_name="shield.checkmark.fill"
                android_material_icon_name="verified-user"
                size={28}
                color={colors.primary}
              />
              <Text style={[styles.paytechTitle, { color: colors.primary }]}>
                Paiement sécurisé PayTech
              </Text>
            </View>
            <View style={styles.paytechFeatures}>
              <View style={styles.paytechFeature}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.paytechFeatureText, { color: isDark ? colors.darkText : colors.text }]}>
                  Crédit instantané après paiement
                </Text>
              </View>
              <View style={styles.paytechFeature}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.paytechFeatureText, { color: isDark ? colors.darkText : colors.text }]}>
                  Transactions 100% sécurisées
                </Text>
              </View>
              <View style={styles.paytechFeature}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.paytechFeatureText, { color: isDark ? colors.darkText : colors.text }]}>
                  Support Wave, Orange Money, Free Money
                </Text>
              </View>
            </View>
          </View>

          {/* Instructions Card */}
          <View style={[styles.instructionsCard, { backgroundColor: colors.warning + '20' }]}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={24}
              color={colors.warning}
            />
            <View style={styles.instructionsContent}>
              <Text style={[styles.instructionsTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Comment ça marche ?
              </Text>
              <Text style={[styles.instructionsText, { color: isDark ? colors.darkText : colors.text }]}>
                1. Choisissez le montant à recharger{'\n'}
                2. Sélectionnez votre mode de paiement{'\n'}
                3. Cliquez sur &quot;Payer maintenant&quot;{'\n'}
                4. Validez le paiement dans votre app mobile{'\n'}
                5. Votre wallet est crédité instantanément !
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.primary },
              isSubmitting && { opacity: 0.6 },
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <React.Fragment>
                <IconSymbol
                  ios_icon_name="arrow.up.circle.fill"
                  android_material_icon_name="payment"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.submitButtonText}>Payer maintenant</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>

          {/* Integration Notice */}
          <View style={[styles.noticeCard, { backgroundColor: colors.accent + '15' }]}>
            <IconSymbol
              ios_icon_name="wrench.fill"
              android_material_icon_name="build"
              size={20}
              color={colors.accent}
            />
            <Text style={[styles.noticeText, { color: isDark ? colors.darkText : colors.text }]}>
              🚧 Intégration PayTech en cours de finalisation. Les paiements seront bientôt automatiques !
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
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
  },
  quickAmountCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  quickAmountLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAmountButton: {
    width: '31%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAmountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  currency: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputHint: {
    fontSize: 13,
    marginTop: 8,
  },
  methodCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  methodButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  methodButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  methodButtonActive: {
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paytechCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  paytechHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  paytechTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  paytechFeatures: {
    gap: 12,
  },
  paytechFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paytechFeatureText: {
    fontSize: 14,
    flex: 1,
  },
  instructionsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  instructionsContent: {
    flex: 1,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 22,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 12,
    boxShadow: '0px 4px 8px rgba(0, 128, 0, 0.3)',
    elevation: 5,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
