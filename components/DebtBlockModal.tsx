
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { formatCurrency } from '@/utils/walletUtils';

interface DebtBlockModalProps {
  visible: boolean;
  debtAmount: number;
  onClose: () => void;
}

export default function DebtBlockModal({ visible, debtAmount, onClose }: DebtBlockModalProps) {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();

  const handleRecharge = () => {
    onClose();
    router.push('/wallet');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: isDark ? colors.darkCard : '#FFFFFF' }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="warning"
              size={48}
              color={colors.accent}
            />
          </View>

          <Text style={[styles.title, { color: isDark ? colors.darkText : colors.text }]}>
            Solde insuffisant
          </Text>

          <Text style={[styles.message, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            Vous devez {formatCurrency(debtAmount)} à Yombal Yoon.
          </Text>

          <Text style={[styles.message, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            Veuillez recharger votre wallet pour continuer à utiliser nos services.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.border }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, { color: isDark ? colors.darkText : colors.text }]}>
                Annuler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.rechargeButton, { backgroundColor: colors.primary }]}
              onPress={handleRecharge}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="plus.circle.fill"
                android_material_icon_name="add-circle"
                size={20}
                color="#FFFFFF"
              />
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                Recharger mon wallet
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
  },
  rechargeButton: {
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
