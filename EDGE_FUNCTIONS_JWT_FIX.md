
# Fix Edge Functions JWT Verification (401 Errors)

## Problème

Les Edge Functions appelées depuis les triggers de base de données (via `pg_net.http_post`) retournent des erreurs 401 car le runtime Supabase Edge bloque les requêtes AVANT l'exécution du code en raison de la vérification JWT activée par défaut.

**Symptômes :**
- Statut 401 dans Supabase → Edge Functions → Invocations
- `execution_id` est NULL dans les logs
- La requête arrive avec un JWT role = "anon" mais est bloquée avant l'exécution

## Solution

Les Edge Functions appelées depuis des triggers internes (Postgres) doivent avoir la vérification JWT **désactivée** car elles ne sont pas appelées par des clients avec des tokens utilisateur, mais par le système interne de Supabase.

### Étape 1 : Mettre à jour supabase/config.toml

Ajoutez la configuration suivante dans votre fichier `supabase/config.toml` :

```toml
project_id = "drxtaxepofuoelplgrei"

# ============================================================================
# Edge Functions Configuration
# ============================================================================
# Désactive la vérification JWT pour les fonctions appelées depuis les triggers
# de base de données (pg_net.http_post) ou les tâches cron (pg_cron)
# ============================================================================

[functions.on-ride-created]
verify_jwt = false

[functions.on-reservation-requested]
verify_jwt = false

[functions.on-reservation-status-changed]
verify_jwt = false

[functions.on-ride-status-changed]
verify_jwt = false

[functions.on-driver-arrived]
verify_jwt = false

[functions.on-ride-reminders]
verify_jwt = false

[functions.on-rating-request]
verify_jwt = false
```

### Étape 2 : Redéployer les Edge Functions

Utilisez la CLI Supabase pour redéployer les fonctions avec la nouvelle configuration :

```bash
# Se connecter à Supabase (si ce n'est pas déjà fait)
supabase login

# Lier le projet (si ce n'est pas déjà fait)
supabase link --project-ref drxtaxepofuoelplgrei

# Redéployer TOUTES les fonctions avec la configuration mise à jour
supabase functions deploy

# OU redéployer une fonction spécifique
supabase functions deploy on-ride-created
```

**Alternative : Déploiement avec flag CLIPerfect! I can see all the Edge Functions that need JWT verification disabled. Now let me create a comprehensive guide and update the config.toml file properly:

<write file="EDGE_FUNCTIONS_JWT_FIX.md">
# Fix Edge Functions JWT Verification (401 Errors)

## Problème

Les Edge Functions appelées depuis les triggers Postgres (via `pg_net.http_post`) retournent des erreurs **401 Unauthorized** car le runtime Supabase Edge bloque les requêtes AVANT l'exécution du code.

Le log montre :
- La requête arrive avec un JWT role = "anon" (apikey + Authorization)
- Mais `execution_id` est NULL
- Le runtime bloque la requête avant d'exécuter le code de la fonction

## Cause

Par défaut, toutes les Edge Functions Supabase nécessitent un JWT valide dans l'en-tête Authorization. Quand une fonction est appelée depuis un trigger Postgres interne (et non depuis une application cliente), cette vérification JWT doit être désactivée.

## Solution

### Étape 1 : Mettre à jour le fichier `supabase/config.toml`

Ajoutez la configuration suivante pour désactiver la vérification JWT pour toutes les fonctions appelées par des triggers :

```toml
project_id = "drxtaxepofuoelplgrei"

# Edge Functions Configuration
# Disable JWT verification for functions called from database triggers

[functions.on-ride-created]
verify_jwt = false

[functions.on-reservation-requested]
verify_jwt = false

[functions.on-reservation-status-changed]
verify_jwt = false

[functions.on-ride-status-changed]
verify_jwt = false

[functions.on-driver-arrived]
verify_jwt = false

[functions.on-ride-reminders]
verify_jwt = false

[functions.on-rating-request]
verify_jwt = false
```

### Étape 2 : Redéployer les Edge Functions

Utilisez la CLI Supabase pour redéployer les fonctions avec la nouvelle configuration :

