
# Yombal Yoon - Instructions de Build pour Production

Ce document contient les instructions détaillées pour générer les builds de production Android (AAB) et iOS (IPA) de l'application Yombal Yoon.

---

## 📋 Prérequis

### Comptes Requis
1. **Compte Expo** (gratuit)
   - Créer un compte sur https://expo.dev
   - Installer EAS CLI: `npm install -g eas-cli`
   - Se connecter: `eas login`

2. **Compte Google Play Console** (Android)
   - Frais unique: 25 USD
   - URL: https://play.google.com/console

3. **Compte Apple Developer** (iOS)
   - Frais annuel: 99 USD
   - URL: https://developer.apple.com

### Outils Requis
- Node.js 18+ installé
- npm ou yarn installé
- EAS CLI installé globalement
- Git installé

---

## 🤖 Build Android (AAB pour Play Store)

### Étape 1: Configuration Initiale

1. **Vérifier la configuration dans `app.json`**
   ```json
   {
     "expo": {
       "name": "Yombal Yoon",
       "android": {
         "package": "com.yombalyoon.app",
         "versionCode": 1
       }
     }
   }
   ```

2. **Vérifier la configuration dans `eas.json`**
   ```json
   {
     "build": {
       "production-android": {
         "android": {
           "buildType": "app-bundle"
         }
       }
     }
   }
   ```

### Étape 2: Générer le Keystore (Première fois uniquement)

EAS générera automatiquement un keystore lors du premier build. Pour utiliser un keystore existant:

```bash
# Créer un keystore manuellement (optionnel)
keytool -genkeypair -v -storetype PKCS12 -keystore yombal-yoon.keystore \
  -alias yombal-yoon-key -keyalg RSA -keysize 2048 -validity 10000
```

### Étape 3: Lancer le Build Android

```bash
# Se connecter à EAS (si pas déjà fait)
eas login

# Configurer le projet (première fois uniquement)
eas build:configure

# Lancer le build de production Android
eas build --platform android --profile production
```

### Étape 4: Télécharger le Build

Une fois le build terminé (environ 10-20 minutes):

1. Le lien de téléchargement sera affiché dans le terminal
2. Ou aller sur https://expo.dev/accounts/[votre-compte]/projects/yombal-yoon/builds
3. Télécharger le fichier `.aab`

### Étape 5: Tester le Build en Internal Testing

1. **Aller sur Google Play Console**
   - https://play.google.com/console

2. **Créer une nouvelle application**
   - Nom: Yombal Yoon
   - Langue par défaut: Français
   - Type: Application
   - Gratuite ou payante: Gratuite

3. **Uploader le AAB**
   - Aller dans "Release" > "Testing" > "Internal testing"
   - Créer une nouvelle release
   - Uploader le fichier `.aab`
   - Remplir les notes de version
   - Sauvegarder et publier

4. **Ajouter des testeurs**
   - Créer une liste de testeurs
   - Ajouter les emails des testeurs
   - Partager le lien de test

5. **Tester sur un appareil Android réel**
   - Ouvrir le lien de test sur l'appareil
   - Installer l'application
   - Tester tous les flux critiques

---

## 🍎 Build iOS (IPA pour App Store)

### Étape 1: Configuration Initiale

1. **Vérifier la configuration dans `app.json`**
   ```json
   {
     "expo": {
       "name": "Yombal Yoon",
       "ios": {
         "bundleIdentifier": "com.yombalyoon.app",
         "buildNumber": "1"
       }
     }
   }
   ```

2. **Configurer Apple Developer Account dans EAS**
   ```bash
   # EAS vous demandera vos identifiants Apple lors du premier build
   eas build --platform ios --profile production
   ```

### Étape 2: Lancer le Build iOS

```bash
# Se connecter à EAS (si pas déjà fait)
eas login

# Lancer le build de production iOS
eas build --platform ios --profile production
```

**Note**: EAS gérera automatiquement:
- La création de l'App ID
- La génération des certificats
- La création des profils de provisioning

### Étape 3: Télécharger le Build

Une fois le build terminé (environ 15-30 minutes):

1. Le lien de téléchargement sera affiché dans le terminal
2. Ou aller sur https://expo.dev/accounts/[votre-compte]/projects/yombal-yoon/builds
3. Le fichier `.ipa` sera automatiquement uploadé sur App Store Connect

### Étape 4: Configurer App Store Connect

1. **Aller sur App Store Connect**
   - https://appstoreconnect.apple.com

2. **Créer une nouvelle application**
   - Cliquer sur "My Apps" > "+"
   - Nom: Yombal Yoon
   - Langue principale: Français
   - Bundle ID: com.yombalyoon.app
   - SKU: yombal-yoon-001

3. **Remplir les informations de l'app**
   - Catégorie: Travel
   - Sous-catégorie: (optionnel)
   - Description courte et longue
   - Mots-clés
   - URL de support
   - URL de politique de confidentialité

4. **Uploader les captures d'écran**
   - iPhone 6.7" (iPhone 14 Pro Max): minimum 3 captures
   - iPhone 6.5" (iPhone 11 Pro Max): minimum 3 captures
   - iPhone 5.5" (iPhone 8 Plus): minimum 3 captures (optionnel)
   - iPad Pro 12.9": minimum 3 captures (si support iPad)

5. **Uploader l'icône**
   - 1024x1024 pixels
   - Format PNG sans transparence
   - Sans coins arrondis

