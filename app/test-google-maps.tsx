
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { supabase } from '@/config/supabase';
import { Stack } from 'expo-router';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
  timestamp?: string;
}

export default function TestGoogleMaps() {
  const theme = useTheme();
  const isDark = theme.dark;
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: TestResult) => {
    setResults((prev) => [...prev, { ...result, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Vérifier la connexion à Supabase
    addResult({
      test: 'Connexion Supabase',
      status: 'pending',
      message: 'Vérification de la connexion...',
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      addResult({
        test: 'Connexion Supabase',
        status: 'success',
        message: 'Connexion établie',
        details: {
          hasSession: !!session,
          platform: Platform.OS,
        },
      });
    } catch (error) {
      addResult({
        test: 'Connexion Supabase',
        status: 'error',
        message: `Erreur: ${error.message}`,
      });
    }

    // Test 2: Tester l'Edge Function avec autocomplete
    addResult({
      test: 'Autocomplétion (Dakar)',
      status: 'pending',
      message: 'Appel de l\'Edge Function...',
    });

    try {
      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: {
          action: 'autocomplete',
          input: 'Dakar',
        },
        headers: {
          'x-platform': Platform.OS,
        },
      });
      const responseTime = Date.now() - startTime;

      if (error) {
        addResult({
          test: 'Autocomplétion (Dakar)',
          status: 'error',
          message: `Erreur Supabase: ${error.message}`,
          details: {
            error: error,
            responseTime: `${responseTime}ms`,
          },
        });
      } else if (data.status === 'OK') {
        addResult({
          test: 'Autocomplétion (Dakar)',
          status: 'success',
          message: `${data.predictions.length} résultats trouvés`,
          details: {
            status: data.status,
            predictions: data.predictions.slice(0, 3).map((p: any) => p.description),
            responseTime: `${responseTime}ms`,
            platform: Platform.OS,
          },
        });
      } else {
        addResult({
          test: 'Autocomplétion (Dakar)',
          status: 'error',
          message: `Erreur Google: ${data.status}`,
          details: {
            status: data.status,
            error_message: data.error_message,
            help: data.help,
            debug: data.debug,
            responseTime: `${responseTime}ms`,
          },
        });
      }
    } catch (error) {
      addResult({
        test: 'Autocomplétion (Dakar)',
        status: 'error',
        message: `Exception: ${error.message}`,
      });
    }

    // Test 3: Tester city_autocomplete
    addResult({
      test: 'Autocomplétion Ville (Thiès)',
      status: 'pending',
      message: 'Appel de l\'Edge Function...',
    });

    try {
      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: {
          action: 'city_autocomplete',
          input: 'Thiès',
        },
        headers: {
          'x-platform': Platform.OS,
        },
      });
      const responseTime = Date.now() - startTime;

      if (error) {
        addResult({
          test: 'Autocomplétion Ville (Thiès)',
          status: 'error',
          message: `Erreur Supabase: ${error.message}`,
          details: {
            error: error,
            responseTime: `${responseTime}ms`,
          },
        });
      } else if (data.status === 'OK') {
        addResult({
          test: 'Autocomplétion Ville (Thiès)',
          status: 'success',
          message: `${data.predictions.length} résultats trouvés`,
          details: {
            status: data.status,
            predictions: data.predictions.slice(0, 3).map((p: any) => p.description),
            responseTime: `${responseTime}ms`,
          },
        });
      } else {
        addResult({
          test: 'Autocomplétion Ville (Thiès)',
          status: 'error',
          message: `Erreur Google: ${data.status}`,
          details: {
            status: data.status,
            error_message: data.error_message,
            responseTime: `${responseTime}ms`,
          },
        });
      }
    } catch (error) {
      addResult({
        test: 'Autocomplétion Ville (Thiès)',
        status: 'error',
        message: `Exception: ${error.message}`,
      });
    }

    // Test 4: Tester place_details
    addResult({
      test: 'Détails du Lieu',
      status: 'pending',
      message: 'Récupération des détails...',
    });

    try {
      const startTime = Date.now();
      // Place ID de Dakar
      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: {
          action: 'place_details',
          placeId: 'ChIJDy7mYDQtpA4RIO-gPMgRGRQ',
        },
        headers: {
          'x-platform': Platform.OS,
        },
      });
      const responseTime = Date.now() - startTime;

      if (error) {
        addResult({
          test: 'Détails du Lieu',
          status: 'error',
          message: `Erreur Supabase: ${error.message}`,
          details: {
            error: error,
            responseTime: `${responseTime}ms`,
          },
        });
      } else if (data.status === 'OK') {
        addResult({
          test: 'Détails du Lieu',
          status: 'success',
          message: 'Coordonnées récupérées',
          details: {
            status: data.status,
            location: data.result?.geometry?.location,
            formatted_address: data.result?.formatted_address,
            responseTime: `${responseTime}ms`,
          },
        });
      } else {
        addResult({
          test: 'Détails du Lieu',
          status: 'error',
          message: `Erreur Google: ${data.status}`,
          details: {
            status: data.status,
            error_message: data.error_message,
            responseTime: `${responseTime}ms`,
          },
        });
      }
    } catch (error) {
      addResult({
        test: 'Détails du Lieu',
        status: 'error',
        message: `Exception: ${error.message}`,
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Test Google Maps API',
          headerStyle: {
            backgroundColor: isDark ? colors.darkCard : colors.card,
          },
          headerTintColor: isDark ? colors.darkText : colors.text,
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.headerTitle, { color: isDark ? colors.darkText : colors.text }]}>
            🔧 Test de Configuration
          </Text>
          <Text style={[styles.headerSubtitle, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            Vérification de l&apos;autocomplétion Google Maps
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.runButton,
            { backgroundColor: colors.primary },
            isRunning && styles.runButtonDisabled,
          ]}
          onPress={runTests}
          disabled={isRunning}
        >
          {isRunning ? (
            <React.Fragment>
              <ActivityIndicator size="small" color="#FFFFFF" style={styles.buttonLoader} />
              <Text style={styles.runButtonText}>Tests en cours...</Text>
            </React.Fragment>
          ) : (
            <Text style={styles.runButtonText}>▶️ Lancer les Tests</Text>
          )}
        </TouchableOpacity>

        {results.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsTitle, { color: isDark ? colors.darkText : colors.text }]}>
              📊 Résultats ({results.length} tests)
            </Text>

            {results.map((result, index) => (
              <View
                key={index}
                style={[
                  styles.resultCard,
                  { backgroundColor: isDark ? colors.darkCard : colors.card },
                ]}
              >
                <View style={styles.resultHeader}>
                  <Text style={styles.resultIcon}>{getStatusIcon(result.status)}</Text>
                  <Text style={[styles.resultTest, { color: isDark ? colors.darkText : colors.text }]}>
                    {result.test}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.resultMessage,
                    { color: getStatusColor(result.status) },
                  ]}
                >
                  {result.message}
                </Text>

                {result.details && (
                  <View style={[styles.detailsContainer, { backgroundColor: isDark ? colors.darkBackground : '#F5F5F5' }]}>
                    <Text style={[styles.detailsTitle, { color: isDark ? colors.darkText : colors.text }]}>
                      Détails:
                    </Text>
                    <Text style={[styles.detailsText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      {JSON.stringify(result.details, null, 2)}
                    </Text>
                  </View>
                )}

                {result.timestamp && (
                  <Text style={[styles.timestamp, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    {new Date(result.timestamp).toLocaleTimeString('fr-FR')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {results.length === 0 && !isRunning && (
          <View style={[styles.emptyState, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={styles.emptyIcon}>🧪</Text>
            <Text style={[styles.emptyTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Aucun test lancé
            </Text>
            <Text style={[styles.emptyText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Cliquez sur &quot;Lancer les Tests&quot; pour vérifier la configuration de Google Maps API
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  runButtonDisabled: {
    opacity: 0.6,
  },
  buttonLoader: {
    marginRight: 8,
  },
  runButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  resultTest: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  resultMessage: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  detailsContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  detailsText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
