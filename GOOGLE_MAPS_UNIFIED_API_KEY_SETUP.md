
# Configuration Clé API Google Maps Unifiée - Yombal Yoon

## 📋 Vue d'ensemble

Ce guide explique comment configurer **une seule clé API Google Maps** qui fonctionne sur **toutes les plateformes** (Web, Android, iOS) pour l'application Yombal Yoon.

## 🎯 Objectif

Utiliser la même clé API Google Maps (`GOOGLE_MAPS_API_KEY`) pour :
- ✅ Web (navigateur)
- ✅ Android (app native)
- ✅ iOS (app native + TestFlight)

## 📝 Étapes de Configuration

### 1️⃣ Créer/Vérifier la Clé API dans Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet Yombal Yoon
3. Allez dans **APIs & Services** > **Credentials**
4. Trouvez votre clé API existante ou créez-en une nouvelle

### 2️⃣ Activer les APIs Nécessaires

Assurez-vous que ces APIs sont activées dans votre projet :

- ✅ **Places API** (pour l'autocomplétion)
- ✅ **Geocoding API** (pour les coordonnées)
- ✅ **Distance Matrix API** (pour les calculs de distance)
- ✅ **Maps JavaScript API** (pour Web)
- ✅ **Maps SDK for Android** (pour Android)
- ✅ **Maps SDK for iOS** (pour iOS)

### 3️⃣ Configurer les Restrictions de la Clé API

#### Option A : Sans Restrictions (Développement/Test)

⚠️ **Attention** : Cette option est moins sécurisée mais plus simple pour le développement.

1. Dans les paramètres de la clé API
2. Section **Application restrictions** : Sélectionnez **None**
3. Section **API restrictions** : Sélectionnez **Don't restrict key**
4. Cliquez sur **Save**

#### Option B : Avec Restrictions (Production Recommandée)

Pour une sécurité maximale en production, configurez des restrictions multiples :

##### Pour Web :
1. **Application restrictions** : HTTP referrers (web sites)
2. Ajoutez ces referrers :
   ```
   *.natively.dev/*
   localhost/*
   127.0.0.1/*
   ```

##### Pour Android :
1. **Application restrictions** : Android apps
2. Ajoutez :
   - **Package name** : `com.yombalyoon.app`
   - **SHA-1 certificate fingerprint** : Votre empreinte SHA-1

Pour obtenir votre SHA-1 :
```bash
# Debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release keystore
keytool -list -v -keystore /path/to/your/release.keystore -alias your-key-alias
```

##### Pour iOS :
1. **Application restrictions** : iOS apps
2. Ajoutez le **Bundle ID** : `com.yombalyoon.yombalyoonapp`

⚠️ **Important pour iOS** : Le Bundle ID doit correspondre **exactement** à celui configuré dans `app.json` :
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yombalyoon.yombalyoonapp"
    }
  }
}
```

### 4️⃣ Configurer la Clé dans Supabase

#### Via Supabase Dashboard :

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet Yombal Yoon
3. Allez dans **Edge Functions** > **Manage secrets**
4. Ajoutez le secret :
   - **Name** : `GOOGLE_MAPS_API_KEY`
   - **Value** : Votre clé API Google Maps
5. Cliquez sur **Save**

#### Via Supabase CLI :

```bash
# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref drxtaxepofuoelplgrei

# Définir le secret
supabase secrets set GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

### 5️⃣ Redéployer l'Edge Function

Après avoir configuré le secret, redéployez l'Edge Function :

```bash
# Via Supabase CLI
supabase functions deploy google-places-proxy

# Ou via Natively
# L'Edge Function sera automatiquement redéployée au prochain build
```

## 🧪 Tester la Configuration

### Test Web :
1. Ouvrez l'app dans le navigateur
2. Allez dans **Envoi de colis** > **Envoyer un colis**
3. Tapez dans le champ "Adresse de départ"
4. Vérifiez que l'autocomplétion fonctionne

### Test Android :
1. Installez l'app sur un appareil Android
2. Allez dans **Envoi de colis** > **Envoyer un colis**
3. Tapez dans le champ "Adresse de départ"
4. Vérifiez que l'autocomplétion fonctionne

