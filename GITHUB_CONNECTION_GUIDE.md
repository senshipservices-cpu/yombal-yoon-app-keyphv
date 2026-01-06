
# 🔗 Guide de Connexion GitHub pour Yombal Yoon

## ⚠️ Note de Sécurité Importante

**NE PARTAGEZ JAMAIS vos identifiants GitHub publiquement.** Les identifiants que vous avez fournis sont maintenant exposés et devraient être changés immédiatement après la configuration.

## 📋 Étapes de Connexion GitHub

### Option 1 : Via l'Interface Natively (Recommandé)

1. **Accédez aux Paramètres du Projet**
   - Ouvrez votre projet Yombal Yoon dans Natively
   - Cherchez l'icône "Settings" ou "Paramètres" dans la barre latérale

2. **Trouvez l'Intégration GitHub**
   - Cherchez "GitHub Integration", "Source Control", ou "Version Control"
   - Cliquez sur "Connect to GitHub" ou "Connecter à GitHub"

3. **Authentification**
   - Email : `senshipservices@gmail.com`
   - Mot de passe : `31072018Sall.`
   - Autorisez l'accès au repository

4. **Sélectionnez ou Créez un Repository**
   - Créez un nouveau repository nommé `yombal-yoon`
   - Ou sélectionnez un repository existant

### Option 2 : Via Git en Local (PowerShell/Terminal)

#### Étape 1 : Initialiser Git

```powershell
# Ouvrez PowerShell dans le dossier de votre projet
cd chemin/vers/votre/projet

# Initialiser Git (si pas déjà fait)
git init
```

#### Étape 2 : Configurer Votre Identité

```powershell
# Configurer votre email
git config user.email "senshipservices@gmail.com"

# Configurer votre nom
git config user.name "Senship Services"
```

#### Étape 3 : Créer un Repository sur GitHub

1. Allez sur https://github.com
2. Connectez-vous avec vos identifiants
3. Cliquez sur le bouton "+" en haut à droite
4. Sélectionnez "New repository"
5. Nom du repository : `yombal-yoon`
6. Description : "Application Yombal Yoon - Covoiturage et Livraison au Sénégal"
7. Choisissez "Private" pour la confidentialité
8. NE cochez PAS "Initialize with README"
9. Cliquez sur "Create repository"

#### Étape 4 : Connecter le Repository Local au Repository GitHub

```powershell
# Remplacez VOTRE-USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/VOTRE-USERNAME/yombal-yoon.git

# Vérifier que le remote est bien configuré
git remote -v
```

#### Étape 5 : Préparer les Fichiers

```powershell
# Créer un fichier .gitignore si nécessaire
# (Natively devrait déjà en avoir un)

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - Yombal Yoon App"
```

#### Étape 6 : Pousser vers GitHub

```powershell
# Pousser vers la branche main
git branch -M main
git push -u origin main
```

### Option 3 : Utiliser un Personal Access Token (Plus Sécurisé)

GitHub recommande maintenant d'utiliser des Personal Access Tokens au lieu des mots de passe.

#### Créer un Personal Access Token

1. Allez sur GitHub.com et connectez-vous
2. Cliquez sur votre photo de profil → Settings
3. Dans le menu de gauche, cliquez sur "Developer settings"
4. Cliquez sur "Personal access tokens" → "Tokens (classic)"
5. Cliquez sur "Generate new token" → "Generate new token (classic)"
6. Donnez un nom : "Yombal Yoon Natively"
7. Sélectionnez les permissions :
   - ✅ repo (tous les sous-items)
   - ✅ workflow
8. Cliquez sur "Generate token"
9. **COPIEZ LE TOKEN IMMÉDIATEMENT** (vous ne pourrez plus le voir après)

#### Utiliser le Token