### Étape 5: Tester via TestFlight

1. **Activer TestFlight**
   - Dans App Store Connect, aller dans "TestFlight"
   - Le build devrait apparaître automatiquement après traitement (10-30 minutes)

2. **Ajouter des testeurs internes**
   - Aller dans "Internal Testing"
   - Ajouter les testeurs (maximum 100)
   - Les testeurs recevront un email avec le lien TestFlight

3. **Tester sur un iPhone réel**
   - Installer l'app TestFlight depuis l'App Store
   - Ouvrir le lien de test reçu par email
   - Installer Yombal Yoon
   - Tester tous les flux critiques

---

## 🔄 Builds Simultanés (Android + iOS)

Pour générer les deux builds en même temps:

```bash
# Build Android et iOS en parallèle
eas build --platform all --profile production
```

---

## 🔧 Commandes Utiles

### Vérifier le Statut des Builds
```bash
# Lister tous les builds
eas build:list

# Voir les détails d'un build spécifique
eas build:view [BUILD_ID]
```

### Annuler un Build en Cours
```bash
eas build:cancel [BUILD_ID]
```

### Mettre à Jour les Credentials
```bash
# Android
eas credentials --platform android

# iOS
eas credentials --platform ios
```

### Soumettre Directement aux Stores (après tests)
```bash
# Soumettre à Google Play
eas submit --platform android --latest

# Soumettre à App Store
eas submit --platform ios --latest
```

---

## 📊 Tailles de Build Attendues

### Android (AAB)
- **Taille du AAB**: ~50-70 MB
- **Taille après installation**: ~80-120 MB
- **Taille de téléchargement pour l'utilisateur**: ~40-60 MB (optimisé par Play Store)

### iOS (IPA)
- **Taille de l'IPA**: ~60-80 MB
- **Taille après installation**: ~100-150 MB
- **Taille de téléchargement pour l'utilisateur**: ~50-70 MB (optimisé par App Store)

---

## ⚠️ Problèmes Courants et Solutions

### Erreur: "Build failed"
**Solution**: Vérifier les logs du build sur expo.dev et corriger les erreurs

### Erreur: "Invalid bundle identifier"
**Solution**: Vérifier que le bundle ID dans app.json correspond à celui configuré sur Apple Developer

### Erreur: "Keystore not found"
**Solution**: Laisser EAS générer automatiquement le keystore lors du premier build

### Erreur: "Google Maps API key invalid"
**Solution**: Vérifier que la clé API est correctement configurée dans app.json et activée sur Google Cloud Console

### Build iOS bloqué à "Waiting for build to start"
**Solution**: Vérifier que le compte Apple Developer est actif et que les frais annuels sont payés

### Build Android échoue avec "Gradle error"
**Solution**: Nettoyer le cache et relancer: `eas build --platform android --profile production --clear-cache`

---

## 🔐 Sécurité des Credentials

### Keystore Android
- **Sauvegarde**: Télécharger et sauvegarder le keystore depuis EAS
- **Stockage**: Garder le keystore dans un endroit sécurisé (pas dans Git)
- **Importance**: Sans le keystore, impossible de mettre à jour l'app sur Play Store

### Certificats iOS
- **Gestion**: EAS gère automatiquement les certificats
- **Sauvegarde**: Les certificats sont sauvegardés sur les serveurs Expo
- **Accès**: Accessible via `eas credentials --platform ios`

---

## 📝 Checklist Avant Build

### Avant Build Android
- [ ] `app.json` configuré correctement
- [ ] `eas.json` configuré pour production
- [ ] Package name correct: `com.yombalyoon.app`
- [ ] Version code incrémenté si mise à jour
- [ ] Icône et splash screen corrects
- [ ] Variables d'environnement configurées
- [ ] Compte EAS actif

### Avant Build iOS
- [ ] `app.json` configuré correctement
- [ ] `eas.json` configuré pour production
- [ ] Bundle ID correct: `com.yombalyoon.app`
- [ ] Build number incrémenté si mise à jour
- [ ] Icône et splash screen corrects
- [ ] Variables d'environnement configurées
- [ ] Compte Apple Developer actif
- [ ] Compte EAS actif

---

## 🚀 Après les Builds

### Tests Obligatoires
1. ✅ Installer sur appareil Android réel
2. ✅ Installer sur iPhone réel via TestFlight
3. ✅ Tester tous les modules (Covoiturage, Colis, Livraison)
4. ✅ Vérifier OTP et sécurité
5. ✅ Tester Google Maps autocomplétion
6. ✅ Vérifier les notifications
7. ✅ Tester les appels et WhatsApp
8. ✅ Vérifier qu'il n'y a pas d'écran blanc

### Prochaines Étapes
1. Compléter les fiches store (voir STORE_LISTING_PREPARATION.md)
2. Préparer les captures d'écran
3. Rédiger les descriptions
4. Soumettre pour review
5. Monitorer les retours

---

## 📞 Support

### Problèmes avec EAS
- Documentation: https://docs.expo.dev/build/introduction/
- Forum: https://forums.expo.dev
- Discord: https://chat.expo.dev

### Problèmes avec Play Store
- Centre d'aide: https://support.google.com/googleplay/android-developer

### Problèmes avec App Store
- Centre d'aide: https://developer.apple.com/support/

---

*Instructions de build préparées pour Yombal Yoon v1.0.0*
*Date: Janvier 2025*
