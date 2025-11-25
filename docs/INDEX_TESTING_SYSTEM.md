
# Index - Système de Tests Yombal Yoon
## Documentation Complète des Tests Techniques & Visuels

---

## 📚 Vue d'Ensemble

Ce système de documentation fournit tous les outils nécessaires pour garantir la cohérence technique et visuelle de l'application Yombal Yoon sur Web, iOS et Android.

---

## 🗂️ Structure de la Documentation

### 1. Guides Principaux

#### 📋 [TESTING_CHECKLIST_TECHNICAL_VISUAL.md](./TESTING_CHECKLIST_TECHNICAL_VISUAL.md)
**Checklist Complète de Tests**
- Tests de cohérence visuelle (Design System)
- Tests des clés API et services
- Tests de synchronisation backend
- Tests de builds et versioning
- Tests finaux utilisateur
- Critères de validation

**Utilisation:** Guide de référence complet pour tous les tests manuels.

---

#### ⚡ [QUICK_TEST_GUIDE.md](./QUICK_TEST_GUIDE.md)
**Guide Rapide de Test**
- Tests rapides (5 minutes)
- Tests détaillés (30 minutes)
- Checklist finale
- Résolution de problèmes

**Utilisation:** Guide pratique pour les tests quotidiens.

---

#### 📊 [IMPLEMENTATION_SUMMARY_TESTS.md](./IMPLEMENTATION_SUMMARY_TESTS.md)
**Résumé de l'Implémentation**
- Objectifs atteints
- Fichiers créés/modifiés
- Instructions d'utilisation
- Configuration des API Keys
- Commandes de build

**Utilisation:** Vue d'ensemble de l'implémentation complète.

---

### 2. Tests Automatiques

#### 🔧 Écran de Test dans l'App
**Fichier:** `app/test-platform-consistency.tsx`

**Accès:**
1. Ouvrir l'application (Web, iOS ou Android)
2. Aller dans **Profil**
3. Cliquer sur **"Tests de Cohérence"** (section Paramètres)

**Tests Effectués:**
- ✅ Design System (Couleurs, Typographie, Espacements)
- ✅ API Keys (Google Maps, Supabase)
- ✅ Backend Synchronization (Supabase URL, ANON Key, Connexion)
- ✅ Build Configuration (Version, Bundle ID, Package Name)

**Résultats:**
- ✅ Vert = Test réussi
- ❌ Rouge = Test échoué
- ⚠️ Jaune = Avertissement
- ⏳ Gris = En attente

---

## 🎯 Workflows de Test

### Workflow 1: Test Rapide (5 minutes)

**Objectif:** Vérification rapide avant un commit ou un build.

```bash
# 1. Test Visuel
# Ouvrir l'app sur Web, iOS, Android
# Comparer visuellement l'écran d'accueil

# 2. Test Autocomplétion
# Aller dans Covoiturage > Publier un trajet
# Taper "Dakar" dans "Ville de départ"
# Vérifier que les suggestions apparaissent

# 3. Test Backend
# Aller dans Profil > Modifier le profil
# Changer le nom et enregistrer
# Vérifier que la modification est sauvegardée
```

**Validation:** Si les 3 tests passent, le code est prêt.

---

### Workflow 2: Test Complet (30 minutes)

**Objectif:** Vérification complète avant un build de production.

**Étapes:**
1. **Tests Automatiques** (5 min)
   - Ouvrir l'écran "Tests de Cohérence"
   - Lancer les tests automatiques
   - Vérifier que tous les tests passent

2. **Tests Manuels Design** (10 min)
   - Vérifier les boutons (couleurs, tailles, ombres)
   - Vérifier les cartes (fond, border-radius, ombres)
   - Vérifier les champs de formulaire (border, focus, error)

3. **Tests Manuels Fonctionnels** (10 min)
   - Tester l'autocomplétion sur tous les modules
   - Tester la création de données (trajet, colis, livraison)
   - Tester la modification de profil

4. **Vérification des Logs** (5 min)
   - Vérifier les logs Supabase Edge Functions
   - Vérifier les logs de la console (Web/iOS/Android)
   - Vérifier qu'il n'y a pas d'erreurs

**Validation:** Si tous les tests passent, le build peut être lancé.

---

### Workflow 3: Test Pré-Production (1 heure)

**Objectif:** Validation finale avant la soumission aux stores.

