
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";
import { useProfile } from "@/contexts/ProfileContext";
import { useRouter } from "expo-router";
import * as Haptics from 'expo-haptics';

export default function EditProfileScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { profile, updateProfile } = useProfile();

  const [fullName, setFullName] = useState(profile.fullName || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!fullName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre nom complet");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre numéro de téléphone");
      return;
    }

    setIsSaving(true);

    try {
      console.log('💾 Saving profile:', { fullName: fullName.trim(), phone: phone.trim() });
      
      await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Succès", "Votre profil a été mis à jour avec succès", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("❌ Error updating profile:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Erreur", 
        error?.message || "Une erreur s'est produite lors de la mise à jour de votre profil"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView 
      style={[styles.safeArea, { backgroundColor: isDark ? colors.darkBackground : colors.background }]} 
      edges={['top']}
    >
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
          Modifier mon profil
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <IconSymbol 
              ios_icon_name="person.fill" 
              android_material_icon_name="person" 
              size={60} 
              color="#FFFFFF" 
            />
          </LinearGradient>
          <TouchableOpacity
            style={[styles.changePhotoButton, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
            activeOpacity={0.7}
            onPress={() => Alert.alert("Photo de profil", "Fonctionnalité à venir")}
          >
            <IconSymbol
              ios_icon_name="camera.fill"
              android_material_icon_name="camera-alt"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View style={[styles.formCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Informations personnelles
          </Text>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.darkText : colors.text }]}>
              Nom complet *
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={20}
                color={isDark ? colors.darkTextSecondary : colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: isDark ? colors.darkText : colors.text }]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Entrez votre nom complet"
                placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: isDark ? colors.darkText : colors.text }]}>
              Numéro de téléphone *
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
              <IconSymbol
                ios_icon_name="phone.fill"
                android_material_icon_name="phone"
                size={20}
                color={isDark ? colors.darkTextSecondary : colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: isDark ? colors.darkText : colors.text }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+221 XX XXX XX XX"
                placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
            {profile.isPhoneVerified && (
              <View style={styles.verifiedBadge}>
                <IconSymbol
                  ios_icon_name="checkmark.shield.fill"
                  android_material_icon_name="verified-user"
                  size={16}
                  color={colors.primary}
                />
                <Text style={[styles.verifiedText, { color: colors.primary }]}>
                  Numéro vérifié
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.infoText, { color: isDark ? colors.darkText : colors.text }]}>
            Ces informations sont utilisées pour vous identifier lors de vos trajets et livraisons.
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: colors.primary },
            isSaving && styles.saveButtonDisabled
          ]}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Text style={styles.saveButtonText}>Enregistrement...</Text>
          ) : (
            <React.Fragment>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
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
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentContainerWithTabBar: {
    paddingBottom: 120,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 16px rgba(0, 128, 0, 0.3)',
    elevation: 8,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 5,
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
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border + '40',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    padding: 18,
    boxShadow: '0px 4px 12px rgba(0, 128, 0, 0.3)',
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
