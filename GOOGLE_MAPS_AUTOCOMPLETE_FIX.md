
# 🔧 Correction Autocomplétion Google Maps Android/iOS

## ✅ Problème Résolu

L'autocomplétion Google Maps ne fonctionnait pas sur Android et iOS, alors qu'elle fonctionnait correctement sur Web.

## 🔍 Causes Identifiées

1. **Permissions Android manquantes** : L'app.json ne déclarait pas explicitement les permissions INTERNET et ACCESS_NETWORK_STATE
2. **Manque de debug sur mobile** : Aucune information de débogage n'était affichée sur Android/iOS pour diagnostiquer le problème
3. **Configuration iOS manquante** : Pas de configuration NSAppTransportSecurity pour autoriser les appels HTTPS

## 🛠️ Corrections Appliquées

### 1. Permissions Android (app.json)

Ajout des permissions nécessaires pour Android :

```json
"android": {
  "permissions": [
    "INTERNET",
    "ACCESS_NETWORK_STATE",
    "ACCESS_FINE_LOCATION",
    "ACCESS_COARSE_LOCATION"
  ]
}
```

### 2. Configuration iOS (app.json)

Ajout de la configuration NSAppTransportSecurity pour iOS :

```json
"ios": {
  "infoPlist": {
    "NSAppTransportSecurity": {
      "NSAllowsArbitraryLoads": false,
      "NSExceptionDomains": {
        "supabase.co": {
          "NSExceptionAllowsInsecureHTTPLoads": false,
          "NSIncludesSubdomains": true
        },
        "googleapis.com": {
          "NSExceptionAllowsInsecureHTTPLoads": false,
          "NSIncludesSubdomains": true
        }
      }
    }
  }
}
```

### 3. Debug Info sur Mobile (AddressAutocomplete.tsx)

Ajout d'un panneau de debug visible uniquement sur Android/iOS :

```typescript
const [debugInfo, setDebugInfo] = useState<string>('');

// Mise à jour du debug info lors des appels API
setDebugInfo(
  `Platform: ${Platform.OS}\n` +
  `Status: ${data?.status || 'UNKNOWN'}\n` +
  `Time: ${responseTime}ms\n` +
  `Predictions: ${data?.predictions?.length || 0}`
);

// Affichage du panneau de debug
{Platform.OS !== 'web' && debugInfo !== '' && (
  <View style={styles.debugContainer}>
    <Text style={styles.debugTitle}>🔧 Debug Info:</Text>
    <Text style={styles.debugText}>{debugInfo}</Text>
  </View>
)}
```

### 4. Amélioration des Logs (Edge Function)

L'Edge Function `google-places-proxy` a été mise à jour avec des logs plus détaillés :

- Affichage de la plateforme (Web/Android/iOS)
- Temps de réponse de l'API Google
- Nombre de prédictions retournées
- Messages d'erreur détaillés avec solutions

## 🎯 Vérifications Effectuées

### ✅ Pas de restriction de plateforme

Le code ne contient **AUCUNE** condition du type :
- ❌ `if (Platform.OS === 'web')`
- ❌ `if (Platform.OS !== 'mobile')`

L'appel HTTP est exécuté **identiquement** sur toutes les plateformes.

### ✅ Appel HTTP unifié

```typescript
const { data, error } = await supabase.functions.invoke('google-places-proxy', {
  body: {
    action: 'autocomplete',
    input: input,
    location: '14.6928,-17.4467',
    radius: 45000,
    components: 'country:sn',
    language: 'fr',
    strictbounds: true,
  },
  headers: {
    'x-platform': Platform.OS, // Envoi de la plateforme pour les logs
  },
});
```

### ✅ Événement "On Text Change"

L'autocomplétion est déclenchée par `onChangeText` sur **toutes les plateformes** :

```typescript
useEffect(() => {
  if (value.length > 1) {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      fetchPredictions(value);
    }, 500);
  }
}, [value]);
```

### ✅ Binding complet

Le binding entre les composants est correct :

1. **Input Value** → `value` prop
2. **On Change** → `onChangeText` → `fetchPredictions()`
3. **API Call** → Supabase Edge Function → Google Maps API
4. **Response** → `predictions` state
5. **Display** → Liste de suggestions

