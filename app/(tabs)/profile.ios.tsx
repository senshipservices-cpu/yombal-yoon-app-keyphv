
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";
import { useProfile } from "@/contexts/ProfileContext";
import { useRouter } from "expo-router";

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