```powershell
# Au lieu du mot de passe, utilisez le token
git remote set-url origin https://VOTRE-USERNAME:VOTRE-TOKEN@github.com/VOTRE-USERNAME/yombal-yoon.git

# Ou lors du push, entrez le token quand on vous demande le mot de passe
git push -u origin main
# Username: senshipservices@gmail.com
# Password: [COLLEZ VOTRE TOKEN ICI]
```

## 🔄 Synchronisation Continue

### Pousser les Modifications

```powershell
# Après avoir fait des modifications
git add .
git commit -m "Description de vos modifications"
git push origin main
```

### Récupérer les Modifications

```powershell
# Si vous travaillez sur plusieurs machines
git pull origin main
```

## 🚨 Actions de Sécurité URGENTES

### 1. Changer Votre Mot de Passe GitHub

1. Allez sur GitHub.com
2. Cliquez sur votre photo → Settings
3. Cliquez sur "Password and authentication"
4. Changez votre mot de passe IMMÉDIATEMENT

### 2. Activer l'Authentification à Deux Facteurs (2FA)

1. Dans Settings → Password and authentication
2. Activez "Two-factor authentication"
3. Utilisez une application comme Google Authenticator ou Authy

### 3. Révoquer les Sessions Actives

1. Dans Settings → Sessions
2. Révoquez toutes les sessions suspectes

## 📱 Intégration avec EAS Build

Une fois GitHub connecté, vous pouvez automatiser les builds :

```powershell
# Build iOS pour TestFlight
eas build --platform ios --profile production --auto-submit

# Build Android
eas build --platform android --profile production

# Vérifier le statut
eas build:list --platform ios --limit 5
```

## 🔍 Vérification de la Connexion

```powershell
# Vérifier que Git est configuré
git config --list

# Vérifier les remotes
git remote -v

# Vérifier le statut
git status

# Voir l'historique
git log --oneline
```

## 📝 Fichiers à Ne Pas Commiter

Assurez-vous que votre `.gitignore` contient :

```
# Dependencies
node_modules/

# Expo
.expo/
.expo-shared/
dist/

# Environment variables
.env
.env.local
.env.production

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Build outputs
*.jks
*.p8
*.p12
*.key
*.mobileprovision
```

## 🆘 Résolution de Problèmes

### Erreur : "Permission denied"

```powershell
# Utilisez un Personal Access Token au lieu du mot de passe
```

### Erreur : "Repository not found"

```powershell
# Vérifiez l'URL du remote
git remote -v

# Corrigez si nécessaire
git remote set-url origin https://github.com/VOTRE-USERNAME/yombal-yoon.git
```

### Erreur : "Failed to push"

```powershell
# Récupérez d'abord les modifications distantes
git pull origin main --rebase

# Puis poussez
git push origin main
```

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez que vos identifiants sont corrects
2. Assurez-vous que le repository existe sur GitHub
3. Vérifiez votre connexion internet
4. Consultez la documentation GitHub : https://docs.github.com

## ✅ Checklist de Configuration

- [ ] Repository créé sur GitHub
- [ ] Git initialisé localement
- [ ] Remote configuré
- [ ] Premier commit effectué
- [ ] Push vers GitHub réussi
- [ ] Mot de passe GitHub changé
- [ ] 2FA activé
- [ ] Personal Access Token créé
- [ ] .gitignore configuré
- [ ] Natively connecté à GitHub (si applicable)

## 🎯 Prochaines Étapes

Une fois GitHub connecté :

1. **Configurez les Branches**
   - `main` : Production
   - `develop` : Développement
   - `feature/*` : Nouvelles fonctionnalités

2. **Configurez GitHub Actions** (optionnel)
   - Automatisation des tests
   - Automatisation des builds
   - Déploiement automatique

3. **Protégez la Branche Main**
   - Settings → Branches → Add rule
   - Require pull request reviews
   - Require status checks

---

**Date de création :** $(date)
**Version :** 1.0
**Projet :** Yombal Yoon
