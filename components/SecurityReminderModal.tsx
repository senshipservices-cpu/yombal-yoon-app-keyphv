
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface SecurityReminderModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'carpooling' | 'parcel';
}

export default function SecurityReminderModal({
  visible,
  onConfirm,
  onCancel,
  type = 'carpooling',
}: SecurityReminderModalProps) {
  const theme = useTheme();
  const isDark = theme.dark;

  const getContent = () => {
    if (type === 'parcel') {
      return {
        title: 'Sécurité Yombal Yoon',
        items: [
          'Assurez-vous que l\'adresse de départ et d\'arrivée est correcte.',
          'Remettez votre colis uniquement à un agent ou livreur identifié.',
          'En cas de doute ou de problème, contactez immédiatement l\'équipe Yombal Yoon.',
        ],
        warning: 'Vérifiez toujours l\'identité du livreur avant de remettre votre colis.',
        confirmText: 'Je comprends et je confirme l\'envoi',
      };
    }

    return {
      title: 'Sécurité Yombal Yoon',
      items: [
        'Votre numéro et celui du conducteur sont protégés.',
        'Ne partagez vos informations qu\'avec un conducteur confirmé.',
        'En cas de problème, contactez l\'équipe Yombal Yoon.',
      ],
      warning: 'Vérifiez toujours l\'identité du conducteur avant de monter dans le véhicule.',
      confirmText: 'Je comprends et je confirme',
    };
  };

  const content = getContent();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: isDark ? colors.darkCard : '#FFFFFF' }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <IconSymbol
              ios_icon_name="shield.fill"
              android_material_icon_name="security"
              size={48}
              color={colors.primary}
            />
          </View>

          <Text style={[styles.title, { color: isDark ? colors.darkText : colors.text }]}>
            {content.title}
          </Text>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {content.items.map((item, index) => (
              <View key={index} style={styles.infoItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.infoText, { color: isDark ? colors.darkText : colors.text }]}>
                  {item}
                </Text>
              </View>
            ))}

            <View style={[styles.warningBox, { backgroundColor: colors.warning + '20' }]}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="warning"
                size={20}
                color={colors.warning}
              />
              <Text style={[styles.warningText, { color: colors.warning }]}>
                {content.warning}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.textSecondary }]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: isDark ? colors.darkText : colors.text }]}>
                Annuler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>{content.confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 450,
    borderRadius: 24,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  content: {
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
