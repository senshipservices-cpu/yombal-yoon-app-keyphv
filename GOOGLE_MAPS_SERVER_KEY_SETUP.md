
# 🔧 CONFIGURATION CLÉ API SERVEUR GOOGLE MAPS

## ✅ ÉTAPE COMPLÉTÉE

L'Edge Function `google-places-proxy` a été mise à jour avec succès pour utiliser une clé API serveur dédiée.

## 📋 PROCHAINES ÉTAPES

### 1️⃣ Créer une clé API serveur dans Google Cloud Console

#### A. Accéder à Google Cloud Console

1. Allez sur https://console.cloud.google.com/
2. Sélectionnez votre projet Yombal Yoon
3. Allez dans **APIs & Services** > **Credentials**

#### B. Créer une nouvelle clé API

1. Cliquez sur **"Create Credentials"** > **"API Key"**
2. Une nouvelle clé sera générée automatiquement
3. Cliquez sur **"Edit API key"** (icône crayon) pour configurer la clé

#### C. Configurer la clé API

**Nom de la clé:**
```
GOOGLE_MAPS_API_KEY_SERVER
```

**Application restrictions:**
- ✅ Sélectionnez **"None"** (Aucune restriction)
- ⚠️ **IMPORTANT:** Ne sélectionnez PAS "HTTP referrers", "Android apps", ou "iOS apps"
- 💡 **Optionnel:** Si vous connaissez les IPs de Supabase, vous pouvez utiliser "IP addresses" pour plus de sécurité

**API restrictions:**
- ✅ Sélectionnez **"Restrict key"**
- ✅ Activez les APIs suivantes:
  - **Places API**
  - **Geocoding API**
  - **Distance Matrix API**

#### D. Sauvegarder la clé

