
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
  const [showNoResults, setShowNoResults] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
    setShowNoResults(false);
    setDebugInfo('');
    
    try {
      console.log('🔍 [AddressAutocomplete] Fetching predictions for:', input);
      console.log('📱 [AddressAutocomplete] Platform:', Platform.OS);

      // Update debug info for mobile
      if (Platform.OS !== 'web') {
        setDebugInfo(`Platform: ${Platform.OS}\nInput: "${input}"\nCalling API...`);
      }

      const startTime = Date.now();

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
        const errorMessage = 'Problème de connexion. Veuillez réessayer.';
        setApiError(errorMessage);
        setPredictions([]);
        setShowPredictions(false);
        setShowNoResults(false);
        
        // Update debug info
        if (Platform.OS !== 'web') {
          setDebugInfo(
            `Platform: ${Platform.OS}\n` +
            `Error: ${error.message}\n` +
            `Time: ${responseTime}ms\n` +
            `\nℹ️ Si ce problème persiste sur iOS/Android:\n` +
            `1. Vérifiez que la clé API Google Maps est configurée pour ${Platform.OS}\n` +
            `2. Pour iOS: Ajoutez le Bundle ID dans les restrictions\n` +
            `3. Pour Android: Ajoutez le Package Name + SHA-1\n` +
            `4. Activez: Places API, Geocoding API`
          );
          
          Alert.alert(
            'Erreur de connexion',
            `Impossible de récupérer les suggestions.\n\nPlateforme: ${Platform.OS}\nDétails: ${error.message}\n\nSi ce problème persiste, contactez le support.`,
            [{ text: 'OK' }]
          );
        }
        return;
      }

      console.log('📦 [AddressAutocomplete] Response status:', data?.status);
      console.log('📦 [AddressAutocomplete] Response data:', JSON.stringify(data, null, 2));

      if (data.status === 'OK' && data.predictions) {
        if (data.predictions.length === 0) {
          console.log('⚠️ [AddressAutocomplete] No predictions found (status=OK but 0 results)');
          setPredictions([]);
          setShowPredictions(false);
          setShowNoResults(true);
          setApiError(null);
          
          if (Platform.OS !== 'web') {
            setDebugInfo(
              `Platform: ${Platform.OS}\n` +
              `Status: ${data.status}\n` +
              `Time: ${responseTime}ms\n` +
              `Predictions: 0\n` +
              `\nℹ️ Aucun résultat trouvé pour "${input}"`
            );
          }
        } else {
          console.log(`✅ [AddressAutocomplete] Found ${data.predictions.length} predictions`);
          setPredictions(data.predictions);
          setShowPredictions(true);
          setShowNoResults(false);
          setApiError(null);
          
          if (Platform.OS !== 'web') {
            setDebugInfo(
              `Platform: ${Platform.OS}\n` +
              `Status: ${data.status}\n` +
              `Time: ${responseTime}ms\n` +
              `Predictions: ${data.predictions.length}\n` +
              `\n✅ API fonctionne correctement`
            );
          }
        }
      } else if (data.status === 'ZERO_RESULTS') {
        console.log('⚠️ [AddressAutocomplete] ZERO_RESULTS status');
        setPredictions([]);
        setShowPredictions(false);
        setShowNoResults(true);
        setApiError(null);
        
        if (Platform.OS !== 'web') {
          setDebugInfo(
            `Platform: ${Platform.OS}\n` +
            `Status: ZERO_RESULTS\n` +
            `Time: ${responseTime}ms\n` +
            `\nℹ️ Aucun résultat trouvé`
          );
        }
      } else if (data.status === 'REQUEST_DENIED') {
        console.error('❌ [AddressAutocomplete] REQUEST_DENIED - API key issue');
        console.error('   Platform:', Platform.OS);
        console.error('   Error message:', data.error_message);
        
        const errorMessage = 'Service temporairement indisponible';
        setApiError(errorMessage);
        setPredictions([]);
        setShowPredictions(false);
        setShowNoResults(false);
        
        if (Platform.OS !== 'web') {
          setDebugInfo(
            `Platform: ${Platform.OS}\n` +
            `Status: REQUEST_DENIED\n` +
            `Time: ${responseTime}ms\n` +
            `Error: ${data.error_message || 'No error message'}\n` +
            `\n🚫 PROBLÈME DE CLÉ API:\n` +
            `La clé API Google Maps n'est pas configurée pour ${Platform.OS}.\n` +
            `\nSOLUTION:\n` +
            `1. Allez sur Google Cloud Console\n` +
            `2. Créez une clé API pour ${Platform.OS}\n` +
            `3. Pour iOS: Ajoutez le Bundle ID\n` +
            `4. Pour Android: Ajoutez Package Name + SHA-1\n` +
            `5. Activez: Places API, Geocoding API, Distance Matrix API`
          );
          
          Alert.alert(
            '🚫 Clé API non configurée',
            `La clé API Google Maps n'est pas configurée pour ${Platform.OS}.\n\n` +
            `Plateforme: ${Platform.OS}\n` +
            `Erreur: ${data.error_message || 'REQUEST_DENIED'}\n\n` +
            `Pour résoudre ce problème:\n` +
            `1. Créez une clé API séparée pour ${Platform.OS}\n` +
            `2. Configurez les restrictions d'application\n` +
            `3. Activez les APIs nécessaires\n\n` +
            `Contactez le support pour plus d'aide.`,
            [{ text: 'OK' }]
          );
        }
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        console.error('❌ [AddressAutocomplete] OVER_QUERY_LIMIT');
        setApiError('Service temporairement indisponible. Veuillez réessayer plus tard.');
        setPredictions([]);
        setShowPredictions(false);
        setShowNoResults(false);
        
        if (Platform.OS !== 'web') {
          setDebugInfo(
            `Platform: ${Platform.OS}\n` +
            `Status: OVER_QUERY_LIMIT\n` +
            `Time: ${responseTime}ms\n` +
            `\n⚠️ Quota API dépassé`
          );
        }
      } else {
        console.log('⚠️ [AddressAutocomplete] Unexpected status:', data.status);
        setPredictions([]);
        setShowNoResults(false);
        
        if (Platform.OS !== 'web') {
          setDebugInfo(
            `Platform: ${Platform.OS}\n` +
            `Status: ${data.status}\n` +
            `Time: ${responseTime}ms\n` +
            `\n⚠️ Statut inattendu`
          );
        }
      }
    } catch (error) {
      console.error('💥 [AddressAutocomplete] Exception:', error);
      setApiError('Problème de connexion. Veuillez réessayer.');
      setPredictions([]);
      setShowNoResults(false);
      
      if (Platform.OS !== 'web') {
        setDebugInfo(
          `Platform: ${Platform.OS}\n` +
          `Exception: ${error.message}\n` +
          `\n💥 Erreur inattendue`
        );
        
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
      console.log('🔍 [AddressAutocomplete] Fetching place details for:', placeId);

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
        Alert.alert(
          'Erreur',
          'Impossible de récupérer les coordonnées. Veuillez réessayer.'
        );
        return null;
      }

      if (data.status === 'OK' && data.result?.geometry?.location) {
        const location = {
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
        };
        console.log('✅ [AddressAutocomplete] Place coordinates:', location);
        return location;
      }
      
      console.error('❌ [AddressAutocomplete] Invalid place details response:', data.status);
      return null;
    } catch (error) {
      console.error('💥 [AddressAutocomplete] Exception in getPlaceDetails:', error);
      Alert.alert(
        'Erreur',
        'Impossible de récupérer les coordonnées. Veuillez réessayer.'
      );
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
    setDebugInfo('');
    Keyboard.dismiss();

    const location = await getPlaceDetails(prediction.place_id);
    if (location) {
      onSelectAddress(address, location, prediction.place_id);
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

      {/* Error Message */}
      {apiError && (
        <View style={[styles.errorContainer, { backgroundColor: '#FF000020' }]}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <View style={styles.errorTextContainer}>
            <Text style={[styles.errorText, { color: '#FF0000' }]}>
              {apiError}
            </Text>
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

      {/* Predictions List */}
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
  predictionsContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    height: 300,
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
    borderRadius: 12,
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
