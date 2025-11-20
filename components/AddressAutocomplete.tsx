
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Platform,
  Alert,
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
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value.length > 2) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        fetchPredictions(value);
      }, 500);
    } else {
      setPredictions([]);
      setShowPredictions(false);
      setApiError(null);
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
    
    try {
      console.log('🔍 [AddressAutocomplete] Fetching predictions for:', input);
      console.log('📱 [AddressAutocomplete] Platform:', Platform.OS);

      // APPEL GOOGLE PLACES API - AUTOCOMPLÉTION D'ADRESSE
      // ====================================================
      // Configuration pour Dakar métropolitaine :
      // 
      // ✅ AUCUN filtre types= : permet d'obtenir TOUS les types de lieux
      //    - Adresses précises (rues, quartiers, communes, unités des Parcelles)
      //    - Établissements (hôpitaux, mosquées, églises, écoles, universités)
      //    - Points de repère (marchés, ronds-points, carrefours, monuments)
      //    - Bâtiments administratifs et services publics
      //    - Zones industrielles, usines
      //    - Commerces, restaurants, hôtels
      //    - Stations de transport
      // 
      // ✅ components=country:sn : restriction au Sénégal uniquement
      // ✅ language=fr : langue française
      // ✅ location=14.6928,-17.4467 : centré sur Dakar
      // ✅ radius=45000 : 45 km pour couvrir toute la zone métropolitaine
      //    (Dakar, Parcelles, Pikine, Guédiawaye, Keur Massar, Mbao, 
      //     Bargny, Rufisque, Sébikotane, Bambilor, Diamaguène, Diamniadio)
      // ✅ strictbounds=true : limite strictement à la zone spécifiée
      
      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: {
          action: 'autocomplete',
          input: input,
          // ⚠️ PAS de paramètre types - cela permet d'obtenir TOUS les types de lieux
          location: '14.6928,-17.4467', // Centre sur Dakar
          radius: 45000, // 45 km - couvre toute la zone métropolitaine de Dakar
          components: 'country:sn', // Restriction au Sénégal
          language: 'fr', // Langue française
          strictbounds: true, // Limite strictement à la zone spécifiée
        },
        headers: {
          'x-platform': Platform.OS, // Send platform info to Edge Function
        },
      });

      if (error) {
        console.error('❌ [AddressAutocomplete] Supabase function error:', error);
        setApiError(`Erreur de connexion: ${error.message}`);
        setPredictions([]);
        setShowPredictions(false);
        
        // Show alert on mobile for debugging
        if (Platform.OS !== 'web') {
          Alert.alert(
            'Erreur de connexion',
            `Impossible de contacter le service d'autocomplétion.\n\nDétails: ${error.message}`,
            [{ text: 'OK' }]
          );
        }
        return;
      }

      console.log('📦 [AddressAutocomplete] API Response status:', data?.status);

      if (data.status === 'OK' && data.predictions) {
        console.log(`✅ [AddressAutocomplete] Found ${data.predictions.length} predictions`);
        
        // Log des types de lieux trouvés pour débogage
        const placeTypes = data.predictions.slice(0, 5).map((p: Prediction) => ({
          name: p.structured_formatting.main_text,
          types: p.types
        }));
        console.log('📍 [AddressAutocomplete] Place types found:', placeTypes);
        
        setPredictions(data.predictions);
        setShowPredictions(true);
        setApiError(null);
      } else if (data.status === 'ZERO_RESULTS') {
        console.log('⚠️ [AddressAutocomplete] No predictions found');
        setPredictions([]);
        setShowPredictions(false);
        setApiError(null);
      } else if (data.status === 'REQUEST_DENIED') {
        console.error('🚫 [AddressAutocomplete] REQUEST_DENIED from Google API');
        console.error('Error message:', data.error_message);
        
        const errorMsg = data.error_message || 'Accès refusé par Google Maps API';
        setApiError(errorMsg);
        setPredictions([]);
        setShowPredictions(false);
        
        // Show detailed alert on mobile
        if (Platform.OS !== 'web') {
          Alert.alert(
            '🚫 Erreur API Google Maps',
            `L'autocomplétion ne fonctionne pas sur ${Platform.OS}.\n\n` +
            `Raison: ${errorMsg}\n\n` +
            `Causes possibles:\n` +
            `• La clé API a des restrictions HTTP referrer (Web uniquement)\n` +
            `• La clé API n'autorise pas les requêtes mobiles\n` +
            `• Les APIs Places ne sont pas activées\n\n` +
            `Solution: Configurer la clé API pour autoriser les apps mobiles dans Google Cloud Console.`,
            [{ text: 'OK' }]
          );
        }
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
      }
    } catch (error) {
      console.error('❌ [AddressAutocomplete] Exception:', error);
      setApiError(`Erreur: ${error.message}`);
      setPredictions([]);
      
      // Show alert on mobile
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Erreur',
          `Une erreur est survenue:\n\n${error.message}`,
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

      // RÉCUPÉRATION LAT/LNG (Google Places Details API)
      // =================================================
      // Récupère la géométrie (latitude et longitude) du lieu sélectionné
      
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
    setApiError(null);
    Keyboard.dismiss();

    console.log('✅ [AddressAutocomplete] Selected address:', address);
    console.log('🆔 [AddressAutocomplete] Place ID:', prediction.place_id);
    console.log('🏷️ [AddressAutocomplete] Place types:', prediction.types);

    // RÉCUPÉRATION DES COORDONNÉES DU LIEU SÉLECTIONNÉ
    // Appel Place Details pour obtenir lat/lng
    const location = await getPlaceDetails(prediction.place_id);
    if (location) {
      // Stockage dans les variables du module :
      // - pickupLat / pickupLng pour l'adresse de départ
      // - dropoffLat / dropoffLng pour l'adresse d'arrivée
      onSelectAddress(address, location, prediction.place_id);
      console.log('✅ [AddressAutocomplete] Coordinates stored successfully');
    } else {
      console.error('❌ [AddressAutocomplete] Failed to retrieve coordinates for selected address');
    }
  };

  const getPlaceIcon = (types: string[]) => {
    // Retourne l'icône appropriée selon le type de lieu
    
    // Établissements de santé
    if (types.includes('hospital')) return '🏥';
    if (types.includes('health')) return '⚕️';
    if (types.includes('doctor')) return '👨‍⚕️';
    if (types.includes('pharmacy')) return '💊';
    if (types.includes('dentist')) return '🦷';
    
    // Lieux de culte
    if (types.includes('mosque')) return '🕌';
    if (types.includes('church')) return '⛪';
    if (types.includes('hindu_temple')) return '🛕';
    if (types.includes('synagogue')) return '🕍';
    if (types.includes('place_of_worship')) return '🙏';
    
    // Établissements d'enseignement
    if (types.includes('university')) return '🎓';
    if (types.includes('school')) return '🏫';
    if (types.includes('secondary_school')) return '📚';
    if (types.includes('primary_school')) return '✏️';
    if (types.includes('library')) return '📖';
    
    // Commerces et marchés
    if (types.includes('shopping_mall')) return '🏬';
    if (types.includes('supermarket')) return '🛒';
    if (types.includes('market')) return '🏪';
    if (types.includes('store')) return '🏪';
    if (types.includes('convenience_store')) return '🏪';
    
    // Transport
    if (types.includes('bus_station')) return '🚌';
    if (types.includes('transit_station')) return '🚉';
    if (types.includes('train_station')) return '🚂';
    if (types.includes('airport')) return '✈️';
    if (types.includes('taxi_stand')) return '🚕';
    
    // Gouvernement et administration
    if (types.includes('local_government_office')) return '🏛️';
    if (types.includes('city_hall')) return '🏛️';
    if (types.includes('courthouse')) return '⚖️';
    if (types.includes('embassy')) return '🏢';
    if (types.includes('post_office')) return '📮';
    if (types.includes('police')) return '👮';
    if (types.includes('fire_station')) return '🚒';
    
    // Loisirs et culture
    if (types.includes('park')) return '🌳';
    if (types.includes('stadium')) return '🏟️';
    if (types.includes('museum')) return '🏛️';
    if (types.includes('art_gallery')) return '🖼️';
    if (types.includes('movie_theater')) return '🎬';
    if (types.includes('night_club')) return '🎉';
    
    // Restauration
    if (types.includes('restaurant')) return '🍽️';
    if (types.includes('cafe')) return '☕';
    if (types.includes('bar')) return '🍺';
    if (types.includes('bakery')) return '🥖';
    
    // Hébergement
    if (types.includes('lodging')) return '🏨';
    if (types.includes('hotel')) return '🏨';
    
    // Finances
    if (types.includes('bank')) return '🏦';
    if (types.includes('atm')) return '💳';
    
    // Industrie et entreprises
    if (types.includes('factory')) return '🏭';
    if (types.includes('industrial')) return '🏭';
    
    // Zones géographiques
    if (types.includes('locality')) return '🏘️';
    if (types.includes('sublocality')) return '🏘️';
    if (types.includes('neighborhood')) return '🏘️';
    if (types.includes('administrative_area_level_1')) return '🗺️';
    if (types.includes('administrative_area_level_2')) return '🗺️';
    
    // Rues et routes
    if (types.includes('route')) return '🛣️';
    if (types.includes('street_address')) return '🏠';
    if (types.includes('intersection')) return '🚦';
    if (types.includes('premise')) return '🏠';
    
    // Points d'intérêt
    if (types.includes('point_of_interest')) return '📍';
    if (types.includes('establishment')) return '🏢';
    
    // Icône par défaut
    return '📍';
  };

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
          <Text style={[styles.errorText, { color: '#FF0000' }]}>
            {apiError}
          </Text>
        </View>
      )}

      {/* Platform Debug Info (only on non-web platforms) */}
      {Platform.OS !== 'web' && __DEV__ && (
        <View style={[styles.debugContainer, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.debugText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            🔧 Debug: Platform = {Platform.OS}
          </Text>
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
          <ScrollView
            style={styles.predictionsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            {predictions.map((item) => (
              <TouchableOpacity
                key={item.place_id}
                style={[
                  styles.predictionItem,
                  { backgroundColor: isDark ? colors.darkCard : colors.card },
                ]}
                onPress={() => handleSelectPrediction(item)}
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
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 1,
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
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  debugContainer: {
    marginTop: 4,
    padding: 8,
    borderRadius: 6,
  },
  debugText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  predictionsContainer: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 12,
    maxHeight: 250,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  predictionsList: {
    flex: 1,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  placeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  predictionTextContainer: {
    flex: 1,
  },
  mainText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  secondaryText: {
    fontSize: 13,
  },
});
