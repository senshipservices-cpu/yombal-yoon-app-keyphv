
# 🔄 GUIDE COMPLET - Réinitialisation et Configuration des Clés Google Maps API

## 📋 Vue d'ensemble

Ce guide vous accompagne pas à pas dans la configuration complète des clés Google Maps API pour l'application **Yombal Yoon** sur les trois plateformes : **Web**, **Android**, et **iOS**.

---

## 🎯 Objectif

Configurer trois clés API Google Maps distinctes et correctement restreintes pour assurer le bon fonctionnement de l'autocomplétion d'adresses sur toutes les plateformes.

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ Accès à [Google Cloud Console](https://console.cloud.google.com/)
- ✅ Un projet Google Cloud actif pour Yombal Yoon
- ✅ Un compte de facturation activé sur le projet
- ✅ Accès au dashboard Supabase du projet
- ✅ Les informations suivantes :
  - Package name Android : `com.yombalyoon.app`
  - Bundle ID iOS : `com.yombalyoon.yombalyoonapp`
  - SHA-1 du keystore Android (voir section 2.1)

---

## 📍 PARTIE 1 : Nettoyage et Clarification des Clés Existantes

### Étape 1.1 : Identifier les clés existantes

1. Allez sur : **https://console.cloud.google.com/apis/credentials**
2. Sélectionnez votre projet **Yombal Yoon**
3. Dans la section **API Keys**, notez toutes les clés existantes :

   ```
   📝 Liste des clés à identifier :
   
   □ Ancienne clé qui fonctionnait (web + premiers tests)
   □ GOOGLE_MAPS_API_KEY_IOS
   □ Clés liées à "Yombal Yonn App"
   □ Clés liées à "Universal Shipping Services"
   □ Autres clés Google Maps
   ```

### Étape 1.2 : Organiser les clés existantes

**⚠️ NE PAS SUPPRIMER les anciennes clés immédiatement !**

Pour chaque clé existante, choisissez l'une des options suivantes :

#### Option A : Désactiver temporairement
1. Cliquez sur la clé
2. En haut de la page, cliquez sur **Disable API key**
3. Confirmez la désactivation

#### Option B : Renommer pour éviter les confusions
1. Cliquez sur la clé
2. Changez le nom en ajoutant un préfixe :
   - `[OLD] Ancienne clé Web`
   - `[DEPRECATED] iOS Key`
   - `[BACKUP] Test Key`

### Étape 1.3 : Documenter les anciennes clés

Créez un document (fichier texte ou note) avec :

```
📄 ANCIENNES CLÉS GOOGLE MAPS - YOMBAL YOON
Date : [DATE DU JOUR]

1. Clé Web (ancienne) :
   - Nom : [NOM]
   - Clé : AIza... (premiers caractères)
   - Action : [Désactivée / Renommée]
   - Raison : Migration vers nouvelle configuration

2. Clé iOS (ancienne) :
   - Nom : [NOM]
   - Clé : AIza... (premiers caractères)
   - Action : [Désactivée / Renommée]
   - Raison : Migration vers nouvelle configuration

[... etc pour toutes les clés]
```

**💡 Conseil** : Gardez ce document pendant au moins 30 jours après la migration, au cas où vous auriez besoin de revenir en arrière.

---

## 🌐 PARTIE 2 : Créer les Nouvelles Clés API

### 🔹 A. Clé API Web (Autocomplétion sur navigateur & Natively Web)

#### Étape 2A.1 : Créer la clé

1. Dans Google Cloud Console > **APIs & Services** > **Credentials**
2. Cliquez sur **+ CREATE CREDENTIALS** > **API key**
3. Une nouvelle clé sera créée - **copiez-la immédiatement** dans un endroit sûr

#### Étape 2A.2 : Configurer le nom

1. Cliquez sur la clé que vous venez de créer
2. Dans le champ **Name**, entrez : `Yombal Yoon - Web`

#### Étape 2A.3 : Configurer les restrictions d'application

1. Dans la section **Application restrictions**, sélectionnez **HTTP referrers (web sites)**
2. Cliquez sur **+ ADD AN ITEM**
3. Ajoutez les referrers suivants (un par un) :

   ```
   https://*.natively.dev/*
   http://localhost/*
   http://localhost:*/*
   https://localhost/*
   https://localhost:*/*
   ```

4. Cliquez sur **Done** après chaque ajout

#### Étape 2A.4 : Configurer les restrictions d'API

1. Dans la section **API restrictions**, sélectionnez **Restrict key**
2. Cliquez sur **Select APIs**
3. Cochez les APIs suivantes :
   - ✅ **Places API**
   - ✅ **Places API (New)**
   - ✅ **Geocoding API**
   - ✅ **Distance Matrix API**
   - ✅ **Maps JavaScript API** (optionnel, pour le front web)

4. Cliquez sur **OK**

#### Étape 2A.5 : Sauvegarder

1. Cliquez sur **SAVE** en bas de la page
2. Attendez la confirmation : "API key saved"

#### Étape 2A.6 : Copier la clé

1. Copiez la clé API complète (commence par `AIza...`)
2. Notez-la dans un endroit sûr :

   ```
   🔑 CLÉ WEB : AIza...
   ```

---

### 🔹 B. Clé API Android

#### Étape 2B.1 : Obtenir le SHA-1 du keystore

**Pour le debug keystore (tests locaux) :**

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Pour le release keystore (production) :**

```bash
keytool -list -v -keystore /chemin/vers/votre/keystore.jks -alias votre-alias
```

**Résultat attendu :**
```
Certificate fingerprints:
     SHA1: AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
     SHA256: ...
```

**📝 Notez le SHA-1** (format : `AA:BB:CC:...`)

**⚠️ Important** : Si vous avez un keystore de production différent, vous devrez créer **deux clés Android** :
- Une pour le debug (tests locaux)
- Une pour la production (Google Play Store)

#### Étape 2B.2 : Créer la clé

1. Dans Google Cloud Console > **Credentials**
2. Cliquez sur **+ CREATE CREDENTIALS** > **API key**
3. Copiez immédiatement la clé créée

#### Étape 2B.3 : Configurer le nom

1. Cliquez sur la clé
2. Dans le champ **Name**, entrez : `Yombal Yoon - Android`

#### Étape 2B.4 : Configurer les restrictions d'application

1. Dans **Application restrictions**, sélectionnez **Android apps**
2. Cliquez sur **+ ADD AN ITEM**
3. Entrez :
   - **Package name** : `com.yombalyoon.app`
   - **SHA-1 certificate fingerprint** : Collez le SHA-1 obtenu à l'étape 2B.1

4. Cliquez sur **Done**

**💡 Si vous avez plusieurs keystores** :
- Cliquez à nouveau sur **+ ADD AN ITEM**
- Ajoutez le même package name avec le SHA-1 du release keystore

#### Étape 2B.5 : Configurer les restrictions d'API

1. Dans **API restrictions**, sélectionnez **Restrict key**
2. Cochez les APIs suivantes :
   - ✅ **Places API**
   - ✅ **Places API (New)**
   - ✅ **Geocoding API**
   - ✅ **Distance Matrix API**
   - ✅ **Maps SDK for Android**

3. Cliquez sur **OK**

#### Étape 2B.6 : Sauvegarder

1. Cliquez sur **SAVE**
2. Attendez la confirmation

#### Étape 2B.7 : Copier la clé

```
🔑 CLÉ ANDROID : AIza...
```

---

### 🔹 C. Clé API iOS

#### Étape 2C.1 : Vérifier le Bundle ID

Le Bundle ID de votre app iOS est : **`com.yombalyoon.yombalyoonapp`**

Vous pouvez le vérifier dans `app.json` :
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yombalyoon.yombalyoonapp"
    }
  }
}
```

#### Étape 2C.2 : Créer la clé

1. Dans Google Cloud Console > **Credentials**
2. Cliquez sur **+ CREATE CREDENTIALS** > **API key**
3. Copiez immédiatement la clé créée

#### Étape 2C.3 : Configurer le nom

1. Cliquez sur la clé
2. Dans le champ **Name**, entrez : `Yombal Yoon - iOS`

#### Étape 2C.4 : Configurer les restrictions d'application

1. Dans **Application restrictions**, sélectionnez **iOS apps**
2. Cliquez sur **+ ADD AN ITEM**
3. Entrez le **Bundle ID** : `com.yombalyoon.yombalyoonapp`
4. Cliquez sur **Done**

#### Étape 2C.5 : Configurer les restrictions d'API

1. Dans **API restrictions**, sélectionnez **Restrict key**
2. Cochez les APIs suivantes :
   - ✅ **Places API**
   - ✅ **Places API (New)**
   - ✅ **Geocoding API**
   - ✅ **Distance Matrix API**
   - ✅ **Maps SDK for iOS**

3. Cliquez sur **OK**

#### Étape 2C.6 : Sauvegarder

1. Cliquez sur **SAVE**
2. Attendez la confirmation

#### Étape 2C.7 : Copier la clé

```
🔑 CLÉ iOS : AIza...
```

---

## 🔐 PARTIE 3 : Ajouter les Clés aux Secrets Supabase

### Étape 3.1 : Accéder aux Secrets Supabase

1. Allez sur : **https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/settings/functions**
2. Cliquez sur l'onglet **Secrets** (ou **Edge Functions** > **Secrets**)

### Étape 3.2 : Ajouter la clé Web

1. Cliquez sur **Add new secret**
2. Entrez :
   - **Name** : `GOOGLE_MAPS_API_KEY_WEB`
   - **Value** : Collez votre clé Web (AIza...)
3. Cliquez sur **Save** ou **Add secret**

### Étape 3.3 : Ajouter la clé Android

1. Cliquez sur **Add new secret**
2. Entrez :
   - **Name** : `GOOGLE_MAPS_API_KEY_ANDROID`
   - **Value** : Collez votre clé Android (AIza...)
3. Cliquez sur **Save**

### Étape 3.4 : Ajouter la clé iOS

1. Cliquez sur **Add new secret**
2. Entrez :
   - **Name** : `GOOGLE_MAPS_API_KEY_IOS`
   - **Value** : Collez votre clé iOS (AIza...)
3. Cliquez sur **Save**

### Étape 3.5 : Vérifier les secrets

Vous devriez maintenant voir trois secrets :

```
✅ GOOGLE_MAPS_API_KEY_WEB
✅ GOOGLE_MAPS_API_KEY_ANDROID
✅ GOOGLE_MAPS_API_KEY_IOS
```

---

## 🚀 PARTIE 4 : Mettre à Jour l'Edge Function

### Étape 4.1 : Comprendre le changement

L'Edge Function `google-places-proxy` doit être mise à jour pour utiliser les trois clés distinctes au lieu d'une seule clé unifiée.

### Étape 4.2 : Vérifier le code actuel

Le code actuel utilise une seule clé :
```typescript
const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
```

Il doit être modifié pour utiliser trois clés selon la plateforme.

### Étape 4.3 : Redéployer l'Edge Function

Une fois le code mis à jour (voir section suivante), redéployez :

```bash
supabase functions deploy google-places-proxy
```

---

## ✅ PARTIE 5 : Vérifications Finales

### Étape 5.1 : Vérifier l'activation des APIs

1. Allez sur : **https://console.cloud.google.com/apis/library**
2. Recherchez et vérifiez que les APIs suivantes sont **activées** :
   - ✅ Places API
   - ✅ Places API (New)
   - ✅ Geocoding API
   - ✅ Distance Matrix API
   - ✅ Maps JavaScript API (pour Web)
   - ✅ Maps SDK for Android
   - ✅ Maps SDK for iOS

3. Si une API n'est pas activée, cliquez dessus et cliquez sur **ENABLE**

### Étape 5.2 : Vérifier la facturation

1. Allez sur : **https://console.cloud.google.com/billing**
2. Vérifiez qu'un compte de facturation est lié au projet
3. Vérifiez que le compte de facturation est actif

### Étape 5.3 : Vérifier les quotas

1. Allez sur : **https://console.cloud.google.com/apis/api/places-backend.googleapis.com/quotas**
2. Vérifiez que vous n'avez pas atteint les limites de quota
3. Si nécessaire, demandez une augmentation de quota

### Étape 5.4 : Tester chaque clé individuellement

#### Test Web (via curl)

```bash
curl "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Dakar&key=VOTRE_CLE_WEB"
```

**Résultat attendu** : `"status": "OK"` avec des prédictions

#### Test Android (via curl)

```bash
curl "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Dakar&key=VOTRE_CLE_ANDROID"
```

**Résultat attendu** : `"status": "REQUEST_DENIED"` (normal, car la clé est restreinte aux apps Android)

#### Test iOS (via curl)

```bash
curl "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Dakar&key=VOTRE_CLE_IOS"
```

**Résultat attendu** : `"status": "REQUEST_DENIED"` (normal, car la clé est restreinte aux apps iOS)

**💡 Note** : Les clés Android et iOS ne fonctionneront que depuis les apps natives, pas depuis curl.

---

## 🧪 PARTIE 6 : Tests sur les Plateformes

### Test 6.1 : Web

1. Ouvrez l'app dans un navigateur : `https://votre-app.natively.dev`
2. Allez dans **Envoi de colis**
3. Cliquez sur le champ **Adresse de départ**
4. Tapez "Plateau" ou "Dakar"
5. **Vérifiez** : Les suggestions d'autocomplétion apparaissent

