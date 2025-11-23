
# 🎯 GUIDE RAPIDE - Où Configurer les Restrictions dans Google Cloud Console

## 📍 Emplacement Exact des Paramètres

### Étape 1 : Accéder à la Configuration de la Clé API

1. Allez sur : **https://console.cloud.google.com/apis/credentials**
2. Sélectionnez votre projet Yombal Yoon
3. Cliquez sur la clé API que vous souhaitez configurer (ou créez-en une nouvelle)

---

## 🔧 Section 1 : Application Restrictions

### Où : Dans la page de configuration de la clé API, section **"Application restrictions"**

### Que mettre :

```
┌─────────────────────────────────────────────────────────┐
│ Application restrictions                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ○ None                                                   │
│ ○ HTTP referrers (web sites)                            │
│ ○ IP addresses (web servers, cron jobs, etc.)           │
│ ● iOS apps                          ← SÉLECTIONNEZ CECI │
│ ○ Android apps                                           │
│                                                          │
│ [Add an item]                       ← CLIQUEZ ICI       │
│                                                          │
│ Bundle ID:                                               │
│ ┌─────────────────────────────────────────────────┐    │
│ │ com.yombalyoon.yombalyoonapp    ← ENTREZ CECI   │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [Done]                              ← CLIQUEZ ICI       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**IMPORTANT** : 
- Le Bundle ID doit être **exactement** : `com.yombalyoon.yombalyoonapp`
- Pas d'espaces avant ou après
- Respectez les majuscules/minuscules

---

## 🔧 Section 2 : API Restrictions

### Où : Dans la même page, section **"API restrictions"**

### Que mettre :

```
┌─────────────────────────────────────────────────────────┐
│ API restrictions                                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ○ Don't restrict key                                     │
│ ● Restrict key                      ← SÉLECTIONNEZ CECI │
│                                                          │
│ Select APIs:                                             │
│                                                          │
│ ☑ Places API                        ← COCHEZ CECI      │
│ ☑ Places API (New)                  ← COCHEZ CECI      │
│ ☑ Geocoding API                     ← COCHEZ CECI      │
│ ☑ Distance Matrix API               ← COCHEZ CECI      │
│ ☐ Maps JavaScript API                                    │
│ ☐ Maps SDK for Android                                  │
│ ☐ Maps SDK for iOS                                      │
│ ☐ ... (autres APIs)                                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**IMPORTANT** : 
- Cochez **uniquement** les 4 APIs listées ci-dessus
- Ne cochez PAS Maps JavaScript API, Maps SDK for Android, ou Maps SDK for iOS

---

## 📸 Capture d'Écran Annotée

```
┌──────────────────────────────────────────────────────────────────┐
│ Google Cloud Console > APIs & Services > Credentials             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ API key: Yombal Yoon - iOS                                       │
│                                                                   │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Name                                                        │  │
│ │ ┌────────────────────────────────────────────────────────┐ │  │
│ │ │ Yombal Yoon - iOS                                       │ │  │
│ │ └────────────────────────────────────────────────────────┘ │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Application restrictions                                    │  │
│ │                                                             │  │
│ │ ● iOS apps                                                  │  │
│ │                                                             │  │
│ │ Bundle ID: com.yombalyoon.yombalyoonapp                    │  │
│ │                                                             │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ API restrictions                                            │  │
│ │                                                             │  │
│ │ ● Restrict key                                              │  │
│ │                                                             │  │
│ │ ☑ Places API                                               │  │
│ │ ☑ Places API (New)                                         │  │
│ │ ☑ Geocoding API                                            │  │
│ │ ☑ Distance Matrix API                                      │  │
│ │                                                             │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│                                    [SAVE]                         │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Vérification

Avant de cliquer sur **SAVE**, vérifiez :

- [ ] **Type** : "iOS apps" est sélectionné
- [ ] **Bundle ID** : `com.yombalyoon.yombalyoonapp` est entré (exactement)
- [ ] **API restrictions** : "Restrict key" est sélectionné
- [ ] **Places API** : Coché ✅
- [ ] **Places API (New)** : Coché ✅
- [ ] **Geocoding API** : Coché ✅
- [ ] **Distance Matrix API** : Coché ✅
- [ ] **Facturation** : Compte de facturation actif sur le projet

---

## 🚀 Après la Configuration

### 1. Copier la Clé API

Après avoir cliqué sur **SAVE**, copiez la clé API :

```
Exemple : AIzaSyC1234567890abcdefghijklmnopqrstuv
```

### 2. Ajouter dans Supabase

1. Allez sur : **https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/settings/functions**
2. Section **Secrets** → **Add new secret**
3. Entrez :
   - **Name** : `GOOGLE_MAPS_API_KEY_IOS`
   - **Value** : Votre clé API copiée
4. Cliquez sur **Save**

### 3. Redéployer l'Edge Function

```bash
supabase functions deploy google-places-proxy
```

### 4. Tester sur TestFlight

1. Ouvrez l'app sur iPhone
2. Allez dans **Envoi de Colis**
3. Tapez une adresse
4. Vérifiez que les suggestions apparaissent

---

## ❌ Erreurs Courantes

### Erreur : "REQUEST_DENIED"

**Cause** : Bundle ID incorrect ou APIs non activées

**Solution** :
1. Vérifiez que le Bundle ID est **exactement** : `com.yombalyoon.yombalyoonapp`
2. Vérifiez que les 4 APIs sont cochées
3. Attendez 5 minutes (propagation des changements)

### Erreur : "API key not configured"

**Cause** : Le secret n'est pas dans Supabase

**Solution** :
1. Vérifiez que le secret `GOOGLE_MAPS_API_KEY_IOS` existe dans Supabase
2. Vérifiez que la valeur est correcte (pas d'espaces)
3. Redéployez l'Edge Function

### Erreur : "OVER_QUERY_LIMIT"

**Cause** : Quota dépassé ou facturation non activée

**Solution** :
1. Allez dans **Billing** dans Google Cloud Console
2. Vérifiez qu'un compte de facturation est lié
3. Vérifiez les quotas dans **APIs & Services** → **Quotas**

---

## 📞 Besoin d'Aide ?

Si vous avez des questions :

1. **Consultez les guides détaillés** :
   - `IOS_API_KEY_SETUP_GUIDE.md` (guide complet)
   - `GOOGLE_MAPS_API_KEY_SETUP_IOS.md` (guide rapide)

2. **Vérifiez les logs Supabase** :
   - Edge Functions → google-places-proxy → Logs
   - Recherchez les messages d'erreur

3. **Testez la clé directement** :
   ```bash
   curl "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Dakar&key=VOTRE_CLE_API"
   ```

---

**Date de création** : 2025-01-22  
**Dernière mise à jour** : 2025-01-22  
**Version** : 1.0
