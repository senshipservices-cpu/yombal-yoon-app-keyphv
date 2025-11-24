
# Configuration des Secrets Supabase Edge Function pour Google Maps API

## 🔴 PROBLÈME ACTUEL

L'erreur "The provided API key is invalid" avec le statut `REQUEST_DENIED` indique que les clés API Google Maps ne sont **PAS configurées dans les secrets Supabase Edge Function**.

Le diagnostic montre:
```
Configuration des clés API:
• Web: N/A
• Android: N/A
• iOS: N/A
```

Cela signifie que les variables d'environnement `GOOGLE_MAPS_API_KEY_WEB`, `GOOGLE_MAPS_API_KEY_ANDROID`, et `GOOGLE_MAPS_API_KEY_IOS` ne sont pas définies dans Supabase.

## ✅ SOLUTION: Ajouter les Secrets dans Supabase Dashboard

### Méthode 1: Via Supabase Dashboard (Recommandé)

1. **Allez dans votre projet Supabase**
   - URL: https://supabase.com/dashboard/project/drxtaxepofuoelplgrei

2. **Naviguez vers Edge Functions Settings**
   - Cliquez sur "Project Settings" (icône d'engrenage en bas à gauche)
   - Sélectionnez "Edge Functions" dans le menu latéral
   - Ou allez directement à: https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/settings/functions

3. **Ajoutez les secrets**
   - Cliquez sur "Add secret" ou "Manage secrets"
   - Ajoutez les trois secrets suivants:

   **Secret 1: GOOGLE_MAPS_API_KEY_WEB**
   ```
   Nom: GOOGLE_MAPS_API_KEY_WEB
   Valeur: [Votre clé API Web depuis Google Cloud Console]
   ```

   **Secret 2: GOOGLE_MAPS_API_KEY_ANDROID**
   ```
   Nom: GOOGLE_MAPS_API_KEY_ANDROID
   Valeur: [Votre clé API Android depuis Google Cloud Console]
   ```

   **Secret 3: GOOGLE_MAPS_API_KEY_IOS**
   ```
   Nom: GOOGLE_MAPS_API_KEY_IOS
   Valeur: [Votre clé API iOS depuis Google Cloud Console]
   ```

4. **Sauvegardez les secrets**
   - Cliquez sur "Save" ou "Add secret" pour chaque secret

5. **Redéployez la Edge Function**
   - Les secrets ne sont appliqués qu'après un redéploiement
   - Dans Natively, la fonction sera automatiquement redéployée
   - Ou utilisez Supabase CLI: `supabase functions deploy google-places-proxy`

### Méthode 2: Via Supabase CLI

Si vous avez Supabase CLI installé:

```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier votre projet
supabase link --project-ref drxtaxepofuoelplgrei

# Ajouter les secrets
supabase secrets set GOOGLE_MAPS_API_KEY_WEB=YOUR_WEB_API_KEY_HERE
supabase secrets set GOOGLE_MAPS_API_KEY_ANDROID=YOUR_ANDROID_API_KEY_HERE
supabase secrets set GOOGLE_MAPS_API_KEY_IOS=YOUR_IOS_API_KEY_HERE

# Redéployer la fonction
supabase functions deploy google-places-proxy
```

## 🔑 Obtenir les Clés API depuis Google Cloud Console

### Pour la Clé Web (GOOGLE_MAPS_API_KEY_WEB)

1. Allez dans [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet
3. Allez dans **APIs & Services > Credentials**
4. Cliquez sur **"+ CREATE CREDENTIALS" > "API key"**
5. Une fois créée, cliquez sur la clé pour la configurer:

   **Application restrictions:**
   - Sélectionnez "HTTP referrers (web sites)"
   - Ajoutez les referrers suivants:
     ```
     https://*.natively.dev/*
     http://localhost/*
     http://127.0.0.1/*
     https://*.exp.direct/*
     ```

   **API restrictions:**
   - Sélectionnez "Restrict key"
   - Activez les APIs suivantes:
     - Places API
     - Geocoding API
     - Distance Matrix API
     - Maps JavaScript API

6. Cliquez sur "Save"
7. Copiez la clé API

### Pour la Clé Android (GOOGLE_MAPS_API_KEY_ANDROID)

1. Dans Google Cloud Console > APIs & Services > Credentials
2. Créez une nouvelle clé API ou modifiez une existante
3. Configurez:

   **Application restrictions:**
   - Sélectionnez "Android apps"
   - Ajoutez:
     - Package name: `com.yombalyoon.app`
     - SHA-1: [Obtenez-le avec `keytool -list -v -keystore your-keystore.jks`]

   **API restrictions:**
   - Activez: Places API, Geocoding API, Distance Matrix API

4. Sauvegardez et copiez la clé

### Pour la Clé iOS (GOOGLE_MAPS_API_KEY_IOS)

1. Dans Google Cloud Console > APIs & Services > Credentials
2. Créez une nouvelle clé API ou modifiez une existante
3. Configurez:

   **Application restrictions:**
   - Sélectionnez "iOS apps"
   - Ajoutez le Bundle ID: `com.yombalyoon.yombalyoonapp`

   **API restrictions:**
   - Activez: Places API, Geocoding API, Distance Matrix API

4. Sauvegardez et copiez la clé

## 🧪 Vérification

Après avoir ajouté les secrets et redéployé:

1. **Testez sur Web**
   - Ouvrez l'app dans le navigateur
   - Allez dans "Envoyer un colis"
   - Tapez une adresse dans le champ de départ
   - Vous devriez voir les suggestions d'autocomplétion

2. **Vérifiez les logs**
   - Dans Supabase Dashboard > Edge Functions > google-places-proxy > Logs
   - Vous devriez voir:
     ```
     🔐 Environment Variables Status:
        - GOOGLE_MAPS_API_KEY_WEB: ✅ SET
        - GOOGLE_MAPS_API_KEY_ANDROID: ✅ SET
        - GOOGLE_MAPS_API_KEY_IOS: ✅ SET
     ```

3. **Testez le debug panel**
   - Sur Web, si une erreur survient, le panneau de debug affichera:
     ```
     Configuration des clés API:
     • Web: SET
     • Android: SET
     • iOS: SET
     ```

## ⚠️ Points Importants

1. **Les secrets Supabase Edge Function sont différents des variables d'environnement de l'app**
   - Les secrets Edge Function sont stockés dans Supabase et accessibles via `Deno.env.get()`
   - Les variables d'environnement de l'app (dans `app.json`) ne sont PAS accessibles dans les Edge Functions

2. **Redéploiement obligatoire**
   - Les secrets ne sont appliqués qu'après un redéploiement de la fonction
   - Dans Natively, cela se fait automatiquement
   - Sinon, utilisez: `supabase functions deploy google-places-proxy`

3. **Délai de propagation Google Cloud**
   - Après avoir configuré les restrictions dans Google Cloud Console
   - Attendez 5 minutes pour que les changements prennent effet

4. **Facturation Google Cloud**
   - Assurez-vous que la facturation est activée sur votre projet Google Cloud
   - Sans facturation, les APIs ne fonctionneront pas

## 🔍 Dépannage

### Erreur: "The provided API key is invalid"

**Causes possibles:**
1. Les secrets ne sont pas configurés dans Supabase
2. La fonction n'a pas été redéployée après l'ajout des secrets
3. La clé API est invalide ou a été supprimée dans Google Cloud Console
4. Les restrictions de la clé API ne correspondent pas au referer/package/bundle

**Solutions:**
1. Vérifiez que les secrets sont bien ajoutés dans Supabase Dashboard
2. Redéployez la fonction
3. Vérifiez que la clé existe dans Google Cloud Console
4. Vérifiez les restrictions de la clé (referrers, package name, bundle ID)

### Erreur: "REQUEST_DENIED"

**Causes possibles:**
1. Les restrictions de la clé API ne correspondent pas
2. Les APIs ne sont pas activées dans Google Cloud Console
3. La facturation n'est pas activée

**Solutions:**
1. Vérifiez les referrers/package/bundle dans Google Cloud Console
2. Activez les APIs requises (Places, Geocoding, Distance Matrix)
3. Activez la facturation sur votre projet Google Cloud

### Les suggestions ne s'affichent pas

**Causes possibles:**
1. Quota dépassé
2. Réseau lent ou instable
3. Erreur dans la configuration

**Solutions:**
1. Vérifiez les quotas dans Google Cloud Console
2. Testez avec une connexion stable
3. Consultez les logs de la Edge Function dans Supabase Dashboard

## 📚 Documentation

- [Supabase Edge Functions Secrets](https://supabase.com/docs/guides/functions/secrets)
- [Google Maps Platform](https://developers.google.com/maps/documentation)
- [Google Cloud Console](https://console.cloud.google.com/)

## ✅ Checklist Finale

- [ ] Créer 3 clés API dans Google Cloud Console (Web, Android, iOS)
- [ ] Configurer les restrictions pour chaque clé
- [ ] Activer les APIs requises (Places, Geocoding, Distance Matrix)
- [ ] Activer la facturation sur le projet Google Cloud
- [ ] Ajouter les 3 secrets dans Supabase Dashboard
- [ ] Redéployer la Edge Function `google-places-proxy`
- [ ] Attendre 5 minutes pour la propagation
- [ ] Tester l'autocomplétion sur Web
- [ ] Tester l'autocomplétion sur Android
- [ ] Tester l'autocomplétion sur iOS
- [ ] Vérifier les logs dans Supabase Dashboard

---

**Note:** Ce guide est spécifique à Yombal Yoon et utilise les identifiants suivants:
- Project ID: `drxtaxepofuoelplgrei`
- Package Android: `com.yombalyoon.app`
- Bundle iOS: `com.yombalyoon.yombalyoonapp`
