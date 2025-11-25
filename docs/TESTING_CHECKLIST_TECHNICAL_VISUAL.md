
# Tests Techniques & Visuels - Yombal Yoon
## Guide de Vérification Complète (Web, iOS, Android)

Ce document contient la liste complète des tests à effectuer pour garantir la cohérence technique et visuelle entre toutes les plateformes.

---

## 🎨 7. Cohérence Visuelle (Design System)

### ✅ Composants Unifiés

**Objectif:** Vérifier que tous les composants UI ont le même style sur Web, iOS et Android.

#### Test 1: Boutons (YYButton)
- [ ] **Web:** Ouvrir l'app sur navigateur
  - Vérifier que tous les boutons utilisent les couleurs Yombal Yoon (Vert, Jaune, Rouge)
  - Vérifier le border-radius (12px)
  - Vérifier les ombres (shadow)
  - Vérifier les états: normal, pressed, disabled
  
- [ ] **iOS:** Ouvrir l'app sur TestFlight
  - Comparer visuellement avec Web
  - Vérifier que les couleurs sont identiques
  - Vérifier que les tailles sont identiques
  - Tester les interactions tactiles
  
- [ ] **Android:** Ouvrir l'app sur Android
  - Comparer visuellement avec Web et iOS
  - Vérifier que les couleurs sont identiques
  - Vérifier que les tailles sont identiques
  - Tester les interactions tactiles

**Composants à vérifier:**
- Bouton "Publier un trajet" (Covoiturage)
- Bouton "Envoyer mon colis" (Colis)
- Bouton "Commander" (Livraison 14 régions)
- Bouton "Recharger" / "Retirer" (Wallet)
- Bouton "Enregistrer" (Profil)

