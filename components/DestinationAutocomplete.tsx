
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Keyboard,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { searchDestinations } from '@/utils/senegalRegions';

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

  useEffect(() => {
    if (value.length > 0) {
      const results = searchDestinations(value);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  const handleSelectDestination = (destination: Destination) => {
    onChangeText(destination.name);
    onSelectDestination(destination);
    setShowSuggestions(false);
    setSuggestions([]);
    Keyboard.dismiss();
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

  const renderSuggestion = ({ item }: { item: Destination }) => (
    <TouchableOpacity
      style={[
        styles.suggestionItem,
        { backgroundColor: isDark ? colors.darkCard : colors.card },
      ]}
      onPress={() => handleSelectDestination(item)}
    >
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
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
      />

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
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            style={styles.suggestionsList}
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
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  suggestionsContainer: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 12,
    maxHeight: 250,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionContent: {
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
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
});