1. Cliquez sur **"Save"**
2. **COPIEZ LA CLÉ API** (vous en aurez besoin pour l'étape suivante)

### 2️⃣ Activer les APIs nécessaires

Si ce n'est pas déjà fait, activez les APIs suivantes dans votre projet Google Cloud:

1. Allez dans **APIs & Services** > **Library**
2. Recherchez et activez:
   - **Places API**
   - **Geocoding API**
   - **Distance Matrix API**

### 3️⃣ Vérifier la facturation

⚠️ **IMPORTANT:** Les APIs Google Maps nécessitent un compte de facturation actif.

1. Allez dans **Billing** dans le menu Google Cloud Console
2. Vérifiez qu'un compte de facturation est associé à votre projet
3. Si nécessaire, créez un compte de facturation et associez-le au projet

### 4️⃣ Ajouter la clé aux secrets Supabase

#### Option A: Via le Dashboard Supabase (Recommandé)

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet **Yombal Yoon** (ID: `drxtaxepofuoelplgrei`)
3. Allez dans **Project Settings** > **Edge Functions**
4. Cliquez sur **"Add secret"** ou **"Manage secrets"**
5. Ajoutez le secret:
   - **Name:** `GOOGLE_MAPS_API_KEY_SERVER`
   - **Value:** `<votre_clé_API_copiée_à_l'étape_1>`
6. Cliquez sur **"Save"**

#### Option B: Via Supabase CLI

Si vous avez Supabase CLI installé:

```bash
# Définir le secret
supabase secrets set GOOGLE_MAPS_API_KEY_SERVER=YOUR_API_KEY_HERE

# Vérifier que le secret est bien défini
supabase secrets list
```

### 5️⃣ Redéployer l'Edge Function (si nécessaire)

L'Edge Function a déjà été redéployée automatiquement. Cependant, si vous avez ajouté le secret via le dashboard, vous devrez peut-être attendre quelques minutes pour que les changements prennent effet.

Pour forcer un redéploiement via CLI:

```bash
supabase functions deploy google-places-proxy
```

### 6️⃣ Tester l'autocomplétion

1. Ouvrez votre application Yombal Yoon sur **Web**
2. Allez dans:
   - **Covoiturage** > **"Publier un trajet"**
   - **Envoi de colis** > **"Envoyer un colis"**
   - **Livraison inter régions** > **"Livraison inter régions"**
3. Testez l'autocomplétion en tapant un nom de ville ou d'adresse
4. Vérifiez que les suggestions apparaissent correctement

### 7️⃣ Vérifier les logs (en cas de problème)

Si l'autocomplétion ne fonctionne toujours pas:

1. Allez dans **Supabase Dashboard** > **Edge Functions** > **google-places-proxy**
2. Cliquez sur **"Logs"**
3. Recherchez les messages d'erreur détaillés:
   - `❌ ERREUR GOOGLE MAPS API`
   - `🔧 DIAGNOSTIC: REQUEST_DENIED`
   - etc.

Les logs vous indiqueront exactement quel est le problème:
- Clé API non configurée
- APIs non activées
- Facturation non activée
- Restrictions incompatibles
- etc.

## 🔍 DIAGNOSTIC DES ERREURS COURANTES

### Erreur: "GOOGLE_MAPS_API_KEY_SERVER non configurée"

**Cause:** Le secret n'a pas été ajouté à Supabase ou n'a pas encore pris effet.

**Solution:**
1. Vérifiez que vous avez bien ajouté le secret dans Supabase Dashboard
2. Attendez 2-3 minutes pour que les changements prennent effet
3. Redéployez l'Edge Function si nécessaire

### Erreur: "REQUEST_DENIED"

**Causes possibles:**
1. La clé API n'a pas les APIs activées (Places API, Geocoding API, Distance Matrix API)
2. La clé API a des restrictions incompatibles (HTTP referrers, Bundle ID, Package name)
3. La facturation n'est pas activée sur le projet Google Cloud
4. La clé API est invalide ou révoquée

**Solution:**
1. Vérifiez la configuration de la clé dans Google Cloud Console
2. Assurez-vous que "Application restrictions" est sur "None"
3. Vérifiez que les 3 APIs sont activées
4. Vérifiez que la facturation est active

### Erreur: "OVER_QUERY_LIMIT"

**Cause:** Le quota de requêtes a été dépassé.

**Solution:**
1. Allez dans Google Cloud Console > APIs & Services > Dashboard
2. Vérifiez les quotas pour Places API, Geocoding API, Distance Matrix API
3. Si nécessaire, augmentez les quotas ou activez la facturation
4. Attendez la réinitialisation du quota (généralement quotidien)

### Erreur: "INVALID_REQUEST"

**Cause:** Paramètres de requête invalides.

**Solution:**
1. Vérifiez les logs de l'Edge Function pour voir les paramètres envoyés
2. Assurez-vous que l'input n'est pas vide
3. Vérifiez le format des coordonnées si applicable

## 📊 DIFFÉRENCES ENTRE LES CLÉS API

### ❌ Anciennes clés (ne fonctionnent PAS avec Edge Functions)

- **GOOGLE_MAPS_API_KEY_WEB:** Restrictions HTTP referrers
- **GOOGLE_MAPS_API_KEY_ANDROID:** Restrictions Package name + SHA-1
- **GOOGLE_MAPS_API_KEY_IOS:** Restrictions Bundle ID

Ces clés sont utilisées pour les appels **directs depuis le client** (navigateur, app mobile).

### ✅ Nouvelle clé (fonctionne avec Edge Functions)

- **GOOGLE_MAPS_API_KEY_SERVER:** Aucune restriction (ou IP uniquement)

Cette clé est utilisée pour les appels **serveur → Google** via les Edge Functions Supabase.

## 🔐 SÉCURITÉ

### Pourquoi une clé sans restriction?

Les Edge Functions Supabase s'exécutent sur des serveurs Supabase, pas sur le client. Google ne peut pas vérifier les restrictions HTTP referrers, Bundle ID, ou Package name pour ces appels serveur.

### Comment sécuriser la clé?

1. **Restrictions d'API:** Limitez la clé aux APIs strictement nécessaires (Places, Geocoding, Distance Matrix)
2. **Quotas:** Configurez des quotas raisonnables dans Google Cloud Console
3. **Monitoring:** Surveillez l'utilisation de la clé dans Google Cloud Console
4. **Rotation:** Changez régulièrement la clé API
5. **IP Restrictions (optionnel):** Si vous connaissez les IPs de Supabase, ajoutez-les

## 📞 SUPPORT

Si vous rencontrez des problèmes après avoir suivi ces étapes:

1. Vérifiez les logs de l'Edge Function dans Supabase Dashboard
2. Vérifiez la configuration de la clé dans Google Cloud Console
3. Vérifiez que la facturation est active
4. Attendez 5-10 minutes après chaque modification pour que les changements prennent effet

## ✅ CHECKLIST FINALE

- [ ] Clé API serveur créée dans Google Cloud Console
- [ ] Nom: GOOGLE_MAPS_API_KEY_SERVER
- [ ] Application restrictions: None
- [ ] API restrictions: Places API, Geocoding API, Distance Matrix API activées
- [ ] APIs activées dans le projet Google Cloud
- [ ] Facturation activée sur le projet Google Cloud
- [ ] Secret ajouté dans Supabase Dashboard: GOOGLE_MAPS_API_KEY_SERVER
- [ ] Edge Function redéployée (automatique)
- [ ] Autocomplétion testée sur Web
- [ ] Autocomplétion testée sur Android (si applicable)
- [ ] Autocomplétion testée sur iOS (si applicable)

## 🎉 RÉSULTAT ATTENDU

Après avoir complété toutes ces étapes, l'autocomplétion Google Maps devrait fonctionner correctement sur toutes les plateformes (Web, Android, iOS) dans les modules:

- **Covoiturage** → "Publier un trajet"
- **Envoi de colis** → "Envoyer un colis"
- **Livraison inter régions** → "Livraison inter régions"

Les erreurs seront loggées de manière détaillée dans les logs de l'Edge Function pour faciliter le diagnostic.
