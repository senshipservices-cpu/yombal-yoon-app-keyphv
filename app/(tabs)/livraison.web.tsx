
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { YYCard, YYButton, YYFormField, YYChip, YYBadge } from '@/components/YY';
import { YYTheme } from '@/styles/theme';
import { IconSymbol } from '@/components/IconSymbol';
import DestinationAutocomplete from '@/components/DestinationAutocomplete';
import { useLivraison } from '@/contexts/LivraisonContext';

type Step = 'sender' | 'delivery' | 'confirmation';
type ParcelType = 'document' | 'small' | 'medium' | 'large' | 'fragile';
type ReceptionMode = 'domicile' | 'point_relais' | 'gare';

export default function LivraisonScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const { addInterRegionalRequest } = useLivraison();

  // Stepper state
  const [currentStep, setCurrentStep] = useState<Step>('sender');

  // Sender information
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [dropoffPoint, setDropoffPoint] = useState('');
  const [senderNote, setSenderNote] = useState('');

  // Recipient information
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [receptionMode, setReceptionMode] = useState<ReceptionMode>('domicile');

  // Delivery details
  const [departureRegion] = useState('Dakar');
  const [departureDepartment] = useState('Dakar Métropolitaine');
  const [destination, setDestination] = useState('');
  const [destinationData, setDestinationData] = useState<any>(null);
  const [exactAddress, setExactAddress] = useState('');
  
  // Parcel details
  const [parcelType, setParcelType] = useState<ParcelType>('small');
  const [estimatedWeight, setEstimatedWeight] = useState('');
  const [description, setDescription] = useState('');

  // Options
  const [isFragile, setIsFragile] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [hasInsurance, setHasInsurance] = useState(false);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pricing
  const baseFee = 1000;
  const getParcelTypeFee = () => {
    const fees: Record<ParcelType, number> = {
      document: 500,
      small: 1000,
      medium: 2000,
      large: 3500,
      fragile: 2500,
    };
    return fees[parcelType];
  };

  const getOptionsFee = () => {
    let fee = 0;
    if (isFragile) fee += 1000;
    if (isUrgent) fee += 1500;
    if (hasInsurance) fee += 500;
    return fee;
  };

  const calculateTotal = () => {
    if (!destinationData) return 0;
    return baseFee + destinationData.price + getParcelTypeFee() + getOptionsFee();
  };

  const getEstimatedDelivery = () => {
    if (!destinationData) return '';
    if (isUrgent) return '24-48h';
    return '3-5 jours';
  };

  // Validation
  const validateSenderStep = () => {
    const newErrors: Record<string, string> = {};
    if (!senderName.trim()) newErrors.senderName = 'Nom requis';
    if (!senderPhone.trim()) newErrors.senderPhone = 'Téléphone requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDeliveryStep = () => {
    const newErrors: Record<string, string> = {};
    if (!recipientName.trim()) newErrors.recipientName = 'Nom requis';
    if (!recipientPhone.trim()) newErrors.recipientPhone = 'Téléphone requis';
    if (!destination.trim()) newErrors.destination = 'Destination requise';
    if (!destinationData) newErrors.destination = 'Sélectionnez une destination valide';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step navigation
  const handleNext = () => {
    console.log('📍 handleNext called, current step:', currentStep);
    if (currentStep === 'sender') {
      if (validateSenderStep()) {
        console.log('✅ Sender validation passed, moving to delivery');
        setCurrentStep('delivery');
      } else {
        console.log('❌ Sender validation failed');
      }
    } else if (currentStep === 'delivery') {
      if (validateDeliveryStep()) {
        console.log('✅ Delivery validation passed, moving to confirmation');
        setCurrentStep('confirmation');
      } else {
        console.log('❌ Delivery validation failed');
      }
    }
  };

  const handleBack = () => {
    console.log('📍 handleBack called, current step:', currentStep);
    if (currentStep === 'delivery') {
      setCurrentStep('sender');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('delivery');
    }
  };

  // Submit
  const handleSubmit = async () => {
    console.log('🚀 handleSubmit called');
    
    if (!validateDeliveryStep()) {
      console.log('❌ Validation failed, returning to delivery step');
      setCurrentStep('delivery');
      return;
    }

    setIsSubmitting(true);
    console.log('📦 Starting submission process...');

    try {
      const requestData = {
        senderName,
        senderPhone,
        recipientName,
        recipientPhone,
        departureRegion: `${departureRegion} - ${departureDepartment}`,
        destinationRegion: destinationData.region || destinationData.name,
        destinationDepartment: destinationData.type === 'department' ? destinationData.name : '',
        description: `Type: ${parcelType}, Poids: ${estimatedWeight || 'Non spécifié'}, ${description}`,
        pricing: {
          baseFee,
          destinationFee: destinationData.price,
          parcelTypeFee: getParcelTypeFee(),
          optionsFee: getOptionsFee(),
          total: calculateTotal(),
        },
      };

      console.log('📦 Request data prepared:', requestData);
      console.log('📦 Calling addInterRegionalRequest...');
      
      const result = await addInterRegionalRequest(requestData);
      console.log('📦 Result from addInterRegionalRequest:', result);

      setIsSubmitting(false);

      if (result.success) {
        console.log('✅ Request submitted successfully');
        Alert.alert(
          '✅ Demande enregistrée',
          'Votre demande de livraison inter-région a été enregistrée avec succès.\n\n' +
          '📱 Une notification WhatsApp a été envoyée à l\'équipe Yombal Yoon au +221765676486.\n\n' +
          'L\'équipe vous contactera bientôt pour confirmer la livraison.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('🔄 Resetting form...');
                // Reset form
                setSenderName('');
                setSenderPhone('');
                setDropoffPoint('');
                setSenderNote('');
                setRecipientName('');
                setRecipientPhone('');
                setReceptionMode('domicile');
                setDestination('');
                setDestinationData(null);
                setExactAddress('');
                setParcelType('small');
                setEstimatedWeight('');
                setDescription('');
                setIsFragile(false);
                setIsUrgent(false);
                setHasInsurance(false);
                setCurrentStep('sender');
                console.log('✅ Form reset complete');
              },
            },
          ]
        );
      } else {
        console.error('❌ Request submission failed:', result.error);
        Alert.alert(
          '❌ Erreur',
          result.error || 'Impossible d\'enregistrer la demande. Veuillez réessayer.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ Exception during submission:', error);
      setIsSubmitting(false);
      Alert.alert(
        '❌ Erreur',
        'Une erreur est survenue. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    }
  };

  // Render stepper
  const renderStepper = () => {
    const steps = [
      { key: 'sender', label: 'Expéditeur' },
      { key: 'delivery', label: 'Livraison' },
      { key: 'confirmation', label: 'Confirmation' },
    ];

    const currentIndex = steps.findIndex((s) => s.key === currentStep);

    return (
      <View style={styles.stepperContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor:
                      index <= currentIndex
                        ? YYTheme.colors.primary
                        : YYTheme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    {
                      color:
                        index <= currentIndex
                          ? YYTheme.colors.text.inverse
                          : YYTheme.colors.text.secondary,
                    },
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color:
                      index <= currentIndex
                        ? isDark
                          ? YYTheme.colors.text.dark
                          : YYTheme.colors.text.primary
                        : YYTheme.colors.text.secondary,
                    fontWeight: index === currentIndex ? '700' : '400',
                  },
                ]}
              >
                {step.label}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  {
                    backgroundColor:
                      index < currentIndex
                        ? YYTheme.colors.primary
                        : YYTheme.colors.border,
                  },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  // Render sender step
  const renderSenderStep = () => (
    <View>
      <YYCard variant="elevated" style={styles.formCard}>
        <Text
          style={[
            styles.cardTitle,
            { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
          ]}
        >
          Informations Expéditeur
        </Text>

        <YYFormField
          label="Nom complet"
          required
          value={senderName}
          onChangeText={setSenderName}
          placeholder="Entrez votre nom complet"
          error={errors.senderName}
        />

        <YYFormField
          label="Téléphone"
          required
          value={senderPhone}
          onChangeText={setSenderPhone}
          placeholder="77 123 45 67"
          keyboardType="phone-pad"
          error={errors.senderPhone}
        />

        <YYFormField
          label="Point de dépôt (optionnel)"
          value={dropoffPoint}
          onChangeText={setDropoffPoint}
          placeholder="Ex: Gare routière Pompiers"
        />

        <YYFormField
          label="Remarque"
          value={senderNote}
          onChangeText={setSenderNote}
          placeholder="Informations complémentaires"
          multiline
          numberOfLines={3}
        />
      </YYCard>
    </View>
  );

  // Render delivery step
  const renderDeliveryStep = () => (
    <View>
      {/* Recipient Information */}
      <YYCard variant="elevated" style={styles.formCard}>
        <Text
          style={[
            styles.cardTitle,
            { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
          ]}
        >
          Informations Destinataire
        </Text>

        <YYFormField
          label="Nom destinataire"
          required
          value={recipientName}
          onChangeText={setRecipientName}
          placeholder="Nom du destinataire"
          error={errors.recipientName}
        />

        <YYFormField
          label="Téléphone"
          required
          value={recipientPhone}
          onChangeText={setRecipientPhone}
          placeholder="77 123 45 67"
          keyboardType="phone-pad"
          error={errors.recipientPhone}
        />

        <Text
          style={[
            styles.fieldLabel,
            { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
          ]}
        >
          Mode de réception
        </Text>
        <View style={styles.chipsContainer}>
          <YYChip
            selected={receptionMode === 'domicile'}
            onPress={() => setReceptionMode('domicile')}
          >
            À domicile
          </YYChip>
          <YYChip
            selected={receptionMode === 'point_relais'}
            onPress={() => setReceptionMode('point_relais')}
          >
            Point relais
          </YYChip>
          <YYChip
            selected={receptionMode === 'gare'}
            onPress={() => setReceptionMode('gare')}
          >
            Gare routière
          </YYChip>
        </View>
      </YYCard>

      {/* Delivery Details */}
      <YYCard variant="elevated" style={styles.formCard}>
        <Text
          style={[
            styles.cardTitle,
            { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
          ]}
        >
          Détails de Livraison
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
          ]}
        >
          Départ
        </Text>
        <View style={styles.fixedFieldContainer}>
          <Text
            style={[
              styles.fixedFieldLabel,
              { color: YYTheme.colors.text.secondary },
            ]}
          >
            Région
          </Text>
          <Text
            style={[
              styles.fixedFieldValue,
              { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
            ]}
          >
            {departureRegion}
          </Text>
        </View>
        <View style={styles.fixedFieldContainer}>
          <Text
            style={[
              styles.fixedFieldLabel,
              { color: YYTheme.colors.text.secondary },
            ]}
          >
            Département
          </Text>
          <Text
            style={[
              styles.fixedFieldValue,
              { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
            ]}
          >
            {departureDepartment}
          </Text>
        </View>

        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
          ]}
        >
          Destination
        </Text>
        <DestinationAutocomplete
          value={destination}
          onChangeText={setDestination}
          onSelectDestination={setDestinationData}
          placeholder="Rechercher une région ou département"
          label="Région / Département"
        />
        {errors.destination && (
          <Text style={[styles.errorText, { color: YYTheme.colors.error }]}>
            {errors.destination}
          </Text>
        )}

        <YYFormField
          label="Adresse exacte (optionnel)"
          value={exactAddress}
          onChangeText={setExactAddress}
          placeholder="Quartier, rue, point de repère..."
          multiline
          numberOfLines={2}
        />

        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
          ]}
        >
          Colis
        </Text>
        <Text
          style={[
            styles.fieldLabel,
            { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
          ]}
        >
          Type de colis
        </Text>
        <View style={styles.chipsContainer}>
          <YYChip
            selected={parcelType === 'document'}
            onPress={() => setParcelType('document')}
          >
            Document
          </YYChip>
          <YYChip
            selected={parcelType === 'small'}
            onPress={() => setParcelType('small')}
          >
            Petit
          </YYChip>
          <YYChip
            selected={parcelType === 'medium'}
            onPress={() => setParcelType('medium')}
          >
            Moyen
          </YYChip>
          <YYChip
            selected={parcelType === 'large'}
            onPress={() => setParcelType('large')}
          >
            Grand
          </YYChip>
          <YYChip
            selected={parcelType === 'fragile'}
            onPress={() => setParcelType('fragile')}
          >
            Fragile
          </YYChip>
        </View>

        <YYFormField
          label="Poids estimé"
          value={estimatedWeight}
          onChangeText={setEstimatedWeight}
          placeholder="Ex: 2kg, 5kg..."
        />

        <YYFormField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Décrivez le contenu du colis"
          multiline
          numberOfLines={3}
        />

        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
          ]}
        >
          Options
        </Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => setIsFragile(!isFragile)}
          >
            <View style={styles.optionLeft}>
              <IconSymbol
                ios_icon_name={isFragile ? 'checkmark.square.fill' : 'square'}
                android_material_icon_name={isFragile ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={isFragile ? YYTheme.colors.primary : YYTheme.colors.text.secondary}
              />
              <Text
                style={[
                  styles.optionLabel,
                  { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
                ]}
              >
                Fragile
              </Text>
            </View>
            <YYBadge variant="accent" size="small">
              +1000 FCFA
            </YYBadge>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => setIsUrgent(!isUrgent)}
          >
            <View style={styles.optionLeft}>
              <IconSymbol
                ios_icon_name={isUrgent ? 'checkmark.square.fill' : 'square'}
                android_material_icon_name={isUrgent ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={isUrgent ? YYTheme.colors.primary : YYTheme.colors.text.secondary}
              />
              <Text
                style={[
                  styles.optionLabel,
                  { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
                ]}
              >
                Urgent
              </Text>
            </View>
            <YYBadge variant="warning" size="small">
              +1500 FCFA
            </YYBadge>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => setHasInsurance(!hasInsurance)}
          >
            <View style={styles.optionLeft}>
              <IconSymbol
                ios_icon_name={hasInsurance ? 'checkmark.square.fill' : 'square'}
                android_material_icon_name={hasInsurance ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={hasInsurance ? YYTheme.colors.primary : YYTheme.colors.text.secondary}
              />
              <Text
                style={[
                  styles.optionLabel,
                  { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
                ]}
              >
                Assurance
              </Text>
            </View>
            <YYBadge variant="primary" size="small">
              +500 FCFA
            </YYBadge>
          </TouchableOpacity>
        </View>
      </YYCard>
    </View>
  );

  // Render confirmation step
  const renderConfirmationStep = () => (
    <View>
      <YYCard variant="elevated" style={styles.formCard}>
        <Text
          style={[
            styles.cardTitle,
            { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
          ]}
        >
          Récapitulatif
        </Text>

        <View style={styles.summarySection}>
          <Text style={[styles.summaryTitle, { color: YYTheme.colors.primary }]}>
            Expéditeur
          </Text>
          <Text
            style={[
              styles.summaryText,
              { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
            ]}
          >
            {senderName}
          </Text>
          <Text style={[styles.summaryText, { color: YYTheme.colors.text.secondary }]}>
            {senderPhone}
          </Text>
        </View>

        <View style={styles.summarySection}>
          <Text style={[styles.summaryTitle, { color: YYTheme.colors.primary }]}>
            Destinataire
          </Text>
          <Text
            style={[
              styles.summaryText,
              { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
            ]}
          >
            {recipientName}
          </Text>
          <Text style={[styles.summaryText, { color: YYTheme.colors.text.secondary }]}>
            {recipientPhone}
          </Text>
        </View>

        <View style={styles.summarySection}>
          <Text style={[styles.summaryTitle, { color: YYTheme.colors.primary }]}>
            Itinéraire
          </Text>
          <View style={styles.routeContainer}>
            <Text
              style={[
                styles.summaryText,
                { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
              ]}
            >
              {departureRegion}
            </Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={YYTheme.colors.text.secondary}
            />
            <Text
              style={[
                styles.summaryText,
                { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
              ]}
            >
              {destinationData?.name || destination}
            </Text>
          </View>
        </View>

        <View style={styles.summarySection}>
          <Text style={[styles.summaryTitle, { color: YYTheme.colors.primary }]}>
            Colis
          </Text>
          <Text
            style={[
              styles.summaryText,
              { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
            ]}
          >
            Type: {parcelType}
          </Text>
          {estimatedWeight && (
            <Text style={[styles.summaryText, { color: YYTheme.colors.text.secondary }]}>
              Poids: {estimatedWeight}
            </Text>
          )}
        </View>

        {(isFragile || isUrgent || hasInsurance) && (
          <View style={styles.summarySection}>
            <Text style={[styles.summaryTitle, { color: YYTheme.colors.primary }]}>
              Options
            </Text>
            <View style={styles.badgesContainer}>
              {isFragile && (
                <YYBadge variant="accent" size="small">
                  Fragile
                </YYBadge>
              )}
              {isUrgent && (
                <YYBadge variant="warning" size="small">
                  Urgent
                </YYBadge>
              )}
              {hasInsurance && (
                <YYBadge variant="primary" size="small">
                  Assuré
                </YYBadge>
              )}
            </View>
          </View>
        )}
      </YYCard>

      {/* Estimation */}
      {destinationData && (
        <YYCard variant="elevated" style={styles.estimationCard}>
          <View style={styles.estimationRow}>
            <View style={styles.estimationItem}>
              <IconSymbol
                ios_icon_name="clock.fill"
                android_material_icon_name="schedule"
                size={24}
                color={YYTheme.colors.primary}
              />
              <Text
                style={[
                  styles.estimationLabel,
                  { color: YYTheme.colors.text.secondary },
                ]}
              >
                Délai estimé
              </Text>
              <Text
                style={[
                  styles.estimationValue,
                  { color: isDark ? YYTheme.colors.text.dark : YYTheme.colors.text.primary },
                ]}
              >
                {getEstimatedDelivery()}
              </Text>
            </View>

            <View style={styles.estimationDivider} />

            <View style={styles.estimationItem}>
              <IconSymbol
                ios_icon_name="banknote.fill"
                android_material_icon_name="payments"
                size={24}
                color={YYTheme.colors.success}
              />
              <Text
                style={[
                  styles.estimationLabel,
                  { color: YYTheme.colors.text.secondary },
                ]}
              >
                Prix estimé
              </Text>
              <Text style={[styles.estimationPrice, { color: YYTheme.colors.success }]}>
                {calculateTotal().toLocaleString()} FCFA
              </Text>
            </View>
          </View>
        </YYCard>
      )}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? YYTheme.colors.background.dark
            : YYTheme.colors.background.light,
        },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: YYTheme.colors.secondary }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <IconSymbol
              ios_icon_name="bolt.fill"
              android_material_icon_name="flash-on"
              size={32}
              color="#333333"
            />
            <IconSymbol
              ios_icon_name="shippingbox.fill"
              android_material_icon_name="inventory-2"
              size={32}
              color="#333333"
              style={styles.headerIconSecondary}
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>LIVRAISON COLIS</Text>
            <Text style={styles.headerTitle}>INTER-RÉGION</Text>
            <Text style={styles.headerSubtitle}>14 Régions • 45 Départements</Text>
          </View>
        </View>
        {/* Watermark logo - subtle */}
        <View style={styles.watermarkContainer}>
          <Text style={styles.watermark}>YY</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stepper */}
        {renderStepper()}

        {/* Form content based on current step */}
        {currentStep === 'sender' && renderSenderStep()}
        {currentStep === 'delivery' && renderDeliveryStep()}
        {currentStep === 'confirmation' && renderConfirmationStep()}

        {/* Navigation buttons */}
        <View style={styles.navigationContainer}>
          {currentStep !== 'sender' && (
            <YYButton
              variant="outline"
              onPress={handleBack}
              style={styles.navButton}
            >
              Retour
            </YYButton>
          )}
          {currentStep !== 'confirmation' ? (
            <YYButton
              variant="primary"
              onPress={handleNext}
              style={[styles.navButton, currentStep === 'sender' && styles.navButtonFull]}
            >
              Suivant
            </YYButton>
          ) : (
            <YYButton
              variant="primary"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.navButtonFull}
            >
              👉 Valider la demande
            </YYButton>
          )}
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
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  headerIconSecondary: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333333',
    lineHeight: 24,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#333333',
    opacity: 0.8,
    marginTop: 4,
  },
  watermarkContainer: {
    position: 'absolute',
    right: -20,
    top: '50%',
    transform: [{ translateY: -50 }],
    opacity: 0.08,
    zIndex: 1,
  },
  watermark: {
    fontSize: 120,
    fontWeight: '900',
    color: '#333333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  stepLine: {
    height: 2,
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 32,
  },
  formCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  fixedFieldContainer: {
    marginBottom: 12,
  },
  fixedFieldLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  fixedFieldValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    marginBottom: 4,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  estimationCard: {
    marginBottom: 16,
  },
  estimationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimationItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  estimationDivider: {
    width: 1,
    height: 60,
    backgroundColor: YYTheme.colors.border,
    marginHorizontal: 16,
  },
  estimationLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  estimationValue: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  estimationPrice: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  navButton: {
    flex: 1,
  },
  navButtonFull: {
    flex: 1,
  },
});
