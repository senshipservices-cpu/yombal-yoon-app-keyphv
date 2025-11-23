
# Fix Urgent : Autocomplétion Web et Android

## 🚨 Problème

L'autocomplétion ne fonctionne plus sur **Web** et ne fonctionne pas sur **Android** car une seule clé API iOS est configurée avec des restrictions iOS uniquement.

## ✅ Solution Rapide

Vous devez créer **deux nouvelles clés API** :
1. Une pour Web
2. Une pour Android

### 🌐 ÉTAPE 1 : Clé API Web (5 minutes)

#### 1.1 Créer la clé
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Cliquez **+ CREATE CREDENTIALS** > **API key**
3. Notez la clé créée

#### 1.2 Configurer les restrictions
1. Cliquez sur la clé
2. Nom : `Yombal Yoon - Web`
3. **Application restrictions** : Sélectionnez **HTTP referrers**
4. Ajoutez ces referrers :
   ```
   https://*.natively.dev/*
   http://localhost/*
   http://localhost:*/*
   ```
5. **API restrictions** : Sélectionnez **Restrict key**
   - ✅ Places API
   - ✅ Geocoding API
   - ✅ Distance Matrix API
6. Cliquez **SAVE**

#### 1.3 Ajouter à Supabase
```bash
supabase secrets set GOOGLE_MAPS_API_KEY_WEB="VOTRE_CLE_WEB_ICI"
```

---

### 🤖 ÉTAPE 2 : Clé API Android (5 minutes)

#### 2.1 Obtenir le SHA-1
```bash
# Pour debug (développement)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```
Notez le **SHA-1** affiché.

#### 2.2 Créer la clé
1. Dans Google Cloud Console > **Credentials**
2. Cliquez **+ CREATE CREDENTIALS** > **API key**
3. Notez la clé créée

#### 2.3 Configurer les restrictions
1. Cliquez sur la clé
2. Nom : `Yombal Yoon - Android`
3. **Application restrictions** : Sélectionnez **Android apps**
4. Cliquez **+ ADD AN ITEM**
   - **Package name** : `com.natively.yombalyoon` (vérifiez dans app.json)
   - **SHA-1** : Collez le SHA-1 obtenu à l'étape 2.1
5. **API restrictions** : Sélectionnez **Restrict key**
   - ✅ Places API
   - ✅ Geocoding API
   - ✅ Distance Matrix API
6. Cliquez **SAVE**

#### 2.4 Ajouter à Supabase
```bash
supabase secrets set GOOGLE_MAPS_API_KEY_ANDROID="VOTRE_CLE_ANDROID_ICI"
```

---

### 🚀 ÉTAPE 3 : Déployer (1 minute)

```bash
# Vérifier que les 3 clés sont présentes
supabase secrets list

# Vous devriez voir :
# - GOOGLE_MAPS_API_KEY_WEB
# - GOOGLE_MAPS_API_KEY_ANDROID
# - GOOGLE_MAPS_API_KEY_IOS

# Redéployer l'Edge Function
supabase functions deploy google-places-proxy
```

---

### ✅ ÉTAPE 4 : Tester

#### Test Web
1. Ouvrez l'app dans Chrome/Firefox
2. Allez dans **Envoi de colis**
3. Tapez "Plateau" dans le champ adresse
4. ✅ L'autocomplétion devrait fonctionner

#### Test Android
1. Lancez l'app sur Android
2. Allez dans **Envoi de colis**
3. Tapez "Plateau" dans le champ adresse
4. ✅ L'autocomplétion devrait fonctionner

#### Test iOS
1. Lancez l'app sur iOS/TestFlight
2. Allez dans **Envoi de colis**
3. Tapez "Plateau" dans le champ adresse
4. ✅ L'autocomplétion devrait continuer à fonctionner

---

## 🔍 Vérification des secrets

Pour vérifier que tout est bien configuré :

```bash
# Lister les secrets
supabase secrets list

# Vous devriez voir ces 3 lignes :
# GOOGLE_MAPS_API_KEY_WEB
# GOOGLE_MAPS_API_KEY_ANDROID
# GOOGLE_MAPS_API_KEY_IOS
```

---

## 📋 Récapitulatif

| Plateforme | Secret Supabase | Restriction Google Cloud |
|------------|----------------|--------------------------|
| **Web** | `GOOGLE_MAPS_API_KEY_WEB` | HTTP referrers: `*.natively.dev/*` |
| **Android** | `GOOGLE_MAPS_API_KEY_ANDROID` | Android apps: Package + SHA-1 |
| **iOS** | `GOOGLE_MAPS_API_KEY_IOS` | iOS apps: Bundle ID |

---

## ⚠️ Points importants

1. **Trois clés distinctes** : Chaque plateforme a sa propre clé avec ses propres restrictions
2. **Restrictions obligatoires** : Sans restrictions appropriées, Google Maps refusera les requêtes
3. **Redéploiement nécessaire** : Après avoir ajouté les secrets, vous DEVEZ redéployer l'Edge Function
4. **Délai de propagation** : Les changements peuvent prendre 1-2 minutes pour être actifs

---

## 🆘 Dépannage rapide

### Erreur : "Configuration API Web requise"
→ La clé Web n'est pas dans Supabase
→ Solution : `supabase secrets set GOOGLE_MAPS_API_KEY_WEB="votre_cle"`

### Erreur : "REQUEST_DENIED" sur Web
→ Les HTTP referrers ne sont pas configurés
→ Solution : Ajoutez `*.natively.dev/*` dans les restrictions de la clé Web

### Erreur : "REQUEST_DENIED" sur Android
→ Le SHA-1 ou package name est incorrect
→ Solution : Vérifiez le SHA-1 avec keytool et le package name dans app.json

### L'autocomplétion ne fonctionne toujours pas
→ L'Edge Function n'a pas été redéployée
→ Solution : `supabase functions deploy google-places-proxy`

---

## 📞 Commandes utiles

```bash
# Voir les logs en temps réel
supabase functions logs google-places-proxy --follow

# Lister les secrets
supabase secrets list

# Supprimer un secret (si besoin de le recréer)
supabase secrets unset GOOGLE_MAPS_API_KEY_WEB

# Redéployer
supabase functions deploy google-places-proxy
```

---

**Temps estimé total** : 15 minutes
**Difficulté** : Facile
**Prérequis** : Accès Google Cloud Console + Supabase CLI installé

---

**Date** : 2025-01-23
**Statut** : Action immédiate requise
