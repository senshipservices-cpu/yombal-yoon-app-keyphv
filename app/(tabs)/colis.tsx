
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TextInput, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useColis, Location, PRICING_CONFIG } from "@/contexts/ColisContext";
import { useDelivery } from "@/contexts/DeliveryContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useOTP } from "@/contexts/OTPContext";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import PhoneVerificationModal from "@/components/PhoneVerificationModal";
import SecurityReminderModal from "@/components/SecurityReminderModal";
import VerifiedDriverBadge from "@/components/VerifiedDriverBadge";
import ContactButtons from "@/components/ContactButtons";
import { maskPhoneNumber } from "@/utils/phoneUtils";
import { demoMode, demoParcels } from "@/config/demoMode";

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
    pickupPlaceId,
    dropoffPlaceId,
  } = useColis();
  const { assignParcelToNearbyDeliveryPersons } = useDelivery();
  const { profile } = useProfile();
  const { isPhoneVerified, loadVerificationStatus } = useOTP();

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
  const [showSecurityReminder, setShowSecurityReminder] = useState(false);
  
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
    departureLocation !== null &&  // ✅ Must have departure location
    arrivalAddress.trim() !== '' &&
    arrivalLocation !== null &&    // ✅ Must have arrival location
    description.trim() !== '' &&
    !isSubmitting;

  // 🔍 DEBUG: Log canSubmit state before render
  useEffect(() => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 DEBUG_CAN_SUBMIT_PARCEL (Web)');
    console.log('═══════════════════════════════════════════════════════');
    console.log('   - canSubmit:', canSubmit);
    console.log('   - senderName:', senderName.trim() !== '');
    console.log('   - senderPhone:', senderPhone.trim() !== '');
    console.log('   - recipientName:', recipientName.trim() !== '');
    console.log('   - recipientPhone:', recipientPhone.trim() !== '');
    console.log('   - departureAddress:', departureAddress.trim() !== '');
    console.log('   - departureLocation:', departureLocation !== null, departureLocation);
    console.log('   - arrivalAddress:', arrivalAddress.trim() !== '');
    console.log('   - arrivalLocation:', arrivalLocation !== null, arrivalLocation);
    console.log('   - description:', description.trim() !== '');
    console.log('   - isSubmitting:', isSubmitting);
    console.log('═══════════════════════════════════════════════════════');
  }, [canSubmit, senderName, senderPhone, recipientName, recipientPhone, departureAddress, departureLocation, arrivalAddress, arrivalLocation, description, isSubmitting]);

  const validateAddresses = (): boolean => {
    console.log('🔍 VALIDATING ADDRESSES...');
    let isValid = true;
    
    // Reset errors
    setDepartureAddressError('');
    setArrivalAddressError('');
    
    // Check if departure address was selected from autocomplete
    if (departureAddress.trim() !== '' && !departureLocation) {
      console.log('❌ Departure address not selected from autocomplete');
      setDepartureAddressError('Veuillez sélectionner l\'adresse de départ dans la liste proposée');
      isValid = false;
    } else {
      console.log('✅ Departure address valid:', departureLocation);
    }
    
    // Check if arrival address was selected from autocomplete
    if (arrivalAddress.trim() !== '' && !arrivalLocation) {
      console.log('❌ Arrival address not selected from autocomplete');
      setArrivalAddressError('Veuillez sélectionner l\'adresse d\'arrivée dans la liste proposée');
      isValid = false;
    } else {
      console.log('✅ Arrival address valid:', arrivalLocation);
    }
    
    console.log('🔍 Validation result:', isValid);
    return isValid;
  };

  const handleSubmitClick = () => {
    // ⚠️ TEMPORARY DEBUG ALERTS - PARTIE 2
    console.log("DEBUG_SUBMIT_PARCEL_CLICKED");
    alert("DEBUG_SUBMIT_PARCEL_CLICKED - Le handler est appelé!");

    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 SUBMIT_PARCEL_CLICKED');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📱 Platform:', Platform.OS);
    console.log('📋 Form State:');
    console.log('   - Sender Name:', senderName);
    console.log('   - Sender Phone:', senderPhone);
    console.log('   - Recipient Name:', recipientName);
    console.log('   - Recipient Phone:', recipientPhone);
    console.log('   - Departure Address:', departureAddress);
    console.log('   - Departure Location:', departureLocation);
    console.log('   - Arrival Address:', arrivalAddress);
    console.log('   - Arrival Location:', arrivalLocation);
    console.log('   - Description:', description);
    console.log('   - Distance:', distanceKm, 'km');
    console.log('   - Price:', calculatedPrice, 'FCFA');
    console.log('   - canSubmit:', canSubmit);
    console.log('   - isSubmitting:', isSubmitting);
    console.log('═══════════════════════════════════════════════════════');

    if (!canSubmit) {
      console.log('❌ SUBMIT_PARCEL_VALIDATION_FAILED - canSubmit is false');
      
      // Provide specific error message
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

    // Validate addresses were selected from autocomplete
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

    // Check if phone is verified
    if (!isPhoneVerified) {
      console.log('⚠️ Phone not verified, showing verification modal');
      setShowVerificationModal(true);
      return;
    }

    // Show security reminder before final submission
    console.log('✅ Showing security reminder');
    setShowSecurityReminder(true);
  };

  const handleConfirmSubmit = async () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('📤 SUBMIT_PARCEL_SEND_REQUEST');
    console.log('═══════════════════════════════════════════════════════');
    
    setShowSecurityReminder(false);
    setIsSubmitting(true);

    try {
      // Préparer les données de pricing si disponibles
      const pricingData = distanceKm > 0 ? {
        distance: distanceKm,
        baseFee: PRICING_CONFIG.baseFee,
        kmFee: calculatedPrice - PRICING_CONFIG.baseFee,
        total: calculatedPrice,
      } : undefined;

      console.log('📦 Calling addParcelRequest with data:');
      console.log('   - Sender:', senderName, senderPhone);
      console.log('   - Recipient:', recipientName, recipientPhone);
      console.log('   - Departure:', departureAddress, departureLocation);
      console.log('   - Arrival:', arrivalAddress, arrivalLocation);
      console.log('   - Pricing:', pricingData);

      console.log('DEBUG_SUBMIT_PARCEL_BEFORE_CALL');
      const result = await addParcelRequest({
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
      });

      console.log('DEBUG_SUBMIT_PARCEL_RESPONSE', result);
      console.log('📬 addParcelRequest result:', result);

      if (result.success && result.requestId) {
        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ SUBMIT_PARCEL_SUCCESS');
        console.log('   - Request ID:', result.requestId);
        console.log('═══════════════════════════════════════════════════════');
        
        // ALWAYS assign to nearby delivery persons (not just in demo mode)
        // This is a core feature of the app
        if (departureLocation) {
          console.log('📍 Assigning parcel to nearby delivery persons...');
          await assignParcelToNearbyDeliveryPersons(
            result.requestId,
            departureLocation,
            departureAddress.trim()
          );
          console.log('✅ Parcel assigned to nearby delivery persons');
        } else {
          console.log('⚠️ No departure location available, skipping assignment');
        }

        // Clear form
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
        
        // Reset calculations and errors
        resetCalculations();
        setDepartureAddressError('');
        setArrivalAddressError('');
        
        // Show success message
        console.log('✅ Showing success message');
        Alert.alert(
          '✅ Succès',
          'Votre demande de colis a été enregistrée. Vous pouvez la retrouver dans "Mes colis".',
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
        
        // Hide success message after 8 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 8000);
      } else {
        console.log('═══════════════════════════════════════════════════════');
        console.log('❌ SUBMIT_PARCEL_ERROR');
        console.log('   - Error:', result.error);
        console.log('═══════════════════════════════════════════════════════');
        console.log('DEBUG_SUBMIT_PARCEL_ERROR', result.error);
        
        Alert.alert(
          '❌ Erreur', 
          result.error || 'Impossible d\'enregistrer votre colis. Veuillez réessayer.'
        );
      }
    } catch (error: any) {
      console.log('═══════════════════════════════════════════════════════');
      console.log('❌ SUBMIT_PARCEL_EXCEPTION');
      console.log('   - Error:', error);
      console.log('   - Message:', error?.message);
      console.log('   - Stack:', error?.stack);
      console.log('═══════════════════════════════════════════════════════');
      console.log('DEBUG_SUBMIT_PARCEL_ERROR', error);
      
      console.error('Error submitting parcel request:', error);
      Alert.alert('❌ Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
      console.log('🏁 SUBMIT_PARCEL_COMPLETE');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else {
      return 'À l\'instant';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return colors.primary;
      case 'en_route_delivery':
        return '#FF8C00';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Livré';
      case 'en_route_delivery':
        return 'En cours';
      default:
        return 'En attente';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: '#FF8C00' }]}>
          <Text style={styles.headerEmoji}>🇸🇳</Text>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Envoi de Colis</Text>
            <Text style={styles.headerSubtitle}>Thiak Thiak</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Icon and Title */}
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
            
            {/* Verified Badge */}
            {isPhoneVerified && (
              <View style={styles.verifiedBadgeContainer}>
                <VerifiedDriverBadge isVerified={true} compact={true} type="sender" />
              </View>
            )}
            
            {/* Quick Actions */}
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

          {/* Form */}
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

            {/* Address Autocomplete Fields with Validation */}
            <AddressAutocomplete
              value={departureAddress}
              onChangeText={(text) => {
                setDepartureAddress(text);
                setDepartureAddressError('');
                // Reset location when user types (not selecting from autocomplete)
                if (departureLocation) {
                  console.log('⚠️ User is typing, resetting departure location');
                  setDepartureLocation(null);
                  setPickupCoordinates(null, null);
                }
              }}
              onSelectAddress={(address, location, placeId) => {
                console.log('✅ Departure address selected from autocomplete');
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
                // Reset location when user types (not selecting from autocomplete)
                if (arrivalLocation) {
                  console.log('⚠️ User is typing, resetting arrival location');
                  setArrivalLocation(null);
                  setDropoffCoordinates(null, null);
                }
              }}
              onSelectAddress={(address, location, placeId) => {
                console.log('✅ Arrival address selected from autocomplete');
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

            {/* Distance et Prix estimés */}
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

            {/* Pricing Display */}
            {distanceKm > 0 && (
              <View style={[styles.pricingCard, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
                <Text style={[styles.pricingTitle, { color: isDark ? colors.darkText : colors.text }]}>
                  Détail de la tarification
                </Text>
                
                <View style={styles.pricingRow}>
                  <Text style={[styles.pricingLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    Distance
                  </Text>
                  <Text style={[styles.pricingValue, { color: isDark ? colors.darkText : colors.text }]}>
                    {distanceKm.toFixed(1)} km
                  </Text>
                </View>

                <View style={styles.pricingRow}>
                  <Text style={[styles.pricingLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    Frais de base
                  </Text>
                  <Text style={[styles.pricingValue, { color: isDark ? colors.darkText : colors.text }]}>
                    {PRICING_CONFIG.baseFee} FCFA
                  </Text>
                </View>

                <View style={styles.pricingRow}>
                  <Text style={[styles.pricingLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    Frais kilométriques
                  </Text>
                  <Text style={[styles.pricingValue, { color: isDark ? colors.darkText : colors.text }]}>
                    {calculatedPrice - PRICING_CONFIG.baseFee} FCFA
                  </Text>
                </View>

                <View style={[styles.divider, { marginVertical: 12 }]} />

                <View style={styles.pricingRow}>
                  <Text style={[styles.pricingTotalLabel, { color: isDark ? colors.darkText : colors.text }]}>
                    Total
                  </Text>
                  <Text style={[styles.pricingTotalValue, { color: colors.accent }]}>
                    {calculatedPrice} FCFA
                  </Text>
                </View>

                <View style={styles.deliveryOptionContainer}>
                  <View style={[styles.deliveryBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.deliveryBadgeText, { color: colors.primary }]}>
                      STANDARD
                    </Text>
                  </View>
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

            {/* Success Message - Positioned just above the button */}
            {showSuccess && (
              <View style={[styles.successCard, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.successIcon]}>✅</Text>
                <Text style={[styles.successTitle, { color: colors.primary }]}>
                  Demande envoyée en toute sécurité !
                </Text>
                <Text style={[styles.successText, { color: isDark ? colors.darkText : colors.text }]}>
                  Votre demande a été envoyée en toute sécurité. Vous pouvez la suivre dans &quot;Mes colis&quot; ou contacter l&apos;équipe Yombal Yoon à tout moment.
                </Text>
                
                {/* Quick link to My Parcels */}
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
                
                {/* Contact Buttons in Success Banner */}
                <View style={styles.successContactButtons}>
                  <ContactButtons phoneNumber={YOMBAL_YOON_PHONE} compact={false} />
                </View>
              </View>
            )}

            {/* ⚠️ TEMPORARY: Remove disabled to test if button works */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: canSubmit ? colors.accent : colors.border }
              ]}
              onPress={handleSubmitClick}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'ENVOI EN COURS...' : 'ENVOYER MON COLIS'}
              </Text>
            </TouchableOpacity>

            {/* Helper text below button */}
            {!canSubmit && (
              <View style={styles.helperTextContainer}>
                <Text style={[styles.helperText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  {!departureLocation || !arrivalLocation
                    ? '⚠️ Veuillez sélectionner vos adresses dans la liste proposée'
                    : '⚠️ Veuillez remplir tous les champs obligatoires'}
                </Text>
              </View>
            )}
          </View>

          {/* Demo Parcels Section */}
          {demoMode && demoParcels.length > 0 && (
            <View style={[styles.demoSection, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
              <View style={styles.demoSectionHeader}>
                <IconSymbol
                  ios_icon_name="clock.fill"
                  android_material_icon_name="history"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.demoSectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
                  Exemples de livraisons récentes
                </Text>
              </View>
              <Text style={[styles.demoSectionSubtitle, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Mode Démo - Données d&apos;exemple
              </Text>

              {demoParcels.map((parcel, index) => (
                <View
                  key={index}
                  style={[
                    styles.demoParcelCard,
                    { backgroundColor: isDark ? colors.darkBackground : colors.background }
                  ]}
                >
                  <View style={styles.demoParcelHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(parcel.status) + '20' }]}>
                      <Text style={[styles.statusBadgeText, { color: getStatusColor(parcel.status) }]}>
                        {getStatusText(parcel.status)}
                      </Text>
                    </View>
                    {parcel.deliveredAt && (
                      <Text style={[styles.timeAgo, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {formatTimeAgo(parcel.deliveredAt)}
                      </Text>
                    )}
                  </View>

                  <Text style={[styles.demoParcelTitle, { color: isDark ? colors.darkText : colors.text }]}>
                    {parcel.title}
                  </Text>
                  <Text style={[styles.demoParcelDescription, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    {parcel.description}
                  </Text>

                  <View style={styles.demoParcelRoute}>
                    <Text style={[styles.demoParcelLocation, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      {parcel.from}
                    </Text>
                    <IconSymbol
                      ios_icon_name="arrow.right"
                      android_material_icon_name="arrow-forward"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.demoParcelLocation, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      {parcel.to}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSuccess={() => {
          setShowVerificationModal(false);
          // After verification, show security reminder
          setShowSecurityReminder(true);
        }}
      />

      {/* Security Reminder Modal */}
      <SecurityReminderModal
        visible={showSecurityReminder}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowSecurityReminder(false)}
        type="parcel"
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
    paddingTop: Platform.OS === 'android' ? 48 : 0,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 60,
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
    marginBottom: 16,
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
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  successIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
  pricingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 14,
  },
  pricingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  pricingTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  pricingTotalValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  deliveryOptionContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  deliveryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  deliveryBadgeText: {
    fontSize: 12,
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
  demoSection: {
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  demoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  demoSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  demoSectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  demoParcelCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoParcelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeAgo: {
    fontSize: 12,
  },
  demoParcelTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  demoParcelDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  demoParcelRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoParcelLocation: {
    fontSize: 13,
  },
});
