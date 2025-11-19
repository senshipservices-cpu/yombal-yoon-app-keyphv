
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Constants from 'expo-constants';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface CityAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectCity: (city: string, placeId: string, lat: number, lng: number) => void;
  placeholder?: string;
  label?: string;
}

export default function CityAutocomplete({
  value,
  onChangeText,
  onSelectCity,
  placeholder = 'Ex: Dakar',
  label = 'Ville',
}: CityAutocompleteProps) {
  const theme = useTheme();
  const isDark = theme.dark;

  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (value.length >= 2) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  const fetchSuggestions = async (input: string) => {
    setIsLoading(true);
    try {
      const apiKey = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.error('Google Maps API key not found');
        return;
      }

      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&types=(cities)&language=fr&components=country:sn&key=${apiKey}`;

      console.log('Fetching city suggestions for:', input);

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        console.log('City suggestions received:', data.predictions.length);
        setSuggestions(data.predictions);
        setShowSuggestions(true);
      } else {
        console.log('No city suggestions found:', data.status);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlaceDetails = async (placeId: string, cityName: string) => {
    try {
      const apiKey = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.error('Google Maps API key not found');
        return;
      }

      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${apiKey}`;

      console.log('Fetching place details for:', placeId);

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        console.log('Place coordinates:', { lat, lng });
        onSelectCity(cityName, placeId, lat, lng);
      } else {
        console.error('Error fetching place details:', data.status);
        onSelectCity(cityName, placeId, 0, 0);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      onSelectCity(cityName, placeId, 0, 0);
    }
  };

  const handleSelectSuggestion = (prediction: PlacePrediction) => {
    const cityName = prediction.structured_formatting.main_text;
    onChangeText(cityName);
    setShowSuggestions(false);
    setSuggestions([]);
    fetchPlaceDetails(prediction.place_id, cityName);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: isDark ? colors.darkText : colors.text }]}>
          {label} *
        </Text>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? colors.darkCard : colors.card,
              color: isDark ? colors.darkText : colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="words"
          autoCorrect={false}
        />
        
        {isLoading && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View
          style={[
            styles.suggestionsContainer,
            {
              backgroundColor: isDark ? colors.darkCard : colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.suggestionItem,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => handleSelectSuggestion(item)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="mappin.circle.fill"
                  android_material_icon_name="place"
                  size={20}
                  color={colors.primary}
                />
                <View style={styles.suggestionTextContainer}>
                  <Text
                    style={[
                      styles.suggestionMainText,
                      { color: isDark ? colors.darkText : colors.text },
                    ]}
                  >
                    {item.structured_formatting.main_text}
                  </Text>
                  {item.structured_formatting.secondary_text && (
                    <Text
                      style={[
                        styles.suggestionSecondaryText,
                        { color: isDark ? colors.darkTextSecondary : colors.textSecondary },
                      ]}
                    >
                      {item.structured_formatting.secondary_text}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
            nestedScrollEnabled={true}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  suggestionsContainer: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionMainText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionSecondaryText: {
    fontSize: 13,
  },
});
