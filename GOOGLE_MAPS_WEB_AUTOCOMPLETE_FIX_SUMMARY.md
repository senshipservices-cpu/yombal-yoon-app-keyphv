
# 🔧 Fix: Google Maps Autocomplete Web - "The provided API key is invalid"

## 📋 Résumé du Problème

**Erreur:** `The provided API key is invalid` avec statut `REQUEST_DENIED`

**Diagnostic:**
```
Configuration des clés API:
• Web: N/A
• Android: N/A
• iOS: N/A
```

**Cause:** Les variables d'environnement `GOOGLE_MAPS_API_KEY_WEB`, `GOOGLE_MAPS_API_KEY_ANDROID`, et `GOOGLE_MAPS_API_KEY_IOS` ne sont **PAS configurées dans les secrets Supabase Edge Function**.

## ✅ Solution Appliquée

### 1. Mise à jour de l'Edge Function

- ✅ Ajout d'une clé de fallback `GOOGLE_MAPS_API_KEY` pour le développement
- ✅ Amélioration des messages d'erreur avec instructions détaillées
- ✅ Ajout du pattern `https://*.exp.direct/*` pour Expo development
- ✅ Logs détaillés pour diagnostiquer les problèmes
- ✅ Redéploiement de la fonction (version 30)

### 2. Mise à jour du composant AddressAutocomplete

- ✅ Affichage du statut des clés API (SET/NOT_SET) dans le debug panel
- ✅ Instructions détaillées pour configurer les secrets Supabase
- ✅ Support du fallback key dans le debug info

## 🚀 Actions Requises (URGENT)

### Étape 1: Créer les Clés API dans Google Cloud Console

#### Pour Web (GOOGLE_MAPS_API_KEY_WEB)