**Étapes:**
1. **Tests Automatiques** (5 min)
   - Sur Web, iOS, Android

2. **Tests Manuels Complets** (30 min)
   - Suivre la checklist complète dans `TESTING_CHECKLIST_TECHNICAL_VISUAL.md`

3. **Builds** (15 min)
   - Lancer les builds iOS et Android
   - Vérifier qu'il n'y a pas d'erreurs
   - Vérifier qu'il n'y a pas de warnings bloquants

4. **Tests Utilisateur** (10 min)
   - Distribuer aux testeurs externes
   - Recueillir les premiers retours

**Validation:** Si tous les tests passent et les testeurs ne rencontrent pas de bugs bloquants, l'app est prête pour la production.

---

## 📱 Tests par Plateforme

### Web

#### Lancer l'App
```bash
npm run web
# Ouvrir http://localhost:8081
```

#### Tests Spécifiques Web
- [ ] Responsive design (desktop et mobile)
- [ ] Autocomplétion Google Maps
- [ ] Connexion Supabase
- [ ] Navigation entre les écrans
- [ ] Formulaires et validation

#### Logs
```bash
# Ouvrir la console du navigateur
F12 > Console
```

---

### iOS

#### Lancer l'App
```bash
# TestFlight
# Installer l'app depuis TestFlight
```

#### Tests Spécifiques iOS
- [ ] Safe area (notch)
- [ ] SF Symbols (icônes)
- [ ] Autocomplétion Google Maps
- [ ] Connexion Supabase
- [ ] Navigation native tabs

#### Logs
```bash
# Xcode Console
Xcode > Window > Devices and Simulators > Console
```

---

### Android

#### Lancer l'App
```bash
# APK ou AAB
# Installer l'app depuis le fichier
```

#### Tests Spécifiques Android
- [ ] Status bar (padding top)
- [ ] Material Icons (icônes)
- [ ] Autocomplétion Google Maps
- [ ] Connexion Supabase
- [ ] Navigation

#### Logs
```bash
# Android Studio Logcat
Android Studio > Logcat
```

---

## 🔧 Configuration Requise

### Google Maps API

#### Clés Nécessaires
1. **GOOGLE_MAPS_API_KEY** (app.json)
   - Utilisée par Web, iOS, Android
   - Restrictions: HTTP referrers (Web), Bundle ID (iOS), Package name (Android)

2. **GOOGLE_MAPS_API_KEY_SERVER** (Supabase Edge Function Secrets)
   - Utilisée par l'Edge Function google-places-proxy
   - Restrictions: Aucune (ou IP restrictions)

#### Configuration
```bash
# Vérifier app.json
grep "GOOGLE_MAPS_API_KEY" app.json

# Vérifier eas.json
grep "GOOGLE_MAPS_API_KEY" eas.json

# Vérifier Supabase Secrets
# Aller sur Supabase Dashboard > Project Settings > Edge Functions
```

---

### Supabase

#### Configuration Requise
1. **SUPABASE_URL** (app.json, eas.json)
   - URL du projet Supabase
   - Doit être identique sur toutes les plateformes

2. **SUPABASE_ANON_KEY** (app.json, eas.json)
   - Clé anonyme du projet Supabase
   - Doit être identique sur toutes les plateformes

#### Vérification
```bash
# Vérifier app.json
grep "SUPABASE" app.json

# Vérifier eas.json
grep "SUPABASE" eas.json

# Vérifier sur Supabase Dashboard
# Project Settings > API
```

---

## 📊 Métriques de Qualité

### Critères de Validation

#### Design System
- **Objectif:** 100% de cohérence visuelle
- **Mesure:** Comparaison visuelle des captures d'écran
- **Validation:** Aucune différence visible entre Web, iOS, Android

#### Fonctionnalités
- **Objectif:** 100% de fonctionnalités identiques
- **Mesure:** Tests manuels sur chaque plateforme
- **Validation:** Toutes les fonctionnalités fonctionnent de manière identique

#### Performance
- **Objectif:** Temps de chargement < 3 secondes
- **Mesure:** Tests de performance sur chaque plateforme
- **Validation:** Aucun écran ne prend plus de 3 secondes à charger

#### Stabilité
- **Objectif:** 0 crash
- **Mesure:** Tests utilisateur sur 2 testeurs externes
- **Validation:** Aucun crash rapporté

---

## 🐛 Résolution de Problèmes

