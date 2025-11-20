
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/config/supabase';

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
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    if (value.length >= 2) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setDebugInfo('');
    }
  }, [value]);

  const fetchSuggestions = async (input: string) => {
    setIsLoading(true);
    setDebugInfo('');
    
    try {
      console.log('🔍 [CityAutocomplete] Fetching city suggestions for:', input);
      console.log('📱 [CityAutocomplete] Platform:', Platform.OS);

      // Update debug info for mobile
      if (Platform.OS !== 'web') {
        setDebugInfo(`Platform: ${Platform.OS}\nInput: "${input}"\nCalling API...`);
      }

      const startTime = Date.now();
      
      // Use city_autocomplete action for Covoiturage module
      // This ensures we only get cities in Senegal
      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: {
          action: 'city_autocomplete',
          input: input,
        },
        headers: {
          'x-platform': Platform.OS,
        },
      });

      const responseTime = Date.now() - startTime;
      console.log(`⏱️ [CityAutocomplete] Response time: ${responseTime}ms`);

      if (error) {
        console.error('❌ [CityAutocomplete] Error fetching city suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
        
        // Update debug info
        if (Platform.OS !== 'web') {
          setDebugInfo(`Platform: ${Platform.OS}\nError: ${error.message}\nTime: ${responseTime}ms`);
          
          Alert.alert(
            'Erreur',
            `Impossible de récupérer les suggestions de villes.\n\nPlateforme: ${Platform.OS}\nDétails: ${error.message}`,
            [{ text: 'OK' }]
          );
        }
        return;
      }

      if (data.status === 'OK' && data.predictions) {
        console.log(`✅ [CityAutocomplete] Found ${data.predictions.length} city suggestions`);
        setSuggestions(data.predictions);
        setShowSuggestions(true);
        
        // Update debug info
        if (Platform.OS !== 'web') {
          setDebugInfo(
            `Platform: ${Platform.OS}\n` +
            `Status: ${data.status}\n` +
            `Time: ${responseTime}ms\n` +
            `Cities: ${data.predictions.length}`
          );
        }
      } else {
        console.log('⚠️ [CityAutocomplete] No city suggestions found:', data.status);
        setSuggestions([]);
        setShowSuggestions(false);
        
        // Update debug info
        if (Platform.OS !== 'web') {
          setDebugInfo(
            `Platform: ${Platform.OS}\n` +
            `Status: ${data.status}\n` +
            `Time: ${responseTime}ms\n` +
            `Cities: 0`
          );
        }
      }
    } catch (error) {
      console.error('❌ [CityAutocomplete] Exception:', error);
      setSuggestions([]);
      setShowSuggestions(false);
      
      // Update debug info
      if (Platform.OS !== 'web') {
        setDebugInfo(`Platform: ${Platform.OS}\nException: ${error.message}`);
        
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

  const fetchPlaceDetails = async (placeId: string, cityName: string) => {
    try {
      console.log('🔍 [CityAutocomplete] Fetching place details for:', placeId);

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
        console.error('❌ [CityAutocomplete] Error fetching place details:', error);
        onSelectCity(cityName, placeId, 0, 0);
        
        if (Platform.OS !== 'web') {
          Alert.alert(
            'Erreur',
            `Impossible de récupérer les coordonnées de la ville.\n\n${error.message}`,
            [{ text: 'OK' }]
          );
        }
        return;
      }

      if (data.status === 'OK' && data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        console.log('✅ [CityAutocomplete] Place coordinates:', { lat, lng });
        onSelectCity(cityName, placeId, lat, lng);
      } else {
        console.error('❌ [CityAutocomplete] Error fetching place details:', data.status);
        onSelectCity(cityName, placeId, 0, 0);
      }
    } catch (error) {
      console.error('❌ [CityAutocomplete] Exception in fetchPlaceDetails:', error);
      onSelectCity(cityName, placeId, 0, 0);
      
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Erreur',
          `Une erreur est survenue:\n\n${error.message}`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleSelectSuggestion = (prediction: PlacePrediction) => {
    const cityName = prediction.structured_formatting.main_text;
    onChangeText(cityName);
    setShowSuggestions(false);
    setSuggestions([]);
    setDebugInfo('');
    fetchPlaceDetails(prediction.place_id, cityName);
  };

  const renderSuggestionItem = ({ item }: { item: PlacePrediction }) => (
    <TouchableOpacity
      style={[
        styles.suggestionItem,
        { 
          borderBottomColor: isDark ? colors.darkBorder : colors.border,
          backgroundColor: isDark ? colors.darkCard : colors.card,
        },
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
  );

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

      {/* Suggestions List - FIXED FOR ANDROID VISIBILITY */}
      {showSuggestions && suggestions.length > 0 && (
        <View
          style={[
            styles.suggestionsContainer,
            {
              backgroundColor: isDark ? colors.darkCard : colors.card,
              borderColor: isDark ? colors.darkBorder : colors.border,
            },
          ]}
        >
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={renderSuggestionItem}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            style={styles.suggestionsList}
            contentContainerStyle={styles.suggestionsListContent}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    zIndex: 1000,
    position: 'relative',
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
  suggestionsContainer: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    // FIXED: Explicit height for Android FlatList rendering
    height: 250,
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
  suggestionsList: {
    flex: 1,
    borderRadius: 12,
  },
  suggestionsListContent: {
    flexGrow: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionMainText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionSecondaryText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
