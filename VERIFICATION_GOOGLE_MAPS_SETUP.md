
# ✅ VÉRIFICATION DE LA CONFIGURATION GOOGLE MAPS API

Ce guide vous aide à vérifier que la configuration des clés Google Maps API est correcte pour toutes les plateformes.

---

## 📋 Checklist de vérification

### ☁️ 1. Google Cloud Console

#### Clé Web
- [ ] Clé créée avec le nom "Yombal Yoon - Web"
- [ ] Type de restriction: **HTTP referrers (web sites)**
- [ ] Référents configurés:
  - [ ] `https://*.natively.dev/*`
  - [ ] `http://localhost/*`
- [ ] APIs activées:
  - [ ] Places API
  - [ ] Geocoding API
  - [ ] Distance Matrix API
  - [ ] Maps JavaScript API (optionnel)
- [ ] Clé copiée et sauvegardée

#### Clé Android
- [ ] Clé créée avec le nom "Yombal Yoon - Android"
- [ ] Type de restriction: **Android apps**
- [ ] Package name: `com.yombalyoon.app`
- [ ] SHA-1 fingerprint ajouté
- [ ] APIs activées:
  - [ ] Places API
  - [ ] Geocoding API
  - [ ] Distance Matrix API
  - [ ] Maps SDK for Android
- [ ] Clé copiée et sauvegardée

#### Clé iOS
- [ ] Clé créée avec le nom "Yombal Yoon - iOS"
- [ ] Type de restriction: **iOS apps**
- [ ] Bundle ID: `com.yombalyoon.yombalyoonapp`
- [ ] APIs activées:
  - [ ] Places API
  - [ ] Geocoding API
  - [ ] Distance Matrix API
  - [ ] Maps SDK for iOS
- [ ] Clé copiée et sauvegardée

---

### 🔐 2. Supabase Secrets

#### Vérification des secrets
- [ ] Connecté à Supabase Dashboard
- [ ] Projet sélectionné: `drxtaxepofuoelplgrei`
- [ ] Accès à: **Project Settings > Edge Functions**
- [ ] Secret `GOOGLE_MAPS_API_KEY_WEB` créé
- [ ] Secret `GOOGLE_MAPS_API_KEY_ANDROID` créé
- [ ] Secret `GOOGLE_MAPS_API_KEY_IOS` créé
- [ ] Edge Function `google-places-proxy` redéployée

---

### 🧪 3. Tests fonctionnels

#### Test Web
1. [ ] Ouvrir l'application dans un navigateur
2. [ ] Aller dans "Envoyer un colis"
3. [ ] Cliquer sur le champ "Adresse de départ"
4. [ ] Taper "Plateau" (ou autre quartier de Dakar)
5. [ ] Vérifier que les suggestions apparaissent
6. [ ] Sélectionner une suggestion
7. [ ] Vérifier que l'adresse est remplie
8. [ ] Répéter pour "Adresse d'arrivée"

**Résultat attendu:** ✅ Les suggestions apparaissent et peuvent être sélectionnées

#### Test Android
1. [ ] Ouvrir l'application sur un appareil Android
2. [ ] Aller dans "Envoyer un colis"
3. [ ] Cliquer sur le champ "Adresse de départ"
4. [ ] Taper "Plateau" (ou autre quartier de Dakar)
5. [ ] Vérifier que les suggestions apparaissent
6. [ ] Sélectionner une suggestion
7. [ ] Vérifier que l'adresse est remplie
8. [ ] Répéter pour "Adresse d'arrivée"

**Résultat attendu:** ✅ Les suggestions apparaissent et peuvent être sélectionnées

#### Test iOS
1. [ ] Ouvrir l'application sur un appareil iOS
2. [ ] Aller dans "Envoyer un colis"
3. [ ] Cliquer sur le champ "Adresse de départ"
4. [ ] Taper "Plateau" (ou autre quartier de Dakar)
5. [ ] Vérifier que les suggestions apparaissent
6. [ ] Sélectionner une suggestion
7. [ ] Vérifier que l'adresse est remplie
8. [ ] Répéter pour "Adresse d'arrivée"

**Résultat attendu:** ✅ Les suggestions apparaissent et peuvent être sélectionnées

---

### 📊 4. Vérification des logs

#### Logs Edge Function
1. [ ] Aller dans Supabase Dashboard
2. [ ] Naviguer vers: **Edge Functions > google-places-proxy > Logs**
3. [ ] Vérifier les messages suivants:
   ```
   🔐 Clé API web chargée avec succès
   🔐 Clé API android chargée avec succès
   🔐 Clé API ios chargée avec succès
   ```
