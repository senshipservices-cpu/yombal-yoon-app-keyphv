
import { checkDebtStatus, calculateAmounts } from '@/utils/walletUtils';
import { useCovoiturage } from '@/contexts/CovoiturageContext';
import { IS_TEST_MODE } from '@/config/testMode';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Linking,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useProfile } from '@/contexts/ProfileContext';
import { IconSymbol } from '@/components/IconSymbol';
import DebtBlockModal from '@/components/DebtBlockModal';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PhoneVerificationModal from '@/components/PhoneVerificationModal';
import { supabase } from '@/config/supabase';
import { useOTP } from '@/contexts/OTPContext';
import * as Clipboard from 'expo-clipboard';
import { ensureProfileAndWallet } from '@/utils/profileWalletUtils';
import { colors } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CityAutocomplete from '@/components/CityAutocomplete';
import MeetingPointAutocomplete from '@/components/MeetingPointAutocomplete';

interface FavoriteRoute {
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  vehicleType?: string;
}

const FAVORITE_ROUTE_KEY = '@favorite_route';
const USER_ID_KEY = '@user_id';

async function getOrCreateUserId(): Promise<string> {
  try {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
  } catch (error) {
    console.error('Error getting/creating user ID:', error);
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default function PublishRideScreen() {
  const { addRide, isLoading } = useCovoiturage();
  const { isVerified, phoneNumber } = useOTP();
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const { profile } = useProfile();

  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [departureLat, setDepartureLat] = useState<number | null>(null);
  const [departureLng, setDepartureLng] = useState<number | null>(null);
  const [arrivalLat, setArrivalLat] = useState<number | null>(null);
  const [arrivalLng, setArrivalLng] = useState<number | null>(null);
  const [meetingPoint, setMeetingPoint] = useState('');
  const [meetingPointLat, setMeetingPointLat] = useState<number | null>(null);
  const [meetingPointLng, setMeetingPointLng] = useState<number | null>(null);
  const [meetingPointPlaceId, setMeetingPointPlaceId] = useState<string | null>(null);
  const [showMeetingPointModal, setShowMeetingPointModal] = useState(false);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [tempTime, setTempTime] = useState(new Date());
  const [seatsAvailable, setSeatsAvailable] = useState('');
  const [pricePerSeat, setPricePerSeat] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [stops, setStops] = useState('');
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [hasDebt, setHasDebt] = useState(false);
  const [debtAmount, setDebtAmount] = useState(0);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [safetyDeclarationChecked, setSafetyDeclarationChecked] = useState(false);

  const loadVerificationStatus = useCallback(async () => {
    console.log('[PublishRide] Loading verification status...');
    console.log('[PublishRide] isVerified:', isVerified);
    console.log('[PublishRide] phoneNumber:', phoneNumber);
  }, [isVerified, phoneNumber]);

  useEffect(() => {
    loadVerificationStatus();
  }, [loadVerificationStatus]);

  useEffect(() => {
    loadFavoriteRoute();
  }, []);

  const calculateDistanceAndDuration = useCallback(async () => {
    if (!departureLat || !departureLng || !arrivalLat || !arrivalLng) {
      console.log('[PublishRide] Missing coordinates for distance calculation');
      return;
    }

    try {
      console.log('[PublishRide] Calculating distance and duration...');
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/google-places-proxy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`,
          },
          body: JSON.stringify({
            action: 'distance',
            origins: `${departureLat},${departureLng}`,
            destinations: `${arrivalLat},${arrivalLng}`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[PublishRide] Distance API response:', data);

      if (data.rows && data.rows[0] && data.rows[0].elements && data.rows[0].elements[0]) {
        const element = data.rows[0].elements[0];
        if (element.status === 'OK') {
          const distanceInMeters = element.distance.value;
          const durationInSeconds = element.duration.value;
          const distanceInKm = Math.round(distanceInMeters / 1000);
          const durationInMin = Math.round(durationInSeconds / 60);
          
          console.log('[PublishRide] Calculated distance:', distanceInKm, 'km');
          console.log('[PublishRide] Calculated duration:', durationInMin, 'min');
          
          setDistanceKm(distanceInKm);
          setDurationMinutes(durationInMin);
        }
      }
    } catch (error) {
      console.error('[PublishRide] Error calculating distance:', error);
    }
  }, [departureLat, departureLng, arrivalLat, arrivalLng]);

  useEffect(() => {
    calculateDistanceAndDuration();
  }, [departureLat, departureLng, arrivalLat, arrivalLng, calculateDistanceAndDuration]);

  const loadFavoriteRoute = async () => {
    try {
      const savedRoute = await AsyncStorage.getItem(FAVORITE_ROUTE_KEY);
      if (savedRoute) {
        console.log('[PublishRide] Favorite route found');
      }
    } catch (error) {
      console.error('[PublishRide] Error loading favorite route:', error);
    }
  };

  const saveFavoriteRoute = async () => {
    try {
      const route: FavoriteRoute = {
        departureCity,
        arrivalCity,
        departureTime: formatTime(time),
        vehicleType,
      };
      await AsyncStorage.setItem(FAVORITE_ROUTE_KEY, JSON.stringify(route));
      console.log('[PublishRide] Favorite route saved');
    } catch (error) {
      console.error('[PublishRide] Error saving favorite route:', error);
    }
  };

  const handleUseUsualRoute = async () => {
    try {
      const savedRoute = await AsyncStorage.getItem(FAVORITE_ROUTE_KEY);
      if (savedRoute) {
        const route: FavoriteRoute = JSON.parse(savedRoute);
        setDepartureCity(route.departureCity);
        setArrivalCity(route.arrivalCity);
        setVehicleType(route.vehicleType || '');
        
        const [hours, minutes] = route.departureTime.split(':');
        const newTime = new Date();
        newTime.setHours(parseInt(hours), parseInt(minutes));
        setTime(newTime);
        
        Alert.alert('Succès', 'Trajet habituel chargé');
      } else {
        Alert.alert('Information', 'Aucun trajet habituel enregistré');
      }
    } catch (error) {
      console.error('[PublishRide] Error loading usual route:', error);
      Alert.alert('Erreur', 'Impossible de charger le trajet habituel');
    }
  };

  const handleSelectDepartureCity = (city: string, placeId: string, lat: number, lng: number) => {
    console.log('[PublishRide] Departure city selected:', city, lat, lng);
    setDepartureCity(city);
    setDepartureLat(lat);
    setDepartureLng(lng);
  };

  const handleSelectArrivalCity = (city: string, placeId: string, lat: number, lng: number) => {
    console.log('[PublishRide] Arrival city selected:', city, lat, lng);
    setArrivalCity(city);
    setArrivalLat(lat);
    setArrivalLng(lng);
  };

  const handleSelectMeetingPoint = (city: string, placeId: string, lat: number, lng: number) => {
    console.log('[PublishRide] Meeting point selected:', city, lat, lng);
    setMeetingPoint(city);
    setMeetingPointLat(lat);
    setMeetingPointLng(lng);
    setMeetingPointPlaceId(placeId);
    setShowMeetingPointModal(false);
  };

  const handleShareMeetingPoint = async () => {
    if (!meetingPoint) {
      Alert.alert('Information', 'Veuillez d&apos;abord sélectionner un point de rencontre');
      return;
    }

    const googleMapsUrl = meetingPointLat && meetingPointLng
      ? `https://www.google.com/maps/search/?api=1&query=${meetingPointLat},${meetingPointLng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meetingPoint)}`;

    try {
      await Clipboard.setStringAsync(googleMapsUrl);
      Alert.alert(
        'Lien copié',
        'Le lien Google Maps du point de rencontre a été copié dans le presse-papiers. Vous pouvez maintenant le partager avec vos passagers.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('[PublishRide] Error copying to clipboard:', error);
      Alert.alert('Erreur', 'Impossible de copier le lien');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      setTempTime(selectedTime);
    }
  };

  const confirmDateSelection = () => {
    setDate(tempDate);
    setShowDatePicker(false);
  };

  const confirmTimeSelection = () => {
    setTime(tempTime);
    setShowTimePicker(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  const validateForm = () => {
    if (!departureCity.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir la ville de départ');
      return false;
    }

    if (!arrivalCity.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir la ville d&apos;arrivée');
      return false;
    }

    if (!meetingPoint.trim()) {
      Alert.alert('Erreur', 'Veuillez sélectionner un point de rencontre');
      return false;
    }

    const seats = parseInt(seatsAvailable);
    if (!seatsAvailable || isNaN(seats) || seats < 1 || seats > 8) {
      Alert.alert('Erreur', 'Veuillez saisir un nombre de places valide (1-8)');
      return false;
    }

    const price = parseInt(pricePerSeat);
    if (!pricePerSeat || isNaN(price) || price < 0) {
      Alert.alert('Erreur', 'Veuillez saisir un prix valide');
      return false;
    }

    if (!vehicleType.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le type de véhicule');
      return false;
    }

    if (!safetyDeclarationChecked) {
      Alert.alert(
        'Déclaration requise',
        'Vous devez accepter la déclaration sur l&apos;honneur concernant la conformité de votre véhicule et votre engagement à respecter le Code de la route.'
      );
      return false;
    }

    return true;
  };

  const showSuccessMessage = () => {
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      router.back();
    }, 2000);
  };

  const handleSubmit = async () => {
    console.log('[PublishRide] Submit button pressed');
    console.log('[PublishRide] isVerified:', isVerified);
    console.log('[PublishRide] phoneNumber:', phoneNumber);

    if (!isVerified) {
      console.log('[PublishRide] User not verified, showing verification modal');
      setShowVerificationModal(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const userId = await getOrCreateUserId();
      console.log('[PublishRide] User ID:', userId);

      const { hasDebt: userHasDebt, debtAmount: userDebtAmount } = await checkDebtStatus(userId);
      console.log('[PublishRide] Debt check:', { userHasDebt, userDebtAmount });

      if (userHasDebt) {
        setHasDebt(true);
        setDebtAmount(userDebtAmount);
        setShowDebtModal(true);
        return;
      }

      const departureDateTime = new Date(date);
      departureDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);

      const rideData = {
        driver_id: userId,
        driver_name: profile?.full_name || 'Conducteur',
        driver_phone: phoneNumber || '',
        departure_city: departureCity,
        arrival_city: arrivalCity,
        departure_datetime: departureDateTime.toISOString(),
        seats_available: parseInt(seatsAvailable),
        seats_total: parseInt(seatsAvailable),
        price_per_seat: parseInt(pricePerSeat),
        vehicle_type: vehicleType,
        stops: stops || null,
        departure_lat: departureLat,
        departure_lng: departureLng,
        arrival_lat: arrivalLat,
        arrival_lng: arrivalLng,
        meeting_point: meetingPoint,
        meeting_point_lat: meetingPointLat,
        meeting_point_lng: meetingPointLng,
        meeting_point_place_id: meetingPointPlaceId,
        distance_km: distanceKm,
        duration_minutes: durationMinutes,
      };

      console.log('[PublishRide] Submitting ride:', rideData);

      await addRide(rideData);
      await saveFavoriteRoute();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSuccessMessage();
    } catch (error) {
      console.error('[PublishRide] Error submitting ride:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la publication du trajet');
    }
  };

  const handleCheckboxToggle = () => {
    console.log('[PublishRide] Checkbox toggled from', safetyDeclarationChecked, 'to', !safetyDeclarationChecked);
    setSafetyDeclarationChecked(!safetyDeclarationChecked);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const renderDatePicker = () => {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date de départ</Text>
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => {
            setTempDate(date);
            setShowDatePicker(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <IconSymbol
            ios_icon_name="calendar"
            android_material_icon_name="calendar-today"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  locale="fr-FR"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.modalButtonTextCancel}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm]}
                    onPress={confirmDateSelection}
                  >
                    <Text style={styles.modalButtonText}>Confirmer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    );
  };

  const renderTimePicker = () => {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Heure de départ</Text>
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => {
            setTempTime(time);
            setShowTimePicker(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <IconSymbol
            ios_icon_name="clock"
            android_material_icon_name="access-time"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.dateTimeText}>{formatTime(time)}</Text>
        </TouchableOpacity>

        {showTimePicker && (
          <Modal
            visible={showTimePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowTimePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <DateTimePicker
                  value={tempTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  locale="fr-FR"
                  is24Hour={true}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setShowTimePicker(false)}
                  >
                    <Text style={styles.modalButtonTextCancel}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm]}
                    onPress={confirmTimeSelection}
                  >
                    <Text style={styles.modalButtonText}>Confirmer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    );
  };

  const renderMeetingPointModal = () => {
    return (
      <Modal
        visible={showMeetingPointModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMeetingPointModal(false)}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { height: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Point de rencontre</Text>
              <TouchableOpacity
                onPress={() => setShowMeetingPointModal(false)}
                style={styles.modalCloseButton}
              >
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, padding: 16 }}>
              <MeetingPointAutocomplete
                value={meetingPoint}
                onChangeText={setMeetingPoint}
                onSelectAddress={handleSelectMeetingPoint}
                placeholder="Rechercher un lieu..."
                label="Où souhaitez-vous rencontrer vos passagers ?"
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const renderSuccessModal = () => {
    return (
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={64}
              color={colors.green}
            />
            <Text style={styles.successModalTitle}>Trajet publié !</Text>
            <Text style={styles.successModalText}>
              Votre trajet a été publié avec succès
            </Text>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Publier un trajet</Text>
          <TouchableOpacity
            style={styles.usualRouteButton}
            onPress={handleUseUsualRoute}
          >
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={16}
              color={colors.yellow}
            />
            <Text style={styles.usualRouteText}>Trajet habituel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ville de départ</Text>
            <CityAutocomplete
              value={departureCity}
              onChangeText={setDepartureCity}
              onSelectCity={handleSelectDepartureCity}
              placeholder="Ex: Dakar"
              label=""
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ville d&apos;arrivée</Text>
            <CityAutocomplete
              value={arrivalCity}
              onChangeText={setArrivalCity}
              onSelectCity={handleSelectArrivalCity}
              placeholder="Ex: Thiès"
              label=""
            />
          </View>

          {distanceKm !== null && durationMinutes !== null && (
            <View style={styles.distanceInfo}>
              <View style={styles.distanceItem}>
                <IconSymbol
                  ios_icon_name="map"
                  android_material_icon_name="map"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.distanceText}>{distanceKm} km</Text>
              </View>
              <View style={styles.distanceItem}>
                <IconSymbol
                  ios_icon_name="clock"
                  android_material_icon_name="access-time"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.distanceText}>{formatDuration(durationMinutes)}</Text>
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Point de rencontre</Text>
            <TouchableOpacity
              style={styles.meetingPointButton}
              onPress={() => {
                setShowMeetingPointModal(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <IconSymbol
                ios_icon_name="mappin.circle.fill"
                android_material_icon_name="place"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.meetingPointText, !meetingPoint && styles.meetingPointPlaceholder]}>
                {meetingPoint || 'Sélectionner un point de rencontre'}
              </Text>
            </TouchableOpacity>
            {meetingPoint && (
              <TouchableOpacity
                style={styles.shareMeetingPointButton}
                onPress={handleShareMeetingPoint}
              >
                <IconSymbol
                  ios_icon_name="square.and.arrow.up"
                  android_material_icon_name="share"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.shareMeetingPointText}>Copier le lien Google Maps</Text>
              </TouchableOpacity>
            )}
          </View>

          {renderDatePicker()}
          {renderTimePicker()}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de places disponibles</Text>
            <TextInput
              style={styles.input}
              value={seatsAvailable}
              onChangeText={setSeatsAvailable}
              placeholder="Ex: 3"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix par place (FCFA)</Text>
            <TextInput
              style={styles.input}
              value={pricePerSeat}
              onChangeText={setPricePerSeat}
              placeholder="Ex: 5000"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type de véhicule</Text>
            <TextInput
              style={styles.input}
              value={vehicleType}
              onChangeText={setVehicleType}
              placeholder="Ex: Berline, 4x4, Minibus"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Arrêts intermédiaires (optionnel)</Text>
            <TextInput
              style={styles.input}
              value={stops}
              onChangeText={setStops}
              placeholder="Ex: Rufisque, Bargny"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.declarationContainer}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={handleCheckboxToggle}
              activeOpacity={0.6}
            >
              <View style={[
                styles.checkbox,
                safetyDeclarationChecked && styles.checkboxChecked
              ]}>
                {safetyDeclarationChecked && (
                  <IconSymbol
                    ios_icon_name="checkmark"
                    android_material_icon_name="check"
                    size={18}
                    color="#fff"
                  />
                )}
              </View>
              <Text style={styles.declarationText}>
                Je déclare sur l&apos;honneur que mon véhicule est conforme à la réglementation en vigueur, que je possède un permis de conduire valide, et que je m&apos;engage à respecter strictement le Code de la route pour conduire mes passagers à destination en toute sécurité.
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.submitButtonText}>Publication en cours...</Text>
            ) : (
              <Text style={styles.submitButtonText}>Publier le trajet</Text>
            )}
          </TouchableOpacity>
        </View>

        {renderMeetingPointModal()}
        {renderSuccessModal()}

        <PhoneVerificationModal
          visible={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          onVerificationSuccess={() => {
            setShowVerificationModal(false);
            handleSubmit();
          }}
        />

        <DebtBlockModal
          visible={showDebtModal}
          onClose={() => setShowDebtModal(false)}
          debtAmount={debtAmount}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  usualRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  usualRouteText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  dateTimeText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  meetingPointButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  meetingPointText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  meetingPointPlaceholder: {
    color: colors.textSecondary,
  },
  shareMeetingPointButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    gap: 8,
  },
  shareMeetingPointText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  distanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  distanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  declarationContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.yellow,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.yellow,
    backgroundColor: '#fff',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  declarationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#333',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.border,
  },
  modalButtonConfirm: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextCancel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
  },
  successModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  successModalText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
