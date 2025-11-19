
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
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
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value]);

  const fetchPredictions = async (input: string) => {
    setIsLoading(true);
    try {
      console.log('🔍 Fetching address predictions for:', input);

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
      });

      if (error) {
        console.error('❌ Error fetching address predictions:', error);
        setPredictions([]);
        setShowPredictions(false);
        return;
      }

      if (data.status === 'OK' && data.predictions) {
        console.log(`✅ Found ${data.predictions.length} predictions`);
        
        // Log des types de lieux trouvés pour débogage
        const placeTypes = data.predictions.slice(0, 5).map((p: Prediction) => ({
          name: p.structured_formatting.main_text,
          types: p.types
        }));
        console.log('📍 Place types found:', placeTypes);
        
        setPredictions(data.predictions);
        setShowPredictions(true);
      } else if (data.status === 'ZERO_RESULTS') {
        console.log('⚠️ No predictions found');
        setPredictions([]);
        setShowPredictions(false);
      } else {
        console.log('⚠️ Autocomplete API response status:', data.status);
        if (data.error_message) {
          console.error('API Error:', data.error_message);
        }
        setPredictions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching address predictions:', error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceDetails = async (placeId: string): Promise<Location | null> => {
    try {
      console.log('🔍 Fetching place details for place_id:', placeId);

      // RÉCUPÉRATION LAT/LNG (Google Places Details API)
      // =================================================
      // Récupère la géométrie (latitude et longitude) du lieu sélectionné
      
      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: {
          action: 'place_details',
          placeId: placeId,
        },
      });

      if (error) {
        console.error('❌ Error fetching place details:', error);
        return null;
      }

      if (data.status === 'OK' && data.result?.geometry?.location) {
        const location = {
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
        };
        console.log('✅ Retrieved coordinates:', location);
        console.log('📍 Place name:', data.result.name);
        console.log('🏷️ Place types:', data.result.types);
        return location;
      } else {
        console.error('❌ Place Details API error:', data.status);
        if (data.error_message) {
          console.error('API Error:', data.error_message);
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching place details:', error);
      return null;
    }
  };

  const handleSelectPrediction = async (prediction: Prediction) => {
    const address = prediction.description;
    onChangeText(address);
    setShowPredictions(false);
    setPredictions([]);
    Keyboard.dismiss();

    console.log('✅ Selected address:', address);
    console.log('🆔 Place ID:', prediction.place_id);
    console.log('🏷️ Place types:', prediction.types);

    // RÉCUPÉRATION DES COORDONNÉES DU LIEU SÉLECTIONNÉ
    // Appel Place Details pour obtenir lat/lng
    const location = await getPlaceDetails(prediction.place_id);
    if (location) {
      // Stockage dans les variables du module :
      // - pickupLat / pickupLng pour l'adresse de départ
      // - dropoffLat / dropoffLng pour l'adresse d'arrivée
      onSelectAddress(address, location, prediction.place_id);
      console.log('✅ Coordinates stored successfully');
    } else {
      console.error('❌ Failed to retrieve coordinates for selected address');
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

  const renderPrediction = ({ item }: { item: Prediction }) => (
    <TouchableOpacity
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
              borderColor: isDark ? colors.darkCard : colors.border,
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
            renderItem={renderPrediction}
            keyExtractor={(item) => item.place_id}
            style={styles.predictionsList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          />
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
  predictionsContainer: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 12,
    maxHeight: 300,
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
