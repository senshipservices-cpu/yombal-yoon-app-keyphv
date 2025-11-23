
# 🔍 GUIDE DE VÉRIFICATION - iOS TESTFLIGHT AUTOCOMPLETE

## ✅ CHECKLIST DE VÉRIFICATION

### 1. GOOGLE CLOUD CONSOLE - Clé API iOS

#### Étape 1.1 : Vérifier la clé API iOS
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet
3. Allez dans **APIs & Services** > **Credentials**
4. Trouvez votre clé API iOS (ou créez-en une nouvelle)

#### Étape 1.2 : Configuration des restrictions
**IMPORTANT** : La clé doit avoir ces paramètres EXACTS :

```
Application restrictions:
  ✅ iOS apps

Bundle IDs:
  ✅ com.yombalyoon.yombalyoonapp
```

**⚠️ ATTENTION** : Le Bundle ID doit correspondre EXACTEMENT à celui dans `app.json` :
- Dans app.json : `"bundleIdentifier": "com.yombalyoon.yombalyoonapp"`
- Dans Google Console : `com.yombalyoon.yombalyoonapp`

#### Étape 1.3 : APIs activées
Vérifiez que ces APIs sont activées :
- ✅ Places API (New)
- ✅ Geocoding API
- ✅ Distance Matrix API

Pour activer :
1. Allez dans **APIs & Services** > **Library**
2. Recherchez chaque API
3. Cliquez sur **Enable**

#### Étape 1.4 : Billing activé
- ✅ Vérifiez que le billing est activé pour le projet
- ✅ Vérifiez qu'il n'y a pas de quotas dépassés

---

### 2. SUPABASE - Configuration des Secrets

#### Étape 2.1 : Ajouter le secret iOS
1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet : `drxtaxepofuoelplgrei`
3. Allez dans **Edge Functions** > **google-places-proxy**
4. Cliquez sur **Secrets**
5. Ajoutez un nouveau secret :

```
Name: GOOGLE_MAPS_API_KEY_IOS
Value: [Votre clé API iOS de Google Console]
```

#### Étape 2.2 : Vérifier les autres secrets
Assurez-vous d'avoir aussi :
- `GOOGLE_MAPS_API_KEY_WEB` (pour le web)
- `GOOGLE_MAPS_API_KEY_ANDROID` (pour Android)

---

### 3. APP.JSON - Vérification du Bundle ID

