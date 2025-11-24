
# CONFIGURATION DES CLÉS GOOGLE MAPS API - YOMBAL YOON

## 📋 Vue d'ensemble

L'application Yombal Yoon utilise **trois clés Google Maps API distinctes** pour chaque plateforme (Web, Android, iOS). Cette approche garantit une sécurité maximale en appliquant des restrictions spécifiques à chaque plateforme.

## 🔑 Les 3 clés API requises

### 1. GOOGLE_MAPS_API_KEY_WEB
**Type:** Sites Web  
**Restrictions d'application:**
- Type: HTTP referrers (web sites)
- Référents autorisés:
  - `https://*.natively.dev/*`
  - `http://localhost/*`

**APIs activées:**
- ✅ Places API
- ✅ Geocoding API
- ✅ Distance Matrix API
- ✅ Maps JavaScript API (optionnel)

### 2. GOOGLE_MAPS_API_KEY_ANDROID
**Type:** Applications Android  
**Restrictions d'application:**
- Type: Android apps
- Package name: `com.yombalyoon.app`
- SHA-1: (empreinte fournie par keytool / Natively)

**APIs activées:**
- ✅ Places API
- ✅ Geocoding API
- ✅ Distance Matrix API
- ✅ Maps SDK for Android

### 3. GOOGLE_MAPS_API_KEY_IOS
**Type:** Applications iOS  
**Restrictions d'application:**
- Type: iOS apps
- Bundle ID: `com.yombalyoon.yombalyoonapp`

**APIs activées:**
- ✅ Places API
- ✅ Geocoding API
- ✅ Distance Matrix API
- ✅ Maps SDK for iOS

---

## 🛠️ ÉTAPE 1: Créer les clés dans Google Cloud Console

### A. Accéder à Google Cloud Console

1. Allez sur: https://console.cloud.google.com/
2. Sélectionnez votre projet Yombal Yoon (ou créez-en un nouveau)
3. Dans le menu de gauche, allez à: **APIs & Services > Credentials**

### B. Créer la clé Web

1. Cliquez sur **+ CREATE CREDENTIALS** > **API key**
2. Une nouvelle clé est créée. Cliquez sur **EDIT API KEY**
3. Nommez la clé: `Yombal Yoon - Web`
4. Dans **Application restrictions**:
   - Sélectionnez: **HTTP referrers (web sites)**
   - Ajoutez les référents:
     ```
     https://*.natively.dev/*
     http://localhost/*
     ```
5. Dans **API restrictions**:
   - Sélectionnez: **Restrict key**
   - Cochez:
     - Places API
     - Geocoding API
     - Distance Matrix API
     - Maps JavaScript API (optionnel)
6. Cliquez sur **SAVE**
7. **Copiez la clé** et sauvegardez-la en sécurité

### C. Créer la clé Android

1. Cliquez sur **+ CREATE CREDENTIALS** > **API key**
2. Une nouvelle clé est créée. Cliquez sur **EDIT API KEY**
3. Nommez la clé: `Yombal Yoon - Android`
4. Dans **Application restrictions**:
   - Sélectionnez: **Android apps**
   - Cliquez sur **ADD AN ITEM**
   - Package name: `com.yombalyoon.app`
   - SHA-1 certificate fingerprint: (voir section suivante pour obtenir le SHA-1)
5. Dans **API restrictions**:
   - Sélectionnez: **Restrict key**
   - Cochez:
     - Places API
     - Geocoding API
     - Distance Matrix API
     - Maps SDK for Android
6. Cliquez sur **SAVE**
7. **Copiez la clé** et sauvegardez-la en sécurité

### D. Créer la clé iOS

1. Cliquez sur **+ CREATE CREDENTIALS** > **API key**
2. Une nouvelle clé est créée. Cliquez sur **EDIT API KEY**
3. Nommez la clé: `Yombal Yoon - iOS`
4. Dans **Application restrictions**:
   - Sélectionnez: **iOS apps**
   - Cliquez sur **ADD AN ITEM**
   - Bundle ID: `com.yombalyoon.yombalyoonapp`
5. Dans **API restrictions**:
   - Sélectionnez: **Restrict key**
   - Cochez:
     - Places API
     - Geocoding API
     - Distance Matrix API
     - Maps SDK for iOS
6. Cliquez sur **SAVE**
7. **Copiez la clé** et sauvegardez-la en sécurité

---

## 🔐 ÉTAPE 2: Obtenir le SHA-1 pour Android

