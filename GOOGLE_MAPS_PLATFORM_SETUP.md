
# Configuration Google Maps API - Multi-Plateforme

## 🎯 Objectif

Configurer trois clés API Google Maps distinctes pour Web, Android et iOS afin d'assurer le bon fonctionnement de l'autocomplétion d'adresses sur toutes les plateformes.

## 📋 Vue d'ensemble

L'application Yombal Yoon nécessite **trois clés API distinctes** :

1. **GOOGLE_MAPS_API_KEY_WEB** - Pour le navigateur web
2. **GOOGLE_MAPS_API_KEY_ANDROID** - Pour l'application Android
3. **GOOGLE_MAPS_API_KEY_IOS** - Pour l'application iOS

Chaque clé doit avoir des restrictions spécifiques pour des raisons de sécurité.

---

## 🌐 PARTIE 1 : Configuration Web

### Étape 1.1 : Créer la clé API Web

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet (ou créez-en un nouveau)
3. Allez dans **APIs & Services** > **Credentials**
4. Cliquez sur **+ CREATE CREDENTIALS** > **API key**
5. Une nouvelle clé sera créée - notez-la temporairement

### Étape 1.2 : Configurer les restrictions Web

1. Cliquez sur la clé que vous venez de créer
2. Renommez-la : `Yombal Yoon - Web`
3. Dans **Application restrictions**, sélectionnez **HTTP referrers (web sites)**
4. Ajoutez les referrers suivants :
   ```
   https://*.natively.dev/*
   http://localhost/*
   http://localhost:*/*
   https://localhost/*
   https://localhost:*/*
   ```

### Étape 1.3 : Activer les APIs nécessaires

Dans **API restrictions**, sélectionnez **Restrict key** et cochez :
- ✅ Places API
- ✅ Geocoding API
- ✅ Distance Matrix API

Cliquez sur **SAVE**

### Étape 1.4 : Ajouter à Supabase

```bash
# Dans le terminal Supabase CLI
supabase secrets set GOOGLE_MAPS_API_KEY_WEB="VOTRE_CLE_API_WEB"
```

---

## 🤖 PARTIE 2 : Configuration Android

### Étape 2.1 : Obtenir le SHA-1 de votre app

Pour obtenir le SHA-1 de votre application Android :

```bash
# Pour le debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Pour le release keystore (si vous en avez un)
keytool -list -v -keystore /path/to/your/keystore.jks -alias your-alias
```

Notez le **SHA-1** qui apparaît.

### Étape 2.2 : Créer la clé API Android

1. Dans Google Cloud Console > **Credentials**
2. Cliquez sur **+ CREATE CREDENTIALS** > **API key**
3. Renommez la clé : `Yombal Yoon - Android`

### Étape 2.3 : Configurer les restrictions Android

1. Dans **Application restrictions**, sélectionnez **Android apps**
2. Cliquez sur **+ ADD AN ITEM**
3. Entrez :
   - **Package name** : `com.natively.yombalyoon` (ou votre package name)
   - **SHA-1 certificate fingerprint** : Collez le SHA-1 obtenu à l'étape 2.1

### Étape 2.4 : Activer les APIs

Dans **API restrictions**, sélectionnez **Restrict key** et cochez :
- ✅ Places API
- ✅ Geocoding API
- ✅ Distance Matrix API

Cliquez sur **SAVE**

### Étape 2.5 : Ajouter à Supabase

```bash
supabase secrets set GOOGLE_MAPS_API_KEY_ANDROID="VOTRE_CLE_API_ANDROID"
```

---

## 🍎 PARTIE 3 : Configuration iOS

### Étape 3.1 : Obtenir le Bundle ID

Le Bundle ID de votre app iOS se trouve dans :
- Expo : `app.json` → `expo.ios.bundleIdentifier`
- Exemple : `com.natively.yombalyoon`

### Étape 3.2 : Créer la clé API iOS

1. Dans Google Cloud Console > **Credentials**
2. Cliquez sur **+ CREATE CREDENTIALS** > **API key**
3. Renommez la clé : `Yombal Yoon - iOS`

### Étape 3.3 : Configurer les restrictions iOS

1. Dans **Application restrictions**, sélectionnez **iOS apps**
2. Cliquez sur **+ ADD AN ITEM**
3. Entrez votre **Bundle ID** : `com.natively.yombalyoon`

### Étape 3.4 : Activer les APIs

Dans **API restrictions**, sélectionnez **Restrict key** et cochez :
- ✅ Places API
- ✅ Geocoding API
- ✅ Distance Matrix API

Cliquez sur **SAVE**

### Étape 3.5 : Ajouter à Supabase

