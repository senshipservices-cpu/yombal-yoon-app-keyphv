
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import CityAutocomplete from '@/components/CityAutocomplete';

export default function SearchRideScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();

  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [numberOfPassengers, setNumberOfPassengers] = useState('1');

  const [departurePlaceId, setDeparturePlaceId] = useState('');
  const [arrivalPlaceId, setArrivalPlaceId] = useState('');
  const [departureLat, setDepartureLat] = useState<number | null>(null);
  const [departureLng, setDepartureLng] = useState<number | null>(null);
  const [arrivalLat, setArrivalLat] = useState<number | null>(null);
  const [arrivalLng, setArrivalLng] = useState<number | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSelectDepartureCity = (city: string, placeId: string, lat: number, lng: number) => {
    console.log('Departure city selected:', { city, placeId, lat, lng });
    setDepartureCity(city);
    setDeparturePlaceId(placeId);
    setDepartureLat(lat);
    setDepartureLng(lng);
  };

  const handleSelectArrivalCity = (city: string, placeId: string, lat: number, lng: number) => {
    console.log('Arrival city selected:', { city, placeId, lat, lng });
    setArrivalCity(city);
    setArrivalPlaceId(placeId);
    setArrivalLat(lat);
    setArrivalLng(lng);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      console.log('Date selected:', selectedDate);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const canSearch = (): boolean => {
    return (
      departureCity.trim() !== '' &&
      arrivalCity.trim() !== '' &&
      numberOfPassengers.trim() !== '' &&
      parseInt(numberOfPassengers) >= 1
    );
  };

  const handleSearch = () => {
    if (!canSearch()) return;

    const searchParams = {
      departureCity: departureCity.trim(),
      arrivalCity: arrivalCity.trim(),
      date: date ? date.toISOString() : new Date().toISOString(),
      numberOfPassengers: parseInt(numberOfPassengers),
      departureLat: departureLat || 0,
      departureLng: departureLng || 0,
      arrivalLat: arrivalLat || 0,
      arrivalLng: arrivalLng || 0,
    };

    console.log('Searching with params:', searchParams);
    router.push({
      pathname: '/covoiturage/search-results',
      params: searchParams,
    });
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
          <Text style={styles.headerTitle}>Rechercher un trajet</Text>
          <Text style={styles.headerSubtitle}>Trouvez votre trajet idéal</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
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

          {/* Date (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Date souhaitée (optionnel)
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
            >
              <Text
                style={[
                  styles.pickerText,
                  { color: date ? (isDark ? colors.darkText : colors.text) : colors.textSecondary },
                ]}
              >
                {date ? formatDate(date) : 'Toutes les dates'}
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
              value={date || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Number of Passengers */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Nombre de passagers *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.darkCard : colors.card,
                  color: isDark ? colors.darkText : colors.text,
                },
              ]}
              placeholder="Ex: 1"
              placeholderTextColor={colors.textSecondary}
              value={numberOfPassengers}
              onChangeText={setNumberOfPassengers}
              keyboardType="number-pad"
              maxLength={1}
            />
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={[
              styles.searchButton,
              {
                backgroundColor: canSearch() ? colors.primary : colors.border,
              },
            ]}
            onPress={handleSearch}
            disabled={!canSearch()}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="magnifyingglass"
              android_material_icon_name="search"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.searchButtonText}>Rechercher</Text>
          </TouchableOpacity>

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Recherchez des trajets disponibles en fonction de votre itinéraire et du nombre de passagers. 
              Utilisez l&apos;autocomplétion pour sélectionner vos villes de départ et d&apos;arrivée.
            </Text>
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
    paddingBottom: 120,
  },
  content: {
    padding: 20,
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 16,
  },
  searchButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
