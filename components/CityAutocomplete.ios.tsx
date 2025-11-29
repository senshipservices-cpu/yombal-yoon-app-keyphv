
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
  Keyboard,
  Dimensions,
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
  error?: string;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function CityAutocomplete({
  value,
  onChangeText,
  onSelectCity,
  placeholder = 'Ex: Dakar',
  label = 'Ville',
  error,
}: CityAutocompleteProps) {
  const theme = useTheme();
  const isDark = theme.dark;

  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSelectedFromAutocomplete, setHasSelectedFromAutocomplete] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputLayout, setInputLayout] = useState({ y: 0, height: 0 });
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<View>(null);

  // Listen to keyboard events
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', (e) => {
      console.log('[CityAutocomplete iOS] Keyboard will show:', e.endCoordinates.height);
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', () => {
      console.log('[CityAutocomplete iOS] Keyboard will hide');
      setKeyboardHeight(0);
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    if (value.length >= 2 && !hasSelectedFromAutocomplete) {
      fetchSuggestions(value);
    } else if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value, hasSelectedFromAutocomplete]);

  const fetchSuggestions = async (input: string) => {
    setIsLoading(true);
    
    try {
      console.log('🔍 [CityAutocomplete iOS] Fetching city suggestions for:', input);

      const startTime = Date.now();
      
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
      console.log(`⏱️ [CityAutocomplete iOS] Response time: ${responseTime}ms`);

      if (error) {
        console.error('❌ [CityAutocomplete iOS] Error fetching city suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      if (data.status === 'OK' && data.predictions) {
        console.log(`✅ [CityAutocomplete iOS] Found ${data.predictions.length} city suggestions`);
        setSuggestions(data.predictions);
        setShowSuggestions(true);
      } else {
        console.log('⚠️ [CityAutocomplete iOS] No city suggestions found:', data.status);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('❌ [CityAutocomplete iOS] Exception:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlaceDetails = async (placeId: string, cityName: string) => {
    try {
      console.log('🔍 [CityAutocomplete iOS] Fetching place details for:', placeId);

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
        console.error('❌ [CityAutocomplete iOS] Error fetching place details:', error);
        onSelectCity(cityName, placeId, 0, 0);
        return;
      }

      if (data.status === 'OK' && data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        console.log('✅ [CityAutocomplete iOS] Place coordinates:', { lat, lng });
        onSelectCity(cityName, placeId, lat, lng);
      } else {
        console.error('❌ [CityAutocomplete iOS] Error fetching place details:', data.status);
        onSelectCity(cityName, placeId, 0, 0);
      }
    } catch (error) {
      console.error('❌ [CityAutocomplete iOS] Exception in fetchPlaceDetails:', error);
      onSelectCity(cityName, placeId, 0, 0);
    }
  };

  const handleSelectSuggestion = (prediction: PlacePrediction) => {
    console.log('[CityAutocomplete iOS] Selected:', prediction.structured_formatting.main_text);
    
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    const cityName = prediction.structured_formatting.main_text;
    onChangeText(cityName);
    setShowSuggestions(false);
    setSuggestions([]);
    setHasSelectedFromAutocomplete(true);
    
    // Dismiss keyboard
    Keyboard.dismiss();
    
    fetchPlaceDetails(prediction.place_id, cityName);
  };

  const handleTextChange = (text: string) => {
    setHasSelectedFromAutocomplete(false);
    onChangeText(text);
  };

  const handleFocus = () => {
    console.log('[CityAutocomplete iOS] Input focused');
    
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    // Measure input position
    if (containerRef.current) {
      containerRef.current.measureInWindow((x, y, width, height) => {
        console.log('[CityAutocomplete iOS] Input position:', { y, height });
        setInputLayout({ y, height });
      });
    }
  };

  const handleBlur = () => {
    console.log('[CityAutocomplete iOS] Input blurred');
    
    // Delay hiding suggestions to allow tap to register
    hideTimeoutRef.current = setTimeout(() => {
      setShowSuggestions(false);
    }, 300);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Calculate if suggestions should appear above or below input
  const spaceBelow = SCREEN_HEIGHT - inputLayout.y - inputLayout.height - keyboardHeight;
  const showAbove = spaceBelow < 200 && keyboardHeight > 0;
  
  // Calculate max height for suggestions list
  const maxSuggestionsHeight = showAbove 
    ? Math.min(inputLayout.y - 100, 250) // Space above input
    : Math.min(spaceBelow - 20, 250); // Space below input

  console.log('[CityAutocomplete iOS] Layout:', {
    inputY: inputLayout.y,
    keyboardHeight,
    spaceBelow,
    showAbove,
    maxHeight: maxSuggestionsHeight,
  });

  return (
    <View style={styles.container} ref={containerRef}>
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
              borderColor: error ? colors.error : colors.border,
              borderWidth: error ? 2 : 1,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="words"
          autoCorrect={false}
        />
        
        {isLoading && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
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

      {/* Suggestions List - Positioned to avoid keyboard */}
      {showSuggestions && suggestions.length > 0 && (
        <View
          style={[
            styles.suggestionsContainer,
            {
              backgroundColor: isDark ? colors.darkCard : colors.card,
              borderColor: isDark ? colors.darkBorder : colors.border,
              maxHeight: maxSuggestionsHeight,
              [showAbove ? 'bottom' : 'top']: showAbove ? inputLayout.height + 8 : 56,
            },
          ]}
        >
          <ScrollView
            style={styles.suggestionsList}
            contentContainerStyle={styles.suggestionsListContent}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={true}
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
            bounces={false}
          >
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.place_id}
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
            ))}
          </ScrollView>
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
  validationErrorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 8,
    marginTop: 2,
  },
  validationErrorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  suggestionsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 2000,
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
