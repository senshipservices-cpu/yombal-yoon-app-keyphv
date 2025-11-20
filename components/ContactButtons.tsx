
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { makePhoneCall, openWhatsApp } from '@/utils/phoneUtils';

interface ContactButtonsProps {
  phoneNumber: string;
  userName?: string;
  compact?: boolean;
}

export default function ContactButtons({
  phoneNumber,
  userName,
  compact = false,
}: ContactButtonsProps) {
  const theme = useTheme();
  const isDark = theme.dark;

  const handleCall = () => {
    makePhoneCall(phoneNumber);
  };

  const handleWhatsApp = () => {
    const message = userName
      ? `Bonjour ${userName}, je vous contacte via Yombal Yoon…`
      : 'Bonjour, je vous contacte via Yombal Yoon…';
    openWhatsApp(phoneNumber, message);
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <TouchableOpacity
          style={[styles.compactButton, { backgroundColor: colors.primary }]}
          onPress={handleCall}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="phone.fill"
            android_material_icon_name="phone"
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.compactButton, { backgroundColor: '#25D366' }]}
          onPress={handleWhatsApp}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="message.fill"
            android_material_icon_name="chat"
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleCall}
        activeOpacity={0.7}
      >
        <IconSymbol
          ios_icon_name="phone.fill"
          android_material_icon_name="phone"
          size={20}
          color="#FFFFFF"
        />
        <Text style={styles.buttonText}>Appeler</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#25D366' }]}
        onPress={handleWhatsApp}
        activeOpacity={0.7}
      >
        <IconSymbol
          ios_icon_name="message.fill"
          android_material_icon_name="chat"
          size={20}
          color="#FFFFFF"
        />
        <Text style={styles.buttonText}>WhatsApp</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  compactContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  compactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
});
