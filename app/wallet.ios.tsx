
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";
import { useProfile } from "@/contexts/ProfileContext";
import { useRouter } from "expo-router";

export default function WalletScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { wallet } = useProfile();

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleWithdrawal = () => {
    Alert.alert(
      "Bientôt disponible",
      "La fonctionnalité de retrait sera bientôt disponible. Vous pourrez retirer vos fonds via Wave ou Orange Money.",
      [{ text: "OK" }]
    );
  };

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
      >
        {/* Balance Cards */}
        <LinearGradient
          colors={[colors.primary, '#006600']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Solde disponible</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(wallet.balanceAvailable)}</Text>
          <View style={styles.balanceDivider} />
          <View style={styles.pendingBalance}>
            <Text style={styles.pendingLabel}>Solde en attente</Text>
            <Text style={styles.pendingAmount}>{formatCurrency(wallet.balancePending)}</Text>
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
              {formatCurrency(wallet.carpoolStats.totalEarned)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Commission Yombal Yoon ({(wallet.commissionRateCarpool * 100).toFixed(0)}%)
            </Text>
            <Text style={[styles.statValue, { color: colors.accent }]}>
              -{formatCurrency(wallet.carpoolStats.commission)}
            </Text>
          </View>
          <View style={[styles.statRow, styles.statRowTotal]}>
            <Text style={[styles.statLabel, styles.statLabelBold, { color: isDark ? colors.darkText : colors.text }]}>
              Net conducteur
            </Text>
            <Text style={[styles.statValue, styles.statValueBold, { color: colors.primary }]}>
              {formatCurrency(wallet.carpoolStats.netDriver)}
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
              {formatCurrency(wallet.parcelStats.totalEarned)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Commission Yombal Yoon ({(wallet.commissionRateParcel * 100).toFixed(0)}%)
            </Text>
            <Text style={[styles.statValue, { color: colors.accent }]}>
              -{formatCurrency(wallet.parcelStats.commission)}
            </Text>
          </View>
          <View style={[styles.statRow, styles.statRowTotal]}>
            <Text style={[styles.statLabel, styles.statLabelBold, { color: isDark ? colors.darkText : colors.text }]}>
              Net livreur
            </Text>
            <Text style={[styles.statValue, styles.statValueBold, { color: colors.primary }]}>
              {formatCurrency(wallet.parcelStats.netDelivery)}
            </Text>
          </View>
        </View>

        {/* Transaction History */}
        <View style={[styles.historyCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.historyTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Historique des transactions
          </Text>
          {wallet.transactions.map((transaction, index) => (
            <React.Fragment key={index}>
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <View
                    style={[
                      styles.transactionIcon,
                      {
                        backgroundColor:
                          transaction.type === 'credit'
                            ? colors.primary + '20'
                            : colors.accent + '20',
                      },
                    ]}
                  >
                    <IconSymbol
                      ios_icon_name={
                        transaction.type === 'credit'
                          ? 'arrow.down.circle.fill'
                          : 'arrow.up.circle.fill'
                      }
                      android_material_icon_name={
                        transaction.type === 'credit' ? 'arrow-downward' : 'arrow-upward'
                      }
                      size={24}
                      color={transaction.type === 'credit' ? colors.primary : colors.accent}
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionDescription, { color: isDark ? colors.darkText : colors.text }]}>
                      {transaction.description}
                    </Text>
                    <Text style={[styles.transactionDate, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      {formatDate(transaction.date)}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color: transaction.type === 'credit' ? colors.primary : colors.accent,
                    },
                  ]}
                >
                  {transaction.type === 'credit' ? '+' : ''}
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>
            </React.Fragment>
          ))}
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
