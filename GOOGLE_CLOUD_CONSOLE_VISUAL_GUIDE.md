
# 🖼️ GUIDE VISUEL - Configuration Google Cloud Console

## 📋 Introduction

Ce guide visuel vous accompagne pas à pas dans la configuration des clés Google Maps API dans Google Cloud Console avec des descriptions détaillées de chaque écran.

---

## 🌐 PARTIE 1 : Accès à Google Cloud Console

### Étape 1.1 : Connexion

1. Ouvrez votre navigateur
2. Allez sur : **https://console.cloud.google.com/**
3. Connectez-vous avec votre compte Google

**Ce que vous voyez** :
```
┌─────────────────────────────────────────────────────────┐
│ Google Cloud Console                                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Icône Google Cloud]  Google Cloud Console             │
│                                                          │
│  Sélectionnez un projet                                 │
│  ┌────────────────────────────────────────────────┐    │
│  │ [Rechercher un projet]                          │    │
│  │                                                 │    │
│  │ ▼ Yombal Yoon                                   │    │
│  │   Autres projets...                             │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Étape 1.2 : Sélection du projet

1. Cliquez sur le sélecteur de projet en haut
2. Recherchez "Yombal Yoon"
3. Cliquez sur le projet

---

## 🔑 PARTIE 2 : Accès aux Credentials

### Étape 2.1 : Menu de navigation

1. Cliquez sur le menu hamburger (☰) en haut à gauche
2. Allez dans **APIs & Services**
3. Cliquez sur **Credentials**

**Ce que vous voyez** :
```
┌─────────────────────────────────────────────────────────┐
│ ☰  Google Cloud Console          [Projet: Yombal Yoon] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ☰ Menu                                                  │
│  ├─ Home                                                 │
│  ├─ IAM & Admin                                          │
│  ├─ APIs & Services                    ← CLIQUEZ ICI    │
│  │  ├─ Library                                           │
│  │  ├─ Credentials                     ← PUIS ICI       │
│  │  ├─ OAuth consent screen                             │
│  │  └─ ...                                               │
│  └─ ...                                                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Étape 2.2 : Page Credentials

**Ce que vous voyez** :
```
┌─────────────────────────────────────────────────────────┐
│ APIs & Services > Credentials                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [+ CREATE CREDENTIALS ▼]  [Manage service accounts]    │
│                                                          │
│  API Keys                                                │
│  ┌────────────────────────────────────────────────┐    │
│  │ Name                    Created      Actions    │    │
│  ├────────────────────────────────────────────────┤    │
│  │ [OLD] Ancienne clé     2024-01-15   [...]      │    │
│  │ Test Key               2024-02-10   [...]      │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🌐 PARTIE 3 : Créer la Clé Web

### Étape 3.1 : Créer une nouvelle clé

1. Cliquez sur **+ CREATE CREDENTIALS**
2. Sélectionnez **API key**

**Ce que vous voyez** :
```
┌─────────────────────────────────────────────────────────┐
│ [+ CREATE CREDENTIALS ▼]                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ▼ API key                          ← CLIQUEZ ICI       │
│    OAuth client ID                                       │
│    Service account                                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Étape 3.2 : Clé créée

**Ce que vous voyez** :
```
┌─────────────────────────────────────────────────────────┐
│ API key created                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Your API key:                                           │
│  ┌────────────────────────────────────────────────┐    │
│  │ AIzaSyC1234567890abcdefghijklmnopqrstuv        │    │
│  │                                          [Copy] │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ⚠️ Keep your API key secure                            │
│                                                          │
│  [CLOSE]                            [RESTRICT KEY]      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**ACTION** : Cliquez sur **[Copy]** pour copier la clé, puis sur **[RESTRICT KEY]**

### Étape 3.3 : Configuration de la clé Web

**Ce que vous voyez** :
```
┌─────────────────────────────────────────────────────────┐
│ Edit API key                                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Name                                                    │
│  ┌────────────────────────────────────────────────┐    │
│  │ API Key 1                                       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Application restrictions                                │
│  ○ None                                                  │
│  ● HTTP referrers (web sites)    ← SÉLECTIONNEZ CECI   │
│  ○ IP addresses                                          │
│  ○ Android apps                                          │
│  ○ iOS apps                                              │
│                                                          │
│  Website restrictions                                    │
│  [+ ADD AN ITEM]                  ← CLIQUEZ ICI         │
│                                                          │
│  API restrictions                                        │
│  ○ Don't restrict key                                    │
│  ● Restrict key                   ← SÉLECTIONNEZ CECI   │
│                                                          │
│  [SAVE]                           [CANCEL]              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Étape 3.4 : Changer le nom