4. [ ] Vérifier qu'il n'y a pas d'erreurs "REQUEST_DENIED"

#### Logs Application (Web)
1. [ ] Ouvrir la console du navigateur (F12)
2. [ ] Aller dans l'onglet "Console"
3. [ ] Taper une adresse dans l'autocomplétion
4. [ ] Vérifier les logs:
   ```
   [AddressAutocomplete] Fetching predictions for: "Plateau" on platform: web
   [AddressAutocomplete] API Response status: OK
   [AddressAutocomplete] Found X predictions
   ```

#### Logs Application (Android)
1. [ ] Connecter l'appareil Android
2. [ ] Ouvrir Android Studio > Logcat
3. [ ] Filtrer par "AddressAutocomplete"
4. [ ] Taper une adresse dans l'autocomplétion
5. [ ] Vérifier les logs similaires à Web

#### Logs Application (iOS)
1. [ ] Connecter l'appareil iOS
2. [ ] Ouvrir Xcode > Console
3. [ ] Filtrer par "AddressAutocomplete"
4. [ ] Taper une adresse dans l'autocomplétion
5. [ ] Vérifier les logs similaires à Web

---

### 🔍 5. Tests de calcul de distance

#### Test Distance Matrix API
1. [ ] Aller dans "Envoyer un colis"
2. [ ] Sélectionner une adresse de départ (ex: "Plateau, Dakar")
3. [ ] Sélectionner une adresse d'arrivée (ex: "Parcelles Assainies, Dakar")
4. [ ] Vérifier que la distance est calculée automatiquement
5. [ ] Vérifier que le prix est mis à jour automatiquement
6. [ ] Vérifier les logs:
   ```
   🔍 Calling Google Distance Matrix API...
   ✅ Distance Matrix API result:
      - Distance: X.XX km
      - Durée: X minutes
   💰 Calculating price for distance: X.XX km
   ✅ Final calculated price: XXXX FCFA
   ```

**Résultat attendu:** ✅ Distance et prix calculés automatiquement

---

### 🌍 6. Tests de géocodage

#### Test Place Details API
1. [ ] Aller dans "Envoyer un colis"
2. [ ] Taper une adresse dans "Adresse de départ"
3. [ ] Sélectionner une suggestion
4. [ ] Vérifier les logs:
   ```
   [AddressAutocomplete] Fetching place details for: ChIJ...
   [AddressAutocomplete] Place details retrieved: {lat: XX.XXXX, lng: -XX.XXXX}
   ```
5. [ ] Vérifier que les coordonnées sont correctes (latitude ~14.6, longitude ~-17.4 pour Dakar)

**Résultat attendu:** ✅ Coordonnées récupérées avec succès

---

### 🚗 7. Tests Covoiturage

#### Test City Autocomplete
1. [ ] Aller dans "Covoiturage"
2. [ ] Cliquer sur "Rechercher un trajet"
3. [ ] Taper "Dakar" dans "Ville de départ"
4. [ ] Vérifier que les suggestions de villes apparaissent
5. [ ] Sélectionner une ville
6. [ ] Répéter pour "Ville d'arrivée"

**Résultat attendu:** ✅ Suggestions de villes apparaissent

---

### 📦 8. Tests Livraison inter-régionale

#### Test Destination Autocomplete
1. [ ] Aller dans "Livraison inter-régionale"
2. [ ] Taper "Thiès" dans "Région de destination"
3. [ ] Vérifier que les suggestions apparaissent
4. [ ] Sélectionner une région
5. [ ] Vérifier que le prix est affiché

**Résultat attendu:** ✅ Suggestions de régions apparaissent avec prix

---

## 🚨 Résolution des problèmes

### ❌ Erreur: "REQUEST_DENIED"

**Symptômes:**
- Les suggestions ne s'affichent pas
- Message d'erreur dans les logs: "REQUEST_DENIED"

**Causes possibles:**
1. Restrictions d'application incorrectes
2. APIs non activées
3. Clé API non valide

**Solutions:**
1. **Vérifier les restrictions:**
   - Web: Vérifier les HTTP referrers
   - Android: Vérifier package name et SHA-1
   - iOS: Vérifier Bundle ID
2. **Vérifier les APIs:**
   - Aller dans Google Cloud Console > APIs & Services > Library
   - Rechercher et activer: Places API, Geocoding API, Distance Matrix API
3. **Attendre la propagation:**
   - Après modification, attendre 5-10 minutes
