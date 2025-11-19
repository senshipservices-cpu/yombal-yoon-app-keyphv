
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Keyboard,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface Location {
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectAddress: (address: string, location: Location) => void;
  placeholder: string;
  label: string;
  apiKey: string;
}

export default function AddressAutocomplete({
  value,
  onChangeText,
  onSelectAddress,
  placeholder,
  label,
  apiKey,
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
    if (!apiKey) {
      console.warn('Google Maps API key not provided');
      return;
    }

    setIsLoading(true);
    try {
      // Dakar coordinates for location bias
      const dakarLat = 14.6937;
      const dakarLng = -17.4441;
      const radius = 45000; // 45km radius

      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&location=${dakarLat},${dakarLng}&radius=${radius}&components=country:sn&language=fr&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        setPredictions(data.predictions);
        setShowPredictions(true);
      } else {
        console.log('Autocomplete API response:', data.status);
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceDetails = async (placeId: string) => {
    if (!apiKey) {
      console.warn('Google Maps API key not provided');
      return null;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result?.geometry?.location) {
        return {
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  };

  const handleSelectPrediction = async (prediction: Prediction) => {
    const address = prediction.description;
    onChangeText(address);
    setShowPredictions(false);
    setPredictions([]);
    Keyboard.dismiss();

    // Fetch coordinates for the selected place
    const location = await getPlaceDetails(prediction.place_id);
    if (location) {
      onSelectAddress(address, location);
    }
  };

  const renderPrediction = ({ item }: { item: Prediction }) => (
    <TouchableOpacity
      style={[
        styles.predictionItem,
        { backgroundColor: isDark ? colors.darkCard : colors.card },
      ]}
      onPress={() => handleSelectPrediction(item)}
    >
      <Text style={[styles.mainText, { color: isDark ? colors.darkText : colors.text }]}>
        {item.structured_formatting.main_text}
      </Text>
      <Text style={[styles.secondaryText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
        {item.structured_formatting.secondary_text}
      </Text>
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
    maxHeight: 200,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  predictionsList: {
    flex: 1,
  },
  predictionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