#### Test 2: Cartes (YYCard)
- [ ] **Web:** Vérifier les cartes sur tous les écrans
  - Fond blanc (#FFFFFF)
  - Border-radius (16px)
  - Ombre légère (shadow)
  - Padding uniforme (16px)
  
- [ ] **iOS:** Comparer avec Web
  - Même apparence visuelle
  - Même espacement
  
- [ ] **Android:** Comparer avec Web et iOS
  - Même apparence visuelle
  - Même espacement

**Écrans à vérifier:**
- Accueil: cartes des modules
- Covoiturage: cartes des trajets
- Colis: cartes des colis
- Profil: cartes des sections

#### Test 3: Champs de Formulaire (YYFormField)
- [ ] **Web:** Vérifier tous les champs de saisie
  - Border-radius (12px)
  - Border color (#E0E0E0)
  - Focus state (border vert)
  - Error state (border rouge)
  - Placeholder color (#999999)
  
- [ ] **iOS:** Comparer avec Web
  - Même apparence
  - Même comportement au focus
  
- [ ] **Android:** Comparer avec Web et iOS
  - Même apparence
  - Même comportement au focus

**Formulaires à vérifier:**
- Publier un trajet (Covoiturage)
- Envoyer un colis (Colis)
- Livraison inter-régions (Livraison)
- Modifier profil (Profil)

### ✅ Couleurs & Icônes

#### Test 4: Palette de Couleurs
- [ ] **Vérifier sur Web:**
  - Vert: #008000 (Primary)
  - Jaune: #FFFF00 (Secondary)
  - Rouge: #FF0000 (Accent)
  - Fond: #F5F5F5
  - Cartes: #FFFFFF
  - Texte: #333333
  
- [ ] **Vérifier sur iOS:**
  - Comparer avec Web (capture d'écran)
  - Aucune variation de teinte
  
- [ ] **Vérifier sur Android:**
  - Comparer avec Web et iOS
  - Aucune variation de teinte

**Méthode de vérification:**
1. Prendre des captures d'écran sur chaque plateforme
2. Utiliser un outil de comparaison de couleurs (ex: ColorPicker)
3. Vérifier que les codes hexadécimaux sont identiques

#### Test 5: Icônes
- [ ] **Web:** Vérifier les icônes des modules
  - Covoiturage: 🚗 (car)
  - Colis: 📦 (package)
  - Livraison: 🗺️ (map)
  - Profil: 👤 (person)
  - Wallet: 💳 (wallet)
  
- [ ] **iOS:** Vérifier les SF Symbols
  - car.fill
  - shippingbox.fill
  - map.fill
  - person.fill
  - creditcard.fill
  
- [ ] **Android:** Vérifier les Material Icons
  - directions-car
  - local-shipping
  - map
  - person
  - account-balance-wallet

**Vérification:**
- Les icônes doivent avoir la même signification visuelle
- Les tailles doivent être identiques (24px par défaut)
- Les couleurs doivent être identiques

### ✅ Mise en Page (Layout)

#### Test 6: Responsive Design
- [ ] **Web Desktop (1920x1080):**
  - Layout centré avec max-width
  - Marges latérales
  - Cartes en grille
  
- [ ] **Web Mobile (375x667):**
  - Layout identique à l'app mobile
  - Pas de débordement horizontal
  - Scroll vertical fluide
  
- [ ] **iOS (iPhone 14):**
  - Layout identique à Web Mobile
  - Safe area respectée
  - Pas de contenu sous la notch
  
- [ ] **Android (Pixel 5):**
  - Layout identique à iOS
  - Status bar respectée
  - Pas de contenu sous les boutons système

**Écrans à vérifier:**
- Accueil
- Covoiturage
- Colis
- Livraison
- Profil
- Wallet

---

## 🗄 8. Clés API & Services

### ✅ Google Maps API Keys

#### Test 7: Configuration des Clés
- [ ] **Vérifier dans app.json:**
  ```json
  "extra": {
    "GOOGLE_MAPS_API_KEY": "AIzaSyCyIEHUEYap3t8z_lqy2tCNhHFBhYHTSHQ"
  }
  ```
  
- [ ] **Vérifier dans eas.json (production):**
  ```json
  "env": {
    "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY": "AIzaSyCyIEHUEYap3t8z_lqy2tCNhHFBhYHTSHQ"
  }
  ```
  
- [ ] **Vérifier dans Supabase Edge Function Secrets:**
  - GOOGLE_MAPS_API_KEY_SERVER: Configuré ✅

#### Test 8: Edge Function Google Maps
- [ ] **Web:** Tester l'autocomplétion
  - Ouvrir "Publier un trajet"
  - Taper "Dakar" dans "Ville de départ"
  - Vérifier que les suggestions apparaissent
  - Sélectionner une suggestion
  - Vérifier qu'aucune erreur n'apparaît
  
- [ ] **iOS:** Tester l'autocomplétion
  - Même test que Web
  - Vérifier les logs dans Xcode
  - Vérifier qu'aucune erreur "REQUEST_DENIED"
  
- [ ] **Android:** Tester l'autocomplétion
  - Même test que Web et iOS
  - Vérifier les logs dans Android Studio
  - Vérifier qu'aucune erreur "REQUEST_DENIED"

**Modules à tester:**
- Covoiturage: Publier un trajet (Départ/Arrivée)
- Colis: Envoyer un colis (Adresse départ/arrivée)
- Livraison: Livraison inter-régions (si autocomplétion activée)

#### Test 9: Validation des Clés API
- [ ] **Google Cloud Console:**
  - Aller dans APIs & Services > Credentials
  - Vérifier que GOOGLE_MAPS_API_KEY_SERVER existe
  - Vérifier "Application restrictions": None (ou IP restrictions)
  - Vérifier "API restrictions": Places API, Geocoding API, Distance Matrix API activées
  - Vérifier que la facturation est activée
  
- [ ] **Supabase Dashboard:**
  - Aller dans Project Settings > Edge Functions
  - Vérifier que GOOGLE_MAPS_API_KEY_SERVER est configuré
  - Vérifier que la valeur est correcte (copier/coller depuis Google Cloud Console)

#### Test 10: Logs Edge Function
- [ ] **Supabase Dashboard:**
  - Aller dans Edge Functions > google-places-proxy
  - Cliquer sur "Logs"
  - Effectuer un test d'autocomplétion sur Web
  - Vérifier les logs:
    ```
    ✅ Clé API serveur chargée avec succès
    🔍 Autocomplete pour: "Dakar" (web)
    ✅ X résultats trouvés (web)
    ```
  - Effectuer un test sur iOS
  - Vérifier les logs:
    ```
    📱 Requête: ios - autocomplete
    ✅ X résultats trouvés (ios)
    ```
  - Effectuer un test sur Android
  - Vérifier les logs:
    ```
    📱 Requête: android - autocomplete
    ✅ X résultats trouvés (android)
    ```

### ✅ Anciennes Clés (Vérification de Suppression)

#### Test 11: Recherche d'Anciennes Clés
- [ ] **Rechercher dans le code:**
  ```bash
  # Rechercher toutes les occurrences de clés API
  grep -r "AIzaSy" .
  ```
  
- [ ] **Vérifier qu'il n'y a QUE:**
  - app.json: GOOGLE_MAPS_API_KEY
  - eas.json: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
  - Supabase Edge Function: GOOGLE_MAPS_API_KEY_SERVER (dans secrets)
  
- [ ] **Vérifier qu'il n'y a PAS:**
  - Clés hardcodées dans les composants
  - Clés dans les fichiers .env
  - Clés dans les fichiers de configuration obsolètes

---

## 🔄 9. Synchronisation Backend

### ✅ Supabase Configuration

#### Test 12: Variables d'Environnement
- [ ] **Vérifier dans app.json:**
  ```json
  "extra": {
    "SUPABASE_URL": "https://drxtaxepofuoelplgrei.supabase.co",
    "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
  
- [ ] **Vérifier dans eas.json (production):**
  ```json
  "env": {
    "EXPO_PUBLIC_SUPABASE_URL": "https://drxtaxepofuoelplgrei.supabase.co",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
  
- [ ] **Vérifier dans config/supabase.ts:**
  ```typescript
  const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL;
  const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;
  ```

#### Test 13: Connexion Supabase
- [ ] **Web:** Tester la connexion
  - Ouvrir la console du navigateur
  - Vérifier qu'il n'y a pas d'erreur "Supabase client not initialized"
  - Effectuer une action (ex: publier un trajet)
  - Vérifier que les données sont enregistrées dans Supabase
  
- [ ] **iOS:** Tester la connexion
  - Ouvrir Xcode Console
  - Vérifier qu'il n'y a pas d'erreur Supabase
  - Effectuer une action
  - Vérifier que les données sont enregistrées
  
- [ ] **Android:** Tester la connexion
  - Ouvrir Android Studio Logcat
  - Vérifier qu'il n'y a pas d'erreur Supabase
  - Effectuer une action
  - Vérifier que les données sont enregistrées

### ✅ Edge Functions

#### Test 14: Versions des Edge Functions
- [ ] **Supabase Dashboard:**
  - Aller dans Edge Functions
  - Vérifier la liste des fonctions:
    - google-places-proxy
    - send-intercity-notifications
  - Vérifier la date de déploiement (doit être récente)
  - Vérifier le statut: Active ✅
  
- [ ] **Tester depuis Web:**
  - Effectuer une action qui appelle une Edge Function
  - Vérifier les logs dans Supabase Dashboard
  - Vérifier qu'il n'y a pas d'erreur
  
- [ ] **Tester depuis iOS:**
  - Même test que Web
  - Vérifier les logs
  
- [ ] **Tester depuis Android:**
  - Même test que Web et iOS
  - Vérifier les logs

### ✅ Row Level Security (RLS)

#### Test 15: Politiques RLS
- [ ] **Supabase Dashboard:**
  - Aller dans Database > Tables
  - Pour chaque table, vérifier les politiques RLS:
    - carpool_rides
    - carpool_reservations
    - parcel_requests
    - intercity_deliveries
    - wallet_transactions
    - profiles
  
- [ ] **Vérifier les politiques:**
  - SELECT: Utilisateurs peuvent voir leurs propres données
  - INSERT: Utilisateurs peuvent créer leurs propres données
  - UPDATE: Utilisateurs peuvent modifier leurs propres données
  - DELETE: Utilisateurs peuvent supprimer leurs propres données (si applicable)

#### Test 16: Test des Permissions
- [ ] **Web:** Tester les permissions
  - Créer un trajet (INSERT)
  - Voir ses trajets (SELECT)
  - Modifier un trajet (UPDATE)
  - Annuler un trajet (UPDATE/DELETE)
  - Vérifier qu'on ne peut pas voir/modifier les trajets des autres
  
- [ ] **iOS:** Même test que Web
  
- [ ] **Android:** Même test que Web et iOS

---

## 📦 10. Builds & Versionning

### ✅ Numéros de Version

#### Test 17: Version Unifiée
- [ ] **Vérifier dans app.json:**
  ```json
  "version": "1.0.0",
  "ios": {
    "buildNumber": "1"
  },
  "android": {
    "versionCode": 1
  }
  ```
  
- [ ] **Web:** Vérifier la version affichée
  - Aller dans Profil > À propos
  - Vérifier: Version 1.0.0
  
- [ ] **iOS:** Vérifier la version
  - Aller dans Profil > À propos
  - Vérifier: Version 1.0.0 (1)
  
- [ ] **Android:** Vérifier la version
  - Aller dans Profil > À propos
  - Vérifier: Version 1.0.0 (1)

### ✅ Build iOS (TestFlight)

#### Test 18: Build iOS
- [ ] **Avant le build:**
  - Valider tous les tests sur Web ✅
  - Vérifier que le code est à jour
  - Vérifier les variables d'environnement dans eas.json
  
- [ ] **Lancer le build:**
  ```bash
  eas build --platform ios --profile production
  ```
  
- [ ] **Vérifier le build:**
  - Attendre la fin du build (15-30 min)
  - Vérifier qu'il n'y a pas d'erreurs
  - Vérifier qu'il n'y a pas de warnings bloquants
  
- [ ] **Upload vers TestFlight:**
  ```bash
  eas submit --platform ios --profile production
  ```
  
- [ ] **Tester sur TestFlight:**
  - Installer l'app depuis TestFlight
  - Effectuer tous les tests fonctionnels
  - Vérifier que tout fonctionne comme sur Web

### ✅ Build Android (AAB)

#### Test 19: Build Android
- [ ] **Avant le build:**
  - Valider tous les tests sur Web ✅
  - Valider tous les tests sur iOS ✅
  - Vérifier que le code est à jour
  - Vérifier les variables d'environnement dans eas.json
  
- [ ] **Lancer le build:**
  ```bash
  eas build --platform android --profile production
  ```
  
- [ ] **Vérifier le build:**
  - Attendre la fin du build (15-30 min)
  - Vérifier qu'il n'y a pas d'erreurs
  - Vérifier qu'il n'y a pas de warnings bloquants
  
- [ ] **Télécharger le AAB:**
  - Aller dans EAS Dashboard
  - Télécharger le fichier .aab
  - Vérifier la taille du fichier (< 100 MB)

### ✅ Warnings & Erreurs

#### Test 20: Vérification des Warnings
- [ ] **Pendant le build iOS:**
  - Vérifier qu'il n'y a pas: "Google Maps API blocked"
  - Vérifier qu'il n'y a pas: "Supabase anon key missing"
  - Vérifier qu'il n'y a pas: "undefined variable"
  - Vérifier qu'il n'y a pas: "deprecated API"
  
- [ ] **Pendant le build Android:**
  - Vérifier qu'il n'y a pas: "Google Maps API blocked"
  - Vérifier qu'il n'y a pas: "Supabase anon key missing"
  - Vérifier qu'il n'y a pas: "undefined variable"
  - Vérifier qu'il n'y a pas: "deprecated API"

---

## 📲 11. Tests Finaux Utilisateur

### ✅ Test Utilisateur Réel

#### Test 21: Distribution aux Testeurs
- [ ] **Préparer les builds:**
  - iOS: Inviter 2 testeurs sur TestFlight
  - Android: Envoyer le fichier APK (ou AAB via Play Console Internal Testing)
  
- [ ] **Instructions aux testeurs:**
  - Installer l'application
  - Créer un compte / Se connecter
  - Tester le mini-onboarding
  - Tester chaque module:
    - Covoiturage: Publier un trajet
    - Colis: Envoyer un colis
    - Livraison: Commander une livraison
    - Wallet: Recharger le wallet
    - Profil: Modifier le profil
  
- [ ] **Recueillir les retours:**
  - Créer un formulaire de feedback
  - Questions à poser:
    - L'application est-elle facile à utiliser ?
    - Avez-vous rencontré des bugs ?
    - L'autocomplétion fonctionne-t-elle ?
    - Les couleurs sont-elles cohérentes ?
    - La navigation est-elle fluide ?
    - Le bouton "Passer" du mini-onboarding fonctionne-t-il ?

### ✅ Stabilité Mini-Onboarding

#### Test 22: Navigation Mini-Onboarding
- [ ] **Web:**
  - Ouvrir l'app pour la première fois
  - Vérifier que le mini-onboarding s'affiche
  - Sélectionner des rôles
  - Cliquer sur "Continuer"
  - Vérifier qu'on arrive sur l'accueil
  - Vérifier qu'il n'y a pas de boucle
  
- [ ] **iOS:**
  - Même test que Web
  - Vérifier qu'il n'y a pas de boucle
  - Vérifier que le bouton "Passer" fonctionne
  
- [ ] **Android:**
  - Même test que Web et iOS
  - Vérifier qu'il n'y a pas de boucle
  - Vérifier que le bouton "Passer" fonctionne

#### Test 23: Bouton "Passer"
- [ ] **Web:**
  - Ouvrir le mini-onboarding
  - Cliquer sur "Passer" sans sélectionner de rôles
  - Vérifier qu'on arrive sur l'accueil
  - Vérifier que tous les modules sont accessibles
  
- [ ] **iOS:**
  - Même test que Web
  - Vérifier le comportement identique
  
- [ ] **Android:**
  - Même test que Web et iOS
  - Vérifier le comportement identique

---

## 📊 Résumé des Tests

### Checklist Globale

#### Design System
- [ ] Boutons unifiés (Web, iOS, Android)
- [ ] Cartes unifiées (Web, iOS, Android)
- [ ] Champs de formulaire unifiés (Web, iOS, Android)
- [ ] Couleurs identiques (Web, iOS, Android)
- [ ] Icônes cohérentes (Web, iOS, Android)
- [ ] Layout responsive (Web, iOS, Android)

#### API Keys & Services
- [ ] Google Maps API Key configurée
- [ ] Edge Function Google Maps fonctionnelle
- [ ] Autocomplétion Web ✅
- [ ] Autocomplétion iOS ✅
- [ ] Autocomplétion Android ✅
- [ ] Aucune ancienne clé dans le code

#### Backend Synchronization
- [ ] Supabase URL identique (Web, iOS, Android)
- [ ] Supabase ANON KEY identique (Web, iOS, Android)
- [ ] Edge Functions à jour
- [ ] RLS policies configurées
- [ ] Permissions testées (Web, iOS, Android)

#### Builds & Versioning
- [ ] Version unifiée (1.0.0)
- [ ] Build iOS TestFlight ✅
- [ ] Build Android AAB ✅
- [ ] Aucun warning bloquant

#### Tests Utilisateur
- [ ] 2 testeurs externes
- [ ] Feedback recueilli
- [ ] Mini-onboarding stable
- [ ] Bouton "Passer" fonctionnel (Web, iOS, Android)

---

## 🎯 Critères de Validation

### ✅ Validation Complète

L'application est prête pour la production si:

1. **Design System:** Tous les composants sont visuellement identiques sur Web, iOS et Android
2. **API Keys:** L'autocomplétion Google Maps fonctionne sur les 3 plateformes
3. **Backend:** Supabase est configuré de manière identique sur les 3 plateformes
4. **Builds:** Les builds iOS et Android sont générés sans erreur
5. **Tests Utilisateur:** Les testeurs externes n'ont pas rencontré de bugs bloquants

### ❌ Validation Échouée

L'application n'est PAS prête si:

1. Des différences visuelles existent entre les plateformes
2. L'autocomplétion ne fonctionne pas sur une plateforme
3. Des erreurs Supabase apparaissent sur une plateforme
4. Des warnings bloquants apparaissent pendant les builds
5. Les testeurs externes rencontrent des bugs critiques

---

## 📝 Notes Importantes

### Ordre des Tests

1. **Toujours tester sur Web en premier**
2. **Ensuite tester sur iOS**
3. **Enfin tester sur Android**
4. **Corriger les écarts AVANT de passer à la plateforme suivante**

### Documentation des Bugs

Pour chaque bug trouvé:
1. Noter la plateforme (Web, iOS, Android)
2. Noter l'écran concerné
3. Noter les étapes pour reproduire
4. Prendre une capture d'écran
5. Noter la gravité (Bloquant, Majeur, Mineur)

### Suivi des Tests

Utiliser ce document comme checklist:
- [ ] = À faire
- [x] = Fait
- [!] = Bug trouvé

---

**Date de création:** 2024
**Version du document:** 1.0.0
**Dernière mise à jour:** [À compléter lors de l'utilisation]
