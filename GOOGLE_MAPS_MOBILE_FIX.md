
# 🔧 Fix Google Maps Autocomplete sur Android/iOS

## 📋 Résumé du problème

L'autocomplétion Google Maps fonctionne sur **Web** mais **PAS sur Android/iOS**.

**Cause principale:** La clé API Google Maps a des **restrictions HTTP referrer** qui n'autorisent que les requêtes provenant de sites web, pas des applications mobiles.

---

## ✅ Solution : Configuration de la clé API Google Maps

### Étape 1 : Accéder à Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet
3. Allez dans **APIs & Services** → **Credentials**

### Étape 2 : Identifier le problème

Votre clé API actuelle : `AIzaSyCyIEHUEYap3t8z_lqy2tCNhHFBhYHTSHQ`

Cette clé a probablement des **restrictions HTTP referrer** comme :
- `*.natively.dev/*`
- `localhost:*`
- Ou d'autres domaines web

**Ces restrictions bloquent les requêtes provenant des apps mobiles !**

### Étape 3 : Choisir une solution

#### Option A : Supprimer les restrictions (Temporaire - pour tester)

⚠️ **Attention:** Cette option est moins sécurisée mais permet de tester rapidement.

1. Cliquez sur votre clé API
2. Dans **Application restrictions**, sélectionnez **None**
3. Dans **API restrictions**, assurez-vous que ces APIs sont activées :
   - Places API
   - Places API (New)
   - Geocoding API
   - Distance Matrix API
4. Cliquez sur **Save**

#### Option B : Créer une clé dédiée mobile (Recommandé)

✅ **Recommandé:** Créez une clé séparée pour les apps mobiles.

1. Cliquez sur **+ CREATE CREDENTIALS** → **API key**
2. Nommez-la : `Yombal Yoon - Mobile`
3. Dans **Application restrictions** :
   - Pour Android :
     - Sélectionnez **Android apps**
     - Ajoutez votre package name : `com.natively.yombalyoon` (ou votre package)
     - Ajoutez votre SHA-1 fingerprint (voir ci-dessous)
   - Pour iOS :
     - Sélectionnez **iOS apps**
     - Ajoutez votre Bundle ID : `com.natively.yombalyoon` (ou votre bundle)
4. Dans **API restrictions**, sélectionnez **Restrict key** et activez :
   - Places API
   - Places API (New)
   - Geocoding API
   - Distance Matrix API
5. Cliquez sur **Save**

#### Option C : Modifier la clé existante (Compromis)

Si vous voulez garder une seule clé pour Web + Mobile :

1. Cliquez sur votre clé API existante
2. Dans **Application restrictions**, sélectionnez **None**
3. ⚠️ **Important:** Ajoutez des **API restrictions** pour limiter l'utilisation :
   - Places API
   - Places API (New)
   - Geocoding API
   - Distance Matrix API
4. Cliquez sur **Save**

---

## 🔑 Obtenir le SHA-1 Fingerprint (Android)

Pour les restrictions Android, vous avez besoin du SHA-1 fingerprint :

### Pour le debug keystore :

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Pour le release keystore :

```bash
keytool -list -v -keystore /path/to/your/release.keystore -alias your-alias
```

Copiez le **SHA-1** et ajoutez-le dans les restrictions Android de votre clé API.

---

## 📱 Mettre à jour la clé API dans le code

Si vous créez une nouvelle clé mobile, mettez à jour le fichier Edge Function :

### Fichier : `supabase/functions/google-places-proxy/index.ts`

```typescript
// Remplacez cette ligne :
const GOOGLE_MAPS_API_KEY = "AIzaSyCyIEHUEYap3t8z_lqy2tCNhHFBhYHTSHQ";

// Par votre nouvelle clé mobile :
const GOOGLE_MAPS_API_KEY = "VOTRE_NOUVELLE_CLE_MOBILE";
```

Puis redéployez la fonction :

```bash
supabase functions deploy google-places-proxy
```

---

## 🧪 Tester la correction

### 1. Vérifier les logs de l'Edge Function

Les logs détaillés ont été ajoutés pour vous aider à diagnostiquer :

```bash
supabase functions logs google-places-proxy
```

Vous verrez :
- La plateforme (web/ios/android)
- Le statut de la réponse Google API
- Les erreurs détaillées si REQUEST_DENIED

### 2. Tester sur mobile

1. Ouvrez l'app sur Android ou iOS
2. Allez dans **Envoi de Colis**
3. Tapez dans le champ "Adresse de départ"
4. Si ça ne fonctionne pas, une alerte s'affichera avec les détails de l'erreur