1. Dans le champ **Name**, remplacez "API Key 1" par : **Yombal Yoon - Web**

### Étape 3.5 : Ajouter les referrers

1. Cliquez sur **[+ ADD AN ITEM]**
2. Entrez : `https://*.natively.dev/*`
3. Cliquez sur **[Done]**
4. Cliquez à nouveau sur **[+ ADD AN ITEM]**
5. Entrez : `http://localhost/*`
6. Cliquez sur **[Done]**

**Ce que vous voyez** :
```
┌─────────────────────────────────────────────────────────┐
│  Website restrictions                                    │
│  ┌────────────────────────────────────────────────┐    │
│  │ https://*.natively.dev/*                [X]     │    │
│  │ http://localhost/*                      [X]     │    │
│  └────────────────────────────────────────────────┘    │
│  [+ ADD AN ITEM]                                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Étape 3.6 : Restreindre les APIs

1. Sous **API restrictions**, sélectionnez **● Restrict key**
2. Cliquez sur **Select APIs**

**Ce que vous voyez** :
```
┌─────────────────────────────────────────────────────────┐
│ Select APIs                                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Search APIs]                                           │
│                                                          │
│  ☐ Maps JavaScript API                                  │
│  ☐ Places API                     ← COCHEZ CECI        │
│  ☐ Places API (New)               ← COCHEZ CECI        │
│  ☐ Geocoding API                  ← COCHEZ CECI        │
│  ☐ Distance Matrix API            ← COCHEZ CECI        │
│  ☐ Directions API                                        │
│  ☐ ...                                                   │
│                                                          │
│  [OK]                             [CANCEL]              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

3. Cochez les 4 APIs listées ci-dessus
4. Cliquez sur **[OK]**

### Étape 3.7 : Sauvegarder

1. Cliquez sur **[SAVE]** en bas de la page
2. Attendez la confirmation : "API key saved"

**✅ Clé Web configurée !**

---

## 🤖 PARTIE 4 : Créer la Clé Android

### Étape 4.1 : Obtenir le SHA-1

**Ouvrez un terminal** et exécutez :

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Ce que vous voyez dans le terminal** :
```
Alias name: androiddebugkey
Creation date: Jan 15, 2024
Entry type: PrivateKeyEntry
Certificate chain length: 1
Certificate[1]:
Owner: CN=Android Debug, O=Android, C=US
Issuer: CN=Android Debug, O=Android, C=US
Serial number: 1
Valid from: Mon Jan 15 10:00:00 UTC 2024 until: Wed Jan 08 10:00:00 UTC 2054
Certificate fingerprints:
     SHA1: AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
     SHA256: ...
```

**📝 Copiez le SHA-1** : `AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD`

### Étape 4.2 : Créer la clé

1. Retournez dans Google Cloud Console > Credentials
2. Cliquez sur **+ CREATE CREDENTIALS** > **API key**
3. Copiez la clé créée
4. Cliquez sur **[RESTRICT KEY]**

### Étape 4.3 : Configuration de la clé Android

**Ce que vous voyez** :
```
┌─────────────────────────────────────────────────────────┐
│ Edit API key                                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Name                                                    │
│  ┌────────────────────────────────────────────────┐    │
│  │ Yombal Yoon - Android                           │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Application restrictions                                │
│  ○ None                                                  │
│  ○ HTTP referrers (web sites)                           │
│  ○ IP addresses                                          │
│  ● Android apps                   ← SÉLECTIONNEZ CECI   │
│  ○ iOS apps                                              │
│                                                          │
│  Restrict usage to your Android apps                    │
│  [+ ADD AN ITEM]                  ← CLIQUEZ ICI         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Étape 4.4 : Ajouter le package et SHA-1

1. Cliquez sur **[+ ADD AN ITEM]**

**Ce que vous voyez** :
```
┌─────────────────────────────────────────────────────────┐
│ Add an item                                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Package name                                            │
│  ┌────────────────────────────────────────────────┐    │
│  │ com.yombalyoon.app                              │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  SHA-1 certificate fingerprint                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:...  │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  [Done]                           [Cancel]              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

2. Entrez le **Package name** : `com.yombalyoon.app`
3. Collez le **SHA-1** que vous avez copié
4. Cliquez sur **[Done]**

### Étape 4.5 : Restreindre les APIs

1. Sous **API restrictions**, sélectionnez **● Restrict key**
2. Cliquez sur **Select APIs**
3. Cochez :
   - ☑ Places API
   - ☑ Places API (New)
   - ☑ Geocoding API
   - ☑ Distance Matrix API
   - ☑ Maps SDK for Android
4. Cliquez sur **[OK]**

