
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";
import { useProfile } from "@/contexts/ProfileContext";
import { useRouter } from "expo-router";
import { useNotifications } from "@/contexts/NotificationContext";
import PhoneVerificationModal from "@/components/PhoneVerificationModal";
import * as Haptics from 'expo-haptics';
import { getOrCreateWallet, formatCurrency } from "@/utils/walletUtils";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPPORT_PHONE = "+221765676486";
const USER_ID_KEY = '@yombal_yoon_user_id';

export default function ProfileScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { profile, updateProfile, isLoading, refreshProfile } = useProfile();
  const { registerForPushNotifications } = useNotifications();

  const [isSender, setIsSender] = useState(profile.roles.sender);
  const [isDelivery, setIsDelivery] = useState(profile.roles.delivery);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);

  useEffect(() => {
    setIsSender(profile.roles.sender);
    setIsDelivery(profile.roles.delivery);
  }, [profile]);

  useEffect(() => {
    loadWallet();
  }, []);

  const getUserId = async (): Promise<string> => {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }

    return userId;
  };

  const loadWallet = async () => {
    try {
      setIsLoadingWallet(true);
      const userId = await getUserId();
      const { wallet: walletData, error } = await getOrCreateWallet(userId);

      if (error) {
        console.error('Error loading wallet:', error);
      } else {
        setWallet(walletData);
      }
    } catch (error) {
      console.error('Error in loadWallet:', error);
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const handleRoleToggle = async (role: 'sender' | 'delivery', value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (role === 'sender') {
      setIsSender(value);
    } else {
      setIsDelivery(value);
    }

    const updatedRoles = {
      ...profile.roles,
      [role]: value,
      driver: true,
      passenger: true,
    };

    await updateProfile({
      roles: updatedRoles,
    });

    const activeRoles: string[] = [];
    if (updatedRoles.driver) activeRoles.push('driver');
    if (updatedRoles.passenger) activeRoles.push('passenger');
    if (updatedRoles.delivery) activeRoles.push('delivery');
    if (updatedRoles.sender) activeRoles.push('sender');

    console.log('Registering push notifications with roles:', activeRoles);
    await registerForPushNotifications(profile.phone || 'current_user', activeRoles);

    console.log(`Role ${role} ${value ? 'activated' : 'deactivated'} immediately`);
  };

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 10) return phone;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `${cleaned.substring(0, 2)} *** ** ${cleaned.substring(cleaned.length - 2)}`;
    }
    return phone;
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
      Alert.alert("Erreur", "Une erreur s'est produite");
    }
  };

  const handleWhatsAppSupport = async () => {
    try {
      const message = encodeURIComponent("Bonjour Yombal Yoon, j'ai besoin d'aide.");
      const url = `https://wa.me/${SUPPORT_PHONE.replace(/\+/g, '')}?text=${message}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Erreur", "Impossible d'ouvrir WhatsApp");
      }
    } catch (error) {
      console.log("Error opening WhatsApp:", error);
      Alert.alert("Erreur", "Une erreur s'est produite");
    }
  };

  const handlePhoneVerificationSuccess = async () => {
    await updateProfile({ isPhoneVerified: true });
    await refreshProfile();
    Alert.alert("Succès", "Votre numéro a été vérifié avec succès !");
  };

  const hasProviderRole = profile.roles.driver || profile.roles.delivery;

  if (isLoading) {
    return (
      <SafeAreaView 
        style={[styles.safeArea, { backgroundColor: isDark ? colors.darkBackground : colors.background }]} 
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: isDark ? colors.darkText : colors.text }]}>
            Chargement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView 
      style={[styles.safeArea, { backgroundColor: isDark ? colors.darkBackground : colors.background }]} 
      edges={['top']}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 1️⃣ HEADER – Informations utilisateur */}
        <View style={[styles.headerCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <View style={styles.headerContent}>
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <IconSymbol 
                ios_icon_name="person.fill" 
                android_material_icon_name="person" 
                size={40} 
                color="#FFFFFF" 
              />
            </LinearGradient>
            <View style={styles.headerInfo}>
              <Text style={[styles.userName, { color: isDark ? colors.darkText : colors.text }]}>
                {profile.fullName || 'Utilisateur'}
              </Text>
              <Text style={[styles.userPhone, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                {maskPhone(profile.phone) || 'Non renseigné'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
            onPress={() => router.push('/edit-profile')}
          >
            <Text style={styles.editButtonText}>Modifier mon profil</Text>
          </TouchableOpacity>
        </View>

        {/* 2️⃣ SECTION – ⭐ MES RÔLES */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            ⭐ Mes rôles
          </Text>

          {/* A. Sous-bloc : Covoiturage */}
          <View style={styles.roleCategory}>
            <View style={[styles.categoryHeader, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
              <Text style={[styles.categoryTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Covoiturage
              </Text>
            </View>

            <View style={styles.roleItem}>
              <View style={styles.roleInfo}>
                <IconSymbol
                  ios_icon_name="car.fill"
                  android_material_icon_name="directions-car"
                  size={24}
                  color={colors.primary}
                />
                <View style={styles.roleTextContainer}>
                  <Text style={[styles.roleLabel, { color: isDark ? colors.darkText : colors.text }]}>
                    Conducteur
                  </Text>
                  <View style={[styles.activeBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.activeBadgeText, { color: colors.primary }]}>
                      ✓ Actif
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.roleItem, styles.roleItemLast]}>
              <View style={styles.roleInfo}>
                <IconSymbol
                  ios_icon_name="person.2.fill"
                  android_material_icon_name="people"
                  size={24}
                  color={colors.primary}
                />
                <View style={styles.roleTextContainer}>
                  <Text style={[styles.roleLabel, { color: isDark ? colors.darkText : colors.text }]}>
                    Passager
                  </Text>
                  <View style={[styles.activeBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.activeBadgeText, { color: colors.primary }]}>
                      ✓ Actif
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* B. Sous-bloc : Envoi de colis (Thiak Thiak) */}
          <View style={[styles.roleCategory, styles.roleCategoryLast]}>
            <View style={[styles.categoryHeader, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
              <Text style={[styles.categoryTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Envoi de colis (Thiak Thiak)
              </Text>
            </View>

            <View style={styles.roleItem}>
              <View style={styles.roleInfo}>
                <IconSymbol
                  ios_icon_name="paperplane.fill"
                  android_material_icon_name="send"
                  size={24}
                  color="#FF8C00"
                />
                <View style={styles.roleTextContainer}>
                  <Text style={[styles.roleLabel, { color: isDark ? colors.darkText : colors.text }]}>
                    Expéditeur
                  </Text>
                  <Text style={[styles.roleSubtext, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    Envoyer des colis
                  </Text>
                </View>
              </View>
              <Switch
                value={isSender}
                onValueChange={(value) => handleRoleToggle('sender', value)}
                trackColor={{ false: colors.border, true: '#FF8C00' + '80' }}
                thumbColor={isSender ? '#FF8C00' : colors.textSecondary}
              />
            </View>

            <View style={[styles.roleItem, styles.roleItemLast]}>
              <View style={styles.roleInfo}>
                <IconSymbol
                  ios_icon_name="shippingbox.fill"
                  android_material_icon_name="local-shipping"
                  size={24}
                  color={colors.secondary}
                />
                <View style={styles.roleTextContainer}>
                  <Text style={[styles.roleLabel, { color: isDark ? colors.darkText : colors.text }]}>
                    Livreur
                  </Text>
                  <Text style={[styles.roleSubtext, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    Livrer des colis
                  </Text>
                </View>
              </View>
              <Switch
                value={isDelivery}
                onValueChange={(value) => handleRoleToggle('delivery', value)}
                trackColor={{ false: colors.border, true: colors.secondary + '80' }}
                thumbColor={isDelivery ? colors.secondary : colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* 3️⃣ SECTION – 📦 MES ACTIVITÉS */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            📦 Mes activités
          </Text>

          <TouchableOpacity
            style={styles.activityItem}
            activeOpacity={0.7}
            onPress={() => router.push('/covoiturage/my-rides')}
          >
            <View style={styles.activityLeft}>
              <IconSymbol
                ios_icon_name="car.fill"
                android_material_icon_name="directions-car"
                size={24}
                color={colors.primary}
              />
              <View style={styles.activityTextContainer}>
                <Text style={[styles.activityTitle, { color: isDark ? colors.darkText : colors.text }]}>
                  Mes trajets covoiturage
                </Text>
                <Text style={[styles.activitySubtext, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  Voir l&apos;historique
                </Text>
              </View>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={isDark ? colors.darkTextSecondary : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.activityItem}
            activeOpacity={0.7}
            onPress={() => router.push('/covoiturage/my-reservations')}
          >
            <View style={styles.activityLeft}>
              <IconSymbol
                ios_icon_name="ticket.fill"
                android_material_icon_name="confirmation-number"
                size={24}
                color={colors.accent}
              />
              <View style={styles.activityTextContainer}>
                <Text style={[styles.activityTitle, { color: isDark ? colors.darkText : colors.text }]}>
                  Mes réservations covoiturage
                </Text>
                <Text style={[styles.activitySubtext, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  Voir l&apos;historique
                </Text>
              </View>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={isDark ? colors.darkTextSecondary : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.activityItem}
            activeOpacity={0.7}
            onPress={() => router.push('/colis/my-parcels')}
          >
            <View style={styles.activityLeft}>
              <IconSymbol
                ios_icon_name="shippingbox.fill"
                android_material_icon_name="inventory"
                size={24}
                color="#FF8C00"
              />
              <View style={styles.activityTextContainer}>
                <Text style={[styles.activityTitle, { color: isDark ? colors.darkText : colors.text }]}>
                  Mes colis envoyés
                </Text>
                <Text style={[styles.activitySubtext, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  Voir l&apos;historique
                </Text>
              </View>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={isDark ? colors.darkTextSecondary : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.activityItem, styles.activityItemLast]}
            activeOpacity={0.7}
            onPress={() => router.push('/colis/driver-my-deliveries')}
          >
            <View style={styles.activityLeft}>
              <IconSymbol
                ios_icon_name="truck.box.fill"
                android_material_icon_name="local-shipping"
                size={24}
                color={colors.secondary}
              />
              <View style={styles.activityTextContainer}>
                <Text style={[styles.activityTitle, { color: isDark ? colors.darkText : colors.text }]}>
                  Mes colis à livrer
                </Text>
                <Text style={[styles.activitySubtext, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  Voir l&apos;historique
                </Text>
              </View>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={isDark ? colors.darkTextSecondary : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* 💰 SECTION – MON WALLET YOMBAL YOON */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            💰 Mon Wallet Yombal Yoon
          </Text>

          {isLoadingWallet ? (
            <View style={styles.walletLoadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.walletLoadingText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Chargement du wallet...
              </Text>
            </View>
          ) : !hasProviderRole ? (
            <View style={[styles.walletInactiveCard, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
              <IconSymbol
                ios_icon_name="exclamationmark.circle.fill"
                android_material_icon_name="info"
                size={32}
                color={colors.accent}
              />
              <Text style={[styles.walletInactiveText, { color: isDark ? colors.darkText : colors.text }]}>
                Activez un rôle Conducteur ou Livreur pour commencer à gagner de l&apos;argent avec Yombal Yoon.
              </Text>
            </View>
          ) : wallet ? (
            <React.Fragment>
              <LinearGradient
                colors={wallet.solde < 0 ? [colors.error, '#CC0000'] : [colors.primary, '#006600']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.walletCard}
              >
                <View style={styles.walletHeader}>
                  <IconSymbol
                    ios_icon_name="wallet.pass.fill"
                    android_material_icon_name="account-balance-wallet"
                    size={28}
                    color="#FFFFFF"
                  />
                  <Text style={styles.walletHeaderText}>Solde disponible</Text>
                </View>
                
                <Text style={styles.walletBalance}>
                  {formatCurrency(wallet.solde)}
                </Text>

                {wallet.solde < 0 && (
                  <View style={styles.walletWarning}>
                    <IconSymbol
                      ios_icon_name="exclamationmark.triangle.fill"
                      android_material_icon_name="warning"
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.walletWarningText}>
                      ⚠️ Vous devez {formatCurrency(Math.abs(wallet.solde))} à Yombal Yoon. Veuillez recharger votre wallet.
                    </Text>
                  </View>
                )}

                {wallet.solde_bloque > 0 && (
                  <View style={styles.walletBlocked}>
                    <Text style={styles.walletBlockedText}>
                      Montant en attente : {formatCurrency(wallet.solde_bloque)} (retraits ou courses en cours)
                    </Text>
                  </View>
                )}
              </LinearGradient>

              <TouchableOpacity
                style={[styles.walletMainButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={() => router.push('/wallet')}
              >
                <IconSymbol
                  ios_icon_name="wallet.pass.fill"
                  android_material_icon_name="account-balance-wallet"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.walletMainButtonText}>Voir mon wallet complet</Text>
              </TouchableOpacity>

              <View style={styles.walletQuickActions}>
                <TouchableOpacity
                  style={[styles.walletQuickAction, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}
                  activeOpacity={0.7}
                  onPress={() => router.push('/wallet/withdrawal')}
                >
                  <IconSymbol
                    ios_icon_name="arrow.down.circle.fill"
                    android_material_icon_name="get-app"
                    size={20}
                    color={colors.accent}
                  />
                  <Text style={[styles.walletQuickActionText, { color: isDark ? colors.darkText : colors.text }]}>
                    Demander un retrait
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.walletQuickAction, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}
                  activeOpacity={0.7}
                  onPress={() => router.push('/wallet/recharge')}
                >
                  <IconSymbol
                    ios_icon_name="arrow.up.circle.fill"
                    android_material_icon_name="publish"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={[styles.walletQuickActionText, { color: isDark ? colors.darkText : colors.text }]}>
                    Recharger mon wallet
                  </Text>
                </TouchableOpacity>
              </View>
            </React.Fragment>
          ) : (
            <View style={[styles.walletErrorCard, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="error"
                size={32}
                color={colors.error}
              />
              <Text style={[styles.walletErrorText, { color: isDark ? colors.darkText : colors.text }]}>
                Impossible de charger votre wallet. Veuillez réessayer.
              </Text>
              <TouchableOpacity
                style={[styles.walletRetryButton, { backgroundColor: colors.primary }]}
                onPress={loadWallet}
              >
                <Text style={styles.walletRetryButtonText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 4️⃣ SECTION – 🔐 SÉCURITÉ & IDENTITÉ */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            🔐 Sécurité & identité
          </Text>

          <View style={styles.securityStatus}>
            <IconSymbol
              ios_icon_name={profile.isPhoneVerified ? "checkmark.shield.fill" : "exclamationmark.shield.fill"}
              android_material_icon_name={profile.isPhoneVerified ? "verified-user" : "warning"}
              size={24}
              color={profile.isPhoneVerified ? colors.primary : colors.accent}
            />
            <Text style={[styles.securityStatusText, { color: profile.isPhoneVerified ? colors.primary : colors.accent }]}>
              {profile.isPhoneVerified ? "✅ Numéro vérifié (OTP global)" : "⚠️ Numéro non vérifié"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.securityItem}
            activeOpacity={0.7}
            onPress={() => setShowPhoneVerification(true)}
          >
            <View style={styles.securityLeft}>
              <IconSymbol
                ios_icon_name="phone.fill"
                android_material_icon_name="phone"
                size={20}
                color={isDark ? colors.darkText : colors.text}
              />
              <Text style={[styles.securityItemText, { color: isDark ? colors.darkText : colors.text }]}>
                Gérer mon numéro / OTP
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={isDark ? colors.darkTextSecondary : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.securityItem, styles.securityItemLast]}
            activeOpacity={0.7}
            onPress={() => Alert.alert("Confidentialité & données", "Fonctionnalité à venir")}
          >
            <View style={styles.securityLeft}>
              <IconSymbol
                ios_icon_name="lock.shield.fill"
                android_material_icon_name="security"
                size={20}
                color={isDark ? colors.darkText : colors.text}
              />
              <Text style={[styles.securityItemText, { color: isDark ? colors.darkText : colors.text }]}>
                Confidentialité & données
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={isDark ? colors.darkTextSecondary : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* 5️⃣ SECTION – 💬 ASSISTANCE YOMBAL YOON */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            💬 Assistance Yombal Yoon
          </Text>

          <TouchableOpacity
            style={styles.assistanceItem}
            activeOpacity={0.7}
            onPress={handleWhatsAppSupport}
          >
            <View style={styles.assistanceLeft}>
              <IconSymbol
                ios_icon_name="message.fill"
                android_material_icon_name="chat"
                size={24}
                color="#25D366"
              />
              <Text style={[styles.assistanceItemText, { color: isDark ? colors.darkText : colors.text }]}>
                Contacter sur WhatsApp
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={isDark ? colors.darkTextSecondary : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.assistanceItem}
            activeOpacity={0.7}
            onPress={handleCallSupport}
          >
            <View style={styles.assistanceLeft}>
              <IconSymbol
                ios_icon_name="phone.fill"
                android_material_icon_name="phone"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.assistanceItemText, { color: isDark ? colors.darkText : colors.text }]}>
                Appeler le support
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={isDark ? colors.darkTextSecondary : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.assistanceItem, styles.assistanceItemLast]}
            activeOpacity={0.7}
            onPress={() => router.push('/feedback')}
          >
            <View style={styles.assistanceLeft}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="report-problem"
                size={24}
                color={colors.accent}
              />
              <Text style={[styles.assistanceItemText, { color: isDark ? colors.darkText : colors.text }]}>
                Signaler un problème
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={isDark ? colors.darkTextSecondary : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* 6️⃣ SECTION – ⚙️ PARAMÈTRES */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            ⚙️ Paramètres
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            activeOpacity={0.7}
            onPress={() => Alert.alert("Langue", "Français (FR)")}
          >
            <View style={styles.settingLeft}>
              <IconSymbol
                ios_icon_name="globe"
                android_material_icon_name="language"
                size={20}
                color={isDark ? colors.darkText : colors.text}
              />
              <Text style={[styles.settingItemText, { color: isDark ? colors.darkText : colors.text }]}>
                Langue
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                FR
              </Text>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={isDark ? colors.darkTextSecondary : colors.textSecondary}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <IconSymbol
                ios_icon_name="moon.fill"
                android_material_icon_name="dark-mode"
                size={20}
                color={isDark ? colors.darkText : colors.text}
              />
              <Text style={[styles.settingItemText, { color: isDark ? colors.darkText : colors.text }]}>
                Mode : Clair / Sombre
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => Alert.alert("Mode", "Fonctionnalité à venir")}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={isDark ? colors.primary : colors.textSecondary}
            />
          </View>

          <TouchableOpacity
            style={[styles.settingItem, styles.settingItemLast]}
            activeOpacity={0.7}
            onPress={() => Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
              { text: "Annuler", style: "cancel" },
              { text: "Déconnexion", style: "destructive", onPress: () => console.log("Logout") }
            ])}
          >
            <View style={styles.settingLeft}>
              <IconSymbol
                ios_icon_name="rectangle.portrait.and.arrow.right"
                android_material_icon_name="logout"
                size={20}
                color={colors.accent}
              />
              <Text style={[styles.logoutText, { color: colors.accent }]}>
                Se déconnecter
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 7️⃣ FOOTER – Version */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            v1.0.0 – Yombal Yoon (Production)
          </Text>
        </View>
      </ScrollView>

      <PhoneVerificationModal
        visible={showPhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        onSuccess={handlePhoneVerificationSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },

  // 1️⃣ HEADER
  headerCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
  },
  editButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // SECTION CARD
  sectionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },

  // 2️⃣ ROLES
  roleCategory: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border + '30',
  },
  roleCategoryLast: {
    marginBottom: 0,
  },
  categoryHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '20',
  },
  roleItemLast: {
    borderBottomWidth: 0,
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleSubtext: {
    fontSize: 13,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // 3️⃣ ACTIVITIES
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '20',
  },
  activityItemLast: {
    borderBottomWidth: 0,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  activitySubtext: {
    fontSize: 13,
  },

  // 💰 WALLET SECTION
  walletLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  walletLoadingText: {
    fontSize: 14,
  },
  walletInactiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 12,
  },
  walletInactiveText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  walletCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  walletHeaderText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '600',
  },
  walletBalance: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  walletWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  walletWarningText: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 18,
  },
  walletBlocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  walletBlockedText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  walletMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  walletMainButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  walletQuickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  walletQuickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border + '40',
  },
  walletQuickActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  walletErrorCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    gap: 12,
  },
  walletErrorText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  walletRetryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  walletRetryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 4️⃣ SECURITY
  securityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    marginBottom: 12,
  },
  securityStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '20',
  },
  securityItemLast: {
    borderBottomWidth: 0,
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  securityItemText: {
    fontSize: 16,
    fontWeight: '500',
  },

  // 5️⃣ ASSISTANCE
  assistanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '20',
  },
  assistanceItemLast: {
    borderBottomWidth: 0,
  },
  assistanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  assistanceItemText: {
    fontSize: 16,
    fontWeight: '500',
  },

  // 6️⃣ SETTINGS
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '20',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
  },

  // 7️⃣ FOOTER
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