### 3. Vérifier les logs dans l'app

Dans les logs de l'app (console), vous verrez :

```
🔍 [AddressAutocomplete] Fetching predictions for: dakar
📱 [AddressAutocomplete] Platform: ios
📦 [AddressAutocomplete] API Response status: OK
✅ [AddressAutocomplete] Found 5 predictions
```

Ou en cas d'erreur :

```
❌ [AddressAutocomplete] API Response status: REQUEST_DENIED
🚫 Error: This API project is not authorized to use this API
```

---

## 🎯 Checklist de vérification

- [ ] La clé API n'a PAS de restrictions HTTP referrer
- [ ] Les APIs suivantes sont activées dans Google Cloud :
  - [ ] Places API
  - [ ] Places API (New)
  - [ ] Geocoding API
  - [ ] Distance Matrix API
- [ ] La facturation est activée sur le projet Google Cloud
- [ ] L'Edge Function a été redéployée avec la nouvelle clé (si applicable)
- [ ] L'app a été testée sur un appareil Android réel
- [ ] L'app a été testée sur un appareil iOS réel

---

## 📊 Monitoring et logs améliorés

### Logs ajoutés dans l'Edge Function :

```
================================================================================
📱 REQUEST INFO:
  Platform: ios
  User-Agent: ...
  Action: autocomplete
  Params: { input: "dakar", location: "14.6928,-17.4467", ... }
================================================================================
🔗 Autocomplete URL: https://maps.googleapis.com/maps/api/place/autocomplete/json?...
⏱️ Google API response time: 234ms
📊 HTTP Status: 200 OK
📦 Google API Response:
  Status: OK
✅ Found 5 predictions
📍 Sample place types: [...]
================================================================================
```

### Logs ajoutés dans le composant :

```
🔍 [AddressAutocomplete] Fetching predictions for: dakar
📱 [AddressAutocomplete] Platform: ios
📦 [AddressAutocomplete] API Response status: OK
✅ [AddressAutocomplete] Found 5 predictions
📍 [AddressAutocomplete] Place types found: [...]
```

### En cas d'erreur REQUEST_DENIED :

```
❌ API ERROR DETECTED:
  Status: REQUEST_DENIED
  Error Message: This API project is not authorized to use this API

🚫 REQUEST_DENIED - Possible causes:
  1. API key is invalid or expired
  2. API key has HTTP referrer restrictions (Web only)
  3. API key does not have the required API enabled
  4. API key has IP address restrictions
  5. Billing is not enabled for this project

🔧 SOLUTION FOR MOBILE:
  - Remove HTTP referrer restrictions from the API key
  - OR create a separate API key for mobile apps
  - Add Android app restrictions (package name + SHA-1)
  - Add iOS app restrictions (bundle ID)
```

---

## 🆘 Support

Si le problème persiste après avoir suivi ces étapes :

1. Vérifiez les logs de l'Edge Function : `supabase functions logs google-places-proxy`
2. Vérifiez les logs de l'app mobile (console)
3. Assurez-vous que la facturation est activée sur Google Cloud
4. Attendez 5-10 minutes après avoir modifié les restrictions de la clé API

---

## 📝 Résumé des modifications apportées

### 1. Edge Function (`supabase/functions/google-places-proxy/index.ts`)
- ✅ Ajout de logs détaillés pour chaque requête
- ✅ Détection de la plateforme (web/ios/android)
- ✅ Messages d'erreur explicites pour REQUEST_DENIED
- ✅ Temps de réponse de l'API Google
- ✅ Support du header `x-platform`

### 2. Composant (`components/AddressAutocomplete.tsx`)
- ✅ Ajout de logs détaillés côté client
- ✅ Affichage d'alertes explicites sur mobile en cas d'erreur
- ✅ Indicateur visuel d'erreur (bordure rouge)
- ✅ Message d'erreur sous le champ de saisie
- ✅ Mode debug pour afficher la plateforme
- ✅ Envoi du header `x-platform` à l'Edge Function

---

## 🎉 Résultat attendu

Après avoir appliqué la correction, l'autocomplétion devrait fonctionner de la même manière sur :
- ✅ Web
- ✅ Android
- ✅ iOS

Avec des suggestions pour :
- Rues et adresses précises
- Quartiers et communes
- Établissements (hôpitaux, écoles, mosquées, églises)
- Points de repère (marchés, monuments, ronds-points)
- Services publics et administration
- Commerces et restaurants

Tous limités à la zone métropolitaine de Dakar (45 km de rayon).
