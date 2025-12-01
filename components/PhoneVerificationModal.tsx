
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useOTP } from '@/contexts/OTPContext';
import { useProfile } from '@/contexts/ProfileContext';

interface PhoneVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PhoneVerificationModal({
  visible,
  onClose,
  onSuccess,
}: PhoneVerificationModalProps) {
  const theme = useTheme();
  const isDark = theme.dark;
  const { sendOTP, verifyPhone } = useOTP();
  const { profile } = useProfile();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [sentViaMethod, setSentViaMethod] = useState<'whatsapp' | 'sms'>('whatsapp');

  const handleSendOTP = async () => {
    if (!phone.trim()) {
      setError('Veuillez entrer votre numéro de téléphone');
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setError('Format de numéro invalide. Utilisez le format international (+221...)');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await sendOTP(phone, selectedMethod, profile.id);

    setIsLoading(false);

    if (result.success) {
      setStep('otp');
      setError('');
      setSentViaMethod((result.method as 'whatsapp' | 'sms') || selectedMethod);
      
      // Show success message
      Alert.alert(
        'Code envoyé',
        result.message || `Code OTP envoyé par ${result.method === 'sms' ? 'SMS' : 'WhatsApp'}`,
        [{ text: 'OK' }]
      );
    } else {
      setError(result.message || 'Erreur lors de l\'envoi du code');
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError('Veuillez entrer le code OTP');
      return;
    }

    if (otp.length !== 6) {
      setError('Le code OTP doit contenir 6 chiffres');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await verifyPhone(phone, otp, profile.id);

    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        'Succès',
        'Votre numéro a été vérifié avec succès !',
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess();
              handleClose();
            },
          },
        ]
      );
    } else {
      setError(result.message || 'Code incorrect');
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    setError('');
    await handleSendOTP();
  };

  const handleClose = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setError('');
    setSelectedMethod('whatsapp');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: isDark ? colors.darkCard : '#FFFFFF' }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <IconSymbol
              ios_icon_name="xmark.circle.fill"
              android_material_icon_name="cancel"
              size={28}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <IconSymbol
              ios_icon_name="phone.fill"
              android_material_icon_name="phone"
              size={48}
              color={colors.primary}
            />
          </View>

          <Text style={[styles.title, { color: isDark ? colors.darkText : colors.text }]}>
            {step === 'phone' ? 'Vérification du numéro' : 'Entrez le code OTP'}
          </Text>

          <Text style={[styles.description, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            {step === 'phone'
              ? 'Nous allons vous envoyer un code de vérification'
              : `Code envoyé au ${phone} par ${sentViaMethod === 'sms' ? 'SMS' : 'WhatsApp'}`}
          </Text>

          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="error"
                size={20}
                color={colors.error}
              />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          {step === 'phone' ? (
            <React.Fragment>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? colors.darkBackground : colors.background,
                    color: isDark ? colors.darkText : colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="+221 XX XXX XX XX"
                placeholderTextColor={colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!isLoading}
                autoFocus
              />

              <View style={styles.methodSelector}>
                <Text style={[styles.methodLabel, { color: isDark ? colors.darkText : colors.text }]}>
                  Méthode d'envoi :
                </Text>
                <View style={styles.methodButtons}>
                  <TouchableOpacity
                    style={[
                      styles.methodButton,
                      selectedMethod === 'whatsapp' && styles.methodButtonActive,
                      { borderColor: selectedMethod === 'whatsapp' ? colors.primary : colors.border },
                    ]}
                    onPress={() => setSelectedMethod('whatsapp')}
                    disabled={isLoading}
                  >
                    <IconSymbol
                      ios_icon_name="message.fill"
                      android_material_icon_name="chat"
                      size={20}
                      color={selectedMethod === 'whatsapp' ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.methodButtonText,
                        { color: selectedMethod === 'whatsapp' ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      WhatsApp
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.methodButton,
                      selectedMethod === 'sms' && styles.methodButtonActive,
                      { borderColor: selectedMethod === 'sms' ? colors.primary : colors.border },
                    ]}
                    onPress={() => setSelectedMethod('sms')}
                    disabled={isLoading}
                  >
                    <IconSymbol
                      ios_icon_name="envelope.fill"
                      android_material_icon_name="sms"
                      size={20}
                      color={selectedMethod === 'sms' ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.methodButtonText,
                        { color: selectedMethod === 'sms' ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      SMS
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.infoBox, { backgroundColor: colors.primary + '10' }]}>
                <IconSymbol
                  ios_icon_name="info.circle"
                  android_material_icon_name="info"
                  size={16}
                  color={colors.primary}
                />
                <Text style={[styles.infoText, { color: isDark ? colors.darkText : colors.text }]}>
                  Ce numéro servira de relais pour le covoiturage
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors.primary },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleSendOTP}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Envoyer le code</Text>
                )}
              </TouchableOpacity>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <TextInput
                style={[
                  styles.input,
                  styles.otpInput,
                  {
                    backgroundColor: isDark ? colors.darkBackground : colors.background,
                    color: isDark ? colors.darkText : colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="000000"
                placeholderTextColor={colors.textSecondary}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isLoading}
                autoFocus
              />

              <View style={styles.otpHint}>
                <IconSymbol
                  ios_icon_name="clock"
                  android_material_icon_name="schedule"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.otpHintText, { color: colors.textSecondary }]}>
                  Le code expire dans 10 minutes
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors.primary },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleVerifyOTP}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Vérifier</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
                disabled={isLoading}
              >
                <IconSymbol
                  ios_icon_name="arrow.clockwise"
                  android_material_icon_name="refresh"
                  size={16}
                  color={colors.primary}
                />
                <Text style={[styles.resendButtonText, { color: colors.primary }]}>
                  Renvoyer le code
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changeNumberButton}
                onPress={() => setStep('phone')}
                disabled={isLoading}
              >
                <Text style={[styles.changeNumberText, { color: colors.textSecondary }]}>
                  Changer de numéro
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          )}
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
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
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
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 8,
  },
  methodSelector: {
    marginBottom: 16,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  methodButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  methodButtonActive: {
    backgroundColor: colors.primary + '10',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  otpHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  otpHintText: {
    fontSize: 13,
  },
  button: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
  },
  resendButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  changeNumberButton: {
    padding: 8,
    alignItems: 'center',
  },
  changeNumberText: {
    fontSize: 14,
  },
});
