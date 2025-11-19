
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
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useCovoiturage } from '@/contexts/CovoiturageContext';
import { useProfile } from '@/contexts/ProfileContext';
import CityAutocomplete from '@/components/CityAutocomplete';

const FAVORITE_ROUTE_KEY = '@yombal_yoon_favorite_route';

interface FavoriteRoute {
  departureCity: string;
  arrivalCity: string;
  departureTime: string; // HH:MM format
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

  // Google Maps related state
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

  // Load favorite route on mount
  useEffect(() => {
    loadFavoriteRoute();
  }, []);

  // Calculate distance and duration when all coordinates are available
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
      const apiKey = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.error('Google Maps API key not found');
        return;
      }

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${departureLat},${departureLng}&destinations=${arrivalLat},${arrivalLng}&mode=driving&language=fr&key=${apiKey}`;

      console.log('Calculating distance and duration...');

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]) {
        const element = data.rows[0].elements[0];

        if (element.status === 'OK') {
          const distanceMeters = element.distance.value;
          const durationSeconds = element.duration.value;

          const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10; // Round to 1 decimal
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

    // Pre-fill form fields
    setDepartureCity(favoriteRoute.departureCity);
    setArrivalCity(favoriteRoute.arrivalCity);
    
    // Set time from favorite (HH:MM format)
    const [hours, minutes] = favoriteRoute.departureTime.split(':');
    const newTime = new Date();
    newTime.setHours(parseInt(hours, 10));
    newTime.setMinutes(parseInt(minutes, 10));
    setDepartureTime(newTime);

    if (favoriteRoute.vehicleType) {
      setVehicleType(favoriteRoute.vehicleType);
    }

    // Leave date empty for user to choose
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
    // On Android, the picker closes automatically
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (event.type === 'set' && selectedDate) {
      setDepartureDate(selectedDate);
      console.log('Date selected:', selectedDate);
      
      // Close picker on iOS after selection
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      // User cancelled
      setShowDatePicker(false);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    // On Android, the picker closes automatically
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (event.type === 'set' && selectedTime) {
      setDepartureTime(selectedTime);
      console.log('Time selected:', selectedTime);
      
      // Close picker on iOS after selection
      if (Platform.OS === 'ios') {
        setShowTimePicker(false);
      }
    } else if (event.type === 'dismissed') {
      // User cancelled
      setShowTimePicker(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (time: Date): string => {
    return time.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
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

      // Save as favorite route
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

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      {/* Header */}
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
          {/* Usual Route Button */}
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

          {/* No Favorite Message */}
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

          {/* Departure City with Autocomplete */}
          <CityAutocomplete
            value={departureCity}
            onChangeText={setDepartureCity}
            onSelectCity={handleSelectDepartureCity}
            placeholder="Ex: Dakar"
            label="Ville de départ"
          />

          {/* Arrival City with Autocomplete */}
          <CityAutocomplete
            value={arrivalCity}
            onChangeText={setArrivalCity}
            onSelectCity={handleSelectArrivalCity}
            placeholder="Ex: Thiès"
            label="Ville d'arrivée"
          />

          {/* Distance and Duration Display */}
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

          {/* Date */}
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
              onPress={() => setShowDatePicker(true)}
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

          {showDatePicker && (
            <DateTimePicker
              value={departureDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Time */}
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
              onPress={() => setShowTimePicker(true)}
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

          {showTimePicker && (
            <DateTimePicker
              value={departureTime || new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              is24Hour={true}
            />
          )}

          {/* Available Seats */}
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

          {/* Price */}
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

          {/* Vehicle Type (Optional) */}
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

          {/* Intermediate Stops (Optional) */}
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

          {/* Submit Button */}
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
});
