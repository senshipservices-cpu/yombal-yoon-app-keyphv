
# Guide Rapide de Test - Yombal Yoon
## Tests Techniques & Visuels (Web, iOS, Android)

Ce guide fournit une checklist rapide pour vérifier la cohérence entre les plateformes.

---

## 🚀 Accès Rapide aux Tests

### Test Automatique dans l'App
1. Ouvrir l'application
2. Aller dans **Profil**
3. Cliquer sur **"Tests de Cohérence"** (en bas du menu)
4. Lancer les tests automatiques
5. Vérifier les résultats

### Test Manuel Complet
Consulter: `docs/TESTING_CHECKLIST_TECHNICAL_VISUAL.md`

---

## ⚡ Tests Rapides (5 minutes)

### 1. Test Visuel Rapide
**Objectif:** Vérifier que l'apparence est identique sur toutes les plateformes.

#### Web
```bash
# Lancer l'app Web
npm run web
```
- Ouvrir http://localhost:8081
- Prendre une capture d'écran de l'accueil
- Noter les couleurs des boutons

#### iOS
- Ouvrir TestFlight
- Installer/Ouvrir l'app
- Prendre une capture d'écran de l'accueil
- Comparer avec Web

#### Android
- Installer l'APK/AAB
- Ouvrir l'app
- Prendre une capture d'écran de l'accueil
- Comparer avec Web et iOS

**✅ Validation:** Les 3 captures d'écran doivent être visuellement identiques (couleurs, tailles, espacements).

---

### 2. Test Autocomplétion Rapide
**Objectif:** Vérifier que Google Maps fonctionne sur toutes les plateformes.

#### Sur chaque plateforme (Web, iOS, Android):
1. Aller dans **Covoiturage** > **Publier un trajet**
2. Cliquer sur le champ **"Ville de départ"**
3. Taper: **"Dakar"**
4. Attendre 1-2 secondes
5. Vérifier que des suggestions apparaissent
6. Sélectionner une suggestion
7. Vérifier qu'aucune erreur n'apparaît

**✅ Validation:** Les suggestions apparaissent sur les 3 plateformes sans erreur.

**❌ Échec:** Si une erreur "REQUEST_DENIED" ou "API blocked" apparaît.

---

### 3. Test Backend Rapide
**Objectif:** Vérifier que Supabase fonctionne sur toutes les plateformes.

#### Sur chaque plateforme (Web, iOS, Android):
1. Aller dans **Profil**
2. Cliquer sur **"Modifier le profil"**
3. Changer le nom
4. Cliquer sur **"Enregistrer"**
5. Vérifier le message de succès
6. Recharger l'app
7. Vérifier que le nom a bien été sauvegardé

**✅ Validation:** Les modifications sont sauvegardées sur les 3 plateformes.

**❌ Échec:** Si une erreur Supabase apparaît ou si les données ne sont pas sauvegardées.

---

## 🔍 Tests Détaillés (30 minutes)

### 1. Design System (10 min)

