
# ✅ VÉRIFICATION IMMÉDIATE - iOS TESTFLIGHT

## 🎯 ACTIONS À FAIRE MAINTENANT

Vous avez indiqué avoir configuré tous les paramètres dans Google Console et Supabase. 
Voici les vérifications à faire pour confirmer que tout est correct :

---

## 1️⃣ GOOGLE CLOUD CONSOLE

### Vérification de la clé API iOS

1. **Allez sur** : https://console.cloud.google.com/
2. **Sélectionnez votre projet**
3. **Allez dans** : APIs & Services > Credentials
4. **Trouvez votre clé API iOS**

### Vérifiez ces paramètres EXACTS :

```
✅ Application restrictions: iOS apps
✅ Bundle ID: com.yombalyoon.yombalyoonapp
```

**⚠️ ATTENTION** : 
- Le Bundle ID doit être EXACTEMENT : `com.yombalyoon.yombalyoonapp`
- Pas d'espaces, pas de majuscules différentes
- Le type de restriction doit être "iOS apps" (pas "Android apps" ni "HTTP referrers")

### Vérifiez les APIs activées :

1. **Allez dans** : APIs & Services > Library
2. **Vérifiez que ces APIs sont activées** :
   - ✅ Places API (New)
   - ✅ Geocoding API
   - ✅ Distance Matrix API

Pour activer une API :
- Recherchez l'API dans la bibliothèque
- Cliquez sur l'API
- Cliquez sur "Enable"

### Vérifiez le Billing :

1. **Allez dans** : Billing
2. **Vérifiez que** :
   - ✅ Le billing est activé
   - ✅ Il n'y a pas de quotas dépassés
   - ✅ La carte de crédit est valide

---

## 2️⃣ SUPABASE DASHBOARD

### Vérification du secret iOS

1. **Allez sur** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** : drxtaxepofuoelplgrei
3. **Allez dans** : Edge Functions
4. **Cliquez sur** : google-places-proxy
5. **Cliquez sur** : Secrets

### Vérifiez que ce secret existe :

```
Name: GOOGLE_MAPS_API_KEY_IOS
Value: [Votre clé API iOS de Google Console]
```

**⚠️ IMPORTANT** :
- Le nom doit être EXACTEMENT : `GOOGLE_MAPS_API_KEY_IOS`
- La valeur doit être la clé API iOS de Google Console
- Pas d'espaces avant ou après la clé

### Si le secret n'existe pas :

1. Cliquez sur "Add new secret"
2. Name : `GOOGLE_MAPS_API_KEY_IOS`
3. Value : Collez votre clé API iOS de Google Console
4. Cliquez sur "Save"

---

## 3️⃣ TEST DANS L'APP

### Option A : Test avec le composant de test

1. **Ouvrez l'app sur TestFlight**
2. **Naviguez vers** : `/test-api-config`
3. **Cliquez sur** : "Lancer les tests"
4. **Vérifiez les résultats** :
   - ✅ Connexion Supabase : doit être vert
   - ✅ Configuration API : doit être vert
   - ✅ Plateforme : doit afficher "ios"
   - ✅ Bundle ID : doit afficher "com.yombalyoon.yombalyoonapp"

### Option B : Test avec l'autocomplétion

1. **Ouvrez l'app sur TestFlight**
2. **Allez dans** : Envoyer un colis
3. **Tapez dans le champ d'adresse** :
   - "Plateau"
   - "Parcelles Assainies"
   - "Marché Sandaga"
   - "Hôpital Principal"
4. **Vérifiez que** :
   - ✅ Des suggestions apparaissent
   - ✅ Pas de message d'erreur
   - ✅ Les suggestions sont pertinentes

---

## 4️⃣ SI ÇA NE FONCTIONNE PAS

### Erreur : "Configuration API manquante"

**Cause** : Le secret `GOOGLE_MAPS_API_KEY_IOS` n'existe pas dans Supabase

**Solution** :
1. Allez dans Supabase Dashboard
2. Edge Functions > google-places-proxy > Secrets
3. Ajoutez le secret `GOOGLE_MAPS_API_KEY_IOS`
4. Testez immédiatement (pas besoin de rebuild)

