
# 🔧 GUIDE DE CONFIGURATION - CLÉ API GOOGLE MAPS POUR iOS

## 📋 Problème Identifié

L'autocomplétion fonctionne sur **Web** mais pas sur **iOS TestFlight** car :
- La clé API actuelle a des restrictions **HTTP referrer** (pour le web uniquement)
- iOS nécessite une clé API avec des restrictions **iOS app** (Bundle ID)

## ✅ Solution : Créer une Clé API Séparée pour iOS

### Étape 1 : Accéder à Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet Yombal Yoon
3. Dans le menu, allez à **APIs & Services** > **Credentials**

### Étape 2 : Créer une Nouvelle Clé API pour iOS

1. Cliquez sur **+ CREATE CREDENTIALS** > **API key**
2. Une nouvelle clé sera créée (notez-la temporairement)
3. Cliquez sur **RESTRICT KEY** pour configurer les restrictions

### Étape 3 : Configurer les Restrictions iOS

#### A. Nom de la Clé
- Donnez un nom clair : `Yombal Yoon - iOS App`

#### B. Application Restrictions
- Sélectionnez **iOS apps**
- Cliquez sur **ADD AN ITEM**
- Entrez le Bundle ID : `com.yombalyoon.yombalyoonapp`
- Cliquez sur **DONE**

#### C. API Restrictions
- Sélectionnez **Restrict key**
- Cochez les APIs suivantes :
  - ✅ **Places API**
  - ✅ **Geocoding API**
  - ✅ **Distance Matrix API**

#### D. Sauvegarder
- Cliquez sur **SAVE**

### Étape 4 : Ajouter la Clé dans Supabase

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet **Yombal Yoon**
3. Dans le menu, allez à **Edge Functions**
4. Cliquez sur **google-places-proxy**
5. Allez dans l'onglet **Secrets**
6. Ajoutez un nouveau secret :
   - **Name** : `GOOGLE_MAPS_API_KEY_IOS`
   - **Value** : Collez votre nouvelle clé API iOS
7. Cliquez sur **Save**

### Étape 5 : Redéployer l'Edge Function

L'Edge Function a été mise à jour pour utiliser automatiquement la bonne clé selon la plateforme.

Pour redéployer :
```bash
supabase functions deploy google-places-proxy
```

Ou via le Dashboard Supabase :
1. Allez dans **Edge Functions** > **google-places-proxy**
2. Cliquez sur **Deploy**

## 🧪 Tester la Configuration

### Test 1 : Vérifier les Logs

1. Ouvrez l'app sur TestFlight
2. Allez dans **Envoi de Colis**
3. Tapez une adresse dans le champ "Adresse de départ"
4. Vérifiez les logs dans Supabase :
   - Allez dans **Edge Functions** > **google-places-proxy** > **Logs**
   - Vous devriez voir : `🔑 Selecting API key for platform: ios`
   - Puis : `✅ Found X predictions`

### Test 2 : Vérifier les Erreurs

Si vous voyez toujours `REQUEST_DENIED` :

1. **Vérifiez le Bundle ID** :
   - Dans Google Cloud Console, vérifiez que le Bundle ID est exactement : `com.yombalyoon.yombalyoonapp`
   - Pas d'espaces, pas de majuscules incorrectes

2. **Vérifiez les APIs activées** :
   - Allez dans **APIs & Services** > **Library**
   - Recherchez et activez :
     - Places API
     - Geocoding API
     - Distance Matrix API

3. **Vérifiez la facturation** :
   - Allez dans **Billing**
   - Assurez-vous qu'un compte de facturation est lié au projet
   - Les APIs Google Maps nécessitent un compte de facturation actif

4. **Attendez la propagation** :
   - Les changements de configuration peuvent prendre 5-10 minutes pour se propager
   - Attendez quelques minutes puis réessayez

## 📊 Configuration Complète (3 Clés)

Pour une configuration optimale, créez 3 clés API séparées :

### 1. Clé Web
- **Nom** : `Yombal Yoon - Web`
- **Restrictions** : HTTP referrers
- **Referrers autorisés** :
  - `https://yombalyoon.com/*`
  - `https://*.yombalyoon.com/*`
  - `http://localhost:*/*` (pour le développement)
- **Secret Supabase** : `GOOGLE_MAPS_API_KEY_WEB`

### 2. Clé iOS
- **Nom** : `Yombal Yoon - iOS`
- **Restrictions** : iOS apps
- **Bundle ID** : `com.yombalyoon.yombalyoonapp`
- **Secret Supabase** : `GOOGLE_MAPS_API_KEY_IOS`

### 3. Clé Android
- **Nom** : `Yombal Yoon - Android`
- **Restrictions** : Android apps
- **Package name** : `com.yombalyoon.app`
- **SHA-1** : (obtenu via `keytool` ou EAS)
- **Secret Supabase** : `GOOGLE_MAPS_API_KEY_ANDROID`

## 🔍 Diagnostic des Erreurs

### Erreur : "API key not configured"
**Cause** : Le secret n'est pas défini dans Supabase
**Solution** : Ajoutez le secret `GOOGLE_MAPS_API_KEY_IOS` dans Supabase Edge Functions

### Erreur : "REQUEST_DENIED"
**Cause** : La clé API a des restrictions incorrectes
**Solution** : 
1. Vérifiez que la restriction est "iOS apps" (pas HTTP referrer)
2. Vérifiez que le Bundle ID est correct
3. Vérifiez que les APIs sont activées

### Erreur : "OVER_QUERY_LIMIT"
**Cause** : Quota API dépassé
**Solution** : 
1. Vérifiez votre facturation Google Cloud
2. Augmentez les quotas si nécessaire

### Erreur : "ZERO_RESULTS"
**Cause** : Aucun résultat trouvé pour la recherche
**Solution** : Normal, essayez avec un terme de recherche plus précis

## 📞 Support

Si le problème persiste après avoir suivi ce guide :

1. **Vérifiez les logs Supabase** :
   - Edge Functions > google-places-proxy > Logs
   - Recherchez les messages d'erreur détaillés

2. **Testez la clé API directement** :
   ```bash
   curl "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Dakar&key=VOTRE_CLE_IOS"
   ```

3. **Contactez le support** avec :
   - Les logs Supabase
   - Les captures d'écran de la configuration Google Cloud
   - Le message d'erreur exact

## ✅ Checklist Finale

- [ ] Clé API iOS créée dans Google Cloud Console
- [ ] Restriction "iOS apps" configurée
- [ ] Bundle ID `com.yombalyoon.yombalyoonapp` ajouté
- [ ] Places API activée
- [ ] Geocoding API activée
- [ ] Distance Matrix API activée
- [ ] Facturation activée sur le projet Google Cloud
- [ ] Secret `GOOGLE_MAPS_API_KEY_IOS` ajouté dans Supabase
- [ ] Edge Function redéployée
- [ ] Testé sur TestFlight
- [ ] Logs vérifiés dans Supabase

---

**Date de création** : 2025-01-22
**Dernière mise à jour** : 2025-01-22
**Version** : 1.0
