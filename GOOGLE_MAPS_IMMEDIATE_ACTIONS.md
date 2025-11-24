
# ⚡ ACTIONS IMMÉDIATES - Configuration Google Maps API

## 🎯 Résumé Exécutif

Ce document liste les actions immédiates à effectuer pour configurer correctement les clés Google Maps API pour Yombal Yoon.

**Temps estimé** : 30-45 minutes

---

## ✅ CHECKLIST RAPIDE

### 1️⃣ Google Cloud Console (15 min)

#### Clé Web
- [ ] Créer une nouvelle clé API
- [ ] Nom : `Yombal Yoon - Web`
- [ ] Type : HTTP referrers
- [ ] Referrers : `*.natively.dev/*`, `localhost/*`
- [ ] APIs : Places API, Geocoding API, Distance Matrix API
- [ ] Copier la clé : `AIza...`

#### Clé Android
- [ ] Obtenir le SHA-1 : `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
- [ ] Créer une nouvelle clé API
- [ ] Nom : `Yombal Yoon - Android`
- [ ] Type : Android apps
- [ ] Package : `com.yombalyoon.app`
- [ ] SHA-1 : [Votre SHA-1]
- [ ] APIs : Places API, Geocoding API, Distance Matrix API, Maps SDK for Android
- [ ] Copier la clé : `AIza...`

#### Clé iOS
- [ ] Créer une nouvelle clé API
- [ ] Nom : `Yombal Yoon - iOS`
- [ ] Type : iOS apps
- [ ] Bundle ID : `com.yombalyoon.yombalyoonapp`
- [ ] APIs : Places API, Geocoding API, Distance Matrix API, Maps SDK for iOS
- [ ] Copier la clé : `AIza...`

### 2️⃣ Supabase Secrets (5 min)

URL : https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/settings/functions

- [ ] Ajouter secret : `GOOGLE_MAPS_API_KEY_WEB` = [Clé Web]
- [ ] Ajouter secret : `GOOGLE_MAPS_API_KEY_ANDROID` = [Clé Android]
- [ ] Ajouter secret : `GOOGLE_MAPS_API_KEY_IOS` = [Clé iOS]

### 3️⃣ Déploiement (5 min)

```bash
# Redéployer l'Edge Function avec les nouvelles clés
supabase functions deploy google-places-proxy
```

### 4️⃣ Tests (10 min)

- [ ] Test Web : Ouvrir l'app dans un navigateur, tester l'autocomplétion
- [ ] Test Android : Lancer l'app sur Android, tester l'autocomplétion
- [ ] Test iOS : Lancer l'app sur iOS/TestFlight, tester l'autocomplétion

---

## 🚨 ERREURS COURANTES À ÉVITER

❌ **Ne pas faire** :
- Utiliser la même clé pour toutes les plateformes
- Oublier d'activer les APIs dans Google Cloud Console
- Oublier de redéployer l'Edge Function après avoir ajouté les secrets
- Utiliser le mauvais SHA-1 pour Android

✅ **À faire** :
- Créer trois clés distinctes avec des restrictions appropriées
- Vérifier que toutes les APIs sont activées
- Tester sur chaque plateforme après la configuration
- Documenter les clés dans un endroit sûr

---

## 📞 AIDE RAPIDE

### Problème : "Configuration API requise"
**Solution** : Vérifiez que les trois secrets sont dans Supabase et redéployez l'Edge Function

### Problème : "REQUEST_DENIED"
**Solution** : Vérifiez les restrictions de la clé dans Google Cloud Console

### Problème : L'autocomplétion ne fonctionne pas
**Solution** : Vérifiez les logs de l'Edge Function : `supabase functions logs google-places-proxy`

---

## 📚 DOCUMENTATION COMPLÈTE

Pour plus de détails, consultez : `GOOGLE_MAPS_API_RESET_GUIDE.md`

---

**Dernière mise à jour** : 2025-01-23