---

### Erreur : "REQUEST_DENIED"

**Cause** : La clé API n'est pas correctement configurée dans Google Console

**Solutions** :

#### Solution 1 : Bundle ID incorrect
1. Vérifiez dans Google Console que le Bundle ID est : `com.yombalyoon.yombalyoonapp`
2. Vérifiez qu'il n'y a pas d'espaces ou de caractères supplémentaires
3. Vérifiez que la restriction est "iOS apps"

#### Solution 2 : APIs non activées
1. Allez dans Google Cloud Console > APIs & Services > Library
2. Activez : Places API, Geocoding API, Distance Matrix API

#### Solution 3 : Créer une nouvelle clé API
1. Allez dans Google Cloud Console > Credentials
2. Cliquez sur "Create Credentials" > "API key"
3. Cliquez sur "Restrict key"
4. Application restrictions : "iOS apps"
5. Bundle ID : `com.yombalyoon.yombalyoonapp`
6. API restrictions : Places API, Geocoding API, Distance Matrix API
7. Copiez la nouvelle clé
8. Allez dans Supabase > Edge Functions > google-places-proxy > Secrets
9. Mettez à jour `GOOGLE_MAPS_API_KEY_IOS` avec la nouvelle clé
10. Testez immédiatement

---

## 5️⃣ VÉRIFICATION DES LOGS

### Logs Supabase

1. **Allez dans** : Supabase Dashboard
2. **Edge Functions** > google-places-proxy > **Logs**
3. **Cherchez** :
   - Erreurs récentes
   - Messages "REQUEST_DENIED"
   - Messages "Configuration API manquante"

### Logs dans l'app

1. **Ouvrez l'app sur TestFlight**
2. **Essayez l'autocomplétion**
3. **Regardez les messages d'erreur** :
   - Messages en rouge = erreur de configuration
   - Messages en jaune = aucun résultat trouvé
   - Messages en vert = tout fonctionne

---

## 📊 RÉSUMÉ DE VOTRE CONFIGURATION

### ✅ Configuration actuelle (vérifiée)

- **Bundle ID iOS** : `com.yombalyoon.yombalyoonapp`
- **Package Android** : `com.yombalyoon.app`
- **Edge Function** : `google-places-proxy` (version 13, active)
- **Logs** : Edge Function fonctionne (codes 200)

### ⚠️ À vérifier maintenant

- **Google Console** : Clé API iOS avec Bundle ID correct
- **Google Console** : APIs activées (Places, Geocoding, Distance Matrix)
- **Google Console** : Billing activé
- **Supabase** : Secret `GOOGLE_MAPS_API_KEY_IOS` configuré

---

## 🚀 PROCHAINE ÉTAPE

**MAINTENANT** :
1. Vérifiez le secret `GOOGLE_MAPS_API_KEY_IOS` dans Supabase
2. Vérifiez la clé API iOS dans Google Console
3. Testez l'autocomplétion sur TestFlight

**SI ÇA NE FONCTIONNE PAS** :
1. Créez une NOUVELLE clé API iOS dans Google Console
2. Configurez les restrictions correctement
3. Ajoutez-la dans Supabase comme `GOOGLE_MAPS_API_KEY_IOS`
4. Testez immédiatement (pas besoin de rebuild)

---

## 📞 BESOIN D'AIDE ?

Si après avoir suivi toutes ces étapes, l'autocomplétion ne fonctionne toujours pas :

1. Lancez le test de configuration dans l'app : `/test-api-config`
2. Prenez une capture d'écran des résultats
3. Vérifiez les logs de l'Edge Function dans Supabase
4. Vérifiez que le Bundle ID correspond EXACTEMENT dans Google Console

---

## ✨ RAPPEL IMPORTANT

**Les changements dans Supabase sont immédiats** :
- Pas besoin de rebuild l'app
- Pas besoin de redéployer l'Edge Function
- Juste ajouter/modifier le secret et tester

**Les changements dans Google Console peuvent prendre quelques minutes** :
- Attendez 2-3 minutes après avoir créé/modifié une clé API
- Testez ensuite l'autocomplétion
