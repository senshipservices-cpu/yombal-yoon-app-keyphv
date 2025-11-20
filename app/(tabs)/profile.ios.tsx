
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, Linking } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";
import { useProfile } from "@/contexts/ProfileContext";
import { useRouter } from "expo-router";

const SUPPORT_PHONE = "+221765676486";

export default function ProfileScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { profile, updateProfile, resetProfile, isLoading } = useProfile();

  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);
  const [isDriver, setIsDriver] = useState(profile.roles.driver);
  const [isPassenger, setIsPassenger] = useState(profile.roles.passenger);
  const [isDelivery, setIsDelivery] = useState(profile.roles.delivery);

  const handleSave = async () => {
    await updateProfile({
      fullName,
      phone,
      roles: {
        driver: isDriver,
        passenger: isPassenger,
        delivery: isDelivery,
      },
    });
    Alert.alert("Succès", "Votre profil a été mis à jour");
  };

  const handleReset = () => {
    Alert.alert(
      "Réinitialiser le profil",
      "Êtes-vous sûr de vouloir réinitialiser votre profil ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Réinitialiser",
          style: "destructive",
          onPress: async () => {
            await resetProfile();
            setFullName('');
            setPhone('');
            setIsDriver(false);
            setIsPassenger(false);
            setIsDelivery(false);
            Alert.alert("Succès", "Votre profil a été réinitialisé");
          },
        },
      ]
    );
  };

  const handleCallSupport = async () => {
    try {
      const url = `tel:${SUPPORT_PHONE}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Erreur", "Impossible d'ouvrir l'application téléphone");
      }
    } catch (error) {
      console.log("Error opening phone app:", error);
      Alert.alert("Erreur", "Une erreur s'est produite lors de l'ouverture de l'application téléphone");
    }
  };

  const handleWhatsAppSupport = async () => {
    try {
      const message = encodeURIComponent("Bonjour Yombal Yoon, j'ai une question sur l'application.");
      const url = `https://wa.me/${SUPPORT_PHONE.replace(/\+/g, '')}?text=${message}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Erreur", "Impossible d'ouvrir WhatsApp. Assurez-vous que l'application est installée.");
      }
    } catch (error) {
      console.log("Error opening WhatsApp:", error);
      Alert.alert("Erreur", "Une erreur s'est produite lors de l'ouverture de WhatsApp");
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: isDark ? colors.darkText : colors.text }]}>
            Chargement...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <IconSymbol 
              ios_icon_name="person.fill" 
              android_material_icon_name="person" 
              size={48} 
              color="#FFFFFF" 
            />
          </LinearGradient>
          <Text style={[styles.headerTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Mon Profil
          </Text>
        </View>

        {/* Wallet Button */}
        <TouchableOpacity
          style={[styles.walletButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={() => router.push('/wallet')}
        >
          <IconSymbol
            ios_icon_name="wallet.pass.fill"
            android_material_icon_name="account-balance-wallet"
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.walletButtonText}>Mon Wallet</Text>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron-right"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* Assistance Yombal Yoon Section */}
        <View style={[styles.assistanceCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <View style={styles.assistanceHeader}>
            <IconSymbol
              ios_icon_name="headphones"
              android_material_icon_name="headset-mic"
              size={28}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text, marginBottom: 0 }]}>
              Assistance Yombal Yoon
            </Text>
          </View>

          <Text style={[styles.assistanceDescription, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            Notre équipe est disponible pour vous aider avec vos trajets et vos envois de colis.
          </Text>

          <View style={styles.assistanceButtons}>
            <TouchableOpacity
              style={[styles.assistanceButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={handleCallSupport}
            >
              <IconSymbol
                ios_icon_name="phone.fill"
                android_material_icon_name="phone"
                size={22}
                color="#FFFFFF"
              />
              <Text style={styles.assistanceButtonText}>Appeler Yombal Yoon</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.assistanceButton, { backgroundColor: '#25D366' }]}
              activeOpacity={0.8}
              onPress={handleWhatsAppSupport}
            >
              <IconSymbol
                ios_icon_name="message.fill"
                android_material_icon_name="chat"
                size={22}
                color="#FFFFFF"
              />
              <Text style={styles.assistanceButtonText}>WhatsApp Yombal Yoon</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.assistanceButton, { backgroundColor: colors.accent }]}
              activeOpacity={0.8}
              onPress={() => router.push('/feedback')}
            >
              <IconSymbol
                ios_icon_name="bubble.left.and.bubble.right.fill"
                android_material_icon_name="feedback"
                size={22}
                color="#FFFFFF"
              />
              <Text style={styles.assistanceButtonText}>Donner mon avis</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Form */}
        <View style={[styles.formCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Informations personnelles
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Nom complet
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.darkBackground : colors.background,
                  color: isDark ? colors.darkText : colors.text,
                  borderColor: isDark ? colors.darkTextSecondary + '30' : colors.border,
                },
              ]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Entrez votre nom complet"
              placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Téléphone
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.darkBackground : colors.background,
                  color: isDark ? colors.darkText : colors.text,
                  borderColor: isDark ? colors.darkTextSecondary + '30' : colors.border,
                },
              ]}
              value={phone}
              onChangeText={setPhone}
              placeholder="+221 XX XXX XX XX"
              placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Roles Section */}
        <View style={[styles.formCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Mes rôles
          </Text>
          <Text style={[styles.sectionDescription, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            Activez les rôles qui correspondent à votre utilisation de l&apos;application
          </Text>

          <View style={styles.roleItem}>
            <View style={styles.roleInfo}>
              <IconSymbol
                ios_icon_name="car.fill"
                android_material_icon_name="directions-car"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.roleLabel, { color: isDark ? colors.darkText : colors.text }]}>
                Conducteur
              </Text>
            </View>
            <Switch
              value={isDriver}
              onValueChange={setIsDriver}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={isDriver ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.roleItem}>
            <View style={styles.roleInfo}>
              <IconSymbol
                ios_icon_name="person.2.fill"
                android_material_icon_name="people"
                size={24}
                color={colors.accent}
              />
              <Text style={[styles.roleLabel, { color: isDark ? colors.darkText : colors.text }]}>
                Passager
              </Text>
            </View>
            <Switch
              value={isPassenger}
              onValueChange={setIsPassenger}
              trackColor={{ false: colors.border, true: colors.accent + '80' }}
              thumbColor={isPassenger ? colors.accent : colors.textSecondary}
            />
          </View>

          <View style={styles.roleItem}>
            <View style={styles.roleInfo}>
              <IconSymbol
                ios_icon_name="shippingbox.fill"
                android_material_icon_name="local-shipping"
                size={24}
                color={colors.secondary}
              />
              <Text style={[styles.roleLabel, { color: isDark ? colors.darkText : colors.text }]}>
                Livreur Colis
              </Text>
            </View>
            <Switch
              value={isDelivery}
              onValueChange={setIsDelivery}
              trackColor={{ false: colors.border, true: colors.secondary + '80' }}
              thumbColor={isDelivery ? colors.secondary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resetButton, { borderColor: colors.accent }]}
          activeOpacity={0.8}
          onPress={handleReset}
        >
          <Text style={[styles.resetButtonText, { color: colors.accent }]}>
            Réinitialiser mon profil
          </Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.infoTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Yombal Yoon
          </Text>
          <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            Version 1.0.0
          </Text>
          <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            © 2024 Yombal Yoon. Tous droits réservés.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 32,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(0, 128, 0, 0.3)',
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(0, 128, 0, 0.3)',
    elevation: 5,
  },
  walletButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  assistanceCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  assistanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  assistanceDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  assistanceButtons: {
    gap: 12,
  },
  assistanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  assistanceButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
    boxShadow: '0px 4px 12px rgba(0, 128, 0, 0.3)',
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resetButton: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
});