#### Boutons
- [ ] Web: Boutons verts (#008000)
- [ ] iOS: Boutons verts (#008000)
- [ ] Android: Boutons verts (#008000)
- [ ] Tous: Border-radius 12px
- [ ] Tous: Ombre légère

#### Cartes
- [ ] Web: Fond blanc, ombre, border-radius 16px
- [ ] iOS: Identique à Web
- [ ] Android: Identique à Web

#### Champs de Formulaire
- [ ] Web: Border gris, focus vert, error rouge
- [ ] iOS: Identique à Web
- [ ] Android: Identique à Web

---

### 2. API Keys (10 min)

#### Google Maps
- [ ] Web: Autocomplétion fonctionne
- [ ] iOS: Autocomplétion fonctionne
- [ ] Android: Autocomplétion fonctionne
- [ ] Tous: Aucune erreur "REQUEST_DENIED"

#### Vérification des Clés
```bash
# Vérifier app.json
grep "GOOGLE_MAPS_API_KEY" app.json

# Vérifier eas.json
grep "GOOGLE_MAPS_API_KEY" eas.json

# Vérifier qu'il n'y a pas d'anciennes clés
grep -r "AIzaSy" . --exclude-dir=node_modules
```

---

### 3. Backend Synchronization (10 min)

#### Supabase Configuration
- [ ] Web: SUPABASE_URL correct
- [ ] iOS: SUPABASE_URL correct
- [ ] Android: SUPABASE_URL correct
- [ ] Tous: SUPABASE_ANON_KEY identique

#### Test de Connexion
- [ ] Web: Créer un trajet → Succès
- [ ] iOS: Créer un trajet → Succès
- [ ] Android: Créer un trajet → Succès
- [ ] Tous: Données visibles sur toutes les plateformes

---

## 🏗️ Builds (15 minutes)

### Build iOS
```bash
# Lancer le build
eas build --platform ios --profile production

# Vérifier les warnings
# Aucun warning "Google Maps API blocked"
# Aucun warning "Supabase anon key missing"
```

### Build Android
```bash
# Lancer le build
eas build --platform android --profile production

# Télécharger le AAB
# Vérifier la taille (< 100 MB)
```

---

## 📊 Checklist Finale

### Avant la Production

#### Design
- [ ] Couleurs identiques (Web, iOS, Android)
- [ ] Composants identiques (Web, iOS, Android)
- [ ] Layout responsive (Web, iOS, Android)

#### Fonctionnalités
- [ ] Autocomplétion Google Maps (Web, iOS, Android)
- [ ] Supabase connexion (Web, iOS, Android)
- [ ] Toutes les fonctionnalités testées (Web, iOS, Android)

#### Builds
- [ ] Build iOS sans erreur
- [ ] Build Android sans erreur
- [ ] Version unifiée (1.0.0)

#### Tests Utilisateur
- [ ] 2 testeurs externes
- [ ] Feedback positif
- [ ] Aucun bug bloquant

---

## 🐛 Résolution de Problèmes

### Autocomplétion ne fonctionne pas

#### Sur Web
1. Ouvrir la console du navigateur (F12)
2. Chercher les erreurs Google Maps
3. Vérifier que GOOGLE_MAPS_API_KEY est configuré dans app.json
4. Vérifier que GOOGLE_MAPS_API_KEY_SERVER est configuré dans Supabase Edge Function Secrets

#### Sur iOS
1. Ouvrir Xcode Console
2. Chercher les erreurs Google Maps
3. Vérifier que EXPO_PUBLIC_GOOGLE_MAPS_API_KEY est configuré dans eas.json
4. Rebuild l'app

#### Sur Android
1. Ouvrir Android Studio Logcat
2. Chercher les erreurs Google Maps
3. Vérifier que EXPO_PUBLIC_GOOGLE_MAPS_API_KEY est configuré dans eas.json
4. Rebuild l'app

### Erreur Supabase

#### Vérifier la Configuration
```bash
# Vérifier app.json
grep "SUPABASE" app.json

# Vérifier eas.json
grep "SUPABASE" eas.json
```

#### Vérifier la Connexion
1. Aller sur https://supabase.com/dashboard
2. Vérifier que le projet est actif
3. Vérifier les API Keys dans Project Settings > API
4. Comparer avec les clés dans app.json

### Build Échoue

#### iOS
```bash
# Vérifier les logs
eas build:view --platform ios

# Vérifier le certificat
eas credentials

# Rebuild
eas build --platform ios --profile production --clear-cache
```

#### Android
```bash
# Vérifier les logs
eas build:view --platform android

# Vérifier le keystore
eas credentials

# Rebuild
eas build --platform android --profile production --clear-cache
```

---

## 📞 Support

### Documentation Complète
- `docs/TESTING_CHECKLIST_TECHNICAL_VISUAL.md` - Checklist complète
- `docs/GOOGLE_MAPS_API_KEYS_SETUP.md` - Configuration Google Maps
- `docs/BUILD_INSTRUCTIONS.md` - Instructions de build

### Logs
- **Supabase Edge Functions:** https://supabase.com/dashboard > Edge Functions > Logs
- **EAS Builds:** https://expo.dev/accounts/yombalyoon/projects/yombal-yoon/builds
- **Web Console:** F12 dans le navigateur
- **iOS Console:** Xcode > Window > Devices and Simulators > Console
- **Android Console:** Android Studio > Logcat

---

## ✅ Validation Finale

L'application est prête pour la production si:

1. ✅ Tous les tests automatiques passent (écran "Tests de Cohérence")
2. ✅ Les 3 tests rapides (5 min) passent sur toutes les plateformes
3. ✅ Les tests détaillés (30 min) passent sur toutes les plateformes
4. ✅ Les builds iOS et Android sont générés sans erreur
5. ✅ Les testeurs externes n'ont pas rencontré de bugs bloquants

---

**Date de création:** 2024
**Version:** 1.0.0
**Dernière mise à jour:** [À compléter]
