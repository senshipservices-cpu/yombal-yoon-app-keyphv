
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";
import { useProfile } from "@/contexts/ProfileContext";
import { useRouter } from "expo-router";
import { supabase } from "@/app/integrations/supabase/client";
import { IS_TEST_MODE } from "@/config/testMode";

export default function WalletScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { profile, loadWalletFromDatabase } = useProfile();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const loadWalletData = useCallback(async () => {
    try {
      if (!profile.id) {
        console.log('⚠️ No profile ID available');
        return;
      }

      console.log('💰 Loading wallet data from database for user:', profile.id);

      // Get wallet data from Supabase
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (walletError) {
        console.error('❌ Error loading wallet:', walletError);
        Alert.alert('Erreur', 'Impossible de charger les données du wallet');
        return;
      }

      if (!wallet) {
        console.log('⚠️ No wallet found, creating one...');
        // Create wallet if it doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({
            user_id: profile.id,
            solde: 0,
            solde_bloque: 0,
            total_gagne: 0,
            total_commissions: 0,
          })
          .select()
          .maybeSingle();

        if (createError) {
          console.error('❌ Error creating wallet:', createError);
          Alert.alert('Erreur', 'Impossible de créer le wallet');
          return;
        }

        setWalletData(newWallet);
      } else {
        setWalletData(wallet);
      }

      // Get transactions from database
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions_wallet')
        .select('*')
        .eq('wallet_id', wallet?.id || '')
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) {
        console.error('❌ Error loading transactions:', transactionsError);
      } else {
        setTransactions(transactionsData || []);
      }

      // Reload wallet in context
      await loadWalletFromDatabase();

      console.log('✅ Wallet data loaded successfully');
    } catch (error) {
      console.error('❌ Error in loadWalletData:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du chargement du wallet');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [profile.id, loadWalletFromDatabase]);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadWalletData();
  };

  const handleWithdrawal = () => {
    Alert.alert(
      "Bientôt disponible",
      "La fonctionnalité de retrait sera bientôt disponible. Vous pourrez retirer vos fonds via Wave ou Orange Money.",
      [{ text: "OK" }]
    );
  };

  // Calculate stats from transactions
  const calculateStats = () => {
    const carpoolTransactions = transactions.filter(t => 
      t.description?.toLowerCase().includes('covoiturage') && 
      (t.type === 'gain' || t.type === 'credit')
    );
    const parcelTransactions = transactions.filter(t => 
      t.description?.toLowerCase().includes('colis') && 
      (t.type === 'gain' || t.type === 'credit')
    );

    const carpoolTotal = carpoolTransactions.reduce((sum, t) => sum + Math.abs(t.montant), 0);
    const parcelTotal = parcelTransactions.reduce((sum, t) => sum + Math.abs(t.montant), 0);

    const commissionRateCarpool = IS_TEST_MODE ? 0 : 0.12;
    const commissionRateParcel = IS_TEST_MODE ? 0 : 0.15;

    const carpoolCommission = Math.round(carpoolTotal * commissionRateCarpool);
    const parcelCommission = Math.round(parcelTotal * commissionRateParcel);

    return {
      carpool: {
        totalEarned: carpoolTotal,
        commission: carpoolCommission,
        netDriver: carpoolTotal - carpoolCommission,
        commissionRate: commissionRateCarpool,
      },
      parcel: {
        totalEarned: parcelTotal,
        commission: parcelCommission,
        netDelivery: parcelTotal - parcelCommission,
        commissionRate: commissionRateParcel,
      },
    };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: isDark ? colors.darkText : colors.text }]}>
            Chargement du wallet...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron-left"
            size={28}
            color={colors.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.darkText : colors.text }]}>
          Mon Wallet
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Balance Cards */}
        <LinearGradient
          colors={walletData?.solde < 0 ? [colors.error, '#CC0000'] : [colors.primary, '#006600']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Solde disponible</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(walletData?.solde || 0)}</Text>
          <View style={styles.balanceDivider} />
          <View style={styles.pendingBalance}>
            <Text style={styles.pendingLabel}>Solde en attente</Text>
            <Text style={styles.pendingAmount}>{formatCurrency(walletData?.solde_bloque || 0)}</Text>
          </View>
        </LinearGradient>

        {/* Withdrawal Button */}
        <TouchableOpacity
          style={[styles.withdrawalButton, { backgroundColor: colors.accent }]}
          activeOpacity={0.8}
          onPress={handleWithdrawal}
        >
          <IconSymbol
            ios_icon_name="arrow.down.circle.fill"
            android_material_icon_name="get-app"
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.withdrawalButtonText}>Demander un retrait</Text>
        </TouchableOpacity>

        {/* Module Stats */}
        <View style={[styles.statsCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <View style={styles.statsHeader}>
            <IconSymbol
              ios_icon_name="car.fill"
              android_material_icon_name="directions-car"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.statsTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Covoiturage
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Total encaissé
            </Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {formatCurrency(stats.carpool.totalEarned)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Commission Yombal Yoon ({(stats.carpool.commissionRate * 100).toFixed(0)}%)
              {IS_TEST_MODE && ' - Mode Test'}
            </Text>
            <Text style={[styles.statValue, { color: colors.accent }]}>
              -{formatCurrency(stats.carpool.commission)}
            </Text>
          </View>
          <View style={[styles.statRow, styles.statRowTotal]}>
            <Text style={[styles.statLabel, styles.statLabelBold, { color: isDark ? colors.darkText : colors.text }]}>
              Net conducteur
            </Text>
            <Text style={[styles.statValue, styles.statValueBold, { color: colors.primary }]}>
              {formatCurrency(stats.carpool.netDriver)}
            </Text>
          </View>
        </View>

        <View style={[styles.statsCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <View style={styles.statsHeader}>
            <IconSymbol
              ios_icon_name="shippingbox.fill"
              android_material_icon_name="local-shipping"
              size={24}
              color={colors.accent}
            />
            <Text style={[styles.statsTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Colis
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Total encaissé
            </Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {formatCurrency(stats.parcel.totalEarned)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Commission Yombal Yoon ({(stats.parcel.commissionRate * 100).toFixed(0)}%)
              {IS_TEST_MODE && ' - Mode Test'}
            </Text>
            <Text style={[styles.statValue, { color: colors.accent }]}>
              -{formatCurrency(stats.parcel.commission)}
            </Text>
          </View>
          <View style={[styles.statRow, styles.statRowTotal]}>
            <Text style={[styles.statLabel, styles.statLabelBold, { color: isDark ? colors.darkText : colors.text }]}>
              Net livreur
            </Text>
            <Text style={[styles.statValue, styles.statValueBold, { color: colors.primary }]}>
              {formatCurrency(stats.parcel.netDelivery)}
            </Text>
          </View>
        </View>

        {/* Transaction History */}
        <View style={[styles.historyCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.historyTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Historique des transactions
          </Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol
                ios_icon_name="tray.fill"
                android_material_icon_name="inbox"
                size={48}
                color={isDark ? colors.darkTextSecondary : colors.textSecondary}
              />
              <Text style={[styles.emptyStateText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Aucune transaction pour le moment
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Vos transactions apparaîtront ici
              </Text>
            </View>
          ) : (
            transactions.map((transaction, index) => (
              <React.Fragment key={index}>
                <View style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.transactionIcon,
                        {
                          backgroundColor:
                            transaction.type === 'gain' || transaction.type === 'credit'
                              ? colors.primary + '20'
                              : colors.accent + '20',
                        },
                      ]}
                    >
                      <IconSymbol
                        ios_icon_name={
                          transaction.type === 'gain' || transaction.type === 'credit'
                            ? 'arrow.down.circle.fill'
                            : 'arrow.up.circle.fill'
                        }
                        android_material_icon_name={
                          transaction.type === 'gain' || transaction.type === 'credit' ? 'arrow-downward' : 'arrow-upward'
                        }
                        size={24}
                        color={transaction.type === 'gain' || transaction.type === 'credit' ? colors.primary : colors.accent}
                      />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={[styles.transactionDescription, { color: isDark ? colors.darkText : colors.text }]}>
                        {transaction.description || 'Transaction'}
                      </Text>
                      <Text style={[styles.transactionDate, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {formatDate(transaction.created_at)}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color: transaction.type === 'gain' || transaction.type === 'credit' ? colors.primary : colors.accent,
                      },
                    ]}
                  >
                    {transaction.type === 'gain' || transaction.type === 'credit' ? '+' : ''}
                    {formatCurrency(Math.abs(transaction.montant))}
                  </Text>
                </View>
              </React.Fragment>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    boxShadow: '0px 4px 16px rgba(0, 128, 0, 0.3)',
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
    marginBottom: 16,
  },
  pendingBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  pendingAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  withdrawalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    gap: 12,
    boxShadow: '0px 4px 12px rgba(255, 0, 0, 0.3)',
    elevation: 5,
  },
  withdrawalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statRowTotal: {
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border + '30',
  },
  statLabel: {
    fontSize: 14,
  },
  statLabelBold: {
    fontWeight: '700',
    fontSize: 15,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statValueBold: {
    fontSize: 16,
    fontWeight: '700',
  },
  historyCard: {
    borderRadius: 16,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 12,
  },
});
