
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "@react-navigation/native";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useLivraison } from "@/contexts/LivraisonContext";
import DestinationAutocomplete from "@/components/DestinationAutocomplete";

export default function LivraisonScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const { addInterRegionalRequest } = useLivraison();

  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationData, setDestinationData] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseFee = 1000;

  const calculateTotal = () => {
    if (!destinationData) return 0;
    return baseFee + destinationData.price;
  };

  const handleSubmit = async () => {
    if (!senderName || !senderPhone || !recipientName || !recipientPhone || !destination) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!destinationData) {
      Alert.alert('Erreur', 'Veuillez sélectionner une destination valide');
      return;
    }

    setIsSubmitting(true);

    const requestData = {
      senderName,
      senderPhone,
      recipientName,
      recipientPhone,
      departureRegion: 'Dakar Métropolitaine',
      destinationRegion: destinationData.region || destinationData.name,
      destinationDepartment: destinationData.type === 'department' ? destinationData.name : '',
      description: description || '',
      pricing: {
        baseFee,
        destinationFee: destinationData.price,
        total: calculateTotal(),
      },
    };

    const result = await addInterRegionalRequest(requestData);

    setIsSubmitting(false);

    if (result.success) {
      setShowSuccess(true);
      setSenderName('');
      setSenderPhone('');
      setRecipientName('');
      setRecipientPhone('');
      setDestination('');
      setDestinationData(null);
      setDescription('');

      Alert.alert(
        '✅ Demande enregistrée',
        'Votre demande de livraison vers la région a été enregistrée. L\'équipe Yombal Yoon vous contactera pour la prise en charge.',
        [{ text: 'OK' }]
      );

      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } else {
      Alert.alert(
        '❌ Erreur',
        result.error || 'Impossible d\'enregistrer la demande. Vérifiez votre connexion et réessayez.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.secondary }]}>
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="bolt.fill"
              android_material_icon_name="flash-on"
              size={32}
              color="#333333"
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>LIVRAISON COLIS INTER-REGION</Text>
            <Text style={styles.headerSubtitle}>14 Régions + 45 Départements</Text>
          </View>
        </View>

        {/* Success Message */}
        {showSuccess && (
          <View style={[styles.successCard, { backgroundColor: colors.primary }]}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={32}
              color="#FFFFFF"
            />
            <Text style={styles.successText}>✅ Demande enregistrée !</Text>
            <Text style={styles.successSubtext}>L&apos;équipe Yombal Yoon vous contactera bientôt.</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.formTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Informations Expéditeur
            </Text>

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
                },
              ]}
              placeholder="Entrez votre nom"
              placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
              value={senderName}
              onChangeText={setSenderName}
            />

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
                },
              ]}
              placeholder="77 123 45 67"
              placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
              value={senderPhone}
              onChangeText={setSenderPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.formTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Informations Destinataire
            </Text>

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
                },
              ]}
              placeholder="Nom du destinataire"
              placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
              value={recipientName}
              onChangeText={setRecipientName}
            />

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
                },
              ]}
              placeholder="77 123 45 67"
              placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
              value={recipientPhone}
              onChangeText={setRecipientPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.formTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Détails de Livraison
            </Text>

            <Text style={[styles.label, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Région de départ
            </Text>
            <View style={[styles.fixedInput, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
              <Text style={[styles.fixedInputText, { color: isDark ? colors.darkText : colors.text }]}>
                Dakar Métropolitaine
              </Text>
            </View>

            <DestinationAutocomplete
              value={destination}
              onChangeText={setDestination}
              onSelectDestination={setDestinationData}
              placeholder="Rechercher une région ou département"
              label="Destination (Région / Département) *"
            />

            <Text style={[styles.label, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Description du colis (optionnel)
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: isDark ? colors.darkBackground : colors.background,
                  color: isDark ? colors.darkText : colors.text,
                  borderColor: isDark ? colors.darkCard : colors.border,
                },
              ]}
              placeholder="Décrivez le contenu du colis"
              placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          {destinationData && (
            <View style={[styles.pricingCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
              <Text style={[styles.pricingTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Tarification
              </Text>
              <View style={styles.pricingRow}>
                <Text style={[styles.pricingLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  Frais de base
                </Text>
                <Text style={[styles.pricingValue, { color: isDark ? colors.darkText : colors.text }]}>
                  {baseFee.toLocaleString()} FCFA
                </Text>
              </View>
              <View style={styles.pricingRow}>
                <Text style={[styles.pricingLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  Frais destination ({destinationData.name})
                </Text>
                <Text style={[styles.pricingValue, { color: isDark ? colors.darkText : colors.text }]}>
                  {destinationData.price.toLocaleString()} FCFA
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: isDark ? colors.darkBackground : colors.border }]} />
              <View style={styles.pricingRow}>
                <Text style={[styles.totalLabel, { color: isDark ? colors.darkText : colors.text }]}>
                  Total
                </Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>
                  {calculateTotal().toLocaleString()} FCFA
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton, 
              { backgroundColor: colors.accent },
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <IconSymbol
              ios_icon_name="paperplane.fill"
              android_material_icon_name="send"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'ENVOI EN COURS...' : 'COMMANDER'}
            </Text>
          </TouchableOpacity>
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
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#333333',
    opacity: 0.8,
  },
  successCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 128, 0, 0.2)',
    elevation: 5,
  },
  successText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  successSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    marginBottom: 16,
  },
  fixedInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  fixedInputText: {
    fontSize: 16,
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pricingCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 14,
  },
  pricingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 12,
    boxShadow: '0px 4px 12px rgba(255, 0, 0, 0.3)',
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
