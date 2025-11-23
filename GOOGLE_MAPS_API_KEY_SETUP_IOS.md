
# 🔑 Configuration Clé API Google Maps pour iOS - Guide Rapide

## 🎯 Objectif

Configurer une clé API Google Maps spécifique pour iOS afin que l'autocomplétion fonctionne sur TestFlight.

## ⚡ Configuration Rapide (5 minutes)

### 1️⃣ Créer la clé API iOS

1. Allez sur: https://console.cloud.google.com/apis/credentials
2. Cliquez sur `+ CREATE CREDENTIALS` → `API key`
3. Copiez la clé générée (vous en aurez besoin à l'étape 3)

### 2️⃣ Configurer les restrictions

1. Cliquez sur la clé que vous venez de créer
2. Dans `Application restrictions`:
   - Sélectionnez `iOS apps`
   - Cliquez sur `ADD AN ITEM`
   - Entrez: `com.yombalyoon.yombalyoonapp`
   - Cliquez sur `DONE`
3. Dans `API restrictions`:
   - Sélectionnez `Restrict key`
   - Cochez:
     - ✅ Places API
     - ✅ Places API (New)
     - ✅ Geocoding API
     - ✅ Distance Matrix API
4. Cliquez sur `SAVE`

### 3️⃣ Ajouter la clé dans Supabase

1. Allez sur: https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/settings/functions
2. Dans la section `Secrets`, cliquez sur `Add new secret`
3. Entrez:
   - **Name**: `GOOGLE_MAPS_API_KEY_IOS`
   - **Value**: Votre clé API iOS (copiée à l'étape 1.3)
4. Cliquez sur `Save`

### 4️⃣ Redéployer l'Edge Function

Depuis votre terminal:

```bash
# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref drxtaxepofuoelplgrei

# Redéployer la fonction
supabase functions deploy google-places-proxy
```

### 5️⃣ Tester sur TestFlight

1. Ouvrez l'app Yombal Yoon sur iPhone
2. Allez dans `Envoi de Colis`
3. Tapez dans "Adresse de départ"
4. Vérifiez que les suggestions apparaissent

## ✅ Vérification

Sous le champ de saisie, vous devriez voir:

```
🔧 Debug Info:
Platform: ios
Status: OK
Time: 234ms
Predictions: 5

✅ API fonctionne correctement
```

## ❌ En cas d'erreur

Si vous voyez `Status: REQUEST_DENIED`:

1. Vérifiez que le Bundle ID est correct: `com.yombalyoon.yombalyoonapp`
2. Vérifiez que les APIs sont activées (Places, Geocoding, Distance Matrix)
3. Attendez 5 minutes (propagation des changements Google Cloud)
4. Redéployez l'Edge Function

## 📞 Besoin d'aide ?

Consultez le guide complet: `IOS_TESTFLIGHT_AUTOCOMPLETE_FIX.md`

---

**Temps estimé**: 5 minutes  
**Difficulté**: Facile  
**Prérequis**: Accès Google Cloud Console + Accès Supabase Dashboard
