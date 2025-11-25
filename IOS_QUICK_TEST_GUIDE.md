
# 🚀 GUIDE DE TEST RAPIDE - iOS AUTOCOMPLÉTION

## ⚡ TEST EN 5 MINUTES

### 1️⃣ Préparer (1 min)

```bash
# Créer le build iOS
eas build --platform ios --profile production
```

### 2️⃣ Installer (1 min)

1. Ouvrir TestFlight sur iPhone
2. Installer la nouvelle version
3. Ouvrir Yombal Yoon

### 3️⃣ Activer les Logs (1 min)

**Mac + iPhone:**
1. Connecter iPhone au Mac
2. Ouvrir Xcode
3. Window → Devices and Simulators
4. Sélectionner iPhone → Open Console
5. Filtrer: `AddressAutocomplete`

### 4️⃣ Tester (2 min)

1. Ouvrir "Envoyer un colis"
2. Taper dans "Adresse de départ": **plateau**
3. **Attendre 1 seconde**
4. Observer:
   - ✅ **Succès:** Suggestions apparaissent
   - ❌ **Erreur:** Alerte iOS + logs rouges

---

## 🔍 QUE CHERCHER DANS LES LOGS

### ✅ Succès (Comportement Attendu)

```
═══════════════════════════════════════════════════════
[AddressAutocomplete] 🔍 FETCHING PREDICTIONS
[AddressAutocomplete] 📱 Platform: ios
[AddressAutocomplete] 📝 Input: "plateau"
═══════════════════════════════════════════════════════
[AddressAutocomplete] ⏱️  Response Time: 850ms
[AddressAutocomplete] 📱 Platform: ios
───────────────────────────────────────────────────────
✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅
[AddressAutocomplete] ✅ API RESPONSE RECEIVED
[AddressAutocomplete] 📱 Platform: ios
[AddressAutocomplete] 📊 Status: OK
[AddressAutocomplete] ✅ Found 8 predictions (ios)
[AddressAutocomplete] 📍 First prediction: Plateau
✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅
```

**→ TOUT FONCTIONNE! ✅**

---

### ❌ Erreur: REQUEST_DENIED

```
❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌
[AddressAutocomplete] ❌ REQUEST_DENIED (ios)
[AddressAutocomplete] 💬 Error Message: The provided API key is invalid
❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌
```

**→ PROBLÈME: Clé API Google Maps**

**Solution Rapide:**

```bash
# 1. Vérifier les secrets Supabase
supabase secrets list

# 2. Ajouter/Mettre à jour la clé serveur
supabase secrets set GOOGLE_MAPS_API_KEY_SERVER=AIza...

# 3. Redéployer l'Edge Function
supabase functions deploy google-places-proxy

# 4. Attendre 1 minute

# 5. Re-tester sur iPhone
```

---

### ❌ Erreur: Supabase Function Error

```
❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌
[AddressAutocomplete] ❌ SUPABASE FUNCTION ERROR
[AddressAutocomplete] 📱 Platform: ios
[AddressAutocomplete] 💬 Error Message: Failed to fetch
❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌
```

**→ PROBLÈME: Connexion ou Edge Function**

**Solution Rapide:**

```bash
# 1. Vérifier l'Edge Function
supabase functions list
# Doit afficher: google-places-proxy (ACTIVE)

# 2. Si absente, déployer
supabase functions deploy google-places-proxy

# 3. Tester manuellement
curl -X POST https://drxtaxepofuoelplgrei.supabase.co/functions/v1/google-places-proxy \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"action":"autocomplete","input":"plateau"}'

# 4. Re-tester sur iPhone
```

---

### ❌ Erreur: Exception

```
💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥
[AddressAutocomplete] 💥 EXCEPTION (ios)
[AddressAutocomplete] 💬 Message: Network request failed
💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥
```

**→ PROBLÈME: Réseau ou Bug**

**Solution Rapide:**

1. Vérifier la connexion WiFi/4G de l'iPhone
2. Redémarrer l'app
3. Re-tester
4. Si persiste: Copier les logs complets et partager

---

## 📊 COMPARAISON RAPIDE

| Plateforme | Logs Attendus | UI Attendue |
|------------|---------------|-------------|
| **Web** | `Platform: web` | Suggestions apparaissent |
| **Android** | `Platform: android` | Suggestions apparaissent |
| **iOS** | `Platform: ios` | Suggestions apparaissent |

**→ Les 3 doivent être IDENTIQUES (sauf la plateforme dans les logs)**

---

## ✅ CHECKLIST RAPIDE

- [ ] Build iOS créé
- [ ] App installée sur iPhone
- [ ] Console Xcode ouverte
- [ ] Filtre `AddressAutocomplete` activé
- [ ] Test "plateau" effectué
- [ ] Logs verts (✅) ou rouges (❌) visibles
- [ ] Suggestions apparaissent (ou erreur identifiée)

---

## 🆘 EN CAS DE PROBLÈME

### Copier ces informations:

1. **Logs complets** de la console (tout le bloc ═══...═══)
2. **Capture d'écran** de l'alerte iOS
3. **Modèle iPhone** (ex: iPhone 14 Pro)
4. **Version iOS** (ex: iOS 17.2)
5. **Build number** (visible dans TestFlight)

### Partager avec:

- L'équipe de développement
- Le canal Slack #yombal-yoon-bugs
- Email: dev@yombalyoon.com

---

## 🎯 OBJECTIF

**iOS doit fonctionner EXACTEMENT comme Web et Android**

- Mêmes suggestions
- Même temps de réponse (~500-1000ms)
- Même comportement

**Si ce n'est pas le cas → Il y a un bug à corriger**

---

## 📞 CONTACT RAPIDE

**Problème urgent?**
- Slack: @dev-team
- Email: dev@yombalyoon.com
- WhatsApp: +221 XX XXX XX XX

---

**Temps total estimé:** 5 minutes
**Difficulté:** Facile
**Prérequis:** Mac + iPhone + Xcode
