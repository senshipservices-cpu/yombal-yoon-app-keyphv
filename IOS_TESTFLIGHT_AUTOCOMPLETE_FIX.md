
# 🔧 FIX: Autocomplétion iOS TestFlight - Yombal Yoon

## 📋 Problème

L'autocomplétion Google Places fonctionne sur **Web** mais **ne fonctionne pas sur iOS (TestFlight)** lors des tests sur iPhone physique.

## 🔍 Diagnostic

### Symptômes
- ✅ Web: Autocomplétion fonctionne parfaitement
- ❌ iOS (TestFlight): Aucune suggestion n'apparaît
- ❌ iOS (TestFlight): Possibles erreurs `REQUEST_DENIED` dans les logs

### Cause Racine

Le problème est causé par les **restrictions de clé API Google Maps**:

1. **Clé API actuelle**: Configurée avec des restrictions HTTP referrer (pour Web uniquement)
2. **iOS nécessite**: Une clé API avec restrictions d'application iOS (Bundle ID)
3. **Résultat**: Les requêtes depuis l'app iOS sont rejetées par Google Maps API

## ✅ Solution

### Étape 1: Créer une clé API iOS séparée

1. **Allez sur Google Cloud Console**
   - URL: https://console.cloud.google.com/
   - Sélectionnez votre projet

2. **Créez une nouvelle clé API**
   - Navigation: `APIs & Services` → `Credentials`
   - Cliquez sur `+ CREATE CREDENTIALS` → `API key`
   - Nommez-la: `Yombal Yoon - iOS`

3. **Configurez les restrictions iOS**
   - Cliquez sur la clé nouvellement créée
   - Section `Application restrictions`:
     - Sélectionnez `iOS apps`
     - Cliquez sur `ADD AN ITEM`
     - Entrez le **Bundle ID**: `com.yombalyoon.yombalyoonapp`
   - Cliquez sur `SAVE`

4. **Activez les APIs nécessaires**
   - Assurez-vous que ces APIs sont activées:
     - ✅ Places API
     - ✅ Places API (New)
     - ✅ Geocoding API
     - ✅ Distance Matrix API

### Étape 2: Configurer la clé dans Supabase

1. **Allez sur Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/drxtaxepofuoelplgrei

2. **Ajoutez la variable d'environnement**
   - Navigation: `Settings` → `Edge Functions` → `Secrets`
   - Ajoutez un nouveau secret:
     - **Nom**: `GOOGLE_MAPS_API_KEY_IOS`
     - **Valeur**: Votre nouvelle clé API iOS
   - Cliquez sur `Save`

3. **Redéployez l'Edge Function**
   ```bash
   # Depuis votre terminal local
   supabase functions deploy google-places-proxy
   ```

### Étape 3: Vérifier la configuration

1. **Testez sur TestFlight**
   - Ouvrez l'app Yombal Yoon sur iPhone
   - Allez dans `Envoi de Colis`
   - Tapez dans le champ "Adresse de départ"
   - Vérifiez que les suggestions apparaissent

2. **Vérifiez les logs de debug**
   - Les logs de debug s'affichent sous le champ de saisie
   - Recherchez:
     - ✅ `Status: OK` → Tout fonctionne
     - ❌ `Status: REQUEST_DENIED` → Problème de clé API
     - ⚠️ `Status: ZERO_RESULTS` → Aucun résultat (normal si recherche vide)

## 🔧 Configuration Actuelle

### Clés API par plateforme

L'Edge Function `google-places-proxy` utilise maintenant des clés API séparées:

```typescript
// Web (par défaut)
const GOOGLE_MAPS_API_KEY_WEB = Deno.env.get('GOOGLE_MAPS_API_KEY_WEB') || DEFAULT_KEY;

// Android
const GOOGLE_MAPS_API_KEY_ANDROID = Deno.env.get('GOOGLE_MAPS_API_KEY_ANDROID') || DEFAULT_KEY;

// iOS
const GOOGLE_MAPS_API_KEY_IOS = Deno.env.get('GOOGLE_MAPS_API_KEY_IOS') || DEFAULT_KEY;
```

### Détection de plateforme

La plateforme est détectée via le header `x-platform`:

```typescript
const platform = req.headers.get('x-platform') || 'web';
const apiKey = getApiKeyForPlatform(platform);
```

## 📱 Restrictions recommandées par plateforme

### Web
- **Type**: HTTP referrers
- **Valeurs autorisées**:
  - `localhost:*`
  - `*.natively.dev/*`
  - `*.supabase.co/*`
  - Votre domaine personnalisé (si applicable)

### iOS
- **Type**: iOS apps
- **Bundle ID**: `com.yombalyoon.yombalyoonapp`

### Android
- **Type**: Android apps
- **Package name**: `com.yombalyoon.app`
- **SHA-1 certificate fingerprint**: (à obtenir depuis votre keystore)

## 🐛 Débogage

### Logs de debug activés

Les composants d'autocomplétion affichent maintenant des informations de debug détaillées sur mobile:

```
🔧 Debug Info:
Platform: ios
Status: OK
Time: 234ms
Predictions: 5

✅ API fonctionne correctement
```

### En cas d'erreur REQUEST_DENIED

```
🔧 Debug Info:
Platform: ios
Status: REQUEST_DENIED
Error: This API key is not authorized for this application

🚫 PROBLÈME DE CLÉ API:
La clé API Google Maps n'est pas configurée pour ios.

SOLUTION:
1. Allez sur Google Cloud Console
2. Créez une clé API pour ios
3. Pour iOS: Ajoutez le Bundle ID
4. Activez: Places API, Geocoding API, Distance Matrix API
```

## 📚 Ressources

- [Google Maps Platform - API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Google Maps Platform - iOS SDK Setup](https://developers.google.com/maps/documentation/ios-sdk/config)
- [Supabase Edge Functions - Environment Variables](https://supabase.com/docs/guides/functions/secrets)

## ✅ Checklist de vérification

- [ ] Clé API iOS créée sur Google Cloud Console
- [ ] Restrictions iOS configurées avec le Bundle ID correct
- [ ] APIs activées (Places, Geocoding, Distance Matrix)
- [ ] Variable d'environnement `GOOGLE_MAPS_API_KEY_IOS` ajoutée dans Supabase
- [ ] Edge Function redéployée
- [ ] Test sur TestFlight réussi
- [ ] Logs de debug vérifiés (Status: OK)

## 🎯 Résultat attendu

Après avoir suivi ces étapes:

1. ✅ L'autocomplétion fonctionne sur **Web**
2. ✅ L'autocomplétion fonctionne sur **iOS (TestFlight)**
3. ✅ L'autocomplétion fonctionne sur **Android** (si configuré)
4. ✅ Les logs de debug affichent `Status: OK`
5. ✅ Les suggestions apparaissent en temps réel

## 📞 Support

Si le problème persiste après avoir suivi ces étapes:

1. Vérifiez les logs de l'Edge Function:
   ```bash
   supabase functions logs google-places-proxy
   ```

2. Vérifiez les logs de debug dans l'app (affichés sous le champ de saisie)

3. Contactez le support avec:
   - Plateforme (iOS/Android/Web)
   - Message d'erreur exact
   - Logs de debug
   - Capture d'écran

---

**Date de création**: 23 novembre 2024  
**Dernière mise à jour**: 23 novembre 2024  
**Version**: 1.0.0
