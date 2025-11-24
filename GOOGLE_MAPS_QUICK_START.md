
# 🚀 GUIDE RAPIDE - Configuration Google Maps API

## ⚡ Configuration en 5 minutes

### 1️⃣ Créer les clés Google Cloud (5 min)

```
📍 https://console.cloud.google.com/apis/credentials

➕ CREATE CREDENTIALS > API key (x3)

🌐 Clé Web:
   - Restrictions: HTTP referrers
   - Référents: *.natively.dev/*, localhost/*
   - APIs: Places, Geocoding, Distance Matrix

🤖 Clé Android:
   - Restrictions: Android apps
   - Package: com.yombalyoon.app
   - SHA-1: (demander à Natively)
   - APIs: Places, Geocoding, Distance Matrix, Maps SDK

🍎 Clé iOS:
   - Restrictions: iOS apps
   - Bundle ID: com.yombalyoon.yombalyoonapp
   - APIs: Places, Geocoding, Distance Matrix, Maps SDK
```

### 2️⃣ Configurer Supabase (2 min)

```
📍 https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/settings/functions

➕ Add secret (x3):

1. GOOGLE_MAPS_API_KEY_WEB = [votre clé web]
2. GOOGLE_MAPS_API_KEY_ANDROID = [votre clé android]
3. GOOGLE_MAPS_API_KEY_IOS = [votre clé ios]

💾 Save
```

### 3️⃣ Redéployer (automatique)

```
✅ L'Edge Function sera automatiquement redéployée par Natively
⏱️ Attendre 2-3 minutes
```

### 4️⃣ Tester (1 min)

```
📱 Ouvrir l'app
📦 Aller dans "Envoyer un colis"
✍️ Taper "Plateau" dans "Adresse de départ"
✅ Vérifier que les suggestions apparaissent
```

---

## 🔑 Informations importantes

### Package names / Bundle IDs

```
Android: com.yombalyoon.app
iOS:     com.yombalyoon.yombalyoonapp
```

### APIs à activer

```
✅ Places API
✅ Geocoding API
✅ Distance Matrix API
✅ Maps SDK for Android (clé Android)
✅ Maps SDK for iOS (clé iOS)
```

### Référents Web

```
https://*.natively.dev/*
http://localhost/*
```

---

## 🚨 Problèmes courants

### "REQUEST_DENIED"
```
❌ Cause: Restrictions incorrectes
✅ Solution: Vérifier package name / Bundle ID / Référents
⏱️ Attendre 5-10 min après modification
```

### "Clé API non configurée"
```
❌ Cause: Secret Supabase manquant
✅ Solution: Ajouter le secret et redéployer
```

### "ZERO_RESULTS"
```
❌ Cause: Adresse trop vague
✅ Solution: Utiliser des noms de lieux connus
```

---

## 📚 Documentation complète

- **Configuration détaillée:** `GOOGLE_MAPS_API_KEYS_SETUP.md`
- **Vérification:** `VERIFICATION_GOOGLE_MAPS_SETUP.md`
- **Dépannage:** `GOOGLE_MAPS_FIX_GUIDE.md`

---

## ✅ Checklist

- [ ] 3 clés créées dans Google Cloud Console
- [ ] Restrictions configurées pour chaque clé
- [ ] APIs activées
- [ ] 3 secrets ajoutés dans Supabase
- [ ] Edge Function redéployée
- [ ] Autocomplétion testée sur Web
- [ ] Autocomplétion testée sur Android
- [ ] Autocomplétion testée sur iOS

---

**Configuration terminée!** 🎉

L'application utilise maintenant les clés Google Maps API de manière sécurisée.
