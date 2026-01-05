
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { supabase } from '@/config/supabase';
import { IconSymbol } from './IconSymbol';

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

interface MeetingPointAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectAddress: (address: string, location: Location, placeId: string) => void;
  placeholder: string;
  label: string;
  error?: string;
}

// Types de lieux publics importants pour le point de rencontre
const MEETING_POINT_TYPES = [
  'hospital',           // Hôpitaux
  'health',            // Centres de santé
  'mosque',            // Mosquées
  'church',            // Églises
  'place_of_worship',  // Lieux de culte
  'university',        // Universités
  'school',            // Écoles
  'town_hall',         // Mairies
  'local_government_office', // Administrations
  'post_office',       // Postes
  'police',            // Commissariats
  'fire_station',      // Casernes
  'bus_station',       // Gares routières
  'transit_station',   // Stations de transport
  'park',              // Parcs
  'stadium',           // Stades
  'shopping_mall',     // Centres commerciaux
  'supermarket',       // Supermarchés
  'market',            // Marchés
  'gas_station',       // Stations-service
  'bank',              // Banques
  'atm',               // Distributeurs
  'pharmacy',          // Pharmacies
  'restaurant',        // Restaurants
  'cafe',              // Cafés
  'hotel',             // Hôtels
  'airport',           // Aéroports
  'train_station',     // Gares ferroviaires
  'subway_station',    // Stations de métro
  'establishment',     // Établissements
  'point_of_interest', // Points d'intérêt
  'premise',           // Locaux
  'sublocality',       // Quartiers
  'locality',          // Localités
  'administrative_area_level_3', // Communes
  'neighborhood',      // Quartiers
  'route',             // Routes
  'intersection',      // Carrefours/Ronds-points
];

const MeetingPointAutocomplete: React.FC<MeetingPointAutocompleteProps> = ({
  value,
  onChangeText,
  onSelectAddress,
  placeholder,
  label,
  error,
}) => {
  const { colors: themeColors } = useTheme();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [hasSelectedFromAutocomplete, setHasSelectedFromAutocomplete] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value && !hasSelectedFromAutocomplete) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        fetchPredictions(value);
      }, 300);
    } else if (!value) {
      setPredictions([]);
      setShowPredictions(false);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value, hasSelectedFromAutocomplete]);

  const fetchPredictions = async (input: string) => {
    if (input.length < 2) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-places-autocomplete', {
        body: {
          input,
          types: MEETING_POINT_TYPES.join('|'),
          components: 'country:sn', // Limiter au Sénégal
          language: 'fr',
        },
      });

      if (error) throw error;

      if (data?.predictions) {
        setPredictions(data.predictions);
        setShowPredictions(true);
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceDetails = async (placeId: string): Promise<Location | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('google-places-details', {
        body: { place_id: placeId },
      });

      if (error) throw error;

      if (data?.result?.geometry?.location) {
        return {
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
        };
      }
    } catch (err) {
      console.error('Error fetching place details:', err);
    }
    return null;
  };

  const handleSelectPrediction = async (prediction: Prediction) => {
    setHasSelectedFromAutocomplete(true);
    onChangeText(prediction.description);
    setShowPredictions(false);
    setPredictions([]);

    const location = await getPlaceDetails(prediction.place_id);
    if (location) {
      onSelectAddress(prediction.description, location, prediction.place_id);
    }

    setTimeout(() => {
      setHasSelectedFromAutocomplete(false);
    }, 500);
  };

  const handleTextChange = (text: string) => {
    setHasSelectedFromAutocomplete(false);
    onChangeText(text);
  };

  const getPlaceIcon = (types: string[]): string => {
    if (types.includes('hospital') || types.includes('health')) return 'cross.case.fill';
    if (types.includes('mosque') || types.includes('place_of_worship')) return 'building.columns.fill';
    if (types.includes('university') || types.includes('school')) return 'graduationcap.fill';
    if (types.includes('town_hall') || types.includes('local_government_office')) return 'building.2.fill';
    if (types.includes('bus_station') || types.includes('transit_station')) return 'bus.fill';
    if (types.includes('market') || types.includes('shopping_mall')) return 'cart.fill';
    if (types.includes('park') || types.includes('stadium')) return 'sportscourt.fill';
    if (types.includes('gas_station')) return 'fuelpump.fill';
    if (types.includes('bank') || types.includes('atm')) return 'banknote.fill';
    if (types.includes('pharmacy')) return 'pills.fill';
    if (types.includes('restaurant') || types.includes('cafe')) return 'fork.knife';
    if (types.includes('hotel')) return 'bed.double.fill';
    if (types.includes('airport')) return 'airplane';
    if (types.includes('police')) return 'shield.fill';
    if (types.includes('post_office')) return 'envelope.fill';
    if (types.includes('intersection')) return 'arrow.triangle.swap';
    if (types.includes('neighborhood') || types.includes('sublocality')) return 'house.fill';
    return 'mappin.circle.fill';
  };

  const renderPredictionItem = ({ item }: { item: Prediction }) => (
    <TouchableOpacity
      style={styles.predictionItem}
      onPress={() => handleSelectPrediction(item)}
    >
      <IconSymbol
        name={getPlaceIcon(item.types)}
        size={20}
        color={colors.primary}
        style={styles.predictionIcon}
      />
      <View style={styles.predictionTextContainer}>
        <Text style={styles.predictionMainText}>{item.structured_formatting.main_text}</Text>
        <Text style={styles.predictionSecondaryText}>
          {item.structured_formatting.secondary_text}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <IconSymbol name="mappin.circle.fill" size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#999"
        />
        {isLoading && <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {showPredictions && predictions.length > 0 && (
        <View style={styles.predictionsContainer}>
          <FlatList
            data={predictions}
            renderItem={renderPredictionItem}
            keyExtractor={(item) => item.place_id}
            style={styles.predictionsList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: colors.danger,
  },
  loader: {
    marginLeft: 8,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  predictionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#ddd',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  predictionsList: {
    maxHeight: 300,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  predictionIcon: {
    marginRight: 12,
  },
  predictionTextContainer: {
    flex: 1,
  },
  predictionMainText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  predictionSecondaryText: {
    fontSize: 13,
    color: '#666',
  },
});

export default MeetingPointAutocomplete;
