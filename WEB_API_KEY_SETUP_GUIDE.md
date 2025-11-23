
# Configuration de la clé API Google Maps pour Web

## Problème
L'autocomplétion ne fonctionne plus sur le web après l'ajout de la clé API iOS. Cela est dû au fait que la clé API iOS a des restrictions spécifiques à iOS (Bundle ID) qui ne fonctionnent pas sur le web.

## Solution
Vous devez créer une clé API Google Maps séparée pour le web avec des restrictions HTTP referrer.

## Étapes de configuration

### 1. Créer une nouvelle clé API pour le Web

1. Allez sur [Google Cloud Console - API Credentials](https://console.cloud.google.com/apis/credentials)
2. Cliquez sur **"+ CREATE CREDENTIALS"** → **"API key"**
3. Une nouvelle clé sera créée. Cliquez sur **"RESTRICT KEY"** immédiatement

### 2. Configurer les restrictions de la clé

#### Application restrictions
- Sélectionnez **"HTTP referrers (web sites)"**
- Ajoutez les referrers suivants:
  ```
  https://natively.dev/*
  http://localhost:*
  https://*.supabase.co/*
  ```

#### API restrictions
- Sélectionnez **"Restrict key"**
- Activez les APIs suivantes:
  - ✅ Places API
  - ✅ Geocoding API
  - ✅ Distance Matrix API

3. Cliquez sur **"SAVE"**

### 3. Ajouter la clé à Supabase

1. Copiez la clé API que vous venez de créer
2. Allez sur [Supabase Dashboard](https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/settings/functions)
3. Dans la section **"Edge Function Secrets"**, ajoutez:
   - **Name**: `GOOGLE_MAPS_API_KEY_WEB`
   - **Value**: Collez votre clé API

4. Cliquez sur **"Add secret"**

### 4. Redéployer la fonction Edge

La fonction Edge `google-places-proxy` doit être redéployée pour utiliser le nouveau secret.

**Option 1: Via Supabase CLI (recommandé)**
```bash
supabase functions deploy google-places-proxy
```

**Option 2: Via le Dashboard**
- La fonction sera automatiquement redéployée lors du prochain changement

### 5. Tester

1. Ouvrez votre application sur le web
2. Essayez de saisir une adresse dans le champ "Adresse de départ"
3. Vous devriez voir les suggestions d'autocomplétion apparaître

## Vérification

Pour vérifier que tout fonctionne:

1. Ouvrez la console du navigateur (F12)
2. Tapez une adresse
3. Vérifiez qu'il n'y a pas d'erreurs dans la console
4. Les suggestions devraient apparaître après quelques caractères

## Résumé des clés API

Vous devez maintenant avoir **3 clés API** configurées:

| Plateforme | Secret Supabase | Restrictions |
|------------|----------------|--------------|
| Web | `GOOGLE_MAPS_API_KEY_WEB` | HTTP referrers |
| Android | `GOOGLE_MAPS_API_KEY_ANDROID` | Android apps (Package name) |
| iOS | `GOOGLE_MAPS_API_KEY_IOS` | iOS apps (Bundle ID) |

## Dépannage

### L'autocomplétion ne fonctionne toujours pas
- Vérifiez que le secret `GOOGLE_MAPS_API_KEY_WEB` est bien configuré dans Supabase
- Vérifiez que les APIs sont activées dans Google Cloud Console
- Vérifiez que les referrers sont correctement configurés
- Attendez quelques minutes pour que les changements se propagent

### Erreur "REQUEST_DENIED"
- La clé API n'est pas configurée ou est invalide
- Les APIs ne sont pas activées
- Les restrictions de la clé ne permettent pas l'accès depuis votre domaine

### Erreur "OVER_QUERY_LIMIT"
- Vous avez dépassé le quota gratuit de Google Maps API
- Vérifiez votre utilisation dans Google Cloud Console
- Activez la facturation si nécessaire

## Support

Si vous rencontrez des problèmes, vérifiez:
1. Les logs de la fonction Edge dans Supabase Dashboard
2. La console du navigateur pour les erreurs JavaScript
3. Les quotas et la facturation dans Google Cloud Console
