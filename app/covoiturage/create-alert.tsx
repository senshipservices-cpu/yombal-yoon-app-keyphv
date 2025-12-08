
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import CityAutocomplete from '@/components/CityAutocomplete';
import { supabase } from '@/app/integrations/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const USER_ID_KEY = '@yombal_yoon_user_id';
const PROFILE_STORAGE_KEY = '@yombal_yoon_profile';

export default function CreateAlertScreen() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.dark;

  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [timeStart, setTimeStart] = useState<Date | null>(null);
  const [timeEnd, setTimeEnd] = useState<Date | null>(null);
  const [maxPrice, setMaxPrice] = useState('');
  const [minSeats, setMinSeats] = useState('1');
  const [acceptsLuggage, setAcceptsLuggage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  const [showTimeStartPicker, setShowTimeStartPicker] = useState(false);
  const [showTimeEndPicker, setShowTimeEndPicker] = useState(false);

  const handleSelectOriginCity = (city: string, placeId: string, lat: number, lng: number) => {
    console.log('Selected origin city:', { city, placeId, lat, lng });
    setOriginCity(city);
  };

  const handleSelectDestinationCity = (city: string, placeId: string, lat: number, lng: number) => {
    console.log('Selected destination city:', { city, placeId, lat, lng });
    setDestinationCity(city);
  };

  const handleSubmit = async () => {
    // Validation
    if (!originCity.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir la ville de départ');
      return;
    }

    if (!destinationCity.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir la ville d\'arrivée');
      return;
    }

    if (originCity.toLowerCase() === destinationCity.toLowerCase()) {
      Alert.alert('Erreur', 'Les villes de départ et d\'arrivée doivent être différentes');
      return;
    }

    const minSeatsNum = parseInt(minSeats);
    if (isNaN(minSeatsNum) || minSeatsNum < 1 || minSeatsNum > 8) {
      Alert.alert('Erreur', 'Le nombre de places doit être entre 1 et 8');
      return;
    }

    const maxPriceNum = maxPrice ? parseInt(maxPrice) : null;
    if (maxPriceNum !== null && (isNaN(maxPriceNum) || maxPriceNum <= 0)) {
      Alert.alert('Erreur', 'Le prix maximum doit être un nombre positif');
      return;
    }

    try {
      setIsSubmitting(true);

      // Get user info
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      const profileStr = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      
      if (!userId || !profileStr) {
        Alert.alert('Erreur', 'Veuillez vous connecter pour créer une alerte');
        return;
      }

      const profile = JSON.parse(profileStr);

      // Prepare alert data
      const alertData = {
        user_id: userId,
        user_name: profile.fullName || 'Utilisateur',
        user_phone: profile.phone || '',
        origin_city: originCity.trim(),
        destination_city: destinationCity.trim(),
        date_from: dateFrom ? dateFrom.toISOString().split('T')[0] : null,
        date_to: dateTo ? dateTo.toISOString().split('T')[0] : null,
        time_range_start: timeStart ? timeStart.toTimeString().split(' ')[0].substring(0, 5) : null,
        time_range_end: timeEnd ? timeEnd.toTimeString().split(' ')[0].substring(0, 5) : null,
        max_price: maxPriceNum,
        min_seats: minSeatsNum,
        accepts_luggage: acceptsLuggage,
        is_active: true,
      };

      console.log('Creating alert:', alertData);

      const { data, error } = await supabase
        .from('ride_alerts')
        .insert(alertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating alert:', error);
        Alert.alert('Erreur', 'Impossible de créer l\'alerte');
        return;
      }

      console.log('Alert created:', data);

      Alert.alert(
        'Succès',
        'Votre alerte a été créée ! Vous serez notifié quand un trajet correspondant sera publié.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Non définie';
    return date.toLocaleDateString('fr-FR');
  };

  const formatTime = (time: Date | null) => {
    if (!time) return 'Non définie';
    return time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Créer une Alerte</Text>
          <Text style={styles.headerSubtitle}>Soyez notifié des nouveaux trajets</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.primary + '15' }]}>
          <IconSymbol
            ios_icon_name="bell.badge"
            android_material_icon_name="notifications-active"
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.infoText, { color: isDark ? colors.darkText : colors.text }]}>
            Vous recevrez une notification push dès qu&apos;un trajet correspondant à vos critères sera publié
          </Text>
        </View>

        {/* Route Section */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Trajet
          </Text>

          <CityAutocomplete
            value={originCity}
            onChangeText={setOriginCity}
            onSelectCity={handleSelectOriginCity}
            placeholder="Ex: Dakar"
            label="Ville de départ"
          />

          <CityAutocomplete
            value={destinationCity}
            onChangeText={setDestinationCity}
            onSelectCity={handleSelectDestinationCity}
            placeholder="Ex: Thiès"
            label="Ville d'arrivée"
          />
        </View>

        {/* Date Range Section */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Période (optionnel)
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Date de début
            </Text>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}
              onPress={() => setShowDateFromPicker(true)}
            >
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.dateButtonText, { color: isDark ? colors.darkText : colors.text }]}>
                {formatDate(dateFrom)}
              </Text>
            </TouchableOpacity>
            {showDateFromPicker && (
              <DateTimePicker
                value={dateFrom || new Date()}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDateFromPicker(false);
                  if (selectedDate) {
                    setDateFrom(selectedDate);
                  }
                }}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Date de fin
            </Text>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}
              onPress={() => setShowDateToPicker(true)}
            >
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.dateButtonText, { color: isDark ? colors.darkText : colors.text }]}>
                {formatDate(dateTo)}
              </Text>
            </TouchableOpacity>
            {showDateToPicker && (
              <DateTimePicker
                value={dateTo || dateFrom || new Date()}
                mode="date"
                display="default"
                minimumDate={dateFrom || new Date()}
                onChange={(event, selectedDate) => {
                  setShowDateToPicker(false);
                  if (selectedDate) {
                    setDateTo(selectedDate);
                  }
                }}
              />
            )}
          </View>
        </View>

        {/* Time Range Section */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Plage horaire (optionnel)
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Heure de début
            </Text>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}
              onPress={() => setShowTimeStartPicker(true)}
            >
              <IconSymbol
                ios_icon_name="clock"
                android_material_icon_name="access-time"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.dateButtonText, { color: isDark ? colors.darkText : colors.text }]}>
                {formatTime(timeStart)}
              </Text>
            </TouchableOpacity>
            {showTimeStartPicker && (
              <DateTimePicker
                value={timeStart || new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimeStartPicker(false);
                  if (selectedTime) {
                    setTimeStart(selectedTime);
                  }
                }}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Heure de fin
            </Text>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}
              onPress={() => setShowTimeEndPicker(true)}
            >
              <IconSymbol
                ios_icon_name="clock"
                android_material_icon_name="access-time"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.dateButtonText, { color: isDark ? colors.darkText : colors.text }]}>
                {formatTime(timeEnd)}
              </Text>
            </TouchableOpacity>
            {showTimeEndPicker && (
              <DateTimePicker
                value={timeEnd || new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimeEndPicker(false);
                  if (selectedTime) {
                    setTimeEnd(selectedTime);
                  }
                }}
              />
            )}
          </View>
        </View>

        {/* Preferences Section */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Préférences
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Prix maximum par place (FCFA)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.darkBackground : colors.background,
                  color: isDark ? colors.darkText : colors.text,
                  borderColor: colors.textSecondary + '30',
                },
              ]}
              value={maxPrice}
              onChangeText={setMaxPrice}
              placeholder="Ex: 5000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
              Nombre minimum de places *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.darkBackground : colors.background,
                  color: isDark ? colors.darkText : colors.text,
                  borderColor: colors.textSecondary + '30',
                },
              ]}
              value={minSeats}
              onChangeText={setMinSeats}
              placeholder="1"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <IconSymbol
                ios_icon_name="bag"
                android_material_icon_name="luggage"
                size={20}
                color={isDark ? colors.darkText : colors.text}
              />
              <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text, marginLeft: 8 }]}>
                Accepte les bagages
              </Text>
            </View>
            <Switch
              value={acceptsLuggage}
              onValueChange={setAcceptsLuggage}
              trackColor={{ false: colors.textSecondary + '30', true: colors.primary + '50' }}
              thumbColor={acceptsLuggage ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <Text style={styles.submitButtonText}>Création en cours...</Text>
          ) : (
            <>
              <IconSymbol
                ios_icon_name="bell.badge.fill"
                android_material_icon_name="notifications-active"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.submitButtonText}>Créer l&apos;alerte</Text>
            </>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    padding: 16,
    paddingBottom: 120,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  formGroup: {
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.textSecondary + '30',
  },
  dateButtonText: {
    fontSize: 16,
    marginLeft: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
