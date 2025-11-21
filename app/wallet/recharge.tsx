
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

export default function RechargeScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();

  const [wallet, setWallet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('wave');

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
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
  };

  const getUserId = async (): Promise<string> => {
    const USER_ID_KEY = '@yombal_yoon_user_id';
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }

    return userId;
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

    if (!transactionId.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le numéro de transaction');
      return;
    }

    // Confirm recharge
    Alert.alert(
      'Confirmer la recharge',
      `Vous allez recharger ${formatCurrency(rechargeAmount)} via ${selectedMethod === 'wave' ? 'Wave' : 'Orange Money'}.\n\nAssurez-vous d'avoir effectué le paiement avant de continuer.`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Confirmer',
          onPress: () => processRecharge(rechargeAmount),
        },
      ]
    );
  };

  const processRecharge = async (rechargeAmount: number) => {
    setIsSubmitting(true);

    try {
      const userId = await getUserId();

      // Create recharge request
      const { error: insertError } = await supabase
        .from('recharges_wallet')
        .insert({
          wallet_id: wallet.id,
          user_id: userId,
          montant: rechargeAmount,
          mode_paiement: selectedMethod,
          transaction_id: transactionId.trim(),
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
        'Demande envoyée !',
        `Votre demande de recharge de ${formatCurrency(rechargeAmount)} a été envoyée.\n\nVeuillez envoyer le montant via ${selectedMethod === 'wave' ? 'Wave' : 'Orange Money'} au numéro indiqué par notre équipe.\n\nVotre wallet sera crédité après validation (sous 24-48h).`,
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
          <Text style={styles.headerTitle}>Recharge</Text>
          <Text style={styles.headerSubtitle}>Recharger mon wallet</Text>
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

          {/* Amount Input */}
          <View style={[styles.inputCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.darkText : colors.text }]}>
              Montant à recharger
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
              Minimum: 500 FCFA
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
                onPress={() => setSelectedMethod('wave')}
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
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  selectedMethod === 'orange_money' && styles.methodButtonActive,
                  { backgroundColor: isDark ? colors.darkBackground : colors.background },
                  selectedMethod === 'orange_money' && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => setSelectedMethod('orange_money')}
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
              </TouchableOpacity>
            </View>
          </View>

          {/* Transaction ID Input */}
          <View style={[styles.inputCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.darkText : colors.text }]}>
              Numéro de transaction
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
              <IconSymbol
                ios_icon_name="number.circle.fill"
                android_material_icon_name="tag"
                size={20}
                color={isDark ? colors.darkTextSecondary : colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: isDark ? colors.darkText : colors.text }]}
                placeholder="Ex: TXN123456789"
                placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
                value={transactionId}
                onChangeText={setTransactionId}
                editable={!isSubmitting}
              />
            </View>
            <Text style={[styles.inputHint, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Référence de votre paiement Wave/Orange Money
            </Text>
          </View>

          {/* Instructions Card */}
          <View style={[styles.instructionsCard, { backgroundColor: colors.warning + '20' }]}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="warning"
              size={24}
              color={colors.warning}
            />
            <View style={styles.instructionsContent}>
              <Text style={[styles.instructionsTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Instructions importantes
              </Text>
              <Text style={[styles.instructionsText, { color: isDark ? colors.darkText : colors.text }]}>
                1. Effectuez le paiement via {selectedMethod === 'wave' ? 'Wave' : 'Orange Money'}{'\n'}
                2. Notez le numéro de transaction{'\n'}
                3. Remplissez ce formulaire avec le montant et le numéro{'\n'}
                4. Notre équipe validera votre recharge sous 24-48h
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
              <>
                <IconSymbol
                  ios_icon_name="arrow.up.circle.fill"
                  android_material_icon_name="publish"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.submitButtonText}>Envoyer la demande</Text>
              </>
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
  },
  methodButtonActive: {
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '700',
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
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
