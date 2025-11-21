
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

interface WithdrawalRequest {
  id: string;
  wallet_id: string;
  user_id: string;
  montant: number;
  mode_paiement: string;
  numero_telephone: string;
  statut: string;
  date_demande: string;
  date_traitement?: string;
  traite_par?: string;
  motif_refus?: string;
}

export default function AdminWithdrawalsScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();

  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('demandes_retrait')
        .select('*')
        .eq('statut', 'en_attente')
        .order('date_demande', { ascending: false });

      if (error) {
        console.error('Error loading withdrawal requests:', error);
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

  const handleApprove = async (request: WithdrawalRequest) => {
    Alert.alert(
      'Approuver le retrait',
      `Confirmer le retrait de ${formatCurrency(request.montant)} vers ${request.mode_paiement} au numéro ${request.numero_telephone} ?\n\nAssurez-vous d'avoir effectué le transfert avant de valider.`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Approuver',
          onPress: () => processApproval(request),
        },
      ]
    );
  };

  const processApproval = async (request: WithdrawalRequest) => {
    setProcessingId(request.id);

    try {
      // 1. Update withdrawal request status
      const { error: updateError } = await supabase
        .from('demandes_retrait')
        .update({
          statut: 'effectue',
          date_traitement: new Date().toISOString(),
          traite_par: 'admin', // In production, use actual admin ID
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

      // 3. Update wallet: reduce solde_bloque
      const { error: walletUpdateError } = await supabase
        .from('wallets')
        .update({
          solde_bloque: Math.max(0, wallet.solde_bloque - request.montant),
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.wallet_id);

      if (walletUpdateError) {
        throw new Error('Erreur lors de la mise à jour du wallet');
      }

      // 4. Add transaction
      const soldeBefore = wallet.solde;
      const soldeAfter = wallet.solde; // Solde doesn't change, only solde_bloque

      const { error: transactionError } = await supabase
        .from('transactions_wallet')
        .insert({
          wallet_id: request.wallet_id,
          type: 'retrait',
          montant: -request.montant,
          solde_avant: soldeBefore,
          solde_apres: soldeAfter,
          description: `Retrait ${request.mode_paiement} - ${request.numero_telephone}`,
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        // Don't throw, transaction is optional
      }

      // Success!
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert('Succès', 'Le retrait a été approuvé');
      
      // Reload requests
      loadRequests();
    } catch (error: any) {
      console.error('Error approving withdrawal:', error);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: WithdrawalRequest) => {
    Alert.prompt(
      'Refuser le retrait',
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

  const processRejection = async (request: WithdrawalRequest, reason: string) => {
    setProcessingId(request.id);

    try {
      // 1. Update withdrawal request status
      const { error: updateError } = await supabase
        .from('demandes_retrait')
        .update({
          statut: 'refuse',
          date_traitement: new Date().toISOString(),
          traite_par: 'admin', // In production, use actual admin ID
          motif_refus: reason,
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

      // 3. Update wallet: restore solde and reduce solde_bloque
      const { error: walletUpdateError } = await supabase
        .from('wallets')
        .update({
          solde: wallet.solde + request.montant,
          solde_bloque: Math.max(0, wallet.solde_bloque - request.montant),
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.wallet_id);

      if (walletUpdateError) {
        throw new Error('Erreur lors de la mise à jour du wallet');
      }

      // Success!
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert('Succès', 'Le retrait a été refusé');
      
      // Reload requests
      loadRequests();
    } catch (error: any) {
      console.error('Error rejecting withdrawal:', error);
      
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
          <ActivityIndicator size="large" color={colors.accent} />
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
          <Text style={styles.headerTitle}>Gestion des retraits</Text>
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
            tintColor={colors.accent}
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
                    <Text style={[styles.requestAmount, { color: colors.accent }]}>
                      {formatCurrency(request.montant)}
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
                      ios_icon_name="phone.fill"
                      android_material_icon_name="phone"
                      size={20}
                      color={isDark ? colors.darkTextSecondary : colors.textSecondary}
                    />
                    <Text style={[styles.detailText, { color: isDark ? colors.darkText : colors.text }]}>
                      {request.numero_telephone}
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
                      styles.approveButton,
                      { backgroundColor: colors.primary },
                      processingId === request.id && { opacity: 0.6 },
                    ]}
                    onPress={() => handleApprove(request)}
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
                        <Text style={styles.actionButtonText}>Approuver</Text>
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
  approveButton: {
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
