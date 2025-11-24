
# 🚀 RÉFÉRENCE RAPIDE - Google Maps API Configuration

## 📋 Informations Clés

### Identifiants de l'Application

| Plateforme | Identifiant | Valeur |
|------------|-------------|--------|
| **Android** | Package Name | `com.yombalyoon.app` |
| **iOS** | Bundle ID | `com.yombalyoon.yombalyoonapp` |
| **Web** | Referrers | `*.natively.dev/*`, `localhost/*` |

### SHA-1 Android

**Commande pour obtenir le SHA-1** :
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

---

## 🔑 Les Trois Clés API

### 1. Clé Web
- **Nom** : `Yombal Yoon - Web`
- **Type** : HTTP referrers (web sites)
- **Referrers** : 
  - `https://*.natively.dev/*`
  - `http://localhost/*`
- **APIs** :
  - ✅ Places API
  - ✅ Places API (New)
  - ✅ Geocoding API
  - ✅ Distance Matrix API
  - ✅ Maps JavaScript API (optionnel)
- **Secret Supabase** : `GOOGLE_MAPS_API_KEY_WEB`

### 2. Clé Android
- **Nom** : `Yombal Yoon - Android`
- **Type** : Android apps
- **Package** : `com.yombalyoon.app`
- **SHA-1** : [Obtenir avec keytool]
- **APIs** :
  - ✅ Places API
  - ✅ Places API (New)
  - ✅ Geocoding API
  - ✅ Distance Matrix API
  - ✅ Maps SDK for Android
- **Secret Supabase** : `GOOGLE_MAPS_API_KEY_ANDROID`

### 3. Clé iOS
- **Nom** : `Yombal Yoon - iOS`
- **Type** : iOS apps
- **Bundle ID** : `com.yombalyoon.yombalyoonapp`
- **APIs** :
  - ✅ Places API
  - ✅ Places API (New)
  - ✅ Geocoding API
  - ✅ Distance Matrix API
  - ✅ Maps SDK for iOS
- **Secret Supabase** : `GOOGLE_MAPS_API_KEY_IOS`

---

## 🔗 Liens Rapides

### Google Cloud Console
- **Credentials** : https://console.cloud.google.com/apis/credentials
- **API Library** : https://console.cloud.google.com/apis/library
- **Billing** : https://console.cloud.google.com/billing
- **Quotas** : https://console.cloud.google.com/apis/api/places-backend.googleapis.com/quotas

### Supabase
- **Secrets** : https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/settings/functions
- **Edge Functions** : https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/functions

---

## ⚡ Commandes Rapides

### Obtenir le SHA-1 (Debug)
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Obtenir le SHA-1 (Release)
```bash
keytool -list -v -keystore /chemin/vers/keystore.jks -alias votre-alias
```

### Ajouter les secrets Supabase
```bash
# Via Supabase CLI (si installé)
supabase secrets set GOOGLE_MAPS_API_KEY_WEB="AIza..."
supabase secrets set GOOGLE_MAPS_API_KEY_ANDROID="AIza..."
supabase secrets set GOOGLE_MAPS_API_KEY_IOS="AIza..."
```

### Lister les secrets
```bash
supabase secrets list
```

### Redéployer l'Edge Function
```bash
supabase functions deploy google-places-proxy
```

### Voir les logs
```bash
supabase functions logs google-places-proxy --follow
```

---

## 🧪 Tests Rapides

### Test Web (curl)
```bash
curl "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Dakar&key=VOTRE_CLE_WEB"
```

**Résultat attendu** : `"status": "OK"`

### Test Android/iOS (curl)
```bash
curl "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Dakar&key=VOTRE_CLE_ANDROID"
```

**Résultat attendu** : `"status": "REQUEST_DENIED"` (normal, car restreint aux apps)

---

## 🔧 Dépannage Express

| Erreur | Solution Rapide |
|--------|-----------------|
| "Configuration API requise" | Vérifier les secrets Supabase + redéployer |
| "REQUEST_DENIED" | Vérifier les restrictions dans Google Cloud Console |
| Pas d'autocomplétion | Vérifier les logs : `supabase functions logs google-places-proxy` |
| "OVER_QUERY_LIMIT" | Vérifier la facturation + quotas |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `GOOGLE_MAPS_API_RESET_GUIDE.md` | Guide complet (⭐ À LIRE EN PREMIER) |
| `GOOGLE_MAPS_IMMEDIATE_ACTIONS.md` | Checklist rapide |
| `GOOGLE_CLOUD_CONSOLE_VISUAL_GUIDE.md` | Guide visuel avec captures |
| `GOOGLE_MAPS_CONFIGURATION_SUMMARY.md` | Résumé de la configuration |
| `GOOGLE_MAPS_QUICK_REFERENCE.md` | Cette référence rapide |

---

## ✅ Checklist Ultra-Rapide

### Google Cloud Console
- [ ] 3 clés créées
- [ ] Restrictions configurées
- [ ] APIs activées
- [ ] Facturation active

### Supabase
- [ ] 3 secrets ajoutés
- [ ] Edge Function redéployée

### Tests
- [ ] Web ✅
- [ ] Android ✅
- [ ] iOS ✅

---

**Dernière mise à jour** : 2025-01-23  
**Version** : 1.0
