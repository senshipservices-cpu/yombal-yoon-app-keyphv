
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { YYScreenContainer, YYCard, YYButton, YYBadge, YYChip } from '@/components/YY';
import { YYColors, YYTypography, YYSpacing } from '@/styles/theme';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/config/supabase';
import Constants from 'expo-constants';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  details?: string;
}

interface TestCategory {
  title: string;
  tests: TestResult[];
}

export default function TestPlatformConsistency() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<TestCategory[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  useEffect(() => {
    runAllTests();
  }, []);

  const runAllTests = async () => {
    setIsRunning(true);
    const results: TestCategory[] = [];

    // 1. Design System Tests
    results.push(await testDesignSystem());

    // 2. API Keys Tests
    results.push(await testAPIKeys());

    // 3. Backend Synchronization Tests
    results.push(await testBackendSync());

    // 4. Build Configuration Tests
    results.push(await testBuildConfig());

    setTestResults(results);
    setIsRunning(false);
  };

  const testDesignSystem = async (): Promise<TestCategory> => {
    setCurrentTest('Testing Design System...');
    const tests: TestResult[] = [];

    // Test 1: Colors
    tests.push({
      name: 'Brand Colors',
      status: YYColors.primary === '#008000' && 
              YYColors.secondary === '#FFFF00' && 
              YYColors.accent === '#FF0000' ? 'pass' : 'fail',
      message: YYColors.primary === '#008000' ? 
        'Brand colors are correctly configured' : 
        'Brand colors mismatch',
      details: `Primary: ${YYColors.primary}, Secondary: ${YYColors.secondary}, Accent: ${YYColors.accent}`,
    });

    // Test 2: Typography
    tests.push({
      name: 'Typography System',
      status: YYTypography.h1 && YYTypography.bodyMedium ? 'pass' : 'fail',
      message: YYTypography.h1 ? 
        'Typography system is configured' : 
        'Typography system missing',
      details: `H1 size: ${YYTypography.h1.fontSize}, Body size: ${YYTypography.bodyMedium.fontSize}`,
    });

    // Test 3: Spacing
    tests.push({
      name: 'Spacing System',
      status: YYSpacing.md === 16 && YYSpacing.lg === 24 ? 'pass' : 'fail',
      message: YYSpacing.md === 16 ? 
        'Spacing system is consistent' : 
        'Spacing system mismatch',
      details: `MD: ${YYSpacing.md}px, LG: ${YYSpacing.lg}px`,
    });

    // Test 4: Platform Detection
    tests.push({
      name: 'Platform Detection',
      status: 'pass',
      message: `Running on ${Platform.OS}`,
      details: `Version: ${Platform.Version}, OS: ${Platform.OS}`,
    });

    return {
      title: '🎨 Design System',
      tests,
    };
  };

  const testAPIKeys = async (): Promise<TestCategory> => {
    setCurrentTest('Testing API Keys...');
    const tests: TestResult[] = [];

    // Test 1: Google Maps API Key
    const googleMapsKey = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;
    tests.push({
      name: 'Google Maps API Key',
      status: googleMapsKey ? 'pass' : 'fail',
      message: googleMapsKey ? 
        'Google Maps API Key is configured' : 
        'Google Maps API Key is missing',
      details: googleMapsKey ? 
        `Key: ${googleMapsKey.substring(0, 10)}...` : 
        'No key found',
    });

    // Test 2: Google Maps Autocomplete
    try {
      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: {
          action: 'autocomplete',
          input: 'Dakar',
        },
        headers: {
          'x-platform': Platform.OS,
        },
      });

      if (error) {
        tests.push({
          name: 'Google Maps Autocomplete',
          status: 'fail',
          message: 'Autocomplete test failed',
          details: error.message,
        });
      } else if (data.status === 'OK') {
        tests.push({
          name: 'Google Maps Autocomplete',
          status: 'pass',
          message: `Autocomplete working (${data.predictions?.length || 0} results)`,
          details: `Platform: ${Platform.OS}, Status: ${data.status}`,
        });
      } else {
        tests.push({
          name: 'Google Maps Autocomplete',
          status: 'warning',
          message: `Autocomplete returned: ${data.status}`,
          details: data.error_message || 'No error message',
        });
      }
    } catch (error) {
      tests.push({
        name: 'Google Maps Autocomplete',
        status: 'fail',
        message: 'Autocomplete test exception',
        details: error.message,
      });
    }

    return {
      title: '🗄 API Keys & Services',
      tests,
    };
  };

  const testBackendSync = async (): Promise<TestCategory> => {
    setCurrentTest('Testing Backend Synchronization...');
    const tests: TestResult[] = [];

    // Test 1: Supabase URL
    const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL;
    tests.push({
      name: 'Supabase URL',
      status: supabaseUrl === 'https://drxtaxepofuoelplgrei.supabase.co' ? 'pass' : 'fail',
      message: supabaseUrl === 'https://drxtaxepofuoelplgrei.supabase.co' ? 
        'Supabase URL is correct' : 
        'Supabase URL mismatch',
      details: supabaseUrl || 'No URL found',
    });

    // Test 2: Supabase ANON Key
    const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;
    tests.push({
      name: 'Supabase ANON Key',
      status: supabaseAnonKey ? 'pass' : 'fail',
      message: supabaseAnonKey ? 
        'Supabase ANON Key is configured' : 
        'Supabase ANON Key is missing',
      details: supabaseAnonKey ? 
        `Key: ${supabaseAnonKey.substring(0, 20)}...` : 
        'No key found',
    });

    // Test 3: Supabase Connection
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        tests.push({
          name: 'Supabase Connection',
          status: 'fail',
          message: 'Failed to connect to Supabase',
          details: error.message,
        });
      } else {
        tests.push({
          name: 'Supabase Connection',
          status: 'pass',
          message: 'Successfully connected to Supabase',
          details: `Platform: ${Platform.OS}`,
        });
      }
    } catch (error) {
      tests.push({
        name: 'Supabase Connection',
        status: 'fail',
        message: 'Supabase connection exception',
        details: error.message,
      });
    }

    return {
      title: '🔄 Backend Synchronization',
      tests,
    };
  };

  const testBuildConfig = async (): Promise<TestCategory> => {
    setCurrentTest('Testing Build Configuration...');
    const tests: TestResult[] = [];

    // Test 1: App Version
    const appVersion = Constants.expoConfig?.version;
    tests.push({
      name: 'App Version',
      status: appVersion === '1.0.0' ? 'pass' : 'warning',
      message: appVersion === '1.0.0' ? 
        'App version is 1.0.0' : 
        `App version is ${appVersion}`,
      details: `Version: ${appVersion}`,
    });

    // Test 2: Bundle Identifier (iOS)
    if (Platform.OS === 'ios') {
      const bundleId = Constants.expoConfig?.ios?.bundleIdentifier;
      tests.push({
        name: 'iOS Bundle Identifier',
        status: bundleId === 'com.yombalyoon.yombalyoonapp' ? 'pass' : 'fail',
        message: bundleId === 'com.yombalyoon.yombalyoonapp' ? 
          'Bundle ID is correct' : 
          'Bundle ID mismatch',
        details: bundleId || 'No bundle ID found',
      });
    }

    // Test 3: Package Name (Android)
    if (Platform.OS === 'android') {
      const packageName = Constants.expoConfig?.android?.package;
      tests.push({
        name: 'Android Package Name',
        status: packageName === 'com.yombalyoon.app' ? 'pass' : 'fail',
        message: packageName === 'com.yombalyoon.app' ? 
          'Package name is correct' : 
          'Package name mismatch',
        details: packageName || 'No package name found',
      });
    }

    // Test 4: EAS Project ID
    const easProjectId = Constants.expoConfig?.extra?.eas?.projectId;
    tests.push({
      name: 'EAS Project ID',
      status: easProjectId ? 'pass' : 'warning',
      message: easProjectId ? 
        'EAS Project ID is configured' : 
        'EAS Project ID is missing',
      details: easProjectId || 'No project ID found',
    });

    return {
      title: '📦 Build Configuration',
      tests,
    };
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return YYColors.success;
      case 'fail':
        return YYColors.error;
      case 'warning':
        return YYColors.warning;
      case 'pending':
        return YYColors.text.secondary;
      default:
        return YYColors.text.secondary;
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return '✅';
      case 'fail':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  const getTotalStats = () => {
    let pass = 0;
    let fail = 0;
    let warning = 0;
    let pending = 0;

    testResults.forEach(category => {
      category.tests.forEach(test => {
        switch (test.status) {
          case 'pass':
            pass++;
            break;
          case 'fail':
            fail++;
            break;
          case 'warning':
            warning++;
            break;
          case 'pending':
            pending++;
            break;
        }
      });
    });

    return { pass, fail, warning, pending, total: pass + fail + warning + pending };
  };

  const stats = getTotalStats();

  return (
    <YYScreenContainer
      title="Tests de Cohérence"
      showBackButton
      onBackPress={() => router.back()}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Platform Info */}
        <YYCard style={styles.platformCard}>
          <View style={styles.platformHeader}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={32}
              color={YYColors.primary}
            />
            <View style={styles.platformInfo}>
              <Text style={styles.platformTitle}>Plateforme Actuelle</Text>
              <Text style={styles.platformValue}>{Platform.OS.toUpperCase()}</Text>
              <Text style={styles.platformVersion}>
                Version: {Constants.expoConfig?.version || 'N/A'}
              </Text>
            </View>
          </View>
        </YYCard>

        {/* Stats Summary */}
        <YYCard style={styles.statsCard}>
          <Text style={styles.statsTitle}>Résumé des Tests</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: YYColors.success }]}>
                {stats.pass}
              </Text>
              <Text style={styles.statLabel}>Réussis</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: YYColors.error }]}>
                {stats.fail}
              </Text>
              <Text style={styles.statLabel}>Échoués</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: YYColors.warning }]}>
                {stats.warning}
              </Text>
              <Text style={styles.statLabel}>Avertissements</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: YYColors.text.primary }]}>
                {stats.total}
              </Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </YYCard>

        {/* Test Results */}
        {isRunning ? (
          <YYCard style={styles.loadingCard}>
            <Text style={styles.loadingText}>{currentTest}</Text>
          </YYCard>
        ) : (
          testResults.map((category, categoryIndex) => (
            <YYCard key={categoryIndex} style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              {category.tests.map((test, testIndex) => (
                <View key={testIndex} style={styles.testItem}>
                  <View style={styles.testHeader}>
                    <Text style={styles.testIcon}>{getStatusIcon(test.status)}</Text>
                    <View style={styles.testInfo}>
                      <Text style={styles.testName}>{test.name}</Text>
                      <Text
                        style={[
                          styles.testMessage,
                          { color: getStatusColor(test.status) },
                        ]}
                      >
                        {test.message}
                      </Text>
                      {test.details && (
                        <Text style={styles.testDetails}>{test.details}</Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </YYCard>
          ))
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <YYButton
            title="Relancer les Tests"
            onPress={runAllTests}
            disabled={isRunning}
            variant="primary"
          />
          <YYButton
            title="Voir la Documentation"
            onPress={() => {
              Alert.alert(
                'Documentation',
                'Consultez le fichier docs/TESTING_CHECKLIST_TECHNICAL_VISUAL.md pour la liste complète des tests à effectuer.',
                [{ text: 'OK' }]
              );
            }}
            variant="outline"
            style={styles.docButton}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ces tests automatiques vérifient la cohérence de base.
          </Text>
          <Text style={styles.footerText}>
            Consultez la documentation pour les tests manuels complets.
          </Text>
        </View>
      </ScrollView>
    </YYScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  platformCard: {
    marginBottom: YYSpacing.md,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: YYSpacing.md,
  },
  platformInfo: {
    flex: 1,
  },
  platformTitle: {
    ...YYTypography.labelMedium,
    color: YYColors.text.secondary,
    marginBottom: 4,
  },
  platformValue: {
    ...YYTypography.h2,
    color: YYColors.primary,
    marginBottom: 4,
  },
  platformVersion: {
    ...YYTypography.caption,
    color: YYColors.text.secondary,
  },
  statsCard: {
    marginBottom: YYSpacing.md,
  },
  statsTitle: {
    ...YYTypography.h3,
    color: YYColors.text.primary,
    marginBottom: YYSpacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...YYTypography.h1,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    ...YYTypography.caption,
    color: YYColors.text.secondary,
  },
  loadingCard: {
    marginBottom: YYSpacing.md,
    alignItems: 'center',
    padding: YYSpacing.xl,
  },
  loadingText: {
    ...YYTypography.bodyMedium,
    color: YYColors.text.secondary,
  },
  categoryCard: {
    marginBottom: YYSpacing.md,
  },
  categoryTitle: {
    ...YYTypography.h3,
    color: YYColors.text.primary,
    marginBottom: YYSpacing.md,
  },
  testItem: {
    marginBottom: YYSpacing.md,
    paddingBottom: YYSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: YYColors.border,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: YYSpacing.sm,
  },
  testIcon: {
    fontSize: 24,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    ...YYTypography.labelLarge,
    color: YYColors.text.primary,
    marginBottom: 4,
  },
  testMessage: {
    ...YYTypography.bodySmall,
    marginBottom: 4,
  },
  testDetails: {
    ...YYTypography.caption,
    color: YYColors.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actions: {
    gap: YYSpacing.sm,
    marginBottom: YYSpacing.md,
  },
  docButton: {
    marginTop: YYSpacing.sm,
  },
  footer: {
    padding: YYSpacing.md,
    alignItems: 'center',
    marginBottom: YYSpacing.xl,
  },
  footerText: {
    ...YYTypography.caption,
    color: YYColors.text.secondary,
    textAlign: 'center',
    marginBottom: 4,
  },
});