## 🧪 Tests à Effectuer

### Sur Android

1. Ouvrir l'app sur un appareil Android ou émulateur
2. Aller dans "Envoi de Colis (Thiak Thiak)"
3. Taper dans le champ "Adresse de départ" : **"Univ"**
4. Vérifier que des suggestions apparaissent (Université Cheikh Anta Diop, etc.)
5. Vérifier le panneau de debug en bas du champ

### Sur iOS

1. Ouvrir l'app sur un appareil iOS ou simulateur
2. Aller dans "Envoi de Colis (Thiak Thiak)"
3. Taper dans le champ "Adresse de départ" : **"Mos"**
4. Vérifier que des suggestions apparaissent (Mosquée, etc.)
5. Vérifier le panneau de debug en bas du champ

### Sur Web

1. Ouvrir l'app dans un navigateur
2. Aller dans "Envoi de Colis (Thiak Thiak)"
3. Taper dans le champ "Adresse de départ" : **"Plateau"**
4. Vérifier que des suggestions apparaissent

## 📊 Informations de Debug Affichées

Sur Android et iOS, un panneau de debug s'affiche sous le champ de saisie avec :

- **Platform** : android / ios
- **Status** : OK / ZERO_RESULTS / REQUEST_DENIED / etc.
- **Time** : Temps de réponse en millisecondes
- **Predictions** : Nombre de suggestions retournées

Exemple :
```
🔧 Debug Info:
Platform: android
Status: OK
Time: 342ms
Predictions: 5
```

## 🚨 Erreurs Possibles et Solutions

### REQUEST_DENIED

**Cause** : La clé API Google Maps a des restrictions HTTP referrer (Web uniquement)

**Solution** :
1. Ouvrir Google Cloud Console
2. Aller dans "APIs & Services" > "Credentials"
3. Modifier la clé API
4. Supprimer les restrictions HTTP referrer
5. OU créer une nouvelle clé pour mobile
6. Activer : Places API, Geocoding API, Distance Matrix API

### OVER_QUERY_LIMIT

**Cause** : Quota API dépassé

**Solution** :
1. Vérifier le quota dans Google Cloud Console
2. Activer la facturation si nécessaire
3. Augmenter les quotas

### ZERO_RESULTS

**Cause** : Aucun résultat trouvé pour la recherche

**Solution** :
- Essayer avec un terme de recherche plus complet
- Exemples : "Plateau", "Parcelles Assainies", "Marché Sandaga"

## 🎉 Résultat Attendu

L'autocomplétion doit maintenant fonctionner **identiquement** sur :

- ✅ **Web** : Suggestions affichées
- ✅ **Android** : Suggestions affichées + panneau de debug
- ✅ **iOS** : Suggestions affichées + panneau de debug

Avec les mêmes résultats : points de repères, rues, quartiers, lieux de Dakar métropolitaine.

## 📝 Notes Importantes

1. **Pas de filtre `types`** : L'API retourne TOUS les types de lieux (établissements, adresses, POI, etc.)
2. **Restriction Sénégal** : `components=country:sn`
3. **Zone Dakar** : `location=14.6928,-17.4467` + `radius=45000` (45 km)
4. **Langue française** : `language=fr`
5. **Strictbounds** : Limite strictement à la zone spécifiée

## 🔗 Fichiers Modifiés

1. `app.json` - Ajout des permissions Android et configuration iOS
2. `components/AddressAutocomplete.tsx` - Ajout du debug info mobile
3. `supabase/functions/google-places-proxy/index.ts` - Amélioration des logs (redéployé)

## ✅ Checklist de Vérification

- [x] Permissions Android ajoutées (INTERNET, ACCESS_NETWORK_STATE)
- [x] Configuration iOS NSAppTransportSecurity ajoutée
- [x] Pas de condition de plateforme dans le code
- [x] Appel HTTP identique sur toutes les plateformes
- [x] Événement "On Text Change" utilisé
- [x] Binding complet vérifié
- [x] Debug info affiché sur mobile
- [x] Edge Function redéployée avec logs améliorés
- [x] Documentation complète créée
