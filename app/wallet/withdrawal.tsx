
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

const MINIMUM_WITHDRAWAL = 1000;
const MAXIMUM_WITHDRAWAL = 500000;

type PaymentMethod = 'wave' | 'orange_money' | 'free_money';

export default function WithdrawalScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();

  const [wallet, setWallet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
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

  const validatePhoneNumber = (phone: string): boolean => {
    // Senegalese phone number validation (9 digits starting with 7 or 3)
    const cleanPhone = phone.replace(/\s/g, '');
    return /^[73]\d{8}$/.test(cleanPhone);
  };

  const handleSubmit = async () => {
    // Validation
    const withdrawalAmount = parseInt(amount);

    if (!amount || isNaN(withdrawalAmount)) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    if (withdrawalAmount < MINIMUM_WITHDRAWAL) {
      Alert.alert(
        'Montant insuffisant',
        `Le montant minimum de retrait est de ${formatCurrency(MINIMUM_WITHDRAWAL)}`
      );
      return;
    }

    if (withdrawalAmount > MAXIMUM_WITHDRAWAL) {
      Alert.alert(
        'Montant trop élevé',
        `Le montant maximum de retrait est de ${formatCurrency(MAXIMUM_WITHDRAWAL)}`
      );
      return;
    }

    if (withdrawalAmount > wallet.solde) {
      Alert.alert(
        'Solde insuffisant',
        `Votre solde disponible est de ${formatCurrency(wallet.solde)}`
      );
      return;
    }

    if (wallet.solde_bloque > 0) {
      Alert.alert(
        'Solde bloqué',
        `Vous avez ${formatCurrency(wallet.solde_bloque)} en attente. Veuillez attendre que ce montant soit débloqué avant de faire un retrait.`
      );
      return;
    }

    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      Alert.alert(
        'Numéro invalide',
        'Veuillez entrer un numéro de téléphone sénégalais valide (ex: 77 123 45 67)'
      );
      return;
    }

    // Confirm withdrawal
    Alert.alert(
      'Confirmer le retrait',
      `Vous allez retirer ${formatCurrency(withdrawalAmount)} vers ${selectedMethod === 'wave' ? 'Wave' : selectedMethod === 'orange_money' ? 'Orange Money' : 'Free Money'} au numéro ${phoneNumber}.\n\nLe montant sera bloqué jusqu'à validation par notre équipe (24-48h).\n\nContinuer ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Confirmer',
          onPress: () => processWithdrawal(withdrawalAmount),
        },
      ]
    );
  };

  const processWithdrawal = async (withdrawalAmount: number) => {
    setIsSubmitting(true);

    try {
      const userId = await getUserId();

      // TODO: Backend Integration - Process withdrawal via PayTech
      console.log('Processing withdrawal via PayTech...');

      // Create withdrawal request in database
      const { error: insertError } = await supabase
        .from('demandes_retrait')
        .insert({
          wallet_id: wallet.id,
          user_id: userId,
          montant: withdrawalAmount,
          mode_paiement: selectedMethod,
          numero_telephone: phoneNumber.replace(/\s/g, ''),
          statut: 'en_attente',
        });

      if (insertError) {
        throw new Error('Erreur lors de la création de la demande');
      }

      // Block amount in wallet
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          solde: wallet.solde - withdrawalAmount,
          solde_bloque: wallet.solde_bloque + withdrawalAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', wallet.id);

      if (updateError) {
        throw new Error('Erreur lors de la mise à jour du wallet');
      }

      // Success!
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        'Demande envoyée !',
        `Votre demande de retrait de ${formatCurrency(withdrawalAmount)} a été créée.\n\n✅ Le montant est maintenant bloqué dans votre wallet.\n\n⏱️ Notre équipe va traiter votre demande sous 24-48h.\n\n💰 Vous recevrez l'argent sur votre ${selectedMethod === 'wave' ? 'compte Wave' : selectedMethod === 'orange_money' ? 'compte Orange Money' : 'compte Free Money'} après validation.\n\n📱 Vous recevrez une notification de confirmation.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      
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
          <Text style={styles.headerTitle}>Retrait Wallet</Text>
          <Text style={styles.headerSubtitle}>Transfert sécurisé via PayTech</Text>
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
              Solde disponible
            </Text>
            <Text style={[styles.balanceAmount, { color: wallet.solde < 0 ? colors.error : colors.primary }]}>
              {formatCurrency(wallet.solde)}
            </Text>
            {wallet.solde_bloque > 0 && (
              <View style={styles.blockedInfo}>
                <IconSymbol
                  ios_icon_name="lock.fill"
                  android_material_icon_name="lock"
                  size={16}
                  color={colors.warning}
                />
                <Text style={[styles.blockedAmount, { color: colors.warning }]}>
                  {formatCurrency(wallet.solde_bloque)} bloqué
                </Text>
              </View>
            )}
          </View>

          {/* Amount Input */}
          <View style={[styles.inputCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.darkText : colors.text }]}>
              Montant à retirer
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
              <TextInput
                style={[styles.input, { color: isDark ? colors.darkText : colors.text }]}
                placeholder="Ex: 5000"
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
              Min: {formatCurrency(MINIMUM_WITHDRAWAL)} • Max: {formatCurrency(MAXIMUM_WITHDRAWAL)}
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
                  selectedMethod === 'wave' && { borderColor: colors.accent, borderWidth: 2 },
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
                  color={selectedMethod === 'wave' ? colors.accent : colors.textSecondary}
                />
                <Text style={[
                  styles.methodButtonText,
                  { color: selectedMethod === 'wave' ? colors.accent : (isDark ? colors.darkText : colors.text) }
                ]}>
                  Wave
                </Text>
                {selectedMethod === 'wave' && (
                  <View style={[styles.selectedBadge, { backgroundColor: colors.accent }]}>
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
                  selectedMethod === 'orange_money' && { borderColor: colors.accent, borderWidth: 2 },
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
                  color={selectedMethod === 'orange_money' ? colors.accent : colors.textSecondary}
                />
                <Text style={[
                  styles.methodButtonText,
                  { color: selectedMethod === 'orange_money' ? colors.accent : (isDark ? colors.darkText : colors.text) }
                ]}>
                  Orange Money
                </Text>
                {selectedMethod === 'orange_money' && (
                  <View style={[styles.selectedBadge, { backgroundColor: colors.accent }]}>
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
                  selectedMethod === 'free_money' && styles.methodButtonActive,
                  { backgroundColor: isDark ? colors.darkBackground : colors.background },
                  selectedMethod === 'free_money' && { borderColor: colors.accent, borderWidth: 2 },
                ]}
                onPress={() => {
                  setSelectedMethod('free_money');
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
                  color={selectedMethod === 'free_money' ? colors.accent : colors.textSecondary}
                />
                <Text style={[
                  styles.methodButtonText,
                  { color: selectedMethod === 'free_money' ? colors.accent : (isDark ? colors.darkText : colors.text) }
                ]}>
                  Free Money
                </Text>
                {selectedMethod === 'free_money' && (
                  <View style={[styles.selectedBadge, { backgroundColor: colors.accent }]}>
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

          {/* Phone Number Input */}
          <View style={[styles.inputCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.darkText : colors.text }]}>
              Numéro de téléphone
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
              <IconSymbol
                ios_icon_name="phone.fill"
                android_material_icon_name="phone"
                size={20}
                color={isDark ? colors.darkTextSecondary : colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: isDark ? colors.darkText : colors.text }]}
                placeholder="77 123 45 67"
                placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                editable={!isSubmitting}
                maxLength={11}
              />
            </View>
            <Text style={[styles.inputHint, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Numéro {selectedMethod === 'wave' ? 'Wave' : selectedMethod === 'orange_money' ? 'Orange Money' : 'Free Money'} où vous recevrez l&apos;argent
            </Text>
          </View>

          {/* Process Info Card */}
          <View style={[styles.processCard, { backgroundColor: colors.primary + '15' }]}>
            <View style={styles.processHeader}>
              <IconSymbol
                ios_icon_name="clock.fill"
                android_material_icon_name="schedule"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.processTitle, { color: colors.primary }]}>
                Processus de retrait
              </Text>
            </View>
            <View style={styles.processSteps}>
              <View style={styles.processStep}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={[styles.stepText, { color: isDark ? colors.darkText : colors.text }]}>
                  Votre demande est créée et le montant est bloqué
                </Text>
              </View>
              <View style={styles.processStep}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={[styles.stepText, { color: isDark ? colors.darkText : colors.text }]}>
                  Notre équipe valide votre demande (24-48h)
                </Text>
              </View>
              <View style={styles.processStep}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={[styles.stepText, { color: isDark ? colors.darkText : colors.text }]}>
                  PayTech transfère l&apos;argent sur votre compte
                </Text>
              </View>
              <View style={styles.processStep}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={[styles.stepText, { color: isDark ? colors.darkText : colors.text }]}>
                  Vous recevez une notification de confirmation
                </Text>
              </View>
            </View>
          </View>

          {/* Warning Card */}
          <View style={[styles.warningCard, { backgroundColor: colors.warning + '20' }]}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="warning"
              size={24}
              color={colors.warning}
            />
            <View style={styles.warningContent}>
              <Text style={[styles.warningTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Important
              </Text>
              <Text style={[styles.warningText, { color: isDark ? colors.darkText : colors.text }]}>
                • Le montant sera bloqué jusqu&apos;à validation{'\n'}
                • Vérifiez bien votre numéro de téléphone{'\n'}
                • Délai de traitement : 24-48h ouvrées{'\n'}
                • Aucun frais de retrait appliqué
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.accent },
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
                  ios_icon_name="arrow.down.circle.fill"
                  android_material_icon_name="get-app"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.submitButtonText}>Demander le retrait</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>
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
  blockedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  blockedAmount: {
    fontSize: 14,
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
  processCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  processHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  processTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  processSteps: {
    gap: 16,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 4,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  warningText: {
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
    boxShadow: '0px 4px 8px rgba(255, 193, 7, 0.3)',
    elevation: 5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