**✅ Succès** : Les suggestions s'affichent correctement
**❌ Échec** : Voir section Dépannage

### Test 6.2 : Android

1. Lancez l'app sur un appareil ou émulateur Android
2. Allez dans **Envoi de colis**
3. Cliquez sur le champ **Adresse de départ**
4. Tapez "Plateau" ou "Dakar"
5. **Vérifiez** : Les suggestions d'autocomplétion apparaissent

**✅ Succès** : Les suggestions s'affichent correctement
**❌ Échec** : Voir section Dépannage

### Test 6.3 : iOS (TestFlight)

1. Installez l'app via TestFlight sur un iPhone
2. Allez dans **Envoi de colis**
3. Cliquez sur le champ **Adresse de départ**
4. Tapez "Plateau" ou "Dakar"
5. **Vérifiez** : Les suggestions d'autocomplétion apparaissent

**✅ Succès** : Les suggestions s'affichent correctement
**❌ Échec** : Voir section Dépannage

### Test 6.4 : Module Livraison Inter-Régions

Répétez les tests ci-dessus dans le module **Livraison 14 régions** > **Livraison inter régions** si des champs d'adresse avec autocomplétion y sont présents.

---

## 🔧 PARTIE 7 : Dépannage

### Problème 1 : "Configuration API requise"