```bash
supabase secrets set GOOGLE_MAPS_API_KEY_IOS="VOTRE_CLE_API_IOS"
```

---

## 🚀 PARTIE 4 : Déploiement

### Étape 4.1 : Vérifier les secrets

```bash
# Lister tous les secrets configurés
supabase secrets list
```

Vous devriez voir :
- ✅ GOOGLE_MAPS_API_KEY_WEB
- ✅ GOOGLE_MAPS_API_KEY_ANDROID
- ✅ GOOGLE_MAPS_API_KEY_IOS

### Étape 4.2 : Redéployer l'Edge Function

```bash
# Redéployer la fonction google-places-proxy
supabase functions deploy google-places-proxy
```

### Étape 4.3 : Tester chaque plateforme

#### Test Web
1. Ouvrez l'app dans un navigateur
2. Allez dans "Envoi de colis"
3. Tapez une adresse dans le champ "Adresse de départ"
4. Vérifiez que l'autocomplétion fonctionne

#### Test Android
1. Lancez l'app sur un appareil/émulateur Android
2. Allez dans "Envoi de colis"
3. Tapez une adresse
4. Vérifiez l'autocomplétion

#### Test iOS
1. Lancez l'app sur un appareil/simulateur iOS (ou TestFlight)
2. Allez dans "Envoi de colis"
3. Tapez une adresse
4. Vérifiez l'autocomplétion

---

## 🔍 Dépannage

### Problème : "Configuration API requise"

**Cause** : La clé API pour cette plateforme n'est pas configurée dans Supabase

**Solution** :
1. Vérifiez que vous avez bien ajouté le secret : `supabase secrets list`
2. Si manquant, ajoutez-le : `supabase secrets set GOOGLE_MAPS_API_KEY_XXX="votre_cle"`
3. Redéployez : `supabase functions deploy google-places-proxy`

### Problème : "REQUEST_DENIED" de Google Maps

**Cause** : Les restrictions de la clé API ne correspondent pas à votre app

**Solutions** :

#### Pour Web :
- Vérifiez que les HTTP referrers incluent `*.natively.dev/*`
- Ajoutez `localhost` pour les tests locaux

#### Pour Android :
- Vérifiez que le package name est correct
- Vérifiez que le SHA-1 correspond à votre keystore
- Pour le debug, utilisez le SHA-1 du debug keystore

#### Pour iOS :
- Vérifiez que le Bundle ID est correct
- Assurez-vous qu'il correspond exactement à celui dans `app.json`

### Problème : L'autocomplétion ne fonctionne que sur une plateforme

**Cause** : Une seule clé API est configurée avec des restrictions trop strictes

**Solution** :
- Créez trois clés API distinctes (une par plateforme)
- Configurez les restrictions appropriées pour chaque clé
- Ajoutez les trois clés aux secrets Supabase
- Redéployez l'Edge Function

---

## 📊 Récapitulatif des restrictions

| Plateforme | Type de restriction | Valeur |
|------------|---------------------|--------|
| **Web** | HTTP referrers | `*.natively.dev/*`, `localhost/*` |
| **Android** | Android apps | Package name + SHA-1 |
| **iOS** | iOS apps | Bundle ID |

---

## ✅ Checklist finale

- [ ] Clé API Web créée et configurée
- [ ] Clé API Android créée et configurée
- [ ] Clé API iOS créée et configurée
- [ ] Les 3 APIs activées pour chaque clé (Places, Geocoding, Distance Matrix)
- [ ] Les 3 secrets ajoutés à Supabase
- [ ] Edge Function redéployée
- [ ] Test Web réussi
- [ ] Test Android réussi
- [ ] Test iOS réussi

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs de l'Edge Function :
   ```bash
   supabase functions logs google-places-proxy
   ```

2. Vérifiez les logs dans l'app (console du navigateur ou logs natifs)

3. Consultez les autres guides :
   - `WEB_API_KEY_SETUP_GUIDE.md`
   - `IOS_API_KEY_SETUP_GUIDE.md`
   - `ANDROID_AUTOCOMPLETE_FIX.md`

---

## 🔐 Sécurité

**Important** : Ne partagez jamais vos clés API publiquement !

- ✅ Les clés sont stockées en sécurité dans Supabase Secrets
- ✅ Les restrictions limitent l'utilisation aux apps autorisées
- ✅ L'Edge Function agit comme proxy pour protéger les clés
- ❌ Ne commitez jamais les clés dans Git
- ❌ Ne les incluez pas dans le code client

---

**Date de création** : 2025-01-23
**Dernière mise à jour** : 2025-01-23
**Version** : 1.0