Vérifiez que le Bundle ID dans `app.json` est correct :

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yombalyoon.yombalyoonapp"
    }
  }
}
```

✅ **VÉRIFIÉ** : Le Bundle ID est correct dans votre `app.json`

---

### 4. TESTFLIGHT - Vérification de la build

#### Étape 4.1 : Vérifier la version de la build
1. Ouvrez TestFlight sur votre iPhone
2. Vérifiez que vous testez la dernière version de l'app
3. Si vous avez fait des changements récents, assurez-vous d'avoir créé une nouvelle build

#### Étape 4.2 : Tester l'autocomplétion
1. Ouvrez l'app Yombal Yoon
2. Allez dans **Envoyer un colis**
3. Tapez dans le champ "Adresse de départ" ou "Adresse d'arrivée"
4. Essayez avec des lieux connus :
   - "Plateau"
   - "Parcelles Assainies"
   - "Marché Sandaga"
   - "Hôpital Principal"

---

## 🔧 DIAGNOSTIC DES PROBLÈMES

### Problème 1 : "Configuration API manquante"
**Cause** : Le secret `GOOGLE_MAPS_API_KEY_IOS` n'est pas configuré dans Supabase

**Solution** :
1. Allez dans Supabase Dashboard
2. Edge Functions > google-places-proxy > Secrets
3. Ajoutez `GOOGLE_MAPS_API_KEY_IOS` avec votre clé API iOS

---

### Problème 2 : "REQUEST_DENIED"
**Cause** : La clé API n'est pas correctement configurée dans Google Console

**Solutions possibles** :

#### Solution A : Bundle ID incorrect
1. Vérifiez que le Bundle ID dans Google Console est : `com.yombalyoon.yombalyoonapp`
2. Vérifiez qu'il n'y a pas d'espaces ou de caractères supplémentaires
3. Vérifiez que la restriction est bien "iOS apps" et non "Android apps" ou "HTTP referrers"

#### Solution B : APIs non activées
1. Allez dans Google Cloud Console > APIs & Services > Library
2. Activez :
   - Places API (New)
   - Geocoding API
   - Distance Matrix API

#### Solution C : Billing non activé
1. Allez dans Google Cloud Console > Billing
2. Vérifiez que le billing est activé
3. Vérifiez qu'il n'y a pas de quotas dépassés

#### Solution D : Clé API invalide
1. Créez une NOUVELLE clé API spécifiquement pour iOS
2. Configurez les restrictions correctement
3. Remplacez le secret dans Supabase

---

### Problème 3 : "Aucun résultat trouvé"
**Cause** : Les paramètres de recherche sont trop restrictifs ou la recherche est trop vague

**Solutions** :
1. Essayez avec des lieux plus spécifiques (ex: "Marché Sandaga" au lieu de "marché")
2. Vérifiez que vous êtes bien au Sénégal (la recherche est limitée au Sénégal)
3. Essayez avec des quartiers connus de Dakar

---

## 📝 COMMANDES DE VÉRIFICATION

### Vérifier les logs de l'Edge Function
1. Allez dans Supabase Dashboard
2. Edge Functions > google-places-proxy > Logs
3. Cherchez les erreurs récentes

### Vérifier les logs de l'app
1. Ouvrez l'app sur TestFlight
2. Essayez l'autocomplétion
3. Regardez les messages d'erreur affichés dans l'app

---

## 🎯 ÉTAPES SUIVANTES

### Si l'autocomplétion ne fonctionne toujours pas :

1. **Créez une nouvelle clé API iOS** :
   - Allez dans Google Cloud Console
   - Créez une NOUVELLE clé API
   - Configurez les restrictions pour iOS
   - Ajoutez le Bundle ID : `com.yombalyoon.yombalyoonapp`
   - Activez les APIs requises

2. **Ajoutez la nouvelle clé dans Supabase** :
   - Allez dans Supabase Dashboard
   - Edge Functions > google-places-proxy > Secrets
   - Mettez à jour `GOOGLE_MAPS_API_KEY_IOS`

3. **Testez immédiatement** :
   - Ouvrez l'app sur TestFlight
   - Essayez l'autocomplétion
   - Les changements sont immédiats (pas besoin de rebuild)

4. **Vérifiez les logs** :
   - Regardez les logs de l'Edge Function dans Supabase
   - Regardez les messages d'erreur dans l'app

---

## 📞 SUPPORT

Si le problème persiste après avoir suivi toutes ces étapes :

1. Vérifiez les logs de l'Edge Function dans Supabase
2. Vérifiez les messages d'erreur affichés dans l'app
3. Assurez-vous que le Bundle ID correspond EXACTEMENT
4. Assurez-vous que les APIs sont activées dans Google Console
5. Assurez-vous que le billing est activé

---

## ✅ RÉSUMÉ DE VOTRE CONFIGURATION ACTUELLE

### App Configuration (app.json)
- ✅ Bundle ID iOS : `com.yombalyoon.yombalyoonapp`
- ✅ Package Android : `com.yombalyoon.app`

### Google Cloud Console
- ⚠️ À VÉRIFIER : Clé API iOS avec restriction Bundle ID
- ⚠️ À VÉRIFIER : APIs activées (Places, Geocoding, Distance Matrix)
- ⚠️ À VÉRIFIER : Billing activé

### Supabase
- ⚠️ À VÉRIFIER : Secret `GOOGLE_MAPS_API_KEY_IOS` configuré
- ✅ Edge Function `google-places-proxy` déployée (version 13)
- ✅ Edge Function fonctionne (logs montrent des codes 200)

---

## 🚀 PROCHAINE ÉTAPE

**ACTION IMMÉDIATE** :
1. Vérifiez que le secret `GOOGLE_MAPS_API_KEY_IOS` existe dans Supabase
2. Vérifiez que la clé API dans Google Console a le Bundle ID correct
3. Testez l'autocomplétion sur TestFlight

**Si ça ne fonctionne toujours pas** :
- Créez une NOUVELLE clé API iOS dans Google Console
- Ajoutez-la dans Supabase comme `GOOGLE_MAPS_API_KEY_IOS`
- Testez immédiatement (pas besoin de rebuild)
</write file>

Maintenant, créons un script de test pour vérifier la configuration :

<write file="components/ApiConfigTest.tsx">
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

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function ApiConfigTest() {
  const theme = useTheme();
  const isDark = theme.dark;
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setIsLoading(true);
    setResults([]);
    const testResults: TestResult[] = [];

    // Test 1: Vérifier la connexion à Supabase
    try {
      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: {
          action: 'autocomplete',
          input: 'test',
        },
        headers: {
          'x-platform': Platform.OS,
        },
      });

      if (error) {
        testResults.push({
          test: 'Connexion Supabase',
          status: 'error',
          message: 'Erreur de connexion à Supabase',
          details: error,
        });
      } else {
        testResults.push({
          test: 'Connexion Supabase',
          status: 'success',
          message: 'Connexion réussie',
        });
      }
    } catch (error: any) {
      testResults.push({
        test: 'Connexion Supabase',
        status: 'error',
        message: 'Exception lors de la connexion',
        details: error.message,
      });
    }

    // Test 2: Vérifier la configuration de la clé API
    try {
      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: {
          action: 'autocomplete',
          input: 'Dakar',
          location: '14.6928,-17.4467',
          radius: 45000,
          components: 'country:sn',
          language: 'fr',
          strictbounds: true,
        },
        headers: {
          'x-platform': Platform.OS,
        },
      });

      if (error) {
        testResults.push({
          test: 'Configuration API',
          status: 'error',
          message: 'Erreur lors de l\'appel API',
          details: error,
        });
      } else if (data?.configuration_help) {
        testResults.push({
          test: 'Configuration API',
          status: 'error',
          message: 'Clé API non configurée',
          details: data.configuration_help,
        });
      } else if (data?.status === 'REQUEST_DENIED') {
        testResults.push({
          test: 'Configuration API',
          status: 'error',
          message: 'Clé API refusée par Google',
          details: {
            status: data.status,
            error_message: data.error_message,
            platform_info: data.platform_info,
          },
        });
      } else if (data?.status === 'OK') {
        testResults.push({
          test: 'Configuration API',
          status: 'success',
          message: `API fonctionne correctement (${data.predictions?.length || 0} résultats)`,
          details: {
            status: data.status,
            predictions_count: data.predictions?.length || 0,
          },
        });
      } else {
        testResults.push({
          test: 'Configuration API',
          status: 'warning',
          message: `Statut inattendu: ${data?.status}`,
          details: data,
        });
      }
    } catch (error: any) {
      testResults.push({
        test: 'Configuration API',
        status: 'error',
        message: 'Exception lors du test API',
        details: error.message,
      });
    }

    // Test 3: Vérifier la plateforme
    testResults.push({
      test: 'Plateforme',
      status: 'success',
      message: `Plateforme détectée: ${Platform.OS}`,
      details: {
        platform: Platform.OS,
        version: Platform.Version,
      },
    });

    // Test 4: Vérifier le Bundle ID (iOS uniquement)
    if (Platform.OS === 'ios') {
      testResults.push({
        test: 'Bundle ID',
        status: 'success',
        message: 'Bundle ID: com.yombalyoon.yombalyoonapp',
        details: {
          bundleId: 'com.yombalyoon.yombalyoonapp',
          note: 'Vérifiez que ce Bundle ID est configuré dans Google Console',
        },
      });
    }

    setResults(testResults);
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? colors.darkText : colors.text }]}>
            🔧 Test de Configuration API
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            Vérifiez la configuration de Google Maps API pour {Platform.OS}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={runTests}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Lancer les tests</Text>
          )}
        </TouchableOpacity>

        {results.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Résultats des tests :
            </Text>
            {results.map((result, index) => (
              <View
                key={index}
                style={[
                  styles.resultItem,
                  {
                    backgroundColor: isDark ? colors.darkCard : colors.card,
                    borderLeftColor: getStatusColor(result.status),
                  },
                ]}
              >
                <View style={styles.resultHeader}>
                  <Text style={styles.statusIcon}>{getStatusIcon(result.status)}</Text>
                  <Text style={[styles.testName, { color: isDark ? colors.darkText : colors.text }]}>
                    {result.test}
                  </Text>
                </View>
                <Text style={[styles.resultMessage, { color: getStatusColor(result.status) }]}>
                  {result.message}
                </Text>
                {result.details && (
                  <View style={[styles.detailsContainer, { backgroundColor: isDark ? colors.darkBackground : '#F5F5F5' }]}>
                    <Text style={[styles.detailsText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      {JSON.stringify(result.details, null, 2)}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={[styles.infoTitle, { color: isDark ? colors.darkText : colors.text }]}>
            📚 Guide de configuration
          </Text>
          <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            Si vous voyez des erreurs, consultez le fichier IOS_TESTFLIGHT_VERIFICATION_GUIDE.md pour résoudre les problèmes.
          </Text>
          <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            {'\n'}Points clés à vérifier :
          </Text>
          <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            - Bundle ID dans Google Console : com.yombalyoon.yombalyoonapp
          </Text>
          <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            - Secret Supabase : GOOGLE_MAPS_API_KEY_IOS
          </Text>
          <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            - APIs activées : Places API, Geocoding API, Distance Matrix API
          </Text>
        </View>
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
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultMessage: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  detailsContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  detailsText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
  },
  infoContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