**Symptôme** : Message d'erreur dans l'app

**Causes possibles** :
- La clé pour cette plateforme n'est pas configurée dans Supabase
- Le nom du secret est incorrect
- L'Edge Function n'a pas été redéployée

**Solutions** :
1. Vérifiez les secrets Supabase : `supabase secrets list`
2. Vérifiez les noms exacts :
   - `GOOGLE_MAPS_API_KEY_WEB`
   - `GOOGLE_MAPS_API_KEY_ANDROID`
   - `GOOGLE_MAPS_API_KEY_IOS`
3. Redéployez l'Edge Function : `supabase functions deploy google-places-proxy`

### Problème 2 : "REQUEST_DENIED" de Google Maps

**Symptôme** : Erreur dans les logs ou message d'erreur dans l'app

**Causes possibles** :
- Les restrictions de la clé ne correspondent pas à l'app
- Le Bundle ID / Package name est incorrect
- Le SHA-1 est incorrect (Android)
- Les APIs ne sont pas activées

**Solutions pour Web** :
1. Vérifiez que les HTTP referrers incluent `*.natively.dev/*`
2. Ajoutez `localhost/*` pour les tests locaux
3. Vérifiez que la clé est bien de type "HTTP referrers"

**Solutions pour Android** :
1. Vérifiez que le package name est exactement : `com.yombalyoon.app`
2. Vérifiez le SHA-1 avec la commande keytool
3. Assurez-vous d'utiliser le SHA-1 du bon keystore (debug vs release)
4. Ajoutez les deux SHA-1 (debug et release) si nécessaire