4. **Régénérer la clé:**
   - Si le problème persiste, créer une nouvelle clé

### ❌ Erreur: "Clé API non configurée"

**Symptômes:**
- Message d'erreur: "La clé API Google Maps pour [platform] n'est pas configurée"

**Causes possibles:**
1. Secret Supabase non défini
2. Edge Function non redéployée
3. Nom du secret incorrect

**Solutions:**
1. **Vérifier les secrets:**
   - Supabase Dashboard > Project Settings > Edge Functions
   - Vérifier que les 3 secrets existent
2. **Redéployer l'Edge Function:**
   - Les secrets ne sont disponibles qu'après redéploiement
3. **Vérifier les noms:**
   - `GOOGLE_MAPS_API_KEY_WEB`
   - `GOOGLE_MAPS_API_KEY_ANDROID`
   - `GOOGLE_MAPS_API_KEY_IOS`

### ❌ Erreur: "ZERO_RESULTS"

**Symptômes:**
- Message: "Aucun résultat trouvé"

**Causes possibles:**
1. Adresse trop vague
2. Adresse hors du Sénégal
3. Faute de frappe

**Solutions:**
1. Essayer avec une adresse plus précise
2. Vérifier l'orthographe
3. Utiliser des noms de lieux connus (ex: "Plateau", "Parcelles Assainies")

### ❌ Erreur: "OVER_QUERY_LIMIT"

**Symptômes:**
- Message: "Autocomplétion momentanément indisponible"
- Logs: "OVER_QUERY_LIMIT"

**Causes possibles:**
1. Quota Google Maps dépassé
2. Trop de requêtes en peu de temps

**Solutions:**
1. **Vérifier les quotas:**
   - Google Cloud Console > APIs & Services > Dashboard
   - Vérifier l'utilisation de chaque API
2. **Augmenter les quotas:**
   - Si nécessaire, activer la facturation
   - Augmenter les quotas dans Google Cloud Console
3. **Optimiser les requêtes:**
   - Augmenter le délai de debounce dans AddressAutocomplete
   - Mettre en cache les résultats

---

## 📊 Tableau de bord de vérification

| Composant | Web | Android | iOS | Notes |
|-----------|-----|---------|-----|-------|
| **Google Cloud Console** |
| Clé créée | ⬜ | ⬜ | ⬜ | |
| Restrictions configurées | ⬜ | ⬜ | ⬜ | |
| APIs activées | ⬜ | ⬜ | ⬜ | |
| **Supabase** |
| Secret créé | ⬜ | ⬜ | ⬜ | |
| Edge Function redéployée | ⬜ | ⬜ | ⬜ | |
| **Tests fonctionnels** |
| Autocomplétion adresse | ⬜ | ⬜ | ⬜ | |
| Calcul de distance | ⬜ | ⬜ | ⬜ | |
| Géocodage | ⬜ | ⬜ | ⬜ | |
| Autocomplétion ville | ⬜ | ⬜ | ⬜ | |
| **Logs** |
| Clé chargée | ⬜ | ⬜ | ⬜ | |
| Pas d'erreurs | ⬜ | ⬜ | ⬜ | |

---

## ✅ Validation finale

Une fois tous les tests passés, vous devriez avoir:

✅ **Google Cloud Console:**
- 3 clés API créées et configurées
- Restrictions appropriées appliquées
- APIs activées

✅ **Supabase:**
- 3 secrets configurés
- Edge Function redéployée

✅ **Application:**
- Autocomplétion fonctionnelle sur toutes les plateformes
- Calcul de distance automatique
- Géocodage fonctionnel
- Pas d'erreurs dans les logs

✅ **Monitoring:**
- Quotas surveillés
- Alertes configurées
- Logs accessibles

---

## 📞 Support

Si vous rencontrez des problèmes après avoir suivi ce guide:

1. **Consultez les logs:**
   - Supabase Edge Function logs
   - Console du navigateur (Web)
   - Logcat (Android)
   - Xcode Console (iOS)

2. **Vérifiez la documentation:**
   - `GOOGLE_MAPS_API_KEYS_SETUP.md`
   - `GOOGLE_CLOUD_CONSOLE_CONFIG_GUIDE.md`

3. **Contactez le support:**
   - Support Natively
   - Support Google Cloud (pour les problèmes de clés API)

---

**Configuration terminée avec succès!** 🎉

Votre application Yombal Yoon utilise maintenant les clés Google Maps API de manière sécurisée sur toutes les plateformes.
