
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "@react-navigation/native";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useColis, PRICING_CONFIG } from "@/contexts/ColisContext";

export default function ColisScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const { 
    addParcelRequest,
    distanceKm,
    calculatedPrice,
    setDistanceKm,
    resetCalculations,
  } = useColis();

  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [departureAddress, setDepartureAddress] = useState('');
  const [arrivalAddress, setArrivalAddress] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Pour tester : champ manuel pour la distance (en attendant Google Maps)
  const [manualDistance, setManualDistance] = useState('');

  const canSubmit = 
    senderName.trim() !== '' &&
    senderPhone.trim() !== '' &&
    recipientName.trim() !== '' &&
    recipientPhone.trim() !== '' &&
    departureAddress.trim() !== '' &&
    arrivalAddress.trim() !== '' &&
    description.trim() !== '' &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer les données de pricing si disponibles
      const pricingData = distanceKm > 0 ? {
        distance: distanceKm,
        baseFee: PRICING_CONFIG.baseFee,
        kmFee: calculatedPrice - PRICING_CONFIG.baseFee,
        total: calculatedPrice,
      } : undefined;

      const result = await addParcelRequest({
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        departureAddress: departureAddress.trim(),
        arrivalAddress: arrivalAddress.trim(),
        description: description.trim(),
        deliveryOption: 'standard',
        pricing: pricingData,
      });

      if (result.success) {
        // Clear form
        setSenderName('');
        setSenderPhone('');
        setRecipientName('');
        setRecipientPhone('');
        setDepartureAddress('');
        setArrivalAddress('');
        setDescription('');
        setManualDistance('');
        
        // Reset calculations
        resetCalculations();
        
        // Show success message
        setShowSuccess(true);
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi de votre demande');
      }
    } catch (error) {
      console.error('Error submitting parcel request:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler pour le champ de distance manuel (test)
  const handleManualDistanceChange = (text: string) => {
    setManualDistance(text);
    const distance = parseFloat(text);
    if (!isNaN(distance) && distance >= 0) {
      setDistanceKm(distance);
    } else {
      setDistanceKm(0);
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
          </View>

          {/* Success Message */}
          {showSuccess && (
            <View style={[styles.successCard, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.successIcon]}>✅</Text>
              <Text style={[styles.successTitle, { color: colors.primary }]}>
                Demande enregistrée !
              </Text>
              <Text style={[styles.successText, { color: isDark ? colors.darkText : colors.text }]}>
                Votre demande a été prise en compte.
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={[styles.formCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Informations Expéditeur
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
                Téléphone
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
                Nom complet
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
                Téléphone
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

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Adresse de départ
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
                placeholder="Ville, quartier, rue..."
                placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
                value={departureAddress}
                onChangeText={setDepartureAddress}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Adresse d&apos;arrivée
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
                placeholder="Ville, quartier, rue..."
                placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
                value={arrivalAddress}
                onChangeText={setArrivalAddress}
              />
            </View>

            {/* Distance et Prix estimés */}
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

            {/* Champ de test pour la distance (temporaire) */}
            <View style={[styles.testCard, { backgroundColor: '#FFF3CD', borderColor: '#FFC107' }]}>
              <Text style={[styles.testTitle, { color: '#856404' }]}>
                🧪 Test - Distance manuelle
              </Text>
              <Text style={[styles.testDescription, { color: '#856404' }]}>
                En attendant Google Maps, saisissez une distance en km pour tester le calcul du prix :
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    borderColor: '#FFC107',
                    marginTop: 8,
                  }
                ]}
                placeholder="Ex: 5.5"
                placeholderTextColor="#999999"
                value={manualDistance}
                onChangeText={handleManualDistanceChange}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Description du colis
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

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: canSubmit ? colors.accent : colors.border }
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'ENVOI EN COURS...' : 'ENVOYER MON COLIS'}
              </Text>
            </TouchableOpacity>
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
  testCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 13,
    lineHeight: 18,
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
});
