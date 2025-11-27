
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { searchDestinations } from '@/utils/senegalRegions';
import { IconSymbol } from '@/components/IconSymbol';

interface Destination {
  name: string;
  type: 'region' | 'department' | 'special';
  region?: string;
  price: number;
}

interface DestinationAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectDestination: (destination: Destination) => void;
  placeholder: string;
  label: string;
}

export default function DestinationAutocomplete({
  value,
  onChangeText,
  onSelectDestination,
  placeholder,
  label,
}: DestinationAutocompleteProps) {
  const theme = useTheme();
  const isDark = theme.dark;
  const [suggestions, setSuggestions] = useState<Destination[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    console.log('[DestinationAutocomplete iOS] Value changed:', value);
    if (value.length > 0) {
      const results = searchDestinations(value);
      console.log('[DestinationAutocomplete iOS] Search results:', results.length);
      setSuggestions(results);
      setShowSuggestions(results.length > 0 && isFocused);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value, isFocused]);

  const handleSelectDestination = (destination: Destination) => {
    console.log('[DestinationAutocomplete iOS] Selected:', destination.name);
    onChangeText(destination.name);
    onSelectDestination(destination);
    setShowSuggestions(false);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const handleFocus = () => {
    console.log('[DestinationAutocomplete iOS] Input focused');
    setIsFocused(true);
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    console.log('[DestinationAutocomplete iOS] Input blurred');
    // Delay hiding suggestions to allow tap to register
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'region':
        return 'Région';
      case 'department':
        return 'Département';
      case 'special':
        return 'Ville';
      default:
        return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'region':
        return '🗺️';
      case 'department':
        return '📍';
      case 'special':
        return '🕌';
      default:
        return '📍';
    }
  };

  const renderSuggestion = ({ item, index }: { item: Destination; index: number }) => (
    <TouchableOpacity
      key={`${item.name}-${index}`}
      style={[
        styles.suggestionItem,
        { 
          backgroundColor: isDark ? colors.darkCard : colors.card,
          borderBottomColor: isDark ? colors.darkBorder : colors.border,
        },
      ]}
      onPress={() => handleSelectDestination(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
      <View style={styles.suggestionContent}>
        <Text style={[styles.mainText, { color: isDark ? colors.darkText : colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.secondaryText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
          {getTypeLabel(item.type)}{item.region ? ` - ${item.region}` : ''}
        </Text>
      </View>
      <Text style={[styles.priceText, { color: colors.primary }]}>
        {item.price.toLocaleString()} FCFA
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
        {label}
      </Text>
      
      <View style={styles.inputWrapper}>
        <IconSymbol
          ios_icon_name="magnifyingglass"
          android_material_icon_name="search"
          size={20}
          color={isDark ? colors.darkTextSecondary : colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? colors.darkBackground : colors.background,
              color: isDark ? colors.darkText : colors.text,
              borderColor: isFocused ? colors.primary : (isDark ? colors.darkCard : colors.border),
              borderWidth: isFocused ? 2 : 1,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="words"
          autoCorrect={false}
          autoComplete="off"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Helper text */}
      {!showSuggestions && value.length === 0 && (
        <Text style={[styles.helperText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
          Tapez pour rechercher parmi 14 régions et 45 départements
        </Text>
      )}

      {/* No results message */}
      {!showSuggestions && value.length > 0 && suggestions.length === 0 && (
        <View style={[styles.noResultsContainer, { backgroundColor: isDark ? colors.darkCard : '#FFF8E1' }]}>
          <Text style={styles.noResultsIcon}>🔍</Text>
          <Text style={[styles.noResultsText, { color: isDark ? colors.darkText : colors.text }]}>
            Aucune région ou département trouvé pour &quot;{value}&quot;
          </Text>
        </View>
      )}

      {/* Suggestions List - iOS Optimized */}
      {showSuggestions && suggestions.length > 0 && (
        <View
          style={[
            styles.suggestionsContainer,
            {
              backgroundColor: isDark ? colors.darkBackground : colors.background,
              borderColor: isDark ? colors.darkCard : colors.border,
            },
          ]}
        >
          <View style={[styles.suggestionsHeader, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.suggestionsHeaderText, { color: isDark ? colors.darkText : colors.text }]}>
              {suggestions.length} résultat{suggestions.length > 1 ? 's' : ''} trouvé{suggestions.length > 1 ? 's' : ''}
            </Text>
          </View>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item, index) => `${item.name}-${item.type}-${index}`}
            style={styles.suggestionsList}
            contentContainerStyle={styles.suggestionsListContent}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={true}
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
            removeClippedSubviews={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
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
  inputWrapper: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: 17,
    zIndex: 1,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    paddingLeft: 44,
    fontSize: 16,
    borderWidth: 1,
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  noResultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  noResultsIcon: {
    fontSize: 20,
  },
  noResultsText: {
    flex: 1,
    fontSize: 13,
  },
  suggestionsContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    maxHeight: 300,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  suggestionsHeader: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionsHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionsListContent: {
    flexGrow: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
    borderBottomWidth: 1,
    minHeight: 70,
  },
  typeIcon: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  mainText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  secondaryText: {
    fontSize: 13,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
});