**Solutions pour iOS** :
1. Vérifiez que le Bundle ID est exactement : `com.yombalyoon.yombalyoonapp`
2. Vérifiez qu'il correspond à celui dans `app.json`
3. Assurez-vous que la clé est bien de type "iOS apps"

### Problème 3 : L'autocomplétion ne fonctionne que sur une plateforme

**Cause** : Une seule clé est configurée ou les autres clés ont des restrictions incorrectes

**Solution** :
1. Vérifiez que les trois clés sont créées dans Google Cloud Console
2. Vérifiez que les trois secrets sont dans Supabase
3. Vérifiez que l'Edge Function utilise bien les trois clés selon la plateforme
4. Redéployez l'Edge Function

### Problème 4 : "OVER_QUERY_LIMIT"

**Cause** : Quota dépassé ou facturation non activée

**Solutions** :
1. Vérifiez la facturation dans Google Cloud Console
2. Vérifiez les quotas : **APIs & Services** > **Quotas**
3. Si nécessaire, demandez une augmentation de quota
4. Vérifiez que vous n'avez pas de boucle infinie d'appels API

### Problème 5 : Les suggestions sont vides

**Cause** : La requête fonctionne mais ne retourne aucun résultat

**Solutions** :
1. Vérifiez les paramètres de la requête (location, radius, components)
2. Essayez avec un terme de recherche plus général (ex: "Dakar" au lieu d'une adresse complète)
3. Vérifiez les logs de l'Edge Function pour voir la réponse de Google

---

## 📊 PARTIE 8 : Récapitulatif des Restrictions

| Plateforme | Type de restriction | Valeur | APIs activées |
|------------|---------------------|--------|---------------|
| **Web** | HTTP referrers | `*.natively.dev/*`<br>`localhost/*` | Places API<br>Places API (New)<br>Geocoding API<br>Distance Matrix API<br>Maps JavaScript API |
| **Android** | Android apps | Package: `com.yombalyoon.app`<br>SHA-1: [Votre SHA-1] | Places API<br>Places API (New)<br>Geocoding API<br>Distance Matrix API<br>Maps SDK for Android |
| **iOS** | iOS apps | Bundle ID: `com.yombalyoon.yombalyoonapp` | Places API<br>Places API (New)<br>Geocoding API<br>Distance Matrix API<br>Maps SDK for iOS |

---

## 📝 PARTIE 9 : Checklist Finale

Avant de considérer la migration comme terminée, vérifiez :

### Google Cloud Console
- [ ] Trois clés API créées (Web, Android, iOS)
- [ ] Chaque clé a un nom clair et descriptif
- [ ] Les restrictions d'application sont correctement configurées
- [ ] Les restrictions d'API sont correctement configurées
- [ ] Toutes les APIs nécessaires sont activées
- [ ] La facturation est active sur le projet
- [ ] Les quotas sont suffisants

### Supabase
- [ ] Secret `GOOGLE_MAPS_API_KEY_WEB` ajouté
- [ ] Secret `GOOGLE_MAPS_API_KEY_ANDROID` ajouté
- [ ] Secret `GOOGLE_MAPS_API_KEY_IOS` ajouté
- [ ] Edge Function `google-places-proxy` mise à jour
- [ ] Edge Function redéployée avec succès

### Tests
- [ ] Test Web réussi (autocomplétion fonctionne)
- [ ] Test Android réussi (autocomplétion fonctionne)
- [ ] Test iOS / TestFlight réussi (autocomplétion fonctionne)
- [ ] Test dans "Envoi de colis" réussi
- [ ] Test dans "Livraison inter régions" réussi (si applicable)

### Documentation
- [ ] Anciennes clés documentées
- [ ] Nouvelles clés documentées
- [ ] SHA-1 Android documenté
- [ ] Bundle ID iOS documenté
- [ ] Date de migration notée

---

## 🔐 PARTIE 10 : Sécurité et Bonnes Pratiques

### Sécurité des Clés

**✅ À FAIRE** :
- Stocker les clés dans Supabase Secrets (jamais dans le code)
- Utiliser des restrictions strictes pour chaque clé
- Documenter les clés dans un gestionnaire de mots de passe sécurisé
- Surveiller l'utilisation des APIs dans Google Cloud Console

**❌ À NE PAS FAIRE** :
- Committer les clés dans Git
- Partager les clés publiquement
- Utiliser la même clé pour toutes les plateformes sans restrictions
- Laisser les clés sans restrictions d'API

### Surveillance

1. **Quotas** : Surveillez régulièrement l'utilisation dans Google Cloud Console
2. **Coûts** : Vérifiez la facturation mensuelle
3. **Logs** : Consultez les logs de l'Edge Function pour détecter les erreurs
4. **Alertes** : Configurez des alertes de quota dans Google Cloud Console

### Rotation des Clés

Il est recommandé de renouveler les clés API tous les 6-12 mois :

1. Créez de nouvelles clés avec les mêmes restrictions
2. Ajoutez les nouvelles clés aux secrets Supabase (avec des noms temporaires)
3. Mettez à jour l'Edge Function pour utiliser les nouvelles clés
4. Testez sur toutes les plateformes
5. Désactivez les anciennes clés
6. Après 30 jours, supprimez les anciennes clés

---

## 📞 PARTIE 11 : Support et Ressources

### Documentation Officielle

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

### Guides Complémentaires

Dans ce projet, consultez également :
- `GOOGLE_MAPS_PLATFORM_SETUP.md` - Guide détaillé multi-plateforme
- `WEB_API_KEY_SETUP_GUIDE.md` - Guide spécifique Web
- `IOS_API_KEY_SETUP_GUIDE.md` - Guide spécifique iOS
- `ANDROID_AUTOCOMPLETE_FIX.md` - Guide spécifique Android

### Logs et Debugging

**Logs Supabase Edge Function** :
```bash
supabase functions logs google-places-proxy --follow
```

**Logs dans l'app** :
- Ouvrez la console du navigateur (Web)
- Utilisez React Native Debugger (iOS/Android)
- Consultez les logs Xcode (iOS)
- Consultez les logs Android Studio (Android)

### Contact

Si vous rencontrez des problèmes persistants :

1. Vérifiez d'abord cette documentation complète
2. Consultez les logs de l'Edge Function
3. Vérifiez les guides complémentaires
4. Contactez le support Google Cloud si le problème vient de Google Maps API
5. Contactez le support Supabase si le problème vient des Edge Functions

---

## 📅 Historique des Modifications

| Date | Version | Modifications |
|------|---------|---------------|
| 2025-01-23 | 1.0 | Création du guide complet de réinitialisation |

---

## ✅ Conclusion

Une fois toutes les étapes de ce guide complétées, vous aurez :

✅ Trois clés API Google Maps correctement configurées et restreintes
✅ Les clés stockées en sécurité dans Supabase Secrets
✅ Une Edge Function mise à jour pour utiliser les bonnes clés selon la plateforme
✅ L'autocomplétion fonctionnelle sur Web, Android et iOS
✅ Une documentation complète pour référence future

**🎉 Félicitations ! Votre configuration Google Maps API est maintenant complète et sécurisée.**

---

**Dernière mise à jour** : 2025-01-23  
**Version** : 1.0  
**Auteur** : Natively Assistant
