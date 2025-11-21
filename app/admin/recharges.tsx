
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
  RefreshControl,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import { formatCurrency } from '@/utils/walletUtils';
import * as Haptics from 'expo-haptics';

interface RechargeRequest {
  id: string;
  wallet_id: string;
  user_id: string;
  montant: number;
  mode_paiement: string;
  transaction_id: string;
  statut: string;
  date_demande: string;
  date_validation?: string;
  valide_par?: string;
  motif_refus?: string;
}

export default function AdminRechargesScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();

  const [requests, setRequests] = useState<RechargeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('recharges_wallet')
        .select('*')
        .eq('statut', 'en_attente')
        .order('date_demande', { ascending: false });

      if (error) {
        console.error('Error loading recharge requests:', error);
        Alert.alert('Erreur', 'Impossible de charger les demandes');
        return;
      }

      setRequests(data || []);
    } catch (error) {
      console.error('Error in loadRequests:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRequests();
  };

  const handleValidate = async (request: RechargeRequest) => {
    Alert.alert(
      'Valider la recharge',
      `Confirmer la recharge de ${formatCurrency(request.montant)} via ${request.mode_paiement} ?\n\nTransaction ID: ${request.transaction_id}`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Valider',
          onPress: () => processValidation(request),
        },
      ]
    );
  };

  const processValidation = async (request: RechargeRequest) => {
    setProcessingId(request.id);

    try {
      // 1. Update recharge request status
      const { error: updateError } = await supabase
        .from('recharges_wallet')
        .update({
          statut: 'validee',
          date_validation: new Date().toISOString(),
          valide_par: 'admin', // In production, use actual admin ID
        })
        .eq('id', request.id);

      if (updateError) {
        throw new Error('Erreur lors de la mise à jour de la demande');
      }

      // 2. Get wallet
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('id', request.wallet_id)
        .single();

      if (walletError || !wallet) {
        throw new Error('Erreur lors de la récupération du wallet');
      }

      // 3. Update wallet: add to solde
      const soldeBefore = wallet.solde;
      const soldeAfter = wallet.solde + request.montant;

      const { error: walletUpdateError } = await supabase
        .from('wallets')
        .update({
          solde: soldeAfter,
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.wallet_id);

      if (walletUpdateError) {
        throw new Error('Erreur lors de la mise à jour du wallet');
      }

      // 4. Add transaction
      const { error: transactionError } = await supabase
        .from('transactions_wallet')
        .insert({
          wallet_id: request.wallet_id,
          type: 'recharge',
          montant: request.montant,
          solde_avant: soldeBefore,
          solde_apres: soldeAfter,
          description: `Recharge ${request.mode_paiement} - ${request.transaction_id}`,
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        // Don't throw, transaction is optional
      }

      // Success!
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert('Succès', 'La recharge a été validée');
      
      // Reload requests
      loadRequests();
    } catch (error: any) {
      console.error('Error validating recharge:', error);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: RechargeRequest) => {
    Alert.prompt(
      'Refuser la recharge',
      'Veuillez indiquer la raison du refus:',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Refuser',
          onPress: (reason) => processRejection(request, reason || 'Non spécifié'),
          style: 'destructive',
        },
      ],
      'plain-text'
    );
  };

  const processRejection = async (request: RechargeRequest, reason: string) => {
    setProcessingId(request.id);

    try {
      // Update recharge request status
      const { error: updateError } = await supabase
        .from('recharges_wallet')
        .update({
          statut: 'refusee',
          date_validation: new Date().toISOString(),
          valide_par: 'admin', // In production, use actual admin ID
          motif_refus: reason,
        })
        .eq('id', request.id);

      if (updateError) {
        throw new Error('Erreur lors de la mise à jour de la demande');
      }

      // Success!
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert('Succès', 'La recharge a été refusée');
      
      // Reload requests
      loadRequests();
    } catch (error: any) {
      console.error('Error rejecting recharge:', error);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          <Text style={styles.headerTitle}>Gestion des recharges</Text>
          <Text style={styles.headerSubtitle}>{requests.length} demande(s) en attente</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.content}>
          {requests.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={64}
                color={colors.primary}
              />
              <Text style={[styles.emptyText, { color: isDark ? colors.darkText : colors.text }]}>
                Aucune demande en attente
              </Text>
            </View>
          ) : (
            requests.map((request) => (
              <View
                key={request.id}
                style={[styles.requestCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
              >
                <View style={styles.requestHeader}>
                  <View style={styles.requestInfo}>
                    <Text style={[styles.requestAmount, { color: colors.primary }]}>
                      +{formatCurrency(request.montant)}
                    </Text>
                    <Text style={[styles.requestDate, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      {formatDate(request.date_demande)}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.warning + '20' }]}>
                    <Text style={[styles.statusText, { color: colors.warning }]}>
                      En attente
                    </Text>
                  </View>
                </View>

                <View style={styles.requestDetails}>
                  <View style={styles.detailRow}>
                    <IconSymbol
                      ios_icon_name="person.fill"
                      android_material_icon_name="person"
                      size={20}
                      color={isDark ? colors.darkTextSecondary : colors.textSecondary}
                    />
                    <Text style={[styles.detailText, { color: isDark ? colors.darkText : colors.text }]}>
                      User ID: {request.user_id.substring(0, 8)}...
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <IconSymbol
                      ios_icon_name="number.circle.fill"
                      android_material_icon_name="tag"
                      size={20}
                      color={isDark ? colors.darkTextSecondary : colors.textSecondary}
                    />
                    <Text style={[styles.detailText, { color: isDark ? colors.darkText : colors.text }]}>
                      Transaction: {request.transaction_id}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <IconSymbol
                      ios_icon_name="creditcard.fill"
                      android_material_icon_name="credit-card"
                      size={20}
                      color={isDark ? colors.darkTextSecondary : colors.textSecondary}
                    />
                    <Text style={[styles.detailText, { color: isDark ? colors.darkText : colors.text }]}>
                      {request.mode_paiement === 'wave' ? 'Wave' : 'Orange Money'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.rejectButton,
                      { backgroundColor: colors.error },
                      processingId === request.id && { opacity: 0.6 },
                    ]}
                    onPress={() => handleReject(request)}
                    disabled={processingId === request.id}
                  >
                    {processingId === request.id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <IconSymbol
                          ios_icon_name="xmark.circle.fill"
                          android_material_icon_name="cancel"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.actionButtonText}>Refuser</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.validateButton,
                      { backgroundColor: colors.primary },
                      processingId === request.id && { opacity: 0.6 },
                    ]}
                    onPress={() => handleValidate(request)}
                    disabled={processingId === request.id}
                  >
                    {processingId === request.id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <IconSymbol
                          ios_icon_name="checkmark.circle.fill"
                          android_material_icon_name="check-circle"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.actionButtonText}>Valider</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
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
    padding: 20,
    paddingBottom: 40,
  },
  content: {
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  requestCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  requestInfo: {
    flex: 1,
  },
  requestAmount: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  requestDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 15,
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
    padding: 14,
    borderRadius: 12,
  },
  rejectButton: {
  },
  validateButton: {
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
