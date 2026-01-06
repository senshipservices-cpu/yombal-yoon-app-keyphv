
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Share as RNShare,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/app/integrations/supabase/client';
import {
  createTripShare,
  getActiveTripShares,
  deactivateTripShare,
  type TripShare,
} from '@/utils/tripSharingUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = 'yombal_yoon_user_id';

export default function ShareTripScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const params = useLocalSearchParams();

  const rideId = params.rideId as string;
  const bookingId = params.bookingId as string | undefined;

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [expiresInHours, setExpiresInHours] = useState('24');
  const [isLoading, setIsLoading] = useState(false);
  const [activeShares, setActiveShares] = useState<TripShare[]>([]);
  const [rideDetails, setRideDetails] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Get user ID
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) {
        Alert.alert('Erreur', 'Utilisateur non identifié');
        return;
      }

      // Load ride details
      const { data: ride, error: rideError } = await supabase
        .from('carpool_rides')
        .select('*')
        .eq('id', rideId)
        .single();

      if (rideError || !ride) {
        console.error('Error loading ride:', rideError);
        Alert.alert('Erreur', 'Impossible de charger les détails du trajet');
        return;
      }

      setRideDetails(ride);

      // Load active shares
      const result = await getActiveTripShares(userId);
      if (result.success && result.shares) {
        const rideShares = result.shares.filter(s => s.ride_id === rideId);
        setActiveShares(rideShares);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShare = async () => {
    if (!recipientName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom du destinataire');
      return;
    }

    if (!recipientPhone.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le numéro de téléphone du destinataire');
      return;
    }

    try {
      setIsLoading(true);

      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) {
        Alert.alert('Erreur', 'Utilisateur non identifié');
        return;
      }

      const hours = parseInt(expiresInHours) || 24;

      const result = await createTripShare(
        rideId,
        bookingId || null,
        userId,
        recipientName.trim(),
        recipientPhone.trim(),
        recipientEmail.trim() || undefined,
        hours
      );

      if (result.success && result.shareUrl) {
        // Copy to clipboard
        await Clipboard.setStringAsync(result.shareUrl);

        // Share via native share dialog
        const shareMessage = `🚗 ${recipientName}, je partage mon trajet avec vous pour votre sécurité.\n\n📍 De: ${rideDetails?.departure_city}\n📍 Vers: ${rideDetails?.arrival_city}\n🕐 Départ: ${new Date(rideDetails?.departure_datetime).toLocaleString('fr-FR')}\n\n🔗 Suivez mon trajet en temps réel:\n${result.shareUrl}\n\n✅ Vous recevrez des notifications automatiques (départ, arrivée, alertes).\n\n🚨 En cas d'urgence, je peux déclencher une alerte SOS.\n\n- Yombal Yoon`;

        try {
          await RNShare.share({
            message: shareMessage,
            title: 'Partage de trajet - Yombal Yoon',
          });
        } catch (shareError) {
          console.log('Share cancelled or error:', shareError);
        }

        Alert.alert(
          '✅ Lien créé',
          'Le lien de partage a été copié dans le presse-papiers et vous pouvez le partager maintenant.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setRecipientName('');
                setRecipientPhone('');
                setRecipientEmail('');
                loadData();
              },
            },
          ]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de créer le lien de partage');
      }
    } catch (error) {
      console.error('Error creating share:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async (shareUrl: string) => {
    await Clipboard.setStringAsync(shareUrl);
    Alert.alert('✅ Copié', 'Le lien a été copié dans le presse-papiers');
  };

  const handleShareLink = async (share: TripShare) => {
    const shareMessage = `🚗 ${share.recipient_name || 'Bonjour'}, je partage mon trajet avec vous pour votre sécurité.\n\n📍 De: ${rideDetails?.departure_city}\n📍 Vers: ${rideDetails?.arrival_city}\n🕐 Départ: ${new Date(rideDetails?.departure_datetime).toLocaleString('fr-FR')}\n\n🔗 Suivez mon trajet en temps réel:\n${share.share_url}\n\n✅ Vous recevrez des notifications automatiques (départ, arrivée, alertes).\n\n🚨 En cas d'urgence, je peux déclencher une alerte SOS.\n\n- Yombal Yoon`;

    try {
      await RNShare.share({
        message: shareMessage,
        title: 'Partage de trajet - Yombal Yoon',
      });
    } catch (error) {
      console.log('Share cancelled or error:', error);
    }
  };

  const handleDeactivateShare = async (shareId: string) => {
    Alert.alert(
      'Désactiver le partage',
      'Êtes-vous sûr de vouloir désactiver ce partage ? Le destinataire ne pourra plus suivre votre trajet.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Désactiver',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const result = await deactivateTripShare(shareId);
              if (result.success) {
                Alert.alert('✅ Désactivé', 'Le partage a été désactivé');
                loadData();
              } else {
                Alert.alert('Erreur', 'Impossible de désactiver le partage');
              }
            } catch (error) {
              console.error('Error deactivating share:', error);
              Alert.alert('Erreur', 'Une erreur est survenue');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Partager mon trajet</Text>
          <Text style={styles.headerSubtitle}>Sécurité renforcée</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.primary + '15' }]}>
          <IconSymbol
            ios_icon_name="shield.checkmark.fill"
            android_material_icon_name="verified-user"
            size={32}
            color={colors.primary}
          />
          <Text style={[styles.infoTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Partagez votre trajet avec vos proches
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Vos proches pourront suivre votre position en temps réel et recevront des notifications automatiques (départ, arrivée, alertes).
          </Text>
        </View>

        {/* Create New Share */}
        <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Nouveau partage
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Nom du destinataire *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.darkBackground : colors.background,
                  color: isDark ? colors.darkText : colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Ex: Maman, Papa, Ami..."
              placeholderTextColor={colors.textSecondary}
              value={recipientName}
              onChangeText={setRecipientName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Numéro de téléphone *
            </Text>
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
              value={recipientPhone}
              onChangeText={setRecipientPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Email (optionnel)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.darkBackground : colors.background,
                  color: isDark ? colors.darkText : colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="email@exemple.com"
              placeholderTextColor={colors.textSecondary}
              value={recipientEmail}
              onChangeText={setRecipientEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Durée de validité (heures)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.darkBackground : colors.background,
                  color: isDark ? colors.darkText : colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="24"
              placeholderTextColor={colors.textSecondary}
              value={expiresInHours}
              onChangeText={setExpiresInHours}
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={handleCreateShare}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol
                  ios_icon_name="link"
                  android_material_icon_name="link"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.createButtonText}>Créer et partager</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Shares */}
        {activeShares.length > 0 && (
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Partages actifs ({activeShares.length})
            </Text>

            {activeShares.map((share) => (
              <View key={share.id} style={[styles.shareItem, { borderBottomColor: colors.border }]}>
                <View style={styles.shareInfo}>
                  <View style={styles.shareHeader}>
                    <IconSymbol
                      ios_icon_name="person.fill"
                      android_material_icon_name="person"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.shareName, { color: isDark ? colors.darkText : colors.text }]}>
                      {share.recipient_name || 'Destinataire'}
                    </Text>
                  </View>
                  <Text style={[styles.sharePhone, { color: colors.textSecondary }]}>
                    {share.recipient_phone}
                  </Text>
                  {share.expires_at && (
                    <Text style={[styles.shareExpiry, { color: colors.textSecondary }]}>
                      Expire: {new Date(share.expires_at).toLocaleString('fr-FR')}
                    </Text>
                  )}
                  <Text style={[styles.shareAccess, { color: colors.textSecondary }]}>
                    Consulté {share.access_count} fois
                  </Text>
                </View>

                <View style={styles.shareActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                    onPress={() => handleCopyLink(share.share_url)}
                  >
                    <IconSymbol
                      ios_icon_name="doc.on.doc"
                      android_material_icon_name="content-copy"
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                    onPress={() => handleShareLink(share)}
                  >
                    <IconSymbol
                      ios_icon_name="square.and.arrow.up"
                      android_material_icon_name="share"
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.accent + '20' }]}
                    onPress={() => handleDeactivateShare(share.id)}
                  >
                    <IconSymbol
                      ios_icon_name="xmark"
                      android_material_icon_name="close"
                      size={18}
                      color={colors.accent}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Features */}
        <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Fonctionnalités de sécurité
          </Text>

          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="location-on"
              size={24}
              color={colors.primary}
            />
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Suivi en temps réel
              </Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                Votre position est mise à jour toutes les 10 secondes
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="bell.fill"
              android_material_icon_name="notifications"
              size={24}
              color={colors.primary}
            />
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Notifications automatiques
              </Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                Départ, arrivée et alertes envoyées automatiquement
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="warning"
              size={24}
              color={colors.accent}
            />
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Bouton SOS
              </Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                Alerte d'urgence envoyée instantanément à vos proches
              </Text>
            </View>
          </View>
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
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 68 : 60,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputContainer: {
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
    fontSize: 15,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  shareItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  shareInfo: {
    flex: 1,
  },
  shareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  shareName: {
    fontSize: 16,
    fontWeight: '600',
  },
  sharePhone: {
    fontSize: 14,
    marginBottom: 2,
  },
  shareExpiry: {
    fontSize: 12,
    marginBottom: 2,
  },
  shareAccess: {
    fontSize: 12,
  },
  shareActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});