### Test iOS (TestFlight) :
1. Installez l'app via TestFlight
2. Allez dans **Envoi de colis** > **Envoyer un colis**
3. Tapez dans le champ "Adresse de départ"
4. Vérifiez que l'autocomplétion fonctionne

## 🔍 Vérifier les Logs

### Logs Edge Function (Supabase) :
1. Allez sur Supabase Dashboard
2. **Edge Functions** > **google-places-proxy** > **Logs**
3. Recherchez les messages :
   - ✅ `🔐 Clé API chargée avec succès pour ios`
   - ✅ `✅ X résultats trouvés (ios)`
   - ❌ `❌ GOOGLE_MAPS_API_KEY non configurée`
   - ❌ `❌ Erreur Google Maps API: REQUEST_DENIED`

### Logs App (Console) :
```javascript
// Recherchez ces messages dans la console
[AddressAutocomplete] Fetching predictions for: "plateau" on platform: ios
[AddressAutocomplete] API Response status: OK
[AddressAutocomplete] Found 5 predictions
```

## ❌ Résolution des Problèmes

### Problème : "REQUEST_DENIED" sur iOS

**Cause** : Le Bundle ID n'est pas correctement configuré dans Google Cloud Console.

**Solution** :
1. Vérifiez que le Bundle ID dans Google Cloud Console est **exactement** : `com.yombalyoon.yombalyoonapp`
2. Vérifiez que le Bundle ID dans `app.json` correspond
3. Attendez 5-10 minutes après avoir modifié les restrictions (propagation)
4. Redéployez l'app sur TestFlight

### Problème : "Autocomplétion momentanément indisponible"

**Cause** : La clé API n'est pas configurée dans Supabase ou l'Edge Function n'a pas été redéployée.

**Solution** :
1. Vérifiez que le secret `GOOGLE_MAPS_API_KEY` existe dans Supabase
2. Redéployez l'Edge Function : `supabase functions deploy google-places-proxy`
3. Attendez 1-2 minutes pour que les changements prennent effet

### Problème : Fonctionne sur Web mais pas sur iOS

**Cause** : Les restrictions de la clé API bloquent iOS.

**Solution** :
1. Vérifiez les restrictions dans Google Cloud Console
2. Assurez-vous que le Bundle ID iOS est ajouté
3. Ou temporairement, désactivez les restrictions pour tester

### Problème : Quota dépassé

**Cause** : Vous avez dépassé le quota gratuit de Google Maps API.

**Solution** :
1. Vérifiez votre utilisation dans Google Cloud Console
2. Activez la facturation si nécessaire
3. Optimisez les appels API (debounce, cache)

## 📊 Utilisation de l'API

### Modules utilisant l'autocomplétion :

1. **Envoi de colis** (`app/(tabs)/colis.tsx`)
   - Champ "Adresse de départ"
   - Champ "Adresse d'arrivée"
   - Zone : Dakar métropole
   - Language : Français
   - Components : country:sn

2. **Livraison inter-régions** (`app/(tabs)/livraison.tsx`)
   - Utilise `DestinationAutocomplete` (liste prédéfinie)
   - **N'utilise PAS** Google Maps API
   - Pas de changement nécessaire

## ✅ Checklist de Vérification

- [ ] Clé API créée dans Google Cloud Console
- [ ] APIs activées (Places, Geocoding, Distance Matrix)
- [ ] Restrictions configurées (ou désactivées pour test)
- [ ] Bundle ID iOS correct : `com.yombalyoon.yombalyoonapp`
- [ ] Secret `GOOGLE_MAPS_API_KEY` configuré dans Supabase
- [ ] Edge Function redéployée
- [ ] Test Web : ✅ Fonctionne
- [ ] Test Android : ✅ Fonctionne
- [ ] Test iOS (TestFlight) : ✅ Fonctionne

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs de l'Edge Function dans Supabase Dashboard
2. Vérifiez les logs de la console dans l'app
3. Consultez ce guide étape par étape
4. Contactez le support technique Yombal Yoon

## 🔗 Ressources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Expo iOS Configuration](https://docs.expo.dev/versions/latest/config/app/#bundleidentifier)

---

**Dernière mise à jour** : 2024
**Version** : 1.0
**Auteur** : Équipe Technique Yombal Yoon