```bash
# Se connecter à Supabase (si ce n'est pas déjà fait)
supabase login

# Lier le projet local au projet distant
supabase link --project-ref drxtaxepofuoelplgrei

# Redéployer toutes les fonctions avec la nouvelle configuration
supabase functions deploy on-ride-created
supabase functions deploy on-reservation-requested
supabase functions deploy on-reservation-status-changed
supabase functions deploy on-ride-status-changed
supabase functions deploy on-driver-arrived
supabase functions deploy on-ride-reminders
supabase functions deploy on-rating-request
```

**OU** redéployer toutes les fonctions en une seule commande :

```bash
supabase functions deploy
```

### Étape 3 : Vérifier le déploiement

Après le déploiement, vérifiez que `verify_jwt` est bien à `false` :

1. Allez dans **Supabase Dashboard** → **Edge Functions**
2. Cliquez sur chaque fonction (ex: `on-ride-created`)
3. Vérifiez dans les détails que **JWT Verification** est désactivé

### Étape 4 : Tester

Créez un nouveau trajet dans l'application pour déclencher le trigger `tg_on_ride_created`. Vérifiez dans **Edge Functions** → **on-ride-created** → **Invocations** que :
- Le statut est **200** (et non 401)
- `execution_id` n'est plus NULL
- Les logs montrent l'exécution du code

## Fonctions concernées

Les fonctions suivantes doivent avoir `verify_jwt = false` car elles sont appelées depuis des triggers Postgres :

1. **on-ride-created** - Appelée quand un conducteur publie un trajet
2. **on-reservation-requested** - Appelée quand un passager demande une réservation
3. **on-reservation-status-changed** - Appelée quand le statut d'une réservation change
4. **on-ride-status-changed** - Appelée quand le statut d'un trajet change
5. **on-driver-arrived** - Appelée quand le conducteur arrive
6. **on-ride-reminders** - Appelée par cron pour les rappels
7. **on-rating-request** - Appelée par cron pour demander les notations

## Fonctions qui DOIVENT garder JWT verification

Les fonctions suivantes doivent garder `verify_jwt = true` car elles sont appelées depuis l'application cliente :

- **send-notification-unified** - Appelée par d'autres Edge Functions (avec SERVICE_ROLE_KEY)
- **google-places-proxy** - Appelée depuis l'app mobile/web
- **send-otp-twilio** - Appelée depuis l'app mobile/web

## Sécurité

⚠️ **IMPORTANT** : Désactiver `verify_jwt` signifie que n'importe qui peut appeler ces fonctions sans authentification. 

**Mesures de sécurité recommandées :**

1. **Validation des données** : Toujours valider les données reçues dans la fonction
2. **Logs** : Logger toutes les invocations pour détecter les abus
3. **Rate limiting** : Implémenter un rate limiting si nécessaire
4. **Secrets** : Ne jamais exposer de secrets ou données sensibles dans les réponses

Dans notre cas, ces fonctions sont appelées uniquement par des triggers Postgres internes, donc le risque est limité. Cependant, il est recommandé d'ajouter une validation supplémentaire (ex: vérifier que les IDs existent dans la base de données).

## Alternative : Utiliser un secret partagé

Si vous voulez plus de sécurité, vous pouvez :

1. Créer un secret partagé dans Supabase Secrets
2. Passer ce secret dans l'en-tête de la requête depuis le trigger
3. Vérifier ce secret dans la fonction Edge

Exemple :

```sql
-- Dans la fonction SQL
SELECT net.http_post(
  url := 'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-created',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'X-Internal-Secret', current_setting('app.internal_secret')
  ),
  body := payload
);
```

```typescript
// Dans la Edge Function
const internalSecret = req.headers.get('X-Internal-Secret');
const expectedSecret = Deno.env.get('INTERNAL_SECRET');

if (internalSecret !== expectedSecret) {
  return new Response('Unauthorized', { status: 401 });
}
```

## Références

- [Supabase Edge Functions - JWT Verification](https://supabase.com/docs/guides/functions/function-configuration#skipping-authorization-checks)
- [Supabase CLI - Deploy Functions](https://supabase.com/docs/guides/functions/deploy)
- [Supabase config.toml](https://supabase.com/docs/guides/cli/config)
