
# 🔧 GUIDE DE CORRECTION - GOOGLE MAPS API

## 🚨 PROBLÈME

L'autocomplétion d'adresses ne fonctionne pas sur **Android** et **iOS** (erreur REQUEST_DENIED).

**Cause**: La clé API Google Maps a des restrictions HTTP referrer (Web uniquement).

---

## ✅ SOLUTION RAPIDE (5 minutes)

### **Étape 1: Accéder à Google Cloud Console**

1. Ouvrir [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionner le projet **Yombal Yoon**
3. Aller dans **APIs & Services** > **Credentials**

---

### **Étape 2: Modifier la clé API**

1. Cliquer sur la clé API: `AIzaSyCyIEHUEYap3t8z_lqy2tCNhHFBhYHTSHQ`
2. Dans **Application restrictions**, sélectionner **None**
3. Cliquer sur **Save**

⚠️ **ATTENTION**: Cette solution expose la clé API. À utiliser uniquement en développement.

---

### **Étape 3: Tester l'application**

1. Redémarrer l'application sur Android/iOS
2. Aller dans **Colis** > **Envoyer un colis**
3. Taper une adresse dans "Adresse de départ"
4. Vérifier que les suggestions apparaissent

---

## 🔒 SOLUTION SÉCURISÉE (Production)

### **Créer 3 clés API séparées**

#### **1. Clé pour Web**
```
Nom: Yombal Yoon - Web
Restrictions: HTTP referrers
Referrers autorisés:
  - http://localhost:*/*
  - https://yourdomain.com/*
APIs activées:
  - Places API
  - Geocoding API
  - Distance Matrix API
```

#### **2. Clé pour Android**
```
Nom: Yombal Yoon - Android
Restrictions: Android apps
Package name: com.yourcompany.yombalyoon
SHA-1: (obtenir avec keytool)
APIs activées:
  - Places API
  - Geocoding API
  - Distance Matrix API
```

#### **3. Clé pour iOS**
```
Nom: Yombal Yoon - iOS
Restrictions: iOS apps
Bundle ID: com.yourcompany.yombalyoon
APIs activées:
  - Places API
  - Geocoding API
  - Distance Matrix API
```

---

### **Configurer les clés dans Supabase**

```bash
# Configurer les secrets Supabase
supabase secrets set GOOGLE_MAPS_API_KEY_WEB=AIzaSy...
supabase secrets set GOOGLE_MAPS_API_KEY_ANDROID=AIzaSy...
supabase secrets set GOOGLE_MAPS_API_KEY_IOS=AIzaSy...
```

---

### **Modifier l'Edge Function**

Le code de l'Edge Function `google-places-proxy` doit être modifié pour utiliser la bonne clé selon la plateforme.

**Voir le fichier**: `supabase/functions/google-places-proxy/index.ts`

---

## 📱 OBTENIR LE SHA-1 (Android)

### **Pour le keystore de debug**:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### **Pour le keystore de production**:
```bash
keytool -list -v -keystore /path/to/your/keystore.jks -alias your-alias
```

---

## 🍎 OBTENIR LE BUNDLE ID (iOS)

Le Bundle ID se trouve dans `app.json`:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.yombalyoon"
    }
  }
}
```

---

## ✅ VÉRIFICATION

Après avoir appliqué la correction, vérifier que:

1. ✅ L'autocomplétion fonctionne sur **Web**
2. ✅ L'autocomplétion fonctionne sur **Android**
3. ✅ L'autocomplétion fonctionne sur **iOS**
4. ✅ Les coordonnées (lat/lng) sont récupérées correctement
5. ✅ La distance est calculée via Google Distance Matrix API
6. ✅ Le prix est calculé automatiquement

---

## 🆘 EN CAS DE PROBLÈME

### **Erreur: REQUEST_DENIED**
- Vérifier que les APIs sont activées dans Google Cloud Console
- Vérifier que la facturation est activée
- Vérifier que les restrictions correspondent à la plateforme

### **Erreur: OVER_QUERY_LIMIT**
- Vérifier le quota dans Google Cloud Console
- Augmenter le quota si nécessaire
- Implémenter un système de cache

### **Erreur: INVALID_REQUEST**
- Vérifier les paramètres de la requête
- Vérifier les logs de l'Edge Function dans Supabase

---

## 📚 DOCUMENTATION

- [Google Maps Platform - API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Places API - Autocomplete](https://developers.google.com/maps/documentation/places/web-service/autocomplete)
- [Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix/overview)
- [Supabase Edge Functions - Secrets](https://supabase.com/docs/guides/functions/secrets)

---

**Date**: 2024-01-20  
**Version**: 1.0
