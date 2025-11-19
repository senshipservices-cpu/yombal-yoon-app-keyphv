
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
  Modal,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useCovoiturage } from '@/contexts/CovoiturageContext';
import { useProfile } from '@/contexts/ProfileContext';
import CityAutocomplete from '@/components/CityAutocomplete';
import { supabase } from '@/config/supabase';

const FAVORITE_ROUTE_KEY = '@yombal_yoon_favorite_route';

interface FavoriteRoute {
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  vehicleType?: string;
}

export default function PublishRideScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { addRide } = useCovoiturage();
  const { profile } = useProfile();

  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [departureTime, setDepartureTime] = useState<Date | null>(null);
  const [availableSeats, setAvailableSeats] = useState('');
  const [pricePerPassenger, setPricePerPassenger] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [intermediateStops, setIntermediateStops] = useState('');

  const [departurePlaceId, setDeparturePlaceId] = useState('');
  const [arrivalPlaceId, setArrivalPlaceId] = useState('');
  const [departureLat, setDepartureLat] = useState<number | null>(null);
  const [departureLng, setDepartureLng] = useState<number | null>(null);
  const [arrivalLat, setArrivalLat] = useState<number | null>(null);
  const [arrivalLng, setArrivalLng] = useState<number | null>(null);
  const [rideDistanceKm, setRideDistanceKm] = useState<number>(0);
  const [rideDurationMinutes, setRideDurationMinutes] = useState<number>(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [favoriteRoute, setFavoriteRoute] = useState<FavoriteRoute | null>(null);
  const [showNoFavoriteMessage, setShowNoFavoriteMessage] = useState(false);

  useEffect(() => {
    loadFavoriteRoute();
  }, []);

  useEffect(() => {
    if (departureLat && departureLng && arrivalLat && arrivalLng) {
      calculateDistanceAndDuration();
    }
  }, [departureLat, departureLng, arrivalLat, arrivalLng]);

  const loadFavoriteRoute = async () => {
    try {
      const storedRoute = await AsyncStorage.getItem(FAVORITE_ROUTE_KEY);
      if (storedRoute) {
        const route: FavoriteRoute = JSON.parse(storedRoute);
        setFavoriteRoute(route);
        console.log('Favorite route loaded:', route);
      }
    } catch (error) {
      console.error('Error loading favorite route:', error);
    }
  };

  const saveFavoriteRoute = async () => {
    try {
      if (!departureTime) return;

      const route: FavoriteRoute = {
        departureCity: departureCity.trim(),
        arrivalCity: arrivalCity.trim(),
        departureTime: formatTime(departureTime),
        vehicleType: vehicleType.trim() || undefined,
      };

      await AsyncStorage.setItem(FAVORITE_ROUTE_KEY, JSON.stringify(route));
      setFavoriteRoute(route);
      console.log('Favorite route saved:', route);
    } catch (error) {
      console.error('Error saving favorite route:', error);
    }
  };

  const calculateDistanceAndDuration = async () => {
    if (!departureLat || !departureLng || !arrivalLat || !arrivalLng) {
      return;
    }

    setIsCalculatingDistance(true);

    try {
      console.log('Calculating distance and duration...');

      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: {
          action: 'distance_matrix',
          originLat: departureLat,
          originLng: departureLng,
          destLat: arrivalLat,
          destLng: arrivalLng,
        },
      });

      if (error) {
        console.error('Error calculating distance:', error);
        return;
      }

      if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]) {
        const element = data.rows[0].elements[0];

        if (element.status === 'OK') {
          const distanceMeters = element.distance.value;
          const durationSeconds = element.duration.value;

          const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
          const durationMinutes = Math.round(durationSeconds / 60);

          setRideDistanceKm(distanceKm);
          setRideDurationMinutes(durationMinutes);

          console.log('Distance and duration calculated:', {
            distanceKm,
            durationMinutes,
          });
        } else {
          console.error('Distance Matrix element error:', element.status);
        }
      } else {
        console.error('Distance Matrix API error:', data.status);
      }
    } catch (error) {
      console.error('Error calculating distance and duration:', error);
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const handleUseUsualRoute = () => {
    if (!favoriteRoute) {
      setShowNoFavoriteMessage(true);
      setTimeout(() => setShowNoFavoriteMessage(false), 4000);
      return;
    }

    setDepartureCity(favoriteRoute.departureCity);
    setArrivalCity(favoriteRoute.arrivalCity);
    
    const [hours, minutes] = favoriteRoute.departureTime.split(':');
    const newTime = new Date();
    newTime.setHours(parseInt(hours, 10));
    newTime.setMinutes(parseInt(minutes, 10));
    setDepartureTime(newTime);

    if (favoriteRoute.vehicleType) {
      setVehicleType(favoriteRoute.vehicleType);
    }

    setDepartureDate(null);

    Alert.alert(
      'Trajet habituel chargé',
      'Veuillez sélectionner la date du trajet.',
      [{ text: 'OK' }]
    );

    console.log('Usual route loaded into form');
  };

  const handleSelectDepartureCity = (city: string, placeId: string, lat: number, lng: number) => {
    setDepartureCity(city);
    setDeparturePlaceId(placeId);
    setDepartureLat(lat);
    setDepartureLng(lng);
    console.log('Departure city selected:', { city, lat, lng });
  };

  const handleSelectArrivalCity = (city: string, placeId: string, lat: number, lng: number) => {
    setArrivalCity(city);
    setArrivalPlaceId(placeId);
    setArrivalLat(lat);
    setArrivalLng(lng);
    console.log('Arrival city selected:', { city, lat, lng });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log('Date picker event:', event.type, selectedDate);
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      
      if (event.type === 'set' && selectedDate) {
        setDepartureDate(selectedDate);
        console.log('Date selected (Android):', selectedDate);
      }
    } else {
      if (selectedDate) {
        setDepartureDate(selectedDate);
        console.log('Date updated (iOS):', selectedDate);
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    console.log('Time picker event:', event.type, selectedTime);
    
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      
      if (event.type === 'set' && selectedTime) {
        setDepartureTime(selectedTime);
        console.log('Time selected (Android):', selectedTime);
      }
    } else {
      if (selectedTime) {
        setDepartureTime(selectedTime);
        console.log('Time updated (iOS):', selectedTime);
      }
    }
  };

  const handleWebDateChange = (e: any) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const date = new Date(dateValue + 'T00:00:00');
      setDepartureDate(date);
      console.log('Web date selected:', date);
    }
  };

  const handleWebTimeChange = (e: any) => {
    const timeValue = e.target.value;
    if (timeValue) {
      const [hours, minutes] = timeValue.split(':');
      const time = new Date();
      time.setHours(parseInt(hours, 10));
      time.setMinutes(parseInt(minutes, 10));
      setDepartureTime(time);
      console.log('Web time selected:', time);
    }
  };

  const confirmDateSelection = () => {
    setShowDatePicker(false);
    console.log('Date confirmed:', departureDate);
  };

  const confirmTimeSelection = () => {
    setShowTimePicker(false);
    console.log('Time confirmed:', departureTime);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (time: Date): string => {
    return time.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeForInput = (time: Date): string => {
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours} h ${mins} min`;
    }
    return `${mins} min`;
  };

  const canSubmit = (): boolean => {
    return (
      departureCity.trim() !== '' &&
      arrivalCity.trim() !== '' &&
      departureDate !== null &&
      departureTime !== null &&
      availableSeats.trim() !== '' &&
      parseInt(availableSeats) >= 1 &&
      parseInt(availableSeats) <= 8 &&
      pricePerPassenger.trim() !== '' &&
      parseInt(pricePerPassenger) > 0 &&
      departureLat !== null &&
      departureLng !== null &&
      arrivalLat !== null &&
      arrivalLng !== null
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires correctement.');
      return;
    }

    try {
      const seats = parseInt(availableSeats);
      const price = parseInt(pricePerPassenger);

      await addRide({
        driverId: 'driver_' + Date.now(),
        driverName: profile.fullName || 'Conducteur',
        departureCity: departureCity.trim(),
        arrivalCity: arrivalCity.trim(),
        date: departureDate!.toISOString().split('T')[0],
        time: formatTime(departureTime!),
        availableSeats: seats,
        totalSeats: seats,
        pricePerPassenger: price,
        vehicleType: vehicleType.trim() || undefined,
        intermediateStops: intermediateStops.trim() || undefined,
        departureLat: departureLat!,
        departureLng: departureLng!,
        arrivalLat: arrivalLat!,
        arrivalLng: arrivalLng!,
        distanceKm: rideDistanceKm,
        durationMinutes: rideDurationMinutes,
      });

      await saveFavoriteRoute();

      Alert.alert('Succès', 'Trajet publié avec succès.', [
        {
          text: 'OK',
          onPress: () => router.push('/covoiturage/my-rides'),
        },
      ]);
    } catch (error) {
      console.error('Error publishing ride:', error);
      Alert.alert('Erreur', 'Erreur lors de la publication du trajet.');
    }
  };

  const renderDatePicker = () => {
    if (!showDatePicker) return null;

    if (Platform.OS === 'web') {
      return (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: isDark ? colors.darkCard : '#FFFFFF' }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: isDark ? colors.darkText : colors.text }]}>
                  Sélectionner une date
                </Text>
              </View>
              
              <View style={styles.webPickerContainer}>
                <input
                  type="date"
                  value={departureDate ? formatDateForInput(departureDate) : ''}
                  onChange={handleWebDateChange}
                  min={formatDateForInput(new Date())}
                  style={{
                    width: '100%',
                    padding: 16,
                    fontSize: 16,
                    borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: isDark ? colors.darkCard : '#FFFFFF',
                    color: isDark ? colors.darkText : colors.text,
                  }}
                />
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowDatePicker(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonCancelText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: colors.primary }]}
                  onPress={confirmDateSelection}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonConfirmText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      );
    }

    const picker = (
      <DateTimePicker
        value={departureDate || new Date()}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={handleDateChange}
        minimumDate={new Date()}
        locale="fr-FR"
      />
    );

    if (Platform.OS === 'ios') {
      return (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: isDark ? colors.darkCard : '#FFFFFF' }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: isDark ? colors.darkText : colors.text }]}>
                  Sélectionner une date
                </Text>
              </View>
              
              {picker}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowDatePicker(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonCancelText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: colors.primary }]}
                  onPress={confirmDateSelection}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonConfirmText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      );
    }

    return picker;
  };

  const renderTimePicker = () => {
    if (!showTimePicker) return null;

    if (Platform.OS === 'web') {
      return (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: isDark ? colors.darkCard : '#FFFFFF' }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: isDark ? colors.darkText : colors.text }]}>
                  Sélectionner une heure
                </Text>
              </View>
              
              <View style={styles.webPickerContainer}>
                <input
                  type="time"
                  value={departureTime ? formatTimeForInput(departureTime) : ''}
                  onChange={handleWebTimeChange}
                  style={{
                    width: '100%',
                    padding: 16,
                    fontSize: 16,
                    borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: isDark ? colors.darkCard : '#FFFFFF',
                    color: isDark ? colors.darkText : colors.text,
                  }}
                />
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowTimePicker(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonCancelText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: colors.primary }]}
                  onPress={confirmTimeSelection}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonConfirmText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      );
    }

    const picker = (
      <DateTimePicker
        value={departureTime || new Date()}
        mode="time"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={handleTimeChange}
        is24Hour={true}
        locale="fr-FR"
      />
    );

    if (Platform.OS === 'ios') {
      return (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: isDark ? colors.darkCard : '#FFFFFF' }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: isDark ? colors.darkText : colors.text }]}>
                  Sélectionner une heure
                </Text>
              </View>
              
              {picker}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowTimePicker(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonCancelText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: colors.primary }]}
                  onPress={confirmTimeSelection}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonConfirmText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      );
    }

    return picker;
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <View style={[styles.header, { backgroundColor: '#FF8C00' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Publier un trajet</Text>
          <Text style={styles.headerSubtitle}>Proposez un trajet</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={[
              styles.usualRouteButton,
              {
                backgroundColor: isDark ? colors.darkCard : colors.card,
                borderColor: colors.primary,
              },
            ]}
            onPress={handleUseUsualRoute}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.usualRouteButtonText, { color: colors.primary }]}>
              Utiliser mon trajet habituel
            </Text>
          </TouchableOpacity>

          {showNoFavoriteMessage && (
            <View style={[styles.noFavoriteMessage, { backgroundColor: colors.warning + '20' }]}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={20}
                color={colors.warning}
              />
              <Text style={[styles.noFavoriteMessageText, { color: colors.warning }]}>
                Vous n&apos;avez pas encore de trajet habituel. Publiez un premier trajet pour l&apos;enregistrer.
              </Text>
            </View>
          )}

          <CityAutocomplete
            value={departureCity}
            onChangeText={setDepartureCity}
            onSelectCity={handleSelectDepartureCity}
            placeholder="Ex: Dakar"
            label="Ville de départ"
          />

          <CityAutocomplete
            value={arrivalCity}
            onChangeText={setArrivalCity}
            onSelectCity={handleSelectArrivalCity}
            placeholder="Ex: Thiès"
            label="Ville d'arrivée"
          />

          {(rideDistanceKm > 0 || isCalculatingDistance) && (
            <View style={[styles.distanceCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
              <View style={styles.distanceRow}>
                <IconSymbol
                  ios_icon_name="map"
                  android_material_icon_name="map"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.distanceLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  Distance estimée :
                </Text>
                <Text style={[styles.distanceValue, { color: isDark ? colors.darkText : colors.text }]}>
                  {isCalculatingDistance ? 'Calcul...' : `${rideDistanceKm} km`}
                </Text>
              </View>
              
              <View style={styles.distanceRow}>
                <IconSymbol
                  ios_icon_name="clock"
                  android_material_icon_name="access-time"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.distanceLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  Durée estimée :
                </Text>
                <Text style={[styles.distanceValue, { color: isDark ? colors.darkText : colors.text }]}>
                  {isCalculatingDistance ? 'Calcul...' : formatDuration(rideDurationMinutes)}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Date du trajet *
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                styles.pickerButton,
                {
                  backgroundColor: isDark ? colors.darkCard : colors.card,
                },
              ]}
              onPress={() => {
                console.log('Date picker button pressed');
                setShowDatePicker(true);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pickerText,
                  { color: departureDate ? (isDark ? colors.darkText : colors.text) : colors.textSecondary },
                ]}
              >
                {departureDate ? formatDate(departureDate) : 'Sélectionner une date'}
              </Text>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Heure de départ *
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                styles.pickerButton,
                {
                  backgroundColor: isDark ? colors.darkCard : colors.card,
                },
              ]}
              onPress={() => {
                console.log('Time picker button pressed');
                setShowTimePicker(true);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pickerText,
                  { color: departureTime ? (isDark ? colors.darkText : colors.text) : colors.textSecondary },
                ]}
              >
                {departureTime ? formatTime(departureTime) : 'Sélectionner une heure'}
              </Text>
              <IconSymbol
                ios_icon_name="clock"
                android_material_icon_name="access-time"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Nombre de places disponibles (1-8) *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.darkCard : colors.card,
                  color: isDark ? colors.darkText : colors.text,
                },
              ]}
              placeholder="Ex: 3"
              placeholderTextColor={colors.textSecondary}
              value={availableSeats}
              onChangeText={setAvailableSeats}
              keyboardType="number-pad"
              maxLength={1}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Prix par passager (FCFA) *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.darkCard : colors.card,
                  color: isDark ? colors.darkText : colors.text,
                },
              ]}
              placeholder="Ex: 5000"
              placeholderTextColor={colors.textSecondary}
              value={pricePerPassenger}
              onChangeText={setPricePerPassenger}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Type de véhicule (optionnel)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.darkCard : colors.card,
                  color: isDark ? colors.darkText : colors.text,
                },
              ]}
              placeholder="Ex: Berline, SUV, etc."
              placeholderTextColor={colors.textSecondary}
              value={vehicleType}
              onChangeText={setVehicleType}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Arrêts intermédiaires (optionnel)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: isDark ? colors.darkCard : colors.card,
                  color: isDark ? colors.darkText : colors.text,
                },
              ]}
              placeholder="Ex: Rufisque, Bargny"
              placeholderTextColor={colors.textSecondary}
              value={intermediateStops}
              onChangeText={setIntermediateStops}
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: canSubmit() ? colors.primary : colors.border,
              },
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit()}
            activeOpacity={0.7}
          >
            <Text style={styles.submitButtonText}>Publier un trajet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderDatePicker()}
      {renderTimePicker()}
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
    paddingBottom: 120,
  },
  content: {
    padding: 20,
  },
  usualRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    gap: 8,
  },
  usualRouteButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  noFavoriteMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  noFavoriteMessageText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  distanceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  distanceValue: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 16,
  },
  submitButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  webPickerContainer: {
    padding: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
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
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
