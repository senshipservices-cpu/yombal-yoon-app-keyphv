
# 🚀 Fix Rapide : Autocomplétion Web + Android

## 🎯 Objectif
Faire fonctionner l'autocomplétion d'adresses sur **Web** et **Android** (iOS fonctionne déjà).

---

## ⚡ Solution en 3 étapes (15 minutes)

### 1️⃣ Créer 2 clés API Google Maps

#### Clé Web (5 min)
```
1. https://console.cloud.google.com/apis/credentials
2. + CREATE CREDENTIALS > API key
3. Cliquez sur la clé > Nom: "Yombal Yoon - Web"
4. Application restrictions: HTTP referrers
   - Ajoutez: https://*.natively.dev/*
   - Ajoutez: http://localhost/*
5. API restrictions: Restrict key
   - ✅ Places API
   - ✅ Geocoding API
   - ✅ Distance Matrix API
6. SAVE
7. Copiez la clé
```

#### Clé Android (5 min)
```bash
# Obtenez le SHA-1
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
# Copiez le SHA-1 affiché
```

```
1. https://console.cloud.google.com/apis/credentials
2. + CREATE CREDENTIALS > API key
3. Cliquez sur la clé > Nom: "Yombal Yoon - Android"
4. Application restrictions: Android apps
   - Package name: com.natively.yombalyoon
   - SHA-1: [Collez le SHA-1 obtenu]
5. API restrictions: Restrict key
   - ✅ Places API
   - ✅ Geocoding API
   - ✅ Distance Matrix API
6. SAVE
7. Copiez la clé
```

### 2️⃣ Ajouter les clés à Supabase (2 min)

```bash
# Clé Web
supabase secrets set GOOGLE_MAPS_API_KEY_WEB="VOTRE_CLE_WEB"

# Clé Android
supabase secrets set GOOGLE_MAPS_API_KEY_ANDROID="VOTRE_CLE_ANDROID"

# Vérifier
supabase secrets list
```

Vous devriez voir 3 clés :
- ✅ GOOGLE_MAPS_API_KEY_WEB
- ✅ GOOGLE_MAPS_API_KEY_ANDROID
- ✅ GOOGLE_MAPS_API_KEY_IOS

### 3️⃣ Redéployer (1 min)

```bash
supabase functions deploy google-places-proxy
```

---

## ✅ Tester

### Web
```
1. Ouvrez l'app dans Chrome
2. Envoi de colis > Tapez "Plateau"
3. ✅ Autocomplétion fonctionne
```

### Android
```
1. Lancez l'app Android
2. Envoi de colis > Tapez "Plateau"
3. ✅ Autocomplétion fonctionne
```

### iOS
```
1. Lancez l'app iOS
2. Envoi de colis > Tapez "Plateau"
3. ✅ Autocomplétion fonctionne toujours
```

---

## 🔍 Dépannage

### ❌ "Configuration API Web requise"
```bash
# La clé Web n'est pas dans Supabase
supabase secrets set GOOGLE_MAPS_API_KEY_WEB="votre_cle"
supabase functions deploy google-places-proxy
```

### ❌ "REQUEST_DENIED" sur Web
```
Les HTTP referrers ne sont pas configurés
→ Ajoutez *.natively.dev/* dans Google Cloud Console
```

### ❌ "REQUEST_DENIED" sur Android
```
Le SHA-1 ou package name est incorrect
→ Vérifiez avec: keytool -list -v -keystore ~/.android/debug.keystore
→ Vérifiez le package dans app.json
```

### ❌ Rien ne fonctionne
```bash
# Vérifiez les secrets
supabase secrets list

# Vérifiez les logs
supabase functions logs google-places-proxy --follow

# Redéployez
supabase functions deploy google-places-proxy
```

---

## 📊 Récapitulatif

| Plateforme | Secret | Restriction |
|------------|--------|-------------|
| Web | `GOOGLE_MAPS_API_KEY_WEB` | HTTP referrers: `*.natively.dev/*` |
| Android | `GOOGLE_MAPS_API_KEY_ANDROID` | Package + SHA-1 |
| iOS | `GOOGLE_MAPS_API_KEY_IOS` | Bundle ID (déjà fait) |

---

## 📚 Guides détaillés

- **WEB_ANDROID_API_FIX.md** - Guide détaillé avec captures
- **GOOGLE_MAPS_PLATFORM_SETUP.md** - Guide complet multi-plateforme
- **ACTION_IMMEDIATE_WEB_ANDROID.md** - Résumé de la correction

---

**Temps total** : 15 minutes
**Difficulté** : ⭐⭐ Facile
**Prérequis** : Accès Google Cloud + Supabase CLI

---

**✅ Code déployé - ⏳ Configuration API requise**