1. Allez dans [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet
3. **APIs & Services > Credentials > + CREATE CREDENTIALS > API key**
4. Configurez la clé:
   - **Application restrictions:** HTTP referrers (web sites)
   - **Referrers autorisés:**
     ```
     https://*.natively.dev/*
     http://localhost/*
     http://127.0.0.1/*
     https://*.exp.direct/*
     ```
   - **API restrictions:** Restrict key
   - **APIs activées:**
     - Places API
     - Geocoding API
     - Distance Matrix API
     - Maps JavaScript API
5. Sauvegardez et copiez la clé

#### Pour Android (GOOGLE_MAPS_API_KEY_ANDROID)

1. Créez une nouvelle clé API
2. Configurez:
   - **Application restrictions:** Android apps
   - **Package name:** `com.yombalyoon.app`
   - **SHA-1:** [Obtenez avec `keytool -list -v -keystore your-keystore.jks`]
   - **APIs activées:** Places API, Geocoding API, Distance Matrix API
3. Sauvegardez et copiez la clé

#### Pour iOS (GOOGLE_MAPS_API_KEY_IOS)

1. Créez une nouvelle clé API
2. Configurez:
   - **Application restrictions:** iOS apps
   - **Bundle ID:** `com.yombalyoon.yombalyoonapp`
   - **APIs activées:** Places API, Geocoding API, Distance Matrix API
3. Sauvegardez et copiez la clé

### Étape 2: Ajouter les Secrets dans Supabase

#### Méthode A: Via Supabase Dashboard (Recommandé)

1. Allez sur https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/settings/functions
2. Cliquez sur "Manage secrets" ou "Add secret"
3. Ajoutez les 3 secrets:
   ```
   GOOGLE_MAPS_API_KEY_WEB = [Votre clé Web]
   GOOGLE_MAPS_API_KEY_ANDROID = [Votre clé Android]
   GOOGLE_MAPS_API_KEY_IOS = [Votre clé iOS]
   ```
4. Sauvegardez

#### Méthode B: Via Supabase CLI

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref drxtaxepofuoelplgrei

# Ajouter les secrets
supabase secrets set GOOGLE_MAPS_API_KEY_WEB=YOUR_WEB_KEY
supabase secrets set GOOGLE_MAPS_API_KEY_ANDROID=YOUR_ANDROID_KEY
supabase secrets set GOOGLE_MAPS_API_KEY_IOS=YOUR_IOS_KEY

# Redéployer (optionnel, déjà fait automatiquement dans Natively)
supabase functions deploy google-places-proxy
```

### Étape 3: Vérification

1. **Attendez 5 minutes** pour que les changements Google Cloud prennent effet
2. **Testez sur Web:**
   - Ouvrez l'app dans le navigateur
   - Allez dans "Envoyer un colis"
   - Tapez une adresse
   - Vérifiez que les suggestions s'affichent
3. **Vérifiez les logs:**
   - Supabase Dashboard > Edge Functions > google-places-proxy > Logs
   - Vous devriez voir:
     ```
     🔐 Environment Variables Status:
        - GOOGLE_MAPS_API_KEY_WEB: ✅ SET
        - GOOGLE_MAPS_API_KEY_ANDROID: ✅ SET
        - GOOGLE_MAPS_API_KEY_IOS: ✅ SET
     ```

## 🔍 Diagnostic Amélioré

Le debug panel sur Web affiche maintenant:

```
🔧 Informations de diagnostic

État de la requête:
• Statut: REQUEST_DENIED
• Plateforme: web
• Referer: https://qlv0abq-anonymous-8081.exp.direct/
• HTTP Status: 200
• Timestamp: 2025-11-24T04:06:38.226Z

Configuration des clés API:
• Web: NOT_SET (ou SET si configuré)
• Android: NOT_SET (ou SET si configuré)
• iOS: NOT_SET (ou SET si configuré)
• Fallback: NOT_SET (ou SET si configuré)
⚠️ Secret manquant: GOOGLE_MAPS_API_KEY_WEB

Solution recommandée:
Configuration requise dans Supabase Dashboard pour web

Étapes à suivre:
1. Allez dans Supabase Dashboard > Project Settings > Edge Functions
2. Cliquez sur "Add secret" ou "Manage secrets"
3. Ajoutez le secret GOOGLE_MAPS_API_KEY_WEB avec votre clé API Google Maps
4. Assurez-vous que la clé est configurée dans Google Cloud Console avec les restrictions appropriées
5. Redéployez cette Edge Function pour que les changements prennent effet

Alternative (Supabase CLI):
Ou utilisez Supabase CLI:
supabase secrets set GOOGLE_MAPS_API_KEY_WEB=YOUR_API_KEY_HERE
Puis redéployez: supabase functions deploy google-places-proxy

📚 Documentation: https://supabase.com/docs/guides/functions/secrets
```

## ⚠️ Points Importants

1. **Les secrets Supabase Edge Function ≠ Variables d'environnement de l'app**
   - Les secrets Edge Function sont dans Supabase Dashboard
   - Les variables d'environnement de l'app (app.json) ne sont PAS accessibles dans les Edge Functions

2. **Redéploiement automatique**
   - Dans Natively, la fonction est automatiquement redéployée
   - Les secrets sont appliqués immédiatement après ajout

3. **Délai de propagation Google Cloud**
   - Attendez 5 minutes après configuration des restrictions
   - Testez ensuite l'autocomplétion

4. **Facturation Google Cloud**
   - La facturation DOIT être activée
   - Sans facturation, les APIs ne fonctionnent pas

## 📚 Documentation Complète

Consultez `SUPABASE_EDGE_FUNCTION_SECRETS_SETUP.md` pour:
- Guide détaillé de configuration
- Dépannage des erreurs courantes
- Checklist complète
- Exemples de configuration

## ✅ Checklist Rapide

- [ ] Créer 3 clés API dans Google Cloud Console
- [ ] Configurer les restrictions (referrers/package/bundle)
- [ ] Activer les APIs (Places, Geocoding, Distance Matrix)
- [ ] Activer la facturation Google Cloud
- [ ] Ajouter les 3 secrets dans Supabase Dashboard
- [ ] Attendre 5 minutes
- [ ] Tester l'autocomplétion sur Web
- [ ] Vérifier les logs Supabase

---

**Statut:** ✅ Edge Function mise à jour et redéployée (version 30)
**Prochaine étape:** Ajouter les secrets dans Supabase Dashboard
**Documentation:** SUPABASE_EDGE_FUNCTION_SECRETS_SETUP.md
