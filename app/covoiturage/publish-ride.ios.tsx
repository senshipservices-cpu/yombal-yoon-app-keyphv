
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useCovoiturage } from '@/contexts/CovoiturageContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useOTP } from '@/contexts/OTPContext';
import CityAutocomplete from '@/components/CityAutocomplete';
import PhoneVerificationModal from '@/components/PhoneVerificationModal';
import DebtBlockModal from '@/components/DebtBlockModal';
import { supabase } from '@/config/supabase';
import { checkDebtStatus, calculateAmounts } from '@/utils/walletUtils';
import { ensureProfileAndWallet } from '@/utils/profileWalletUtils';
import { IS_TEST_MODE } from '@/config/testMode';

const FAVORITE_ROUTE_KEY = '@yombal_yoon_favorite_route';
const USER_ID_KEY = '@yombal_yoon_user_id';

interface FavoriteRoute {
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  vehicleType?: string;
}

// Centralized function to get or create user ID
const getOrCreateUserId = async (): Promise<string> => {
  try {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem(USER_ID_KEY, userId);
      console.log('[publish-ride.ios] ✅ Created new user ID:', userId);
    } else {
      console.log('[publish-ride.ios] ✅ Retrieved existing user ID:', userId);
    }

    return userId;
  } catch (error) {
    console.error('[publish-ride.ios] ❌ Error getting/creating user ID:', error);
    // Fallback to a temporary ID
    return `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
};

export default function PublishRideScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { addRide } = useCovoiturage();
  const { profile } = useProfile();
  const { isPhoneVerified, loadVerificationStatus } = useOTP();

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

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [departureCityError, setDepartureCityError] = useState('');
  const [arrivalCityError, setArrivalCityError] = useState('');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successAnimation] = useState(new Animated.Value(0));
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [debtAmount, setDebtAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateDistanceAndDuration = useCallback(async () => {
    if (!departureLat || !departureLng || !arrivalLat || !arrivalLng) {
      return;
    }

    setIsCalculatingDistance(true);

    try {
      console.log('[publish-ride.ios] 📍 Calculating distance and duration...');

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
        console.error('[publish-ride.ios] ❌ Error calculating distance:', error);
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

          console.log('[publish-ride.ios] ✅ Distance and duration calculated:', {
            distanceKm,
            durationMinutes,
          });
        } else {
          console.error('[publish-ride.ios] ❌ Distance Matrix element error:', element.status);
        }
      } else {
        console.error('[publish-ride.ios] ❌ Distance Matrix API error:', data.status);
      }
    } catch (error) {
      console.error('[publish-ride.ios] ❌ Error calculating distance and duration:', error);
    } finally {
      setIsCalculatingDistance(false);
    }
  }, [departureLat, departureLng, arrivalLat, arrivalLng]);

  useEffect(() => {
    loadFavoriteRoute();
    loadVerificationStatus();
  }, [loadVerificationStatus]);

  useEffect(() => {
    if (departureLat && departureLng && arrivalLat && arrivalLng) {
      calculateDistanceAndDuration();
    }
  }, [departureLat, departureLng, arrivalLat, arrivalLng, calculateDistanceAndDuration]);

  const loadFavoriteRoute = async () => {
    try {
      const storedRoute = await AsyncStorage.getItem(FAVORITE_ROUTE_KEY);
      if (storedRoute) {
        const route: FavoriteRoute = JSON.parse(storedRoute);
        setFavoriteRoute(route);
        console.log('[publish-ride.ios] ✅ Favorite route loaded:', route);
      }
    } catch (error) {
      console.error('[publish-ride.ios] ❌ Error loading favorite route:', error);
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
      console.log('[publish-ride.ios] ✅ Favorite route saved:', route);
    } catch (error) {
      console.error('[publish-ride.ios] ❌ Error saving favorite route:', error);
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
      'Veuillez sélectionner la date du trajet et confirmer les villes dans les suggestions.',
      [{ text: 'OK' }]
    );

    console.log('[publish-ride.ios] ✅ Usual route loaded into form');
  };

  const handleSelectDepartureCity = (city: string, placeId: string, lat: number, lng: number) => {
    console.log('[publish-ride.ios] ✅ Departure city selected:', { city, placeId, lat, lng });
    setDepartureCity(city);
    setDeparturePlaceId(placeId);
    setDepartureLat(lat);
    setDepartureLng(lng);
    setDepartureCityError('');
  };

  const handleSelectArrivalCity = (city: string, placeId: string, lat: number, lng: number) => {
    console.log('[publish-ride.ios] ✅ Arrival city selected:', { city, placeId, lat, lng });
    setArrivalCity(city);
    setArrivalPlaceId(placeId);
    setArrivalLat(lat);
    setArrivalLng(lng);
    setArrivalCityError('');
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log('[publish-ride.ios] 📅 Date picker event:', event.type, selectedDate);
    
    setShowDatePicker(false);
    
    if (event.type === 'set' && selectedDate) {
      setDepartureDate(selectedDate);
      console.log('[publish-ride.ios] ✅ Date selected:', selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    console.log('[publish-ride.ios] ⏰ Time picker event:', event.type, selectedTime);
    
    setShowTimePicker(false);
    
    if (event.type === 'set' && selectedTime) {
      setDepartureTime(selectedTime);
      console.log('[publish-ride.ios] ✅ Time selected:', selectedTime);
    }
  };

  const confirmDateSelection = () => {
    setShowDatePicker(false);
    console.log('[publish-ride.ios] ✅ Date confirmed:', departureDate);
  };

  const confirmTimeSelection = () => {
    setShowTimePicker(false);
    console.log('[publish-ride.ios] ✅ Time confirmed:', departureTime);
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

  const isButtonEnabled = useMemo(() => {
    const hasValidDepartureCity = departureCity.trim() !== '' && departureLat !== null && departureLng !== null;
    const hasValidArrivalCity = arrivalCity.trim() !== '' && arrivalLat !== null && arrivalLng !== null;
    const hasValidDate = departureDate !== null;
    const hasValidTime = departureTime !== null;
    
    const seats = parseInt(availableSeats);
    const hasValidSeats = availableSeats.trim() !== '' && !isNaN(seats) && seats >= 1 && seats <= 8;
    
    const price = parseInt(pricePerPassenger);
    const hasValidPrice = pricePerPassenger.trim() !== '' && !isNaN(price) && price > 0;

    return hasValidDepartureCity && hasValidArrivalCity && hasValidDate && hasValidTime && hasValidSeats && hasValidPrice && !isSubmitting;
  }, [departureCity, departureLat, departureLng, arrivalCity, arrivalLat, arrivalLng, departureDate, departureTime, availableSeats, pricePerPassenger, isSubmitting]);

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    setDepartureCityError('');
    setArrivalCityError('');

    if (departureCity.trim() === '') {
      errors.push('Ville de départ requise');
    } else if (!departureLat || !departureLng) {
      errors.push('Veuillez sélectionner la ville de départ dans la liste');
      setDepartureCityError('Veuillez sélectionner la ville dans la liste proposée');
    }

    if (arrivalCity.trim() === '') {
      errors.push('Ville d\'arrivée requise');
    } else if (!arrivalLat || !arrivalLng) {
      errors.push('Veuillez sélectionner la ville d\'arrivée dans la liste');
      setArrivalCityError('Veuillez sélectionner la ville dans la liste proposée');
    }

    if (!departureDate) {
      errors.push('Date du trajet requise');
    }

    if (!departureTime) {
      errors.push('Heure de départ requise');
    }

    if (availableSeats.trim() === '') {
      errors.push('Nombre de places requis');
    } else {
      const seats = parseInt(availableSeats);
      if (isNaN(seats) || seats < 1 || seats > 8) {
        errors.push('Le nombre de places doit être entre 1 et 8');
      }
    }

    if (pricePerPassenger.trim() === '') {
      errors.push('Prix par passager requis');
    } else {
      const price = parseInt(pricePerPassenger);
      if (isNaN(price) || price <= 0) {
        errors.push('Le prix doit être supérieur à 0');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const showSuccessMessage = () => {
    console.log('[publish-ride.ios] 🎉 ========================================');
    console.log('[publish-ride.ios] 🎉 SHOWING SUCCESS MESSAGE');
    console.log('[publish-ride.ios] 🎉 ========================================');
    
    // iOS FIX: Trigger haptic feedback first
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // iOS FIX: Show Alert dialog IMMEDIATELY for user feedback
    // This is the primary success notification on iOS
    setTimeout(() => {
      console.log('[publish-ride.ios] 🎉 Displaying Alert dialog...');
      Alert.alert(
        '🎉 Trajet publié avec succès !',
        `Votre trajet de ${departureCity} vers ${arrivalCity} a été publié.\n\nVous pouvez maintenant le consulter dans "Mes trajets publiés".`,
        [
          {
            text: 'Voir mes trajets',
            style: 'default',
            onPress: () => {
              console.log('[publish-ride.ios] ✅ User chose to view rides, navigating...');
              router.push('/covoiturage/my-rides');
            }
          },
          {
            text: 'OK',
            style: 'cancel',
            onPress: () => {
              console.log('[publish-ride.ios] ✅ User acknowledged success');
            }
          }
        ],
        { cancelable: false }
      );
    }, 100);

    // iOS FIX: Also show the animated modal as a secondary visual confirmation
    setShowSuccessModal(true);

    Animated.sequence([
      Animated.timing(successAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(successAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccessModal(false);
    });
  };

  const handleSubmit = async () => {
    // iOS FIX: Check if already submitting to prevent double-tap
    if (isSubmitting) {
      console.log('[publish-ride.ios] ⚠️ Already submitting, ignoring duplicate request');
      return;
    }

    console.log('[publish-ride.ios] ========================================');
    console.log('[publish-ride.ios] 🚀 SUBMIT STARTED');
    console.log('[publish-ride.ios] ========================================');
    console.log('[publish-ride.ios] 📱 Platform:', Platform.OS);
    console.log('[publish-ride.ios] 📅 Date:', new Date().toISOString());

    const validation = validateForm();
    
    if (!validation.isValid) {
      console.log('[publish-ride.ios] ❌ Validation errors:', validation.errors);
      setValidationErrors(validation.errors);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        'Formulaire incomplet',
        'Veuillez corriger les erreurs suivantes :\n\n' + validation.errors.map((e, i) => `${i + 1}. ${e}`).join('\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    if (!isPhoneVerified) {
      console.log('[publish-ride.ios] ⚠️ Phone not verified, showing verification modal');
      setShowVerificationModal(true);
      return;
    }

    // iOS FIX: Set submitting state BEFORE any async operations
    setIsSubmitting(true);
    console.log('[publish-ride.ios] 🔒 isSubmitting set to true');

    try {
      // Step 1: Get or create user ID
      console.log('[publish-ride.ios] ========================================');
      console.log('[publish-ride.ios] 📝 STEP 1: Getting/Creating User ID');
      console.log('[publish-ride.ios] ========================================');
      const userId = await getOrCreateUserId();
      console.log('[publish-ride.ios] ✅ User ID obtained:', userId);

      // Step 2: Ensure profile and wallet exist BEFORE creating ride
      console.log('[publish-ride.ios] ========================================');
      console.log('[publish-ride.ios] 👤 STEP 2: Ensuring Profile and Wallet');
      console.log('[publish-ride.ios] ========================================');
      try {
        // iOS FIX: Use retry logic with longer delays
        const profileWalletResult = await ensureProfileAndWallet(userId, {
          name: profile.fullName || 'Conducteur',
          phone: profile.phoneNumber || '',
        }, 3); // iOS: Use 3 retries instead of 2
        
        if (profileWalletResult) {
          console.log('[publish-ride.ios] ✅ Profile and wallet ensured:', {
            profileId: profileWalletResult.profile.id,
            walletId: profileWalletResult.wallet.id,
          });
        } else {
          console.log('[publish-ride.ios] ⚠️ Profile/wallet result is null, but continuing...');
        }
        
        // iOS FIX: Add a small delay to ensure database consistency
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (ensureError: any) {
        console.error('[publish-ride.ios] ========================================');
        console.error('[publish-ride.ios] ❌ ERROR ENSURING PROFILE/WALLET');
        console.error('[publish-ride.ios] ========================================');
        console.error('[publish-ride.ios] Error message:', ensureError?.message);
        console.error('[publish-ride.ios] Error code:', ensureError?.code);
        console.error('[publish-ride.ios] Error details:', ensureError?.details);
        console.error('[publish-ride.ios] Error hint:', ensureError?.hint);
        console.error('[publish-ride.ios] Full error:', JSON.stringify(ensureError, null, 2));
        
        // iOS FIX: Show specific error to user
        if (ensureError?.code === '23505') {
          Alert.alert(
            'Profil existant',
            'Un profil avec ce numéro de téléphone existe déjà. Veuillez réessayer.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Erreur de profil',
            `Impossible de créer/vérifier votre profil.\n\nErreur: ${ensureError?.message || 'Inconnue'}`,
            [{ text: 'OK' }]
          );
        }
        
        setIsSubmitting(false);
        return;
      }

      // Step 3: Check debt status
      console.log('[publish-ride.ios] ========================================');
      console.log('[publish-ride.ios] 💰 STEP 3: Checking Debt Status');
      console.log('[publish-ride.ios] ========================================');
      try {
        const debtStatus = await checkDebtStatus(userId);
        console.log('[publish-ride.ios] ✅ Debt status checked:', debtStatus);
        
        if (debtStatus.isBlocked) {
          console.log('[publish-ride.ios] ⚠️ User is blocked due to debt:', debtStatus.debtAmount);
          setDebtAmount(debtStatus.debtAmount);
          setShowDebtModal(true);
          setIsSubmitting(false);
          return;
        }
      } catch (debtError: any) {
        console.error('[publish-ride.ios] ⚠️ Error checking debt status (non-critical):', debtError?.message);
      }

      setValidationErrors([]);

      // Step 4: Prepare ride data
      console.log('[publish-ride.ios] ========================================');
      console.log('[publish-ride.ios] 📦 STEP 4: Preparing Ride Data');
      console.log('[publish-ride.ios] ========================================');
      const seats = parseInt(availableSeats);
      const price = parseInt(pricePerPassenger);

      // FIX: Include the driver's phone number in the ride data
      const rideData = {
        driverId: userId,
        driverName: profile.fullName || 'Conducteur',
        driverPhone: profile.phoneNumber || '', // FIX: Pass the actual phone number
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
      };

      console.log('[publish-ride.ios] 📋 Ride data prepared:', JSON.stringify(rideData, null, 2));
      console.log('[publish-ride.ios] 📞 Driver phone being sent:', rideData.driverPhone);

      // Step 5: Add ride
      console.log('[publish-ride.ios] ========================================');
      console.log('[publish-ride.ios] 🚗 STEP 5: Publishing Ride to Supabase');
      console.log('[publish-ride.ios] ========================================');
      await addRide(rideData);

      console.log('[publish-ride.ios] ========================================');
      console.log('[publish-ride.ios] ✅ RIDE PUBLISHED SUCCESSFULLY!');
      console.log('[publish-ride.ios] ========================================');

      // Step 6: Save favorite route
      console.log('[publish-ride.ios] 📝 STEP 6: Saving favorite route...');
      await saveFavoriteRoute();

      console.log('[publish-ride.ios] ========================================');
      console.log('[publish-ride.ios] ✅ SUBMIT COMPLETED SUCCESSFULLY');
      console.log('[publish-ride.ios] ========================================');
      
      // iOS FIX: Reset submitting state BEFORE showing success message
      setIsSubmitting(false);
      console.log('[publish-ride.ios] 🔓 isSubmitting set to false');
      
      // iOS FIX: Show success message IMMEDIATELY after successful submission
      showSuccessMessage();
    } catch (error: any) {
      console.error('[publish-ride.ios] ========================================');
      console.error('[publish-ride.ios] ❌❌❌ SUBMIT FAILED ❌❌❌');
      console.error('[publish-ride.ios] ========================================');
      console.error('[publish-ride.ios] 🔴 Error Type:', typeof error);
      console.error('[publish-ride.ios] 🔴 Error Name:', error?.name);
      console.error('[publish-ride.ios] 🔴 Error Message:', error?.message);
      console.error('[publish-ride.ios] 🔴 Error Code:', error?.code);
      console.error('[publish-ride.ios] 🔴 Error Details:', error?.details);
      console.error('[publish-ride.ios] 🔴 Error Hint:', error?.hint);
      console.error('[publish-ride.ios] 🔴 Error Status:', error?.status);
      console.error('[publish-ride.ios] 🔴 Error StatusCode:', error?.statusCode);
      console.error('[publish-ride.ios] 🔴 Full Error Object:', JSON.stringify(error, null, 2));
      console.error('[publish-ride.ios] 🔴 Error Stack:', error?.stack);
      console.error('[publish-ride.ios] ========================================');
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Build detailed error message for user
      let errorTitle = 'Erreur Supabase';
      let errorMessage = 'Erreur lors de la publication du trajet.\n\n';
      
      // Add all available error information
      if (error?.message) {
        errorMessage += `Message: ${error.message}\n\n`;
      }
      
      if (error?.code) {
        errorMessage += `Code: ${error.code}\n\n`;
      }
      
      if (error?.details) {
        errorMessage += `Détails: ${error.details}\n\n`;
      }
      
      if (error?.hint) {
        errorMessage += `Suggestion: ${error.hint}\n\n`;
      }
      
      // Check for specific error types
      if (error?.message?.includes('foreign key') || error?.code === '23503') {
        errorTitle = 'Erreur de Clé Étrangère';
        errorMessage += '⚠️ Problème de contrainte de base de données (foreign key).\n\n';
        errorMessage += 'Cela signifie généralement que votre profil utilisateur n\'existe pas dans la base de données.\n\n';
      } else if (error?.message?.includes('duplicate') || error?.code === '23505') {
        errorTitle = 'Erreur de Duplication';
        errorMessage += '⚠️ Ce trajet existe déjà.\n\n';
      } else if (error?.message?.includes('NOT NULL') || error?.code === '23502') {
        errorTitle = 'Erreur de Champ Requis';
        errorMessage += '⚠️ Un champ obligatoire est manquant.\n\n';
      } else if (error?.message?.includes('permission') || error?.message?.includes('RLS')) {
        errorTitle = 'Erreur de Permission';
        errorMessage += '⚠️ Problème de sécurité RLS (Row Level Security).\n\n';
      }
      
      errorMessage += 'Veuillez copier ce message et le partager avec le support technique.';
      
      // Show detailed error alert
      Alert.alert(
        errorTitle,
        errorMessage,
        [
          { 
            text: 'Copier l\'erreur', 
            onPress: () => {
              // In a real app, you would copy to clipboard here
              console.log('[publish-ride.ios] 📋 User requested to copy error');
            }
          },
          { text: 'OK' }
        ]
      );
    } finally {
      // iOS FIX: Always reset submitting state in finally block
      setIsSubmitting(false);
      console.log('[publish-ride.ios] 🔓 isSubmitting set to false (finally)');
    }
  };

  const renderDatePicker = () => {
    if (!showDatePicker) return null;

    const picker = (
      <DateTimePicker
        value={departureDate || new Date()}
        mode="date"
        display="spinner"
        onChange={handleDateChange}
        minimumDate={new Date()}
        locale="fr-FR"
      />
    );

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
  };

  const renderTimePicker = () => {
    if (!showTimePicker) return null;

    const picker = (
      <DateTimePicker
        value={departureTime || new Date()}
        mode="time"
        display="spinner"
        onChange={handleTimeChange}
        is24Hour={true}
        locale="fr-FR"
      />
    );

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
  };

  const renderSuccessModal = () => {
    if (!showSuccessModal) return null;

    const scale = successAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 1.1, 1],
    });

    const opacity = successAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => {}}
      >
        <View style={styles.successModalOverlay}>
          <Animated.View
            style={[
              styles.successModalContent,
              {
                backgroundColor: isDark ? colors.darkCard : '#FFFFFF',
                transform: [{ scale }],
                opacity,
              },
            ]}
          >
            <View style={[styles.successIconContainer, { backgroundColor: colors.success + '20' }]}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={64}
                color={colors.success}
              />
            </View>
            
            <Text style={[styles.successTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Trajet publié avec succès !
            </Text>
            
            <Text style={[styles.successMessage, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Votre trajet est maintenant visible dans &quot;Mes trajets publiés&quot;
            </Text>

            <View style={[styles.successDetailsCard, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
              <View style={styles.successDetailRow}>
                <IconSymbol
                  ios_icon_name="location.fill"
                  android_material_icon_name="place"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.successDetailText, { color: isDark ? colors.darkText : colors.text }]}>
                  {departureCity} → {arrivalCity}
                </Text>
              </View>
              
              <View style={styles.successDetailRow}>
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="calendar-today"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.successDetailText, { color: isDark ? colors.darkText : colors.text }]}>
                  {departureDate && formatDate(departureDate)} à {departureTime && formatTime(departureTime)}
                </Text>
              </View>
              
              <View style={styles.successDetailRow}>
                <IconSymbol
                  ios_icon_name="person.2.fill"
                  android_material_icon_name="people"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.successDetailText, { color: isDark ? colors.darkText : colors.text }]}>
                  {availableSeats} place{parseInt(availableSeats) > 1 ? 's' : ''} disponible{parseInt(availableSeats) > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <PhoneVerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSuccess={() => {
          Alert.alert(
            'Numéro vérifié !',
            'Vous pouvez maintenant publier votre trajet.',
            [{ text: 'OK' }]
          );
        }}
      />

      <DebtBlockModal
        visible={showDebtModal}
        debtAmount={debtAmount}
        onClose={() => setShowDebtModal(false)}
      />

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
        keyboardShouldPersistTaps="handled"
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

          {validationErrors.length > 0 && (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '20', borderColor: colors.error }]}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="error"
                size={20}
                color={colors.error}
              />
              <View style={styles.errorTextContainer}>
                <Text style={[styles.errorTitle, { color: colors.error }]}>
                  Veuillez corriger les erreurs suivantes :
                </Text>
                {validationErrors.map((error, index) => (
                  <Text key={index} style={[styles.errorText, { color: colors.error }]}>
                    • {error}
                  </Text>
                ))}
              </View>
            </View>
          )}

          <CityAutocomplete
            value={departureCity}
            onChangeText={(text) => {
              setDepartureCity(text);
              setDepartureCityError('');
            }}
            onSelectCity={handleSelectDepartureCity}
            placeholder="Ex: Dakar"
            label="Ville de départ"
            error={departureCityError}
          />

          <CityAutocomplete
            value={arrivalCity}
            onChangeText={(text) => {
              setArrivalCity(text);
              setArrivalCityError('');
            }}
            onSelectCity={handleSelectArrivalCity}
            placeholder="Ex: Thiès"
            label="Ville d'arrivée"
            error={arrivalCityError}
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
                  borderColor: !departureDate && validationErrors.length > 0 ? colors.error : colors.border,
                },
              ]}
              onPress={() => {
                console.log('[publish-ride.ios] 📅 Date picker button pressed');
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
                  borderColor: !departureTime && validationErrors.length > 0 ? colors.error : colors.border,
                },
              ]}
              onPress={() => {
                console.log('[publish-ride.ios] ⏰ Time picker button pressed');
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
                  borderColor: availableSeats.trim() === '' && validationErrors.length > 0 ? colors.error : colors.border,
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
                  borderColor: pricePerPassenger.trim() === '' && validationErrors.length > 0 ? colors.error : colors.border,
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
                backgroundColor: isButtonEnabled ? colors.primary : colors.border,
                opacity: isButtonEnabled ? 1 : 0.6,
              },
            ]}
            onPress={handleSubmit}
            disabled={!isButtonEnabled}
            activeOpacity={0.7}
          >
            <Text style={[styles.submitButtonText, { color: isButtonEnabled ? '#FFFFFF' : colors.textSecondary }]}>
              {isSubmitting ? 'Publication en cours...' : (!isPhoneVerified ? 'Vérifier le numéro pour publier' : 'Publier un trajet')}
            </Text>
            {isButtonEnabled && !isSubmitting && (
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color="#FFFFFF"
              />
            )}
          </TouchableOpacity>

          {!isButtonEnabled && !isSubmitting && (
            <View style={styles.helpTextContainer}>
              <IconSymbol
                ios_icon_name="info.circle"
                android_material_icon_name="info"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Remplissez tous les champs obligatoires (*) et sélectionnez les villes dans les suggestions pour activer le bouton.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {renderDatePicker()}
      {renderTimePicker()}
      {renderSuccessModal()}
    </KeyboardAvoidingView>
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
    paddingTop: 60,
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  helpTextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    gap: 8,
    paddingHorizontal: 4,
  },
  helpText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
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
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalContent: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  successDetailsCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  successDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  successDetailText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
});
