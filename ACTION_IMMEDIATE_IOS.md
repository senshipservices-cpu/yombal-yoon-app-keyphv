
# 🚨 ACTION IMMÉDIATE REQUISE - Configuration iOS

## Résumé du Problème

L'autocomplétion ne fonctionne pas sur iOS Testflight car la clé API Google Maps pour iOS n'est pas configurée.

## ✅ Ce qui a été fait

1. ✅ Code mis à jour dans `AddressAutocomplete.tsx`
2. ✅ Code mis à jour dans `ColisContext.tsx`
3. ✅ Edge Function mise à jour et déployée (Version 17)
4. ✅ Validation améliorée pour permettre la saisie manuelle
5. ✅ Messages d'erreur améliorés

## ⚠️ Ce qu'il reste à faire (URGENT)

### Étape 1: Créer une Clé API iOS (5 minutes)

1. Aller sur https://console.cloud.google.com/
2. Sélectionner votre projet Google Cloud
3. Menu: **APIs & Services** > **Credentials**
4. Cliquer sur **+ CREATE CREDENTIALS** > **API key**
5. Une fois créée, cliquer sur l'icône ✏️ (Edit) à côté de la clé
6. Configurer:

   **Application restrictions:**
   - Sélectionner: ☑️ **iOS apps**
   - Cliquer sur **ADD AN ITEM**
   - Bundle ID: `com.yombalyoon.app`
   - Cliquer sur **DONE**

   **API restrictions:**
   - Sélectionner: ☑️ **Restrict key**
   - Cocher ces APIs:
     - ☑️ Places API
     - ☑️ Geocoding API
     - ☑️ Distance Matrix API
     - ☑️ Maps SDK for iOS

7. Cliquer sur **SAVE**
8. **COPIER LA CLÉ API** (vous en aurez besoin pour l'étape 2)

### Étape 2: Ajouter la Clé à Supabase (2 minutes)

1. Aller sur https://supabase.com/dashboard/project/drxtaxepofuoelplgrei
2. Menu de gauche: **Edge Functions**
3. Onglet: **Secrets**
4. Cliquer sur **Add new secret**
5. Remplir:
   - **Name**: `GOOGLE_MAPS_API_KEY_IOS`
   - **Value**: [Coller la clé API de l'étape 1]
6. Cliquer sur **Save**

### Étape 3: Tester (10 minutes)

1. Construire une nouvelle version de l'app
2. Uploader sur Testflight
3. Installer sur iPhone
4. Ouvrir le module "Envoi de colis"
5. Tester:
   - ✅ Taper dans "Adresse de départ" → Les suggestions doivent apparaître
   - ✅ Sélectionner une suggestion → L'adresse doit se remplir
   - ✅ Faire pareil pour "Adresse d'arrivée"
   - ✅ Remplir tous les champs
   - ✅ Cliquer sur "ENVOYER MON COLIS" → Doit fonctionner

## 🔍 Comment Vérifier que ça Marche

### Logs Edge Function

```bash
supabase functions logs google-places-proxy --project-ref drxtaxepofuoelplgrei
```

Vous devriez voir:
```
🔑 Platform: ios
✅ Using iOS API key
🔍 Autocomplete request for: "..."
✅ 5 results found
```

### Logs App (Xcode)

Pendant le test sur iPhone, ouvrir Xcode Console et rechercher:
```
[AddressAutocomplete] Fetching predictions for: "..." on platform: ios
[AddressAutocomplete] API Response status: OK
[AddressAutocomplete] Found X predictions
```

## ❌ Si ça ne Marche Toujours Pas

### Erreur: "Configuration API iOS requise"

**Cause**: La clé API iOS n'est pas configurée dans Supabase

**Solution**: Vérifier l'étape 2 ci-dessus

### Erreur: "REQUEST_DENIED"

**Cause**: La clé API iOS n'a pas les bonnes restrictions

**Solution**: 
1. Vérifier que le Bundle ID est exactement: `com.yombalyoon.app`
2. Vérifier que toutes les APIs sont activées
3. Attendre 5 minutes (propagation des changements Google)

### Aucune Suggestion n'Apparaît

**Cause**: Problème de réseau ou de configuration

**Solution**:
1. Vérifier la connexion internet de l'iPhone
2. Vérifier les logs Edge Function
3. Vérifier les logs Xcode Console

### Erreur lors de l'Envoi du Formulaire

**Cause**: Champs manquants ou connexion réseau

**Solution**:
1. Vérifier que TOUS les champs sont remplis:
   - Nom expéditeur
   - Téléphone expéditeur
   - Nom destinataire
   - Téléphone destinataire
   - Adresse de départ
   - Adresse d'arrivée
   - Description
2. Vérifier la connexion internet

## 📞 Support

Si le problème persiste après avoir suivi ces étapes:

1. Envoyer les logs Edge Function
2. Envoyer les logs Xcode Console
3. Envoyer des captures d'écran de l'erreur
4. Préciser:
   - Version iOS
   - Modèle d'iPhone
   - Version de l'app

## 📚 Documentation Complète

- `IOS_TESTFLIGHT_AUTOCOMPLETE_FIX.md` - Guide détaillé
- `RESUME_CORRECTION_AUTOCOMPLETE_IOS.md` - Résumé des corrections
- `IOS_API_KEY_SETUP_GUIDE.md` - Configuration API iOS
- `TESTING_GUIDE.md` - Procédures de test

## ⏱️ Temps Estimé

- Configuration Google Cloud: **5 minutes**
- Configuration Supabase: **2 minutes**
- Build et upload Testflight: **15 minutes**
- Test: **10 minutes**

**TOTAL: ~30 minutes**

## 🎯 Résultat Attendu

Après avoir suivi ces étapes:
- ✅ L'autocomplétion fonctionne sur iOS
- ✅ La sélection d'adresse remplit les coordonnées
- ✅ Le formulaire peut être soumis avec succès
- ✅ La saisie manuelle fonctionne aussi (sans autocomplétion)