### Problème: Autocomplétion ne fonctionne pas

#### Diagnostic
1. Ouvrir l'écran "Tests de Cohérence"
2. Vérifier le test "Google Maps Autocomplete"
3. Noter le message d'erreur

#### Solutions Possibles

**Erreur: REQUEST_DENIED**
```bash
# Vérifier que GOOGLE_MAPS_API_KEY_SERVER est configuré
# Supabase Dashboard > Project Settings > Edge Functions

# Vérifier que la clé a les APIs activées
# Google Cloud Console > APIs & Services > Credentials
# Places API, Geocoding API, Distance Matrix API
```

**Erreur: OVER_QUERY_LIMIT**
```bash
# Vérifier les quotas
# Google Cloud Console > APIs & Services > Dashboard
# Augmenter les quotas si nécessaire
```

**Erreur: Network Error**
```bash
# Vérifier la connexion internet
# Vérifier que Supabase est accessible
# Vérifier les logs Edge Function
```

---

### Problème: Supabase ne fonctionne pas

#### Diagnostic
1. Ouvrir l'écran "Tests de Cohérence"
2. Vérifier le test "Supabase Connection"
3. Noter le message d'erreur

#### Solutions Possibles

**Erreur: Invalid API Key**
```bash
# Vérifier que SUPABASE_ANON_KEY est correct
grep "SUPABASE_ANON_KEY" app.json

# Comparer avec Supabase Dashboard
# Project Settings > API > anon public
```

**Erreur: Network Error**
```bash
# Vérifier que SUPABASE_URL est correct
grep "SUPABASE_URL" app.json

# Vérifier que le projet Supabase est actif
# Supabase Dashboard
```

---

### Problème: Build échoue

#### Diagnostic
```bash
# Vérifier les logs du build
eas build:view --platform ios
eas build:view --platform android
```

#### Solutions Possibles

**Erreur: Missing Environment Variable**
```bash
# Vérifier eas.json
cat eas.json | grep -A 20 "production"

# Ajouter les variables manquantes
```

**Erreur: Certificate/Keystore**
```bash
# Vérifier les credentials
eas credentials

# Régénérer si nécessaire
eas credentials --platform ios
eas credentials --platform android
```

---

## 📞 Support

### Documentation
- **Checklist Complète:** [TESTING_CHECKLIST_TECHNICAL_VISUAL.md](./TESTING_CHECKLIST_TECHNICAL_VISUAL.md)
- **Guide Rapide:** [QUICK_TEST_GUIDE.md](./QUICK_TEST_GUIDE.md)
- **Résumé:** [IMPLEMENTATION_SUMMARY_TESTS.md](./IMPLEMENTATION_SUMMARY_TESTS.md)

### Outils
- **Tests Automatiques:** Profil > Paramètres > Tests de Cohérence
- **Supabase Dashboard:** https://supabase.com/dashboard
- **EAS Dashboard:** https://expo.dev/accounts/yombalyoon/projects/yombal-yoon

### Logs
- **Supabase Edge Functions:** Supabase Dashboard > Edge Functions > Logs
- **EAS Builds:** EAS Dashboard > Builds
- **Web Console:** F12 dans le navigateur
- **iOS Console:** Xcode > Window > Devices and Simulators > Console
- **Android Console:** Android Studio > Logcat

---

## ✅ Checklist Finale

### Avant Chaque Commit
- [ ] Tests automatiques passent (écran "Tests de Cohérence")
- [ ] Tests rapides passent (5 min)
- [ ] Aucune erreur dans les logs

### Avant Chaque Build
- [ ] Tests automatiques passent sur Web, iOS, Android
- [ ] Tests détaillés passent (30 min)
- [ ] Configuration vérifiée (API Keys, Supabase)
- [ ] Version unifiée (1.0.0)

### Avant la Production
- [ ] Tests complets passent (1 heure)
- [ ] Builds iOS et Android sans erreur
- [ ] Testeurs externes n'ont pas rencontré de bugs bloquants
- [ ] Tous les critères de validation sont remplis

---

## 🎉 Conclusion

Ce système de tests garantit la cohérence technique et visuelle de l'application Yombal Yoon sur toutes les plateformes. Utilisez cette documentation comme référence pour tous vos tests.

**Bonne chance avec vos tests ! 🚀**

---

**Date de création:** 2024
**Version:** 1.0.0
**Dernière mise à jour:** [À compléter]
