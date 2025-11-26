
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useColis, Location, PRICING_CONFIG } from "@/contexts/ColisContext";
import { useDelivery } from "@/contexts/DeliveryContext";
import { useOTP } from "@/contexts/OTPContext";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import PhoneVerificationModal from "@/components/PhoneVerificationModal";
import VerifiedDriverBadge from "@/components/VerifiedDriverBadge";
import ContactButtons from "@/components/ContactButtons";

const YOMBAL_YOON_PHONE = "+221765676486";

export default function ColisScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { 
    addParcelRequest,
    distanceKm,
    calculatedPrice,
    setPickupCoordinates,
    setDropoffCoordinates,
    resetCalculations,
  } = useColis();
  const { assignParcelToNearbyDeliveryPersons } = useDelivery();
  const { isPhoneVerified, loadVerificationStatus } = useOTP();

  // ✅ FIELD IDs CORRECTED - Matching exact specification
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [departureAddress, setDepartureAddress] = useState('');
  const [departureLocation, setDepartureLocation] = useState<Location | null>(null);
  const [arrivalAddress, setArrivalAddress] = useState('');
  const [arrivalLocation, setArrivalLocation] = useState<Location | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  // Validation errors
  const [departureAddressError, setDepartureAddressError] = useState('');
  const [arrivalAddressError, setArrivalAddressError] = useState('');

  // Load verification status on mount
  useEffect(() => {
    loadVerificationStatus();
  }, [loadVerificationStatus]);

  // ✅ IMPROVED canSubmit - Now includes location validation
  const canSubmit = 
    senderName.trim() !== '' &&
    senderPhone.trim() !== '' &&
    recipientName.trim() !== '' &&
    recipientPhone.trim() !== '' &&
    departureAddress.trim() !== '' &&
    departureLocation !== null &&
    arrivalAddress.trim() !== '' &&
    arrivalLocation !== null &&
    description.trim() !== '' &&
    !isSubmitting;

  const validateAddresses = (): boolean => {
    console.log('🔍 VALIDATING ADDRESSES (iOS)...');
    let isValid = true;
    
    setDepartureAddressError('');
    setArrivalAddressError('');
    
    if (departureAddress.trim() !== '' && !departureLocation) {
      console.log('❌ Departure address not selected from autocomplete');
      setDepartureAddressError('Veuillez sélectionner l\'adresse de départ dans la liste proposée');
      isValid = false;
    } else {
      console.log('✅ Departure address valid:', departureLocation);
    }
    
    if (arrivalAddress.trim() !== '' && !arrivalLocation) {
      console.log('❌ Arrival address not selected from autocomplete');
      setArrivalAddressError('Veuillez sélectionner l\'adresse d\'arrivée dans la liste proposée');
      isValid = false;
    } else {
      console.log('✅ Arrival address valid:', arrivalLocation);
    }
    
    console.log('🔍 Validation result (iOS):', isValid);
    return isValid;
  };

  const submitParcel = async () => {
    console.log("DEBUG_SUBMIT_PARCEL_CLICKED");
    
    try {
      setIsSubmitting(true);
      
      const pricingData = distanceKm > 0 ? {
        distance: distanceKm,
        baseFee: PRICING_CONFIG.baseFee,
        kmFee: calculatedPrice - PRICING_CONFIG.baseFee,
        total: calculatedPrice,
      } : undefined;

      const payload = {
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        departureAddress: departureAddress.trim(),
        departureLocation: departureLocation || undefined,
        arrivalAddress: arrivalAddress.trim(),
        arrivalLocation: arrivalLocation || undefined,
        description: description.trim(),
        deliveryOption: 'standard',
        pricing: pricingData,
      };

      console.log("DEBUG_SUBMIT_PARCEL_BEFORE_CALL", payload);

      const result = await addParcelRequest(payload);
      
      console.log("DEBUG_SUBMIT_PARCEL_RESPONSE", result);

      if (result.error) {
        console.log("SUBMIT_PARCEL_BACKEND_ERROR", result.error);
        Alert.alert(
          "Erreur",
          "Impossible d'enregistrer votre colis. Veuillez réessayer."
        );
        return;
      }

      // Succès
      if (result.success && result.requestId) {
        console.log('✅ SUBMIT_PARCEL_SUCCESS - Request ID:', result.requestId);
        
        if (departureLocation) {
          console.log('📍 Assigning parcel to nearby delivery persons...');
          await assignParcelToNearbyDeliveryPersons(
            result.requestId,
            departureLocation,
            departureAddress.trim()
          );
          console.log('✅ Parcel assigned to nearby delivery persons');
        }

        console.log('🧹 Clearing form...');
        setSenderName('');
        setSenderPhone('');
        setRecipientName('');
        setRecipientPhone('');
        setDepartureAddress('');
        setDepartureLocation(null);
        setArrivalAddress('');
        setArrivalLocation(null);
        setDescription('');
        
        resetCalculations();
        setDepartureAddressError('');
        setArrivalAddressError('');
        
        Alert.alert(
          "Succès",
          "Votre demande de colis a été enregistrée. Vous pouvez la retrouver dans 'Mes colis'.",
          [
            {
              text: 'Voir mes colis',
              onPress: () => router.push('/colis/my-parcels')
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
        
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 8000);
      } else {
        console.log("SUBMIT_PARCEL_BACKEND_ERROR", result.error || "Unknown error");
        Alert.alert(
          "Erreur",
          "Impossible d'enregistrer votre colis. Veuillez réessayer."
        );
      }
    } catch (e: any) {
      console.log("SUBMIT_PARCEL_EXCEPTION", e);
      Alert.alert(
        "Erreur",
        "Une erreur inattendue est survenue. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitClick = async () => {
    console.log('🚀 SUBMIT_PARCEL_CLICKED (iOS)');

    if (!canSubmit) {
      console.log('❌ SUBMIT_PARCEL_VALIDATION_FAILED - canSubmit is false');
      
      if (!departureLocation || !arrivalLocation) {
        console.log('❌ Missing location data');
        Alert.alert(
          'Adresses non valides',
          'Veuillez sélectionner vos adresses dans la liste proposée pour Départ et Arrivée.',
          [{ text: 'OK' }]
        );
      } else {
        console.log('❌ Missing required fields');
        Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      }
      return;
    }

    if (!validateAddresses()) {
      console.log('❌ SUBMIT_PARCEL_VALIDATION_FAILED - Address validation failed');
      Alert.alert(
        'Adresses non valides',
        'Veuillez sélectionner vos adresses dans la liste proposée pour Départ et Arrivée.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('✅ SUBMIT_PARCEL_VALIDATION_OK');

    if (!isPhoneVerified) {
      console.log('⚠️ Phone not verified, showing verification modal');
      setShowVerificationModal(true);
      return;
    }

    // ✅ DIRECT SUBMISSION - Call submitParcel
    await submitParcel();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { backgroundColor: '#FF8C00' }]}>
          <Text style={styles.headerEmoji}>🇸🇳</Text>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Envoi de Colis</Text>
            <Text style={styles.headerSubtitle}>Thiak Thiak</Text>
          </View>
        </View>
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <View style={styles.iconContainer}>
              <IconSymbol
                ios_icon_name="shippingbox.fill"
                android_material_icon_name="local-shipping"
                size={48}
                color={colors.accent}
              />
            </View>
            <Text style={[styles.title, { color: isDark ? colors.darkText : colors.text }]}>
              Envoyer un colis
            </Text>
            {isPhoneVerified && (
              <View style={styles.verifiedBadgeContainer}>
                <VerifiedDriverBadge isVerified={true} compact={true} type="sender" />
              </View>
            )}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}
                onPress={() => router.push('/colis/my-parcels')}
              >
                <IconSymbol
                  ios_icon_name="list.bullet"
                  android_material_icon_name="list"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.quickActionText, { color: isDark ? colors.darkText : colors.text }]}>
                  Mes colis
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}
                onPress={() => router.push('/colis/driver-my-deliveries')}
              >
                <IconSymbol
                  ios_icon_name="shippingbox.fill"
                  android_material_icon_name="local-shipping"
                  size={20}
                  color={colors.accent}
                />
                <Text style={[styles.quickActionText, { color: isDark ? colors.darkText : colors.text }]}>
                  Mes livraisons
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.formCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Informations Expéditeur
            </Text>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Nom complet *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? colors.darkBackground : colors.background,
                    color: isDark ? colors.darkText : colors.text,
                    borderColor: isDark ? colors.darkCard : colors.border,
                  }
                ]}
                placeholder="Votre nom"
                placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
                value={senderName}
                onChangeText={setSenderName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Téléphone *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? colors.darkBackground : colors.background,
                    color: isDark ? colors.darkText : colors.text,
                    borderColor: isDark ? colors.darkCard : colors.border,
                  }
                ]}
                placeholder="+221 XX XXX XX XX"
                placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
                value={senderPhone}
                onChangeText={setSenderPhone}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.divider} />
            <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Informations Destinataire
            </Text>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Nom complet *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? colors.darkBackground : colors.background,
                    color: isDark ? colors.darkText : colors.text,
                    borderColor: isDark ? colors.darkCard : colors.border,
                  }
                ]}
                placeholder="Nom du destinataire"
                placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
                value={recipientName}
                onChangeText={setRecipientName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Téléphone *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? colors.darkBackground : colors.background,
                    color: isDark ? colors.darkText : colors.text,
                    borderColor: isDark ? colors.darkCard : colors.border,
                  }
                ]}
                placeholder="+221 XX XXX XX XX"
                placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
                value={recipientPhone}
                onChangeText={setRecipientPhone}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.divider} />
            <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Détails du Colis
            </Text>
            <AddressAutocomplete
              value={departureAddress}
              onChangeText={(text) => {
                setDepartureAddress(text);
                setDepartureAddressError('');
                if (departureLocation) {
                  console.log('⚠️ User is typing, resetting departure location');
                  setDepartureLocation(null);
                  setPickupCoordinates(null, null);
                }
              }}
              onSelectAddress={(address, location, placeId) => {
                console.log('✅ Departure address selected from autocomplete (iOS)');
                setDepartureAddress(address);
                setDepartureLocation(location);
                setPickupCoordinates(location.lat, location.lng, placeId);
                setDepartureAddressError('');
                console.log('   - Address:', address);
                console.log('   - Location:', location);
                console.log('   - Place ID:', placeId);
              }}
              placeholder="Rechercher une adresse à Dakar..."
              label="Adresse de départ *"
              error={departureAddressError}
            />
            <AddressAutocomplete
              value={arrivalAddress}
              onChangeText={(text) => {
                setArrivalAddress(text);
                setArrivalAddressError('');
                if (arrivalLocation) {
                  console.log('⚠️ User is typing, resetting arrival location');
                  setArrivalLocation(null);
                  setDropoffCoordinates(null, null);
                }
              }}
              onSelectAddress={(address, location, placeId) => {
                console.log('✅ Arrival address selected from autocomplete (iOS)');
                setArrivalAddress(address);
                setArrivalLocation(location);
                setDropoffCoordinates(location.lat, location.lng, placeId);
                setArrivalAddressError('');
                console.log('   - Address:', address);
                console.log('   - Location:', location);
                console.log('   - Place ID:', placeId);
              }}
              placeholder="Rechercher une adresse à Dakar..."
              label="Adresse d'arrivée *"
              error={arrivalAddressError}
            />
            {(departureLocation && arrivalLocation) && (
              <View style={[styles.estimationCard, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
                <View style={styles.estimationRow}>
                  <IconSymbol
                    ios_icon_name="location.fill"
                    android_material_icon_name="place"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={[styles.estimationLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    Distance estimée :
                  </Text>
                  <Text style={[styles.estimationValue, { color: isDark ? colors.darkText : colors.text }]}>
                    {distanceKm > 0 ? `${distanceKm.toFixed(1)} km` : '-- km'}
                  </Text>
                </View>
                <View style={styles.estimationRow}>
                  <IconSymbol
                    ios_icon_name="creditcard.fill"
                    android_material_icon_name="payments"
                    size={20}
                    color={colors.accent}
                  />
                  <Text style={[styles.estimationLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    Prix estimé :
                  </Text>
                  <Text style={[styles.estimationValue, { color: colors.accent, fontWeight: '700' }]}>
                    {calculatedPrice > 0 ? `${calculatedPrice} FCFA` : '-- FCFA'}
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Description du colis *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: isDark ? colors.darkBackground : colors.background,
                    color: isDark ? colors.darkText : colors.text,
                    borderColor: isDark ? colors.darkCard : colors.border,
                  }
                ]}
                placeholder="Décrivez le contenu du colis..."
                placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            {showSuccess && (
              <View style={[styles.successCard, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.successIcon]}>✅</Text>
                <Text style={[styles.successTitle, { color: colors.primary }]}>
                  Demande envoyée en toute sécurité !
                </Text>
                <Text style={[styles.successText, { color: isDark ? colors.darkText : colors.text }]}>
                  Votre demande a été envoyée en toute sécurité. Vous pouvez la suivre dans &quot;Mes colis&quot; ou contacter l&apos;équipe Yombal Yoon à tout moment.
                </Text>
                <TouchableOpacity
                  style={[styles.viewParcelsButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/colis/my-parcels')}
                >
                  <IconSymbol
                    ios_icon_name="list.bullet"
                    android_material_icon_name="list"
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.viewParcelsButtonText}>
                    Voir mes colis
                  </Text>
                </TouchableOpacity>
                <View style={styles.successContactButtons}>
                  <ContactButtons phoneNumber={YOMBAL_YOON_PHONE} compact={false} />
                </View>
              </View>
            )}
            <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
              <TouchableOpacity
                onPress={() => {
                  console.log("DEBUG_RAW_BUTTON_PRESS");
                  alert("TEST : le bouton ENVOYER MON COLIS (TEST) répond bien au clic.");
                }}
                style={{
                  backgroundColor: "#E30613",
                  borderRadius: 8,
                  paddingVertical: 14,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 16 }}>
                  ENVOYER MON COLIS (TEST)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <PhoneVerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSuccess={() => {
          setShowVerificationModal(false);
          handleSubmitClick();
        }}
      />
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerEmoji: {
    fontSize: 32,
    marginRight: 12,
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
  content: {
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  verifiedBadgeContainer: {
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  successCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  viewParcelsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  viewParcelsButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  successContactButtons: {
    width: '100%',
    marginTop: 8,
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
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
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  estimationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  estimationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  estimationLabel: {
    fontSize: 14,
    flex: 1,
  },
  estimationValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  submitButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    boxShadow: '0px 4px 8px rgba(255, 0, 0, 0.2)',
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  helperTextContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  helperText: {
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