### Étape 4.6 : Sauvegarder

1. Cliquez sur **[SAVE]**

**✅ Clé Android configurée !**

---

## 🍎 PARTIE 5 : Créer la Clé iOS

### Étape 5.1 : Créer la clé

1. Cliquez sur **+ CREATE CREDENTIALS** > **API key**
2. Copiez la clé créée
3. Cliquez sur **[RESTRICT KEY]**

### Étape 5.2 : Configuration de la clé iOS

**Ce que vous voyez** :
```
┌─────────────────────────────────────────────────────────┐
│ Edit API key                                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Name                                                    │
│  ┌────────────────────────────────────────────────┐    │
│  │ Yombal Yoon - iOS                               │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Application restrictions                                │
│  ○ None                                                  │
│  ○ HTTP referrers (web sites)                           │
│  ○ IP addresses                                          │
│  ○ Android apps                                          │
│  ● iOS apps                       ← SÉLECTIONNEZ CECI   │
│                                                          │
│  Restrict usage to your iOS apps                        │
│  [+ ADD AN ITEM]                  ← CLIQUEZ ICI         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Étape 5.3 : Ajouter le Bundle ID

1. Cliquez sur **[+ ADD AN ITEM]**

**Ce que vous voyez** :
```
┌─────────────────────────────────────────────────────────┐
│ Add an item                                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Bundle ID                                               │
│  ┌────────────────────────────────────────────────┐    │
│  │ com.yombalyoon.yombalyoonapp                    │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  [Done]                           [Cancel]              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

2. Entrez le **Bundle ID** : `com.yombalyoon.yombalyoonapp`
3. Cliquez sur **[Done]**

### Étape 5.4 : Restreindre les APIs

1. Sous **API restrictions**, sélectionnez **● Restrict key**
2. Cliquez sur **Select APIs**
3. Cochez :
   - ☑ Places API
   - ☑ Places API (New)
   - ☑ Geocoding API
   - ☑ Distance Matrix API
   - ☑ Maps SDK for iOS
4. Cliquez sur **[OK]**

### Étape 5.5 : Sauvegarder

1. Cliquez sur **[SAVE]**

**✅ Clé iOS configurée !**

---

## 📊 PARTIE 6 : Vérification Finale

### Étape 6.1 : Vue d'ensemble des clés

Retournez sur la page **Credentials**. Vous devriez voir :

```
┌─────────────────────────────────────────────────────────┐
│ APIs & Services > Credentials                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  API Keys                                                │
│  ┌────────────────────────────────────────────────┐    │
│  │ Name                    Created      Actions    │    │
│  ├────────────────────────────────────────────────┤    │
│  │ Yombal Yoon - Web      2025-01-23   [...]      │    │
│  │ Yombal Yoon - Android  2025-01-23   [...]      │    │
│  │ Yombal Yoon - iOS      2025-01-23   [...]      │    │
│  │ [OLD] Ancienne clé     2024-01-15   [...]      │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Étape 6.2 : Vérifier les restrictions

Pour chaque clé, cliquez dessus et vérifiez :

**Yombal Yoon - Web** :
- ✅ Application restrictions : HTTP referrers
- ✅ Referrers : `*.natively.dev/*`, `localhost/*`
- ✅ API restrictions : Places API, Geocoding API, Distance Matrix API

**Yombal Yoon - Android** :
- ✅ Application restrictions : Android apps
- ✅ Package : `com.yombalyoon.app`
- ✅ SHA-1 : [Votre SHA-1]
- ✅ API restrictions : Places API, Geocoding API, Distance Matrix API, Maps SDK for Android

**Yombal Yoon - iOS** :
- ✅ Application restrictions : iOS apps
- ✅ Bundle ID : `com.yombalyoon.yombalyoonapp`
- ✅ API restrictions : Places API, Geocoding API, Distance Matrix API, Maps SDK for iOS

---

## ✅ PARTIE 7 : Checklist Finale

Avant de quitter Google Cloud Console, vérifiez :

- [ ] Trois clés créées avec des noms clairs
- [ ] Chaque clé a les bonnes restrictions d'application
- [ ] Chaque clé a les bonnes restrictions d'API
- [ ] Les trois clés sont copiées dans un endroit sûr
- [ ] La facturation est active sur le projet
- [ ] Toutes les APIs sont activées

---

## 🎯 Prochaine Étape

Maintenant que les clés sont créées dans Google Cloud Console, passez à :

**GOOGLE_MAPS_API_RESET_GUIDE.md - Partie 3** : Ajouter les clés aux secrets Supabase

---

**Date de création** : 2025-01-23  
**Version** : 1.0  
**Auteur** : Natively Assistant
