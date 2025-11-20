
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Platform,
  Alert,
  FlatList,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { supabase } from '@/config/supabase';

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

interface Location {
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectAddress: (address: string, location: Location, placeId: string) => void;
  placeholder: string;
  label: string;
}

export default function AddressAutocomplete({
  value,
  onChangeText,
  onSelectAddress,
  placeholder,
  label,
}: AddressAutocompleteProps) {
  const theme = useTheme();
  const isDark = theme.dark;
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [showNoResults, setShowNoResults] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reduced minimum length from 3 to 2 characters
    if (value.length > 1) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        fetchPredictions(value);
      }, 500);
    } else {
      setPredictions([]);
      setShowPredictions(false);
      setShowNoResults(false);
      setApiError(null);
      setApiStatus(null);
      setDebugInfo('');
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value]);

  const fetchPredictions = async (input: string) => {
    setIsLoading(true);
    setApiError(null);
    setApiStatus(null);
    setShowNoResults(false);
    setDebugInfo('');
    
    try {
      console.log('🔍 [AddressAutocomplete] Fetching predictions for:', input);
      console.log('📱 [AddressAutocomplete] Platform:', Platform.OS);

      const requestBody = {
        action: 'autocomplete',
        input: input,
        location: '14.6928,-17.4467',
        radius: 45000,
        components: 'country:sn',
        language: 'fr',
        strictbounds: true,
      };

      console.log('📤 [AddressAutocomplete] Request body:', JSON.stringify(requestBody, null, 2));

      // Update debug info for mobile
      if (Platform.OS !== 'web') {
        setDebugInfo(`Platform: ${Platform.OS}\nInput: "${input}"\nCalling API...`);
      }

      // APPEL GOOGLE PLACES API - AUTOCOMPLÉTION D'ADRESSE
      // ====================================================
      // ✅ AUCUN filtre de plateforme - fonctionne sur Web, Android et iOS
      // ✅ Appel HTTP direct via Supabase Edge Function
      // ✅ Pas de condition "if Platform.OS === 'web'"
      
      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: requestBody,
        headers: {
          'x-platform': Platform.OS,
        },
      });
      const responseTime = Date.now() - startTime;

      console.log(`⏱️ [AddressAutocomplete] Response time: ${responseTime}ms`);

      if (error) {
        console.error('❌ [AddressAutocomplete] Supabase function error:', error);
        const errorMsg = `Erreur de connexion: ${error.message}`;
        setApiError(errorMsg);
        setApiStatus('SUPABASE_ERROR');
        setPredictions([]);
        setShowPredictions(false);
        setShowNoResults(false);
        
        // Update debug info
        if (Platform.OS !== 'web') {
          setDebugInfo(`Platform: ${Platform.OS}\nError: ${error.message}\nTime: ${responseTime}ms`);
        }
        
        // Show alert on mobile for debugging
        if (Platform.OS !== 'web') {
          Alert.alert(
            'Erreur de connexion',
            `Impossible de contacter le service d'autocomplétion.\n\nPlateforme: ${Platform.OS}\nDétails: ${error.message}\nTemps: ${responseTime}ms`,
            [{ text: 'OK' }]
          );
        }
        return;
      }

      console.log('📦 [AddressAutocomplete] API Response status:', data?.status);
      setApiStatus(data?.status || 'UNKNOWN');

      // Update debug info with response
      if (Platform.OS !== 'web') {
        setDebugInfo(
          `Platform: ${Platform.OS}\n` +
          `Status: ${data?.status || 'UNKNOWN'}\n` +
          `Time: ${responseTime}ms\n` +
          `Predictions: ${data?.predictions?.length || 0}`
        );
      }

      if (data.status === 'OK' && data.predictions) {
        console.log(`✅ [AddressAutocomplete] Found ${data.predictions.length} predictions`);
        
        if (data.predictions.length === 0) {
          console.log('⚠️ [AddressAutocomplete] API returned OK but 0 predictions');
          setPredictions([]);
          setShowPredictions(false);
          setShowNoResults(true);
          setApiError(null);
        } else {
          const placeTypes = data.predictions.slice(0, 5).map((p: Prediction) => ({
            name: p.structured_formatting.main_text,
            types: p.types
          }));
          console.log('📍 [AddressAutocomplete] Place types found:', placeTypes);
          
          setPredictions(data.predictions);
          setShowPredictions(true);
          setShowNoResults(false);
          setApiError(null);
        }
      } else if (data.status === 'ZERO_RESULTS') {
        console.log('⚠️ [AddressAutocomplete] ZERO_RESULTS from Google API');
        setPredictions([]);
        setShowPredictions(false);
        setShowNoResults(true);
        setApiError(null);
      } else if (data.status === 'REQUEST_DENIED') {
        console.error('🚫 [AddressAutocomplete] REQUEST_DENIED from Google API');
        console.error('Error message:', data.error_message);
        
        const errorMsg = data.error_message || 'Accès refusé par Google Maps API';
        setApiError(errorMsg);
        setPredictions([]);
        setShowPredictions(false);
        setShowNoResults(false);
        
        // Show detailed alert on mobile with solution
        if (Platform.OS !== 'web') {
          Alert.alert(
            '🚫 Erreur API Google Maps',
            `L'autocomplétion ne fonctionne pas sur ${Platform.OS}.\n\n` +
            `Status: REQUEST_DENIED\n\n` +
            `Raison: ${errorMsg}\n\n` +
            `🔧 SOLUTION:\n\n` +
            `La clé API Google Maps a des restrictions.\n\n` +
            `Pour corriger:\n` +
            `1. Ouvrir Google Cloud Console\n` +
            `2. Aller dans "APIs & Services" > "Credentials"\n` +
            `3. Modifier la clé API\n` +
            `4. Supprimer les restrictions HTTP referrer\n` +
            `5. OU créer une nouvelle clé pour mobile\n` +
            `6. Activer: Places API, Geocoding API, Distance Matrix API`,
            [{ text: 'OK' }]
          );
        }
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        console.error('⚠️ [AddressAutocomplete] OVER_QUERY_LIMIT');
        setApiError('Quota API dépassé. Veuillez réessayer plus tard.');
        setPredictions([]);
        setShowPredictions(false);
        setShowNoResults(false);
        
        if (Platform.OS !== 'web') {
          Alert.alert(
            '⚠️ Quota dépassé',
            'Le quota de l\'API Google Maps a été dépassé. Veuillez réessayer plus tard.',
            [{ text: 'OK' }]
          );
        }
      } else if (data.status === 'INVALID_REQUEST') {
        console.error('⚠️ [AddressAutocomplete] INVALID_REQUEST');
        setApiError('Requête invalide');
        setPredictions([]);
        setShowPredictions(false);
        setShowNoResults(false);
      } else {
        console.log('⚠️ [AddressAutocomplete] Autocomplete API response status:', data.status);
        if (data.error_message) {
          console.error('API Error:', data.error_message);
          setApiError(data.error_message);
          
          // Show alert on mobile
          if (Platform.OS !== 'web') {
            Alert.alert(
              'Erreur API',
              `Status: ${data.status}\n\n${data.error_message}`,
              [{ text: 'OK' }]
            );
          }
        }
        setPredictions([]);
        setShowNoResults(false);
      }
    } catch (error) {
      console.error('❌ [AddressAutocomplete] Exception:', error);
      const errorMsg = `Erreur: ${error.message}`;
      setApiError(errorMsg);
      setApiStatus('EXCEPTION');
      setPredictions([]);
      setShowNoResults(false);
      
      // Update debug info
      if (Platform.OS !== 'web') {
        setDebugInfo(`Platform: ${Platform.OS}\nException: ${error.message}`);
      }
      
      // Show alert on mobile
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Erreur',
          `Une erreur est survenue:\n\nPlateforme: ${Platform.OS}\n${error.message}`,
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceDetails = async (placeId: string): Promise<Location | null> => {
    try {
      console.log('🔍 [AddressAutocomplete] Fetching place details for place_id:', placeId);

      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: {
          action: 'place_details',
          placeId: placeId,
        },
        headers: {
          'x-platform': Platform.OS,
        },
      });

      if (error) {
        console.error('❌ [AddressAutocomplete] Error fetching place details:', error);
        
        if (Platform.OS !== 'web') {
          Alert.alert(
            'Erreur',
            `Impossible de récupérer les coordonnées:\n\n${error.message}`,
            [{ text: 'OK' }]
          );
        }
        return null;
      }

      if (data.status === 'OK' && data.result?.geometry?.location) {
        const location = {
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
        };
        console.log('✅ [AddressAutocomplete] Retrieved coordinates:', location);
        console.log('📍 [AddressAutocomplete] Place name:', data.result.name);
        console.log('🏷️ [AddressAutocomplete] Place types:', data.result.types);
        return location;
      } else {
        console.error('❌ [AddressAutocomplete] Place Details API error:', data.status);
        if (data.error_message) {
          console.error('API Error:', data.error_message);
          
          if (Platform.OS !== 'web') {
            Alert.alert(
              'Erreur API',
              `Status: ${data.status}\n\n${data.error_message}`,
              [{ text: 'OK' }]
            );
          }
        }
      }
      return null;
    } catch (error) {
      console.error('❌ [AddressAutocomplete] Exception in getPlaceDetails:', error);
      
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Erreur',
          `Une erreur est survenue:\n\n${error.message}`,
          [{ text: 'OK' }]
        );
      }
      return null;
    }
  };

  const handleSelectPrediction = async (prediction: Prediction) => {
    const address = prediction.description;
    onChangeText(address);
    setShowPredictions(false);
    setPredictions([]);
    setShowNoResults(false);
    setApiError(null);
    setApiStatus(null);
    setDebugInfo('');
    Keyboard.dismiss();

    console.log('✅ [AddressAutocomplete] Selected address:', address);
    console.log('🆔 [AddressAutocomplete] Place ID:', prediction.place_id);
    console.log('🏷️ [AddressAutocomplete] Place types:', prediction.types);

    const location = await getPlaceDetails(prediction.place_id);
    if (location) {
      onSelectAddress(address, location, prediction.place_id);
      console.log('✅ [AddressAutocomplete] Coordinates stored successfully');
    } else {
      console.error('❌ [AddressAutocomplete] Failed to retrieve coordinates for selected address');
    }
  };

  const getPlaceIcon = (types: string[]) => {
    if (types.includes('hospital')) return '🏥';
    if (types.includes('health')) return '⚕️';
    if (types.includes('doctor')) return '👨‍⚕️';
    if (types.includes('pharmacy')) return '💊';
    if (types.includes('dentist')) return '🦷';
    if (types.includes('mosque')) return '🕌';
    if (types.includes('church')) return '⛪';
    if (types.includes('hindu_temple')) return '🛕';
    if (types.includes('synagogue')) return '🕍';
    if (types.includes('place_of_worship')) return '🙏';
    if (types.includes('university')) return '🎓';
    if (types.includes('school')) return '🏫';
    if (types.includes('secondary_school')) return '📚';
    if (types.includes('primary_school')) return '✏️';
    if (types.includes('library')) return '📖';
    if (types.includes('shopping_mall')) return '🏬';
    if (types.includes('supermarket')) return '🛒';
    if (types.includes('market')) return '🏪';
    if (types.includes('store')) return '🏪';
    if (types.includes('convenience_store')) return '🏪';
    if (types.includes('bus_station')) return '🚌';
    if (types.includes('transit_station')) return '🚉';
    if (types.includes('train_station')) return '🚂';
    if (types.includes('airport')) return '✈️';
    if (types.includes('taxi_stand')) return '🚕';
    if (types.includes('local_government_office')) return '🏛️';
    if (types.includes('city_hall')) return '🏛️';
    if (types.includes('courthouse')) return '⚖️';
    if (types.includes('embassy')) return '🏢';
    if (types.includes('post_office')) return '📮';
    if (types.includes('police')) return '👮';
    if (types.includes('fire_station')) return '🚒';
    if (types.includes('park')) return '🌳';
    if (types.includes('stadium')) return '🏟️';
    if (types.includes('museum')) return '🏛️';
    if (types.includes('art_gallery')) return '🖼️';
    if (types.includes('movie_theater')) return '🎬';
    if (types.includes('night_club')) return '🎉';
    if (types.includes('restaurant')) return '🍽️';
    if (types.includes('cafe')) return '☕';
    if (types.includes('bar')) return '🍺';
    if (types.includes('bakery')) return '🥖';
    if (types.includes('lodging')) return '🏨';
    if (types.includes('hotel')) return '🏨';
    if (types.includes('bank')) return '🏦';
    if (types.includes('atm')) return '💳';
    if (types.includes('factory')) return '🏭';
    if (types.includes('industrial')) return '🏭';
    if (types.includes('locality')) return '🏘️';
    if (types.includes('sublocality')) return '🏘️';
    if (types.includes('neighborhood')) return '🏘️';
    if (types.includes('administrative_area_level_1')) return '🗺️';
    if (types.includes('administrative_area_level_2')) return '🗺️';
    if (types.includes('route')) return '🛣️';
    if (types.includes('street_address')) return '🏠';
    if (types.includes('intersection')) return '🚦';
    if (types.includes('premise')) return '🏠';
    if (types.includes('point_of_interest')) return '📍';
    if (types.includes('establishment')) return '🏢';
    return '📍';
  };

  const renderPredictionItem = ({ item }: { item: Prediction }) => (
    <TouchableOpacity
      style={[
        styles.predictionItem,
        { 
          backgroundColor: isDark ? colors.darkCard : colors.card,
          borderBottomColor: isDark ? colors.darkBorder : colors.border,
        },
      ]}
      onPress={() => handleSelectPrediction(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.placeIcon}>{getPlaceIcon(item.types)}</Text>
      <View style={styles.predictionTextContainer}>
        <Text style={[styles.mainText, { color: isDark ? colors.darkText : colors.text }]}>
          {item.structured_formatting.main_text}
        </Text>
        <Text style={[styles.secondaryText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
          {item.structured_formatting.secondary_text}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
        {label}
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? colors.darkBackground : colors.background,
              color: isDark ? colors.darkText : colors.text,
              borderColor: apiError ? '#FF0000' : (isDark ? colors.darkCard : colors.border),
              borderWidth: apiError ? 2 : 1,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => {
            if (predictions.length > 0) {
              setShowPredictions(true);
            }
          }}
        />
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        )}
      </View>

      {/* Error Message */}
      {apiError && (
        <View style={[styles.errorContainer, { backgroundColor: '#FF000020' }]}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <View style={styles.errorTextContainer}>
            <Text style={[styles.errorText, { color: '#FF0000' }]}>
              {apiError}
            </Text>
            {apiStatus && (
              <Text style={[styles.errorStatus, { color: '#FF0000' }]}>
                Status: {apiStatus}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* No Results Message */}
      {showNoResults && !apiError && !isLoading && value.length > 1 && (
        <View style={[styles.noResultsContainer, { backgroundColor: isDark ? colors.darkCard : '#FFF8E1' }]}>
          <Text style={styles.noResultsIcon}>🔍</Text>
          <View style={styles.noResultsTextContainer}>
            <Text style={[styles.noResultsTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Aucun résultat trouvé
            </Text>
            <Text style={[styles.noResultsText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Essayez avec un nom de lieu plus complet ou un quartier de Dakar
            </Text>
            <Text style={[styles.noResultsExample, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Exemples: &quot;Plateau&quot;, &quot;Parcelles Assainies&quot;, &quot;Marché Sandaga&quot;
            </Text>
          </View>
        </View>
      )}

      {/* Debug Info (only on mobile platforms) */}
      {Platform.OS !== 'web' && debugInfo !== '' && (
        <View style={[styles.debugContainer, { backgroundColor: isDark ? colors.darkCard : '#E3F2FD' }]}>
          <Text style={[styles.debugTitle, { color: isDark ? colors.darkText : colors.text }]}>
            🔧 Debug Info:
          </Text>
          <Text style={[styles.debugText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            {debugInfo}
          </Text>
        </View>
      )}

      {/* Predictions List - Using FlatList for better Android compatibility */}
      {showPredictions && predictions.length > 0 && (
        <View
          style={[
            styles.predictionsContainer,
            {
              backgroundColor: isDark ? colors.darkBackground : colors.background,
              borderColor: isDark ? colors.darkCard : colors.border,
            },
          ]}
        >
          <FlatList
            data={predictions}
            renderItem={renderPredictionItem}
            keyExtractor={(item) => item.place_id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            scrollEnabled={true}
            style={styles.predictionsList}
            contentContainerStyle={styles.predictionsListContent}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 1000,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  loadingContainer: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 8,
    marginTop: 2,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  errorStatus: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  noResultsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB300',
  },
  noResultsIcon: {
    fontSize: 20,
    marginRight: 8,
    marginTop: 2,
  },
  noResultsTextContainer: {
    flex: 1,
  },
  noResultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  noResultsText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  noResultsExample: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  debugContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  debugText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
  },
  predictionsContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    maxHeight: 300,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  predictionsList: {
    flex: 1,
  },
  predictionsListContent: {
    flexGrow: 1,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  placeIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
    textAlign: 'center',
  },
  predictionTextContainer: {
    flex: 1,
  },
  mainText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  secondaryText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