### Option A: Via Natively (Recommandé)

Natively génère automatiquement un keystore pour votre application. Pour obtenir le SHA-1:

1. Contactez le support Natively
2. Demandez le SHA-1 fingerprint pour votre application
3. Utilisez ce SHA-1 dans la configuration de la clé Android

### Option B: Via keytool (si vous avez le keystore)

Si vous avez accès au fichier keystore:

```bash
keytool -v -list -keystore your_keystore_name.keystore -alias your_alias_name
```

Le SHA-1 sera affiché dans la sortie sous la forme:
```
SHA1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
```

---

## ☁️ ÉTAPE 3: Configurer les secrets Supabase

### A. Accéder à Supabase Dashboard

1. Allez sur: https://supabase.com/dashboard
2. Sélectionnez votre projet: `drxtaxepofuoelplgrei`
3. Dans le menu de gauche, allez à: **Project Settings > Edge Functions**

### B. Ajouter les secrets

1. Cliquez sur **Add secret**
2. Ajoutez les 3 secrets suivants:

**Secret 1:**
- Name: `GOOGLE_MAPS_API_KEY_WEB`
- Value: (collez votre clé Web créée à l'étape 1B)

**Secret 2:**
- Name: `GOOGLE_MAPS_API_KEY_ANDROID`
- Value: (collez votre clé Android créée à l'étape 1C)

**Secret 3:**
- Name: `GOOGLE_MAPS_API_KEY_IOS`
- Value: (collez votre clé iOS créée à l'étape 1D)

3. Cliquez sur **Save** pour chaque secret

### C. Redéployer l'Edge Function

⚠️ **IMPORTANT:** Les secrets ne sont disponibles qu'après un redéploiement de l'Edge Function.

L'Edge Function `google-places-proxy` est déjà configurée pour utiliser ces secrets. Elle sera automatiquement redéployée par Natively lors de la prochaine mise à jour.

---

## ✅ ÉTAPE 4: Vérifier la configuration

### A. Vérifier les secrets Supabase

1. Dans Supabase Dashboard > Edge Functions
2. Vérifiez que les 3 secrets sont présents:
   - ✅ GOOGLE_MAPS_API_KEY_WEB
   - ✅ GOOGLE_MAPS_API_KEY_ANDROID
   - ✅ GOOGLE_MAPS_API_KEY_IOS

### B. Tester l'autocomplétion

1. **Sur Web:**
   - Ouvrez l'application dans un navigateur
   - Allez dans "Envoyer un colis"
   - Tapez une adresse dans le champ "Adresse de départ"
   - Vérifiez que les suggestions apparaissent

2. **Sur Android:**
   - Ouvrez l'application sur un appareil Android
   - Allez dans "Envoyer un colis"
   - Tapez une adresse dans le champ "Adresse de départ"
   - Vérifiez que les suggestions apparaissent

3. **Sur iOS:**
   - Ouvrez l'application sur un appareil iOS
   - Allez dans "Envoyer un colis"
   - Tapez une adresse dans le champ "Adresse de départ"
   - Vérifiez que les suggestions apparaissent

### C. Vérifier les logs

1. Dans Supabase Dashboard, allez à: **Edge Functions > google-places-proxy > Logs**
2. Vérifiez les logs pour voir si les clés sont correctement chargées:
   ```
   ✅ Clé API web chargée avec succès
   ✅ Clé API android chargée avec succès
   ✅ Clé API ios chargée avec succès
   ```

---

## 🔍 Architecture technique

### Comment ça fonctionne?

1. **Client (App)** → Envoie une requête à l'Edge Function avec le header `x-platform`
2. **Edge Function** → Détecte la plateforme (web/android/ios)
3. **Edge Function** → Sélectionne la clé API appropriée depuis les secrets Supabase
4. **Edge Function** → Appelle l'API Google Maps avec la clé appropriée
5. **Edge Function** → Retourne les résultats au client

### Fichiers concernés

- **Edge Function:** `supabase/functions/google-places-proxy/index.ts`
- **Composants:**
  - `components/AddressAutocomplete.tsx` (Envoi de colis)
  - `components/CityAutocomplete.tsx` (Covoiturage)
  - `components/DestinationAutocomplete.tsx` (Livraison inter-régionale)
- **Contextes:**
  - `contexts/ColisContext.tsx` (Calcul de distance)
  - `contexts/LivraisonContext.tsx` (Notifications)

### Flux de données

```
┌─────────────────┐
│   App (Client)  │
│  Platform: iOS  │
└────────┬────────┘
         │ x-platform: ios
         ▼
┌─────────────────────────────────┐
│  Edge Function                  │
│  google-places-proxy            │
│                                 │
│  if (platform === 'ios')        │
│    key = GOOGLE_MAPS_API_KEY_IOS│
│  else if (platform === 'android')│
│    key = GOOGLE_MAPS_API_KEY_ANDROID│
│  else                           │
│    key = GOOGLE_MAPS_API_KEY_WEB│
└────────┬────────────────────────┘
         │ key = AIza...
         ▼
┌─────────────────┐
│  Google Maps    │
│  Places API     │
└─────────────────┘
```

---

## 🚨 Dépannage

### Problème: "REQUEST_DENIED"

**Cause:** La clé API n'est pas correctement configurée pour la plateforme.

**Solution:**
1. Vérifiez que la clé existe dans Google Cloud Console
2. Vérifiez les restrictions d'application:
   - **Web:** HTTP referrers corrects
   - **Android:** Package name et SHA-1 corrects
   - **iOS:** Bundle ID correct
3. Vérifiez que les APIs sont activées
4. Attendez 5-10 minutes après la modification (propagation)

### Problème: "Clé API non configurée"

**Cause:** Le secret Supabase n'est pas défini ou l'Edge Function n'a pas été redéployée.

**Solution:**
1. Vérifiez que les secrets existent dans Supabase Dashboard
2. Redéployez l'Edge Function
3. Attendez quelques minutes et réessayez

### Problème: Autocomplétion ne fonctionne pas

**Cause:** Plusieurs causes possibles.

**Solution:**
1. Vérifiez votre connexion internet
2. Vérifiez les logs de l'Edge Function dans Supabase
3. Vérifiez que les APIs sont activées dans Google Cloud Console
4. Vérifiez que vous n'avez pas dépassé les quotas Google Maps

---

## 📊 Quotas et facturation

### Quotas gratuits Google Maps

- **Places API:** 0-100,000 requêtes/mois gratuit
- **Geocoding API:** 0-40,000 requêtes/mois gratuit
- **Distance Matrix API:** 0-40,000 éléments/mois gratuit

### Surveillance des quotas

1. Allez dans Google Cloud Console
2. Menu: **APIs & Services > Dashboard**
3. Sélectionnez chaque API pour voir l'utilisation

### Alertes de quota

Configurez des alertes pour être notifié avant d'atteindre les limites:
1. Google Cloud Console > **Billing > Budgets & alerts**
2. Créez un budget avec des alertes à 50%, 75%, 90%

---

## 🔒 Sécurité

### Bonnes pratiques

✅ **À FAIRE:**
- Utiliser des clés API distinctes par plateforme
- Appliquer des restrictions strictes sur chaque clé
- Stocker les clés dans Supabase Secrets (jamais dans le code)
- Surveiller l'utilisation des APIs
- Configurer des alertes de quota

❌ **À NE PAS FAIRE:**
- Utiliser la même clé pour toutes les plateformes
- Exposer les clés dans le code source
- Partager les clés publiquement
- Désactiver les restrictions d'API

### Rotation des clés

Si une clé est compromise:
1. Créez une nouvelle clé dans Google Cloud Console
2. Mettez à jour le secret Supabase correspondant
3. Redéployez l'Edge Function
4. Désactivez l'ancienne clé après vérification

---

## 📞 Support

### Ressources

- **Documentation Google Maps:** https://developers.google.com/maps/documentation
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Support Natively:** (contactez votre support Natively)

### Logs utiles

Pour déboguer, consultez:
1. **Logs Edge Function:** Supabase Dashboard > Edge Functions > Logs
2. **Logs App:** Console du navigateur (Web) ou Logcat (Android) ou Console (iOS)
3. **Logs Google Cloud:** Google Cloud Console > Logging

---

## ✨ Résumé

1. ✅ Créez 3 clés API dans Google Cloud Console (Web, Android, iOS)
2. ✅ Configurez les restrictions appropriées pour chaque clé
3. ✅ Ajoutez les clés comme secrets Supabase
4. ✅ Redéployez l'Edge Function
5. ✅ Testez l'autocomplétion sur chaque plateforme
6. ✅ Surveillez les quotas et l'utilisation

**L'application est maintenant configurée pour utiliser les clés Google Maps API de manière sécurisée sur toutes les plateformes!** 🎉
