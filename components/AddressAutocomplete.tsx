
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
  ScrollView,
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
  error?: string;
}

interface DebugInfo {
  status?: string;
  error_message?: string;
  platform_used?: string;
  referer?: string;
  http_status?: number;
  http_status_text?: string;
  timestamp?: string;
  debug?: {
    env_status?: {
      server?: string;
    };
    requested_platform?: string;
    missing_secret?: string;
    api_key_length?: number;
    api_key_prefix?: string;
    request_url_pattern?: string;
  };
  help?: {
    message: string;
    causes?: string[];
    steps: string[];
    supabase_cli_alternative?: string[];
    documentation?: string;
  };
}

export default function AddressAutocomplete({
  value,
  onChangeText,
  onSelectAddress,
  placeholder,
  label,
  error,
}: AddressAutocompleteProps) {
  const theme = useTheme();
  const isDark = theme.dark;
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showNoResults, setShowNoResults] = useState(false);
  const [hasSelectedFromAutocomplete, setHasSelectedFromAutocomplete] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value.length > 1 && !hasSelectedFromAutocomplete) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        fetchPredictions(value);
      }, 500);
    } else if (value.length <= 1) {
      setPredictions([]);
      setShowPredictions(false);
      setShowNoResults(false);
      setApiError(null);
      setDebugInfo(null);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value, hasSelectedFromAutocomplete]);

  const fetchPredictions = async (input: string) => {
    setIsLoading(true);
    setApiError(null);
    setShowNoResults(false);
    setDebugInfo(null);
    
    try {
      console.log(`[AddressAutocomplete] Fetching predictions for: "${input}" on platform: ${Platform.OS}`);
      
      const requestBody = {
        action: 'autocomplete',
        input: input,
        location: '14.6928,-17.4467',
        radius: 45000,
        components: 'country:sn',
        language: 'fr',
        strictbounds: true,
      };

      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: requestBody,
        headers: {
          'x-platform': Platform.OS,
        },
      });

      if (error) {
        console.error('[AddressAutocomplete] Supabase function error:', error);
        setApiError('Autocomplétion momentanément indisponible. Vérifiez votre connexion internet ou réessayez plus tard.');
        setPredictions([]);
        setShowPredictions(false);
        
        // Store debug info for web platform
        if (Platform.OS === 'web') {
          setDebugInfo({
            error_message: error.message,
            timestamp: new Date().toISOString(),
          });
        }
        return;
      }

      console.log('[AddressAutocomplete] API Response:', data);

      // Store debug info for web platform
      if (Platform.OS === 'web' && data) {
        setDebugInfo(data as DebugInfo);
      }

      if (data.status === 'OK' && data.predictions) {
        if (data.predictions.length === 0) {
          setPredictions([]);
          setShowPredictions(false);
          setShowNoResults(true);
        } else {
          console.log(`[AddressAutocomplete] Found ${data.predictions.length} predictions`);
          setPredictions(data.predictions);
          setShowPredictions(true);
          setShowNoResults(false);
        }
        setApiError(null);
      } else if (data.status === 'ZERO_RESULTS') {
        setPredictions([]);
        setShowPredictions(false);
        setShowNoResults(true);
        setApiError(null);
      } else if (data.status === 'REQUEST_DENIED') {
        console.error('[AddressAutocomplete] REQUEST_DENIED:', data.error_message);
        console.error('[AddressAutocomplete] Debug Info:', data.debug);
        console.error('[AddressAutocomplete] Help:', data.help);
        
        setApiError('Autocomplétion momentanément indisponible. Vérifiez votre connexion internet ou réessayez plus tard.');
        setPredictions([]);
        setShowPredictions(false);
        
        // Show debug panel on web
        if (Platform.OS === 'web') {
          setShowDebugPanel(true);
        }
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        setApiError('Autocomplétion momentanément indisponible. Vérifiez votre connexion internet ou réessayez plus tard.');
        setPredictions([]);
        setShowPredictions(false);
      } else {
        console.error('[AddressAutocomplete] Unexpected status:', data.status);
        setApiError('Autocomplétion momentanément indisponible. Vérifiez votre connexion internet ou réessayez plus tard.');
        setPredictions([]);
        setShowNoResults(false);
      }
    } catch (error) {
      console.error('[AddressAutocomplete] Exception:', error);
      setApiError('Autocomplétion momentanément indisponible. Vérifiez votre connexion internet ou réessayez plus tard.');
      setPredictions([]);
      setShowNoResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceDetails = async (placeId: string): Promise<Location | null> => {
    try {
      console.log('[AddressAutocomplete] Fetching place details for:', placeId);
      
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
        console.error('[AddressAutocomplete] Place details error:', error);
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
        console.log('[AddressAutocomplete] Place details retrieved:', location);
        return location;
      }
      
      console.error('[AddressAutocomplete] Invalid place details:', data.status);
      return null;
    } catch (error) {
      console.error('[AddressAutocomplete] Place details exception:', error);
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
    setDebugInfo(null);
    setShowDebugPanel(false);
    setHasSelectedFromAutocomplete(true);
    Keyboard.dismiss();

    console.log('[AddressAutocomplete] Selected prediction:', address);

    const location = await getPlaceDetails(prediction.place_id);
    if (location) {
      onSelectAddress(address, location, prediction.place_id);
    }
  };

  const handleTextChange = (text: string) => {
    setHasSelectedFromAutocomplete(false);
    onChangeText(text);
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

  // Check if user has selected from autocomplete
  const isValidSelection = hasSelectedFromAutocomplete || value.trim() === '';

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
              borderColor: error ? colors.error : (apiError ? '#FF0000' : (isDark ? colors.darkCard : colors.border)),
              borderWidth: (error || apiError) ? 2 : 1,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
          value={value}
          onChangeText={handleTextChange}
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

      {/* Validation Error Message */}
      {error && (
        <View style={[styles.validationErrorContainer, { backgroundColor: colors.error + '20', borderColor: colors.error }]}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={[styles.validationErrorText, { color: colors.error }]}>
            {error}
          </Text>
        </View>
      )}

      {apiError && (
        <View style={[styles.errorContainer, { backgroundColor: '#FFF3CD', borderColor: '#FFC107' }]}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <View style={styles.errorTextContainer}>
            <Text style={[styles.errorText, { color: '#856404' }]}>
              {apiError}
            </Text>
            <Text style={[styles.errorHint, { color: '#856404' }]}>
              Vous pouvez continuer en saisissant l&apos;adresse manuellement.
            </Text>
            {Platform.OS === 'web' && debugInfo && (
              <TouchableOpacity
                onPress={() => setShowDebugPanel(!showDebugPanel)}
                style={styles.debugToggle}
              >
                <Text style={[styles.debugToggleText, { color: '#856404' }]}>
                  {showDebugPanel ? '▼ Masquer les détails techniques' : '▶ Afficher les détails techniques'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Debug Panel for Web Platform */}
      {Platform.OS === 'web' && showDebugPanel && debugInfo && (
        <ScrollView style={[styles.debugPanel, { backgroundColor: isDark ? colors.darkCard : '#F5F5F5' }]}>
          <Text style={[styles.debugTitle, { color: isDark ? colors.darkText : colors.text }]}>
            🔧 Informations de diagnostic
          </Text>
          
          <View style={styles.debugSection}>
            <Text style={[styles.debugSectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
              État de la requête:
            </Text>
            <Text style={[styles.debugText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              • Statut: {debugInfo.status || 'N/A'}
            </Text>
            <Text style={[styles.debugText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              • Plateforme: {debugInfo.platform_used || Platform.OS}
            </Text>
            <Text style={[styles.debugText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              • Referer: {debugInfo.referer || 'N/A'}
            </Text>
            <Text style={[styles.debugText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              • HTTP Status: {debugInfo.http_status || 'N/A'} {debugInfo.http_status_text || ''}
            </Text>
            <Text style={[styles.debugText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              • Timestamp: {debugInfo.timestamp || 'N/A'}
            </Text>
          </View>

          {debugInfo.debug && (
            <View style={styles.debugSection}>
              <Text style={[styles.debugSectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Configuration des clés API:
              </Text>
              <Text style={[styles.debugText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                • Server: {debugInfo.debug.env_status?.server || 'N/A'}
              </Text>
              {debugInfo.debug.missing_secret && (
                <Text style={[styles.debugTextError, { color: '#D32F2F' }]}>
                  ⚠️ Secret manquant: {debugInfo.debug.missing_secret}
                </Text>
              )}
            </View>
          )}

          {debugInfo.help && (
            <View style={styles.debugSection}>
              <Text style={[styles.debugSectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Solution recommandée:
              </Text>
              <Text style={[styles.debugText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                {debugInfo.help.message}
              </Text>
              
              {debugInfo.help.causes && (
                <React.Fragment>
                  <Text style={[styles.debugSubtitle, { color: isDark ? colors.darkText : colors.text }]}>
                    Causes possibles:
                  </Text>
                  {debugInfo.help.causes.map((cause, index) => (
                    <Text key={index} style={[styles.debugText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      • {cause}
                    </Text>
                  ))}
                </React.Fragment>
              )}

              <Text style={[styles.debugSubtitle, { color: isDark ? colors.darkText : colors.text }]}>
                Étapes à suivre:
              </Text>
              {debugInfo.help.steps.map((step, index) => (
                <Text key={index} style={[styles.debugText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  {step}
                </Text>
              ))}

              {debugInfo.help.supabase_cli_alternative && (
                <React.Fragment>
                  <Text style={[styles.debugSubtitle, { color: isDark ? colors.darkText : colors.text }]}>
                    Alternative (Supabase CLI):
                  </Text>
                  {debugInfo.help.supabase_cli_alternative.map((item, index) => (
                    <Text key={index} style={[styles.debugText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      {item}
                    </Text>
                  ))}
                </React.Fragment>
              )}

              {debugInfo.help.documentation && (
                <Text style={[styles.debugText, { color: colors.primary, marginTop: 8 }]}>
                  📚 Documentation: {debugInfo.help.documentation}
                </Text>
              )}
            </View>
          )}

          {debugInfo.error_message && (
            <View style={styles.debugSection}>
              <Text style={[styles.debugSectionTitle, { color: '#D32F2F' }]}>
                Message d&apos;erreur:
              </Text>
              <Text style={[styles.debugTextError, { color: '#D32F2F' }]}>
                {debugInfo.error_message}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

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
  validationErrorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  validationErrorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
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
    fontWeight: '600',
  },
  errorHint: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
    fontStyle: 'italic',
  },
  debugToggle: {
    marginTop: 8,
    paddingVertical: 4,
  },
  debugToggleText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  debugPanel: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    maxHeight: 400,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  debugSection: {
    marginBottom: 16,
  },
  debugSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  debugSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  debugText: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 2,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  debugTextError: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 2,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
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
